import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

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

    // Scoped to the caller's own token so every read below runs under their
    // RLS context, exactly as it would from the browser. This is what turns
    // "the row came back" into proof that the caller is allowed to act on it.
    const supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
        return NextResponse.json(
            { error: "Invalid or expired session" },
            { status: 401 }
        );
    }

    let body: { inviteId?: unknown };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const inviteId = Number(body.inviteId);

    if (!Number.isFinite(inviteId) || inviteId <= 0) {
        return NextResponse.json(
            { error: "Missing or invalid inviteId" },
            { status: 400 }
        );
    }

    // RLS on trip_invites scopes this to invites the caller can actually
    // see (the same access check the invites list uses), so a returned row
    // is the authorization check, not just a data lookup.
    const { data: invite, error: inviteError } = await supabase
        .from("trip_invites")
        .select("id, trip_id, email, inviter_name")
        .eq("id", inviteId)
        .maybeSingle();

    if (inviteError || !invite) {
        return NextResponse.json(
            { error: "Invite not found" },
            { status: 404 }
        );
    }

    const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("title")
        .eq("id", invite.trip_id)
        .maybeSingle();

    if (tripError || !trip) {
        return NextResponse.json(
            { error: "Invite not found" },
            { status: 404 }
        );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const inviteUrl = `${appUrl}/invite`;

    const tripTitle = trip.title || "a trip";
    const inviterName = invite.inviter_name || "Someone";

    try {
        const { error } = await resend.emails.send({
            from: "Voyome <hello@voyome.com>",
            to: invite.email,
            subject: `You're invited to join "${tripTitle}" on Voyome`,
            html: `
        <div style="font-family: sans-serif; padding: 24px;">
          <h2>You're invited to a trip on Voyome ✈️</h2>

          <p>
            ${escapeHtml(inviterName)} invited you to collaborate on:
          </p>

          <p style="font-size: 18px; font-weight: bold;">
            ${escapeHtml(tripTitle)}
          </p>

          <p>
            Sign in or create an account to join the trip.
          </p>

          <a
            href="${inviteUrl}"
            style="
              display: inline-block;
              margin-top: 16px;
              background: #f43f5e;
              color: white;
              padding: 12px 18px;
              border-radius: 12px;
              text-decoration: none;
              font-weight: 600;
            "
          >
            Open Voyome
          </a>
        </div>
      `,
        });

        if (error) {
            console.error("Resend invite email error:", error);

            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to send invite email" },
            { status: 500 }
        );
    }
}
