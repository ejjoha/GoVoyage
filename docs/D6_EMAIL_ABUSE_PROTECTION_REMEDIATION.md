# D6 — Email Abuse Protection: Application Rate Limiting + Supabase Auth Native Protections

**Status: complete.**

## What was found

The original health audit's D6 finding was narrower than what this arc ended up covering: `/api/send-welcome-email` had no authentication at all (an open relay, fixed in an earlier session — see git history for the auth-only fix) and, separately, neither it nor `/api/send-trip-invite` had any rate limiting once auth was added. This arc closed the rate-limiting half of D6, then extended the investigation to a related but distinct surface the original finding didn't cover: Supabase Auth's own native signup/confirmation-email flow, which sends email entirely outside Voyome's application code and therefore can't be protected by anything Voyome's own rate limiter builds.

## Part 1 — Application-level rate limiting

Both `/api/send-trip-invite` and `/api/send-welcome-email` are already correctly authenticated (a prerequisite from earlier work, not this arc). What was missing was any frequency control — an authenticated caller could invite-spam or trigger welcome-emails without limit.

**Design**: an atomic, all-dimensions-per-request Postgres RPC (`public.consume_email_rate_limits(jsonb)`, `supabase/migrations/20260823145912_email_rate_limit_buckets.sql`) — a request checks every applicable bucket together; if any dimension is already at its limit, none of them are incremented, and the caller gets the longest relevant reset time. Bucket keys (actor/recipient/IP identities) are HMAC-SHA256 hashed server-side (`RATE_LIMIT_HASH_SECRET`) before ever reaching the database — no raw email or IP is persisted. The bucket table lives in a non-PostgREST-exposed `private` schema; the RPC is `SECURITY INVOKER`, `EXECUTE` restricted to `service_role` only. Concurrent requests sharing a bucket are serialized via row-level locking in a deterministic lock order.

Limits: `invite_actor` 20/hr, `invite_recipient` 5/hr, `invite_ip` 40/hr, `welcome_actor` 3/hr, `welcome_ip` 8/hr. On breach: `429` with a `Retry-After` header; on a limiter infrastructure failure (not a real breach): `503`, never a silent bypass. All three invite call sites (trip creation, add-traveller, resend) were checked and updated to surface a 429-specific message rather than the generic failure text, and `handleResendInvite` gained a double-submission ref-lock so a legitimate rapid re-click can't burn its own rate-limit budget.

**Production verification**: 15/15 disposable RPC-level checks (atomicity, concurrency, anon-key denial, per-key isolation, window expiry, malformed-input rejection) plus a full endpoint-integration QA against the live deployment (real HTTP calls, real Vercel headers, real database reconciliation).

**A real incident worth recording honestly, not glossing over**: during the endpoint-integration QA, the reported test results for one run didn't match any trace in the database at all — no bucket rows, no email delivery. Investigation (ruling out window-boundary and hash-mismatch hypotheses one at a time, then an empirical single-request diagnostic call) found the actual cause: `RATE_LIMIT_HASH_SECRET` in Vercel Production did not match the value in local `.env.local` — the secret had drifted between the two environments. The secret was regenerated and reset consistently in both places, redeployed, and a deterministic proof-of-fix (a hand-computed hash, a preconditioned bucket row, and a real request matched exactly against it with zero stray rows created) confirmed local and production were using identical secret bytes before the full verify suite was re-run and passed 6/6 with complete raw evidence (status, body, `Retry-After`, `x-vercel-id`, `x-matched-path`) for every request. Merged and deployed at `7edfd1c540a07d51d4fe2648af0be133387a641e`.

## Part 2 — Supabase Auth's own native signup/confirmation-email flow

This is a structurally separate surface from Part 1: Voyome's signup call (`app/login/page.tsx`, `handleSignUp`) invokes `supabase.auth.signUp()` **directly from the browser to Supabase Auth's REST API** — zero Voyome server code sits in that specific request's path, meaning nothing Voyome builds can intercept it. Protection here has to come from Supabase's own native controls, confirmed via its Management API (`GET /v1/projects/{ref}/config/auth`, read-only) and then verified empirically against the real endpoints — not inferred from the dashboard's displayed values alone.

### Finding 1 — Signup confirmation-email spam: closed, structurally impossible

`mailer_autoconfirm: true` is live in production. Accounts are confirmed immediately on signup; GoTrue's documented behavior when autoconfirm is on is that no confirmation email is sent at all, since there's nothing to confirm. Voyome's own post-signup welcome email (a separate, Resend-based, Voyome-owned send) is the only email that actually goes out on signup, and it's already covered by Part 1's rate limiting.

### Finding 2 — Raw signup-volume abuse: closed, native limit confirmed by empirical test

