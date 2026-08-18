# D7 — Establish Trustworthy Schema / RLS Visibility

## Context

The Aug 16 health audit found that Voyome's live Supabase schema is not fully reconstructable or auditable from the migrations currently tracked in Git.

Existing migrations contain changes to policies, grants and functions, but not necessarily the original definitions for several important parts of the production authorization model.

This particularly affects core tables such as:

* `trips`
* `trip_invites`
* `trip_collaborators`
* `bookings`
* `profiles`

and privileged functions such as:

* `remove_trip_collaborator`
* `leave_trip`
* `archive_trip_member`
* `revoke_trip_invite`

Because Voyome talks directly from the browser to Supabase for most application data, **RLS policies and Postgres functions form the real backend authorization boundary**.

The purpose of D7 is therefore to establish trustworthy visibility into what is actually running in production and assess it.

**This is not a remediation task and not a migration task.**

---

## Branch

Create a fresh branch from latest `main`, e.g.:

`audit/supabase-schema-rls`

Do not work from an old audit or remediation branch.

Do not merge or deploy anything without review.

---

# 1. Safety rules — non-negotiable

This task must be **read-only with respect to the live Supabase project**.

Do not:

* modify tables
* modify columns
* modify data
* create/drop/alter functions
* create/drop/alter policies
* change RLS
* change grants
* modify Storage configuration
* modify Auth configuration
* apply migrations
* run `db push`
* run a remote `db reset`
* run migration repair
* alter Supabase migration-history metadata
* execute SQL that changes production state

If any command unexpectedly prompts to:

* apply changes
* repair migration history
* write migration metadata
* modify production
* synchronize remote state

**stop and report before accepting the prompt.**

Do not assume that a command is safe solely because its name contains `pull`, `dump`, `diff`, `inspect`, etc. Confirm its behavior before using it against production.

---

# 2. Mission

Establish a trustworthy, reviewable snapshot of the **actual production database authorization surface** relevant to Voyome.

The output should allow Joachim, Claude and CC to answer:

> What schema, RLS policies, privileged functions and grants are actually protecting Voyome's production data today?

and:

> Do those authorization rules enforce the permissions the application assumes they enforce?

No fixes should be implemented during this task.

---

# 3. Capture strategy

Do **not** use this task to create new migration-history files intended to be applied later.

Do not modify existing files under `supabase/migrations/`.

Instead, create clearly labelled **reference material** representing the current production state.

Preferred location:

`supabase/reference/`

For example:

`supabase/reference/production-schema-2026-08-16.sql`

and, if useful:

`supabase/reference/README.md`

The reference file must be clearly marked as:

* a production snapshot/reference
* read-only evidence
* **not a migration**
* **not intended to be executed against a database**

If another location would materially reduce risk or ambiguity, explain why before using it.

---

# 4. Production schema capture

Use a safe, schema-only/read-only method such as `supabase db dump` or another appropriate inspection mechanism.

Capture enough of the production `public` schema to review:

* tables
* columns
* constraints
* foreign keys
* indexes where relevant
* functions
* function definitions
* function ownership where available
* `SECURITY DEFINER` / `SECURITY INVOKER`
* RLS enablement
* RLS policies
* grants / execute permissions
* relevant role permissions

Do **not** capture production table data.

Do not intentionally export:

* user records
* trip data
* journal content
* emails
* expense data
* authentication records
* other real-user data

If the selected command would include production data, stop and choose a safer method.

---

# 5. Secret / sensitive-content check

Before any generated reference SQL or documentation is committed:

Inspect it for accidentally embedded sensitive information such as:

* API keys
* database passwords
* service-role keys
* tokens
* connection strings
* credentials
* private URLs containing credentials
* hard-coded secrets inside function definitions
* user data

If anything resembling a secret or real-user data appears:

**do not commit the file. Stop and report what was found.**

Do not reproduce secret values in the report.

---

# 6. Migration-history drift

Compare the captured production state against the existing contents of:

`supabase/migrations/`

Determine at a high level:

