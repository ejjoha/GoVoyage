import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { consumeRateLimits, getClientIp } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Missing authorization token" },
            { status: 401 }
        );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
        return NextResponse.json(
            { error: "Server is missing Supabase configuration" },
            { status: 500 }
        );
    }

    const supabase = createClient(supabaseUrl, anonKey);

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user?.email) {
        return NextResponse.json(
            { error: "Invalid or expired session" },
            { status: 401 }
        );
    }

    // The recipient is strictly the authenticated caller's own verified
    // address - never taken from the request body.
    const email = user.email;

    // Rate-limit only after identity is established above - abuse control
    // on top of D6's existing auth requirement, never a substitute for it.
    // IP is the dimension that actually matters for the signup-abuse path:
    // a script creating many distinct accounts gets a different user.id
    // each time, so per-actor alone can't catch it.
    const clientIp = getClientIp(request);

    if (!clientIp) {
        console.error("Missing client IP for rate limiting on send-welcome-email");
        return NextResponse.json(
            { error: "Unable to process request" },
            { status: 503 }
        );
    }

    const rateLimitResult = await consumeRateLimits([
        { dimension: "welcome_actor", rawKey: user.id, maxCount: 3, windowSeconds: 3600 },
        { dimension: "welcome_ip", rawKey: clientIp, maxCount: 8, windowSeconds: 3600 },
    ]);

    if (rateLimitResult.outcome === "error") {
        return NextResponse.json(
            { error: "Unable to process request" },
            { status: 503 }
        );
    }

    if (rateLimitResult.outcome === "blocked") {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds) },
            }
        );
    }

    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.voyome.com";

        const text = `Hello,

Your Voyome account has been created successfully.

You can now sign in and start planning your trips:
${appUrl}

Thanks,
The Voyome team`;

        const { error } = await resend.emails.send({
            from: "Voyome <hello@voyome.com>",
            to: email,
            replyTo: "hello@voyome.com",
            subject: "Your Voyome account has been created",
            text,
            html: `
        <div style="font-family: sans-serif; padding: 24px;">
          <p>Hello,</p>

          <p>Your Voyome account has been created successfully.</p>

          <p>
            You can now sign in and start planning your trips:
          </p>

          <p>
            <a href="${appUrl}">${appUrl}</a>
          </p>

          <p>
            Thanks,<br />
            The Voyome team
          </p>
        </div>
      `,
        });

        if (error) {
            console.error("Resend welcome email error:", error);

            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to send welcome email" },
            { status: 500 }
        );
    }
}