Since autoconfirm means no email is sent per signup, the dashboard's `rate_limit_email_sent: 2` setting doesn't throttle raw signup attempts the way it would in a non-autoconfirm setup — this was flagged as an open question rather than assumed either way. Tested directly: sequential signup requests against the real `/auth/v1/signup` endpoint with disposable `@example.com` addresses. A first run of 20 attempts all succeeded (200); a second, corrected run hit a real `429` at attempt 19 of 20:
```json
{"code":429,"error_code":"over_request_rate_limit","msg":"Request rate limit reached"}
```
This is a generic request-rate limit, not one of the named dashboard settings — but it's real, active, and empirically confirmed to trigger on sustained signup volume.

**QA incident, recorded honestly**: the first test run's cleanup logic checked `body?.id` for signup-success detection, but autoconfirm means `/signup` returns a full session object with the user nested at `body.user.id`, not top-level — so all 20 accounts created in that run were real, but the script's own detection never found them, and it reported "CLEANUP CONFIRMED CLEAN" as a false positive. This was caught before moving on (the discrepancy between "20 successful signups" and "0 accounts to clean up" was the tell), a corrective script located and deleted all 20 real accounts via service-role, and admin read-back confirmed all 20 gone before the corrected script (fixed to read `body.user.id`) was used for the second, decisive run.

### Finding 3 — Resend-confirmation / magic-link: does not exist in Voyome

Confirmed via full codebase search: no `signInWithOtp`, no magic-link flow, and no "resend confirmation" action exist anywhere in Voyome's own code. This makes sense given Finding 1 — there's never anything pending to confirm, so no reason to have built a resend action for it. Voyome's own real analog to "an unauthenticated, repeatable action targeting an arbitrary address" is `/forgot-password` (Finding 4).

One narrower, separate question — whether GoTrue's own raw `/auth/v1/resend` (type=signup) endpoint does anything at all against an account that's already autoconfirmed — was tested directly and returned `200 {}`, an empty success body. That response is genuinely ambiguous on its own (consistent with either a real send or a security-conscious silent no-op) and was not conclusively resolved with independent evidence. This doesn't affect Voyome's actual exposure either way, since the app never calls this endpoint — noted for completeness, not left as an unstated gap.

### Finding 4 — `/forgot-password` (email-bombing a single victim): mitigated by an active native throttle, no change needed

`/forgot-password` is public, requires no login, and calls `supabase.auth.resetPasswordForEmail()` — the closest real, exposed analog to "repeatedly targeting one victim address." Repeated password-reset requests to the same controlled address were throttled on the second request with `over_email_send_rate_limit`, with an observed cooldown of approximately 60 seconds. This is a distinct, much stricter mechanism than Finding 2's broad request-volume limit — it's a per-target cooldown, not a counter that takes many attempts to exhaust. No further action needed; the existing native protection already closes this specific vector effectively.

(Note on test methodology: `@example.com` and even the RFC 2606-reserved `.test` TLD were both rejected outright by this specific endpoint with `email_address_invalid` — its validation is stricter than `/signup`'s and appears to require an actually-deliverable domain. The test above used a real, controlled address via plus-addressing, approved explicitly before use given the higher email-volume footprint versus a throwaway domain.)

### Finding 5 — Account enumeration: separate, non-blocking, low-severity note

Not part of the original email-abuse concern this arc was scoped to investigate, but worth recording since it surfaced during the trace: Supabase's default `/signup` behavior for an already-registered email typically returns a distinguishable error, and `handleSignUp` surfaces `error.message` verbatim to the user — a mild account-enumeration surface, unaffected by autoconfirm either way. Not tested live (doing so would mean a real signup attempt purely to observe an error shape, with no cleanup need but also no clear benefit over the already-known default GoTrue behavior). Flagged for awareness; not blocking, not part of this arc's remediation scope.

## CAPTCHA — documented as available, not recommended now

Supabase supports hCaptcha/Turnstile natively for the signup flow (`security_captcha_provider: hcaptcha` is pre-selected in the project config; `security_captcha_enabled: false`). This remains available future hardening if raw signup-volume abuse ever becomes a real, observed problem beyond what the native `over_request_rate_limit` already throttles. Enabling it changes the signup UX for every real user, so it's a deliberate product decision, not a security-only call — not proposed or recommended as part of this arc.

## What's still open

- Finding 3's raw `/auth/v1/resend` ambiguity (empty `200` response, real effect unconfirmed) — doesn't affect Voyome's actual exposure since the app never calls this endpoint, but is left explicitly unresolved rather than asserted either way.
- Finding 5 (account enumeration) — a separate, low-severity, non-blocking item, not remediated as part of this arc.
- No code changes were made or are proposed as part of Part 2 — this was investigation and empirical verification only, closing out the D6 finding's abuse-protection scope.