* which important production objects are fully represented in tracked migrations
* which objects exist in production but have incomplete origin/history in Git
* which policies/functions appear only through later ALTER/GRANT/REVOKE-style migrations
* whether important authorization behavior cannot currently be reconstructed from Git alone

Do not attempt to repair this drift in D7.

Do not create baseline migrations yet.

The separate question:

> "How should production schema state and migration history be reconciled so Git becomes the authoritative source going forward?"

should be answered as a **recommendation**, not implemented here.

---

# 7. SECURITY DEFINER review

Identify every application-relevant `SECURITY DEFINER` function exposed to or callable by Voyome.

At minimum, specifically inspect:

* `remove_trip_collaborator`
* `leave_trip`
* `archive_trip_member`
* `revoke_trip_invite`

Also include other relevant `SECURITY DEFINER` functions discovered during the production inspection.

For each function report:

### Identity

* function name/signature
* owner
* `SECURITY DEFINER` or `SECURITY INVOKER`
* configured `search_path`, if any

### Invocation permissions

Determine which roles can execute it, including where relevant:

* `anon`
* `authenticated`
* `public`
* `service_role`
* other roles

Do not assume RLS protects function execution.

### Caller identification

Determine how the function establishes who is calling.

Examples to inspect:

* `auth.uid()`
* JWT claims
* passed user IDs
* passed trip IDs
* other caller-controlled arguments

### Authorization logic

Determine what business permission the function requires and whether that permission is actually enforced **inside the trusted database boundary**.

Examples:

* trip owner only
* any collaborator
* trip member
* record owner/self
* authenticated user
* service role only

Do not assume that being authenticated or having general trip access is sufficient.

### Privilege escalation / IDOR-style concerns

Check whether caller-controlled function arguments could allow a user to:

* modify another user's data
* remove another collaborator
* operate on a trip they do not control
* revoke another trip's invite
* act as another user
* bypass expected ownership rules

### RLS interaction

Where the function performs privileged writes:

* determine whether it bypasses RLS
* determine whether its own authorization checks adequately replace that protection
* flag cases where elevated privilege is broader than necessary

### SQL safety

Look for:

* unsafe/dynamic SQL
* unsafe object lookup
* insecure `search_path`
* unexpectedly broad grants
* reliance on client-side authorization
* authorization performed only before calling the function rather than inside it

For each function classify the result as:

* **Confirmed safe**
* **Confirmed vulnerability**
* **Likely vulnerability**
* **Architectural concern**
* **Requires further verification**

Include evidence and confidence level.

Do not fix anything.

---

# 8. RLS review

Inspect RLS coverage for core Voyome tables, especially:

* `trips`
* `trip_invites`
* `trip_collaborators`
* `bookings`
* `profiles`

and other high-value tables identified during inspection, including where relevant:

* journal data
* expense/cost-sharing data
* packing data

For each important table determine:

* whether RLS is enabled
* policies for `SELECT`
* policies for `INSERT`
* policies for `UPDATE`
* policies for `DELETE`
* roles each policy applies to
* how user/trip ownership or membership is established
* whether access appears to match Voyome's intended product permissions

Pay special attention to:

* cross-user reads
* cross-trip reads
* collaborator vs owner permissions
* invitation access
* profile access
* mutations where the client supplies `user_id`, `trip_id` or ownership-like fields

Do not attempt adversarial writes against production merely to test a theory.

Base this pass on schema/policy/function inspection and existing application code.

If something cannot be confirmed without an active test, explicitly mark it as requiring further verification.

---

# 9. D2 / Storage visibility

D2 — public journal images undermining the application's private visibility model — is the next queued security task.

Use D7 to gather **read-only evidence relevant to D2**, but do not fix D2.

Specifically determine, where safely inspectable:

* whether the `journal-images` bucket is public
* relevant `storage.objects` policies
* who can `SELECT` journal-image objects
* who can upload/update/delete them
* whether any Storage policy checks trip membership/ownership
* whether the database's journal visibility flag has any relationship to actual Storage access control
* whether existing object naming/path rules materially affect exposure

If normal production schema capture does not include the required Storage information, use targeted read-only inspection rather than broadening the dump into production data.

Flag any D2-related findings separately so they can feed directly into the later D2 remediation brief.

**Do not:**

* change the bucket
* make it private
* change Storage RLS
* move objects
* generate migration SQL
* rotate/rewrite object URLs

during D7.

---

# 10. Relationship to application code

Where necessary, trace the Voyome codebase to understand the permissions the database is expected to enforce.

Examples:

* who is allowed to remove collaborators
* who can invite travellers
* who can revoke invites
* who can edit bookings
* who can leave trips
* who can archive/remove members
* who can access journals

Distinguish carefully between:

1. **UI restrictions**
2. **client-side checks**
3. **actual database-enforced authorization**

Only #3 should be considered a reliable security boundary.

If Voyome's UI assumes stronger permissions than the database actually enforces, flag that.

---

# 11. Do not broaden into remediation

Do not fix any issue discovered during this review.

In particular, do not:

* rewrite policies
* tighten grants
* alter functions
* add migrations
* move Storage objects
* consolidate schema history
* refactor Supabase client code
* change signup/auth behavior
* make unrelated security improvements

Even obvious fixes should be reported first.

Each material remediation should receive its own scoped task after review.

---

# 12. Verification

After capturing the reference material:

* confirm no production write was performed
* confirm no migration-history metadata was changed
* confirm no production data was exported into the repo
* confirm no credentials/secrets were captured
* run `git diff` / `git status` and verify the only intended changes are reference/audit artifacts
* do **not** run a deployment

If production state may have been modified unintentionally, stop immediately and report exactly what happened before proceeding.

---

# 13. Output

Return one consolidated D7 report containing:

## A. Capture summary

Explain:

* commands/tools used
* why they were considered read-only
* schemas inspected
* anything deliberately excluded
* reference files created

## B. Production vs Git visibility

Summarize:

* what Git already represents accurately
* what production state was missing/incomplete from tracked migrations
* how significant the drift is
* whether Voyome can currently be reconstructed securely from migration history alone

Do not repair it yet.

## C. SECURITY DEFINER assessment

For each relevant privileged function include:

* function
* caller roles
* intended permission
* actual authorization check
* RLS-bypass implications
* `search_path` observations
* finding
* evidence
* confidence level

## D. RLS assessment

For each major table summarize:

* RLS status
* effective access model
* notable gaps or concerns
* confidence level

## E. D2 / Storage observations

Record anything relevant to journal-image access control separately so it can be used directly in the later D2 task.

## F. Findings

Rank material findings:

* **Critical**
* **High**
* **Medium**
* **Low**
* **Informational / architectural**

For each include:

1. affected object
2. evidence
3. actual/potential impact
4. confidence
5. recommended remediation direction
6. likely risk/complexity of fixing it

Do not inflate severity.

## G. Migration-history recommendation

Recommend — but do not implement — how Voyome should eventually make Git a trustworthy source of database schema history.

Explain whether you recommend:

* a baseline migration
* reconstructed historical migrations
* a production snapshot + future migrations
* another approach

and the trade-offs.

## H. Suggested next task

Based on the evidence, state whether:

* D2 should remain next as planned
* another newly discovered security issue should take precedence
* D7 revealed no immediate security blocker

Do not begin that task.

---

# 14. Audit philosophy

The purpose of D7 is **visibility and evidence**, not activity.

Prefer:

* inspecting over changing
* verified production definitions over assumptions
* database-enforced authorization over UI behavior
* explicit uncertainty over speculation
* narrow evidence-based findings over broad security redesign

A function or policy being unusual does not automatically make it vulnerable.

A UI restriction does not prove database authorization.

A `SECURITY DEFINER` function is not automatically unsafe; assess what privileges it has and what caller checks it performs.

If a point cannot be established safely from the available evidence, say so.

When the assessment is complete, **stop and report**.

Do not implement remediation, merge, deploy, or change production.
