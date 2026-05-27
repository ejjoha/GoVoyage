import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { email, tripTitle, inviterName } = body;

        if (!email || !tripTitle) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        const inviteUrl = `${appUrl}/invite`;

        const { error } = await resend.emails.send({
            from: "GoVoyage <onboarding@resend.dev>",
            to: email,
            subject: `You're invited to join "${tripTitle}" on GoVoyage`,
            html: `
        <div style="font-family: sans-serif; padding: 24px;">
          <h2>You're invited to a trip on GoVoyage ✈️</h2>

          <p>
            ${inviterName || "Someone"} invited you to collaborate on:
          </p>

          <p style="font-size: 18px; font-weight: bold;">
            ${tripTitle}
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
            Open GoVoyage
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