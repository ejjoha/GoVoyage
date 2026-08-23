import "server-only";

import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Abuse-control layer only - this never determines whether an action is
// allowed (that's D1/D6's job, already enforced before this is ever
// called). It only constrains how often an already-authorized action can
// repeat.

const RATE_LIMIT_HASH_SECRET = process.env.RATE_LIMIT_HASH_SECRET;

// Raw identifiers (user id, email, IP) are hashed here, server-side, before
// anything is sent to Postgres - the database never sees or stores the
// actual value, only an opaque HMAC keyed to a secret that never leaves
// this process.
function hashKey(dimension: string, rawValue: string): string {
    if (!RATE_LIMIT_HASH_SECRET) {
        throw new Error("Missing RATE_LIMIT_HASH_SECRET");
    }

    return createHmac("sha256", RATE_LIMIT_HASH_SECRET)
        .update(`${dimension}:${rawValue}`)
        .digest("hex");
}

function getServiceRoleClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error("Missing Supabase service-role configuration");
    }

    return createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// Vercel's edge network overwrites x-forwarded-for itself for traffic
// passing through its proxy - a client cannot successfully spoof this on a
// standard deployment (the exception is an Enterprise "trusted proxies"
// configuration, not in use here). The leftmost entry is the original
// client; anything after it is Vercel's own hop.
export function getClientIp(request: Request): string | null {
    const forwardedFor = request.headers.get("x-forwarded-for");

    if (!forwardedFor) return null;

    const first = forwardedFor.split(",")[0]?.trim();

    return first || null;
}

export type RateLimitSpec = {
    dimension: string;
    rawKey: string;
    maxCount: number;
    windowSeconds: number;
};

export type RateLimitResult =
    | { outcome: "allowed" }
    | { outcome: "blocked"; retryAfterSeconds: number }
    | { outcome: "error" };

// One atomic, all-dimensions decision per call - see
// consume_email_rate_limits() in the matching migration for the actual
// check-then-increment logic. A request blocked on any single dimension
// never consumes capacity on the others.
export async function consumeRateLimits(
    specs: RateLimitSpec[]
): Promise<RateLimitResult> {
    try {
        const hashedSpecs = specs.map((spec) => ({
            dimension: spec.dimension,
            key_hash: hashKey(spec.dimension, spec.rawKey),
            max_count: spec.maxCount,
            window_seconds: spec.windowSeconds,
        }));

        const supabase = getServiceRoleClient();

        const { data, error } = await supabase.rpc("consume_email_rate_limits", {
            specs: hashedSpecs,
        });

        if (error || !data) {
            console.error("Rate limit check failed:", error);
            return { outcome: "error" };
        }

        if (data.allowed === true) {
            return { outcome: "allowed" };
        }

        if (data.allowed !== false || typeof data.reset_at !== "string") {
            console.error("Unexpected rate-limit RPC response");
            return { outcome: "error" };
        }

        const resetAtMs = Date.parse(data.reset_at);

        if (!Number.isFinite(resetAtMs)) {
            console.error("Invalid rate-limit reset timestamp");
            return { outcome: "error" };
        }

        const retryAfterSeconds = Math.max(
            1,
            Math.ceil((resetAtMs - Date.now()) / 1000)
        );

        return { outcome: "blocked", retryAfterSeconds };
    } catch (error) {
        console.error("Rate limit check threw:", error);
        return { outcome: "error" };
    }
}
