import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, displayName } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.voyome.com";

    const firstName =
      typeof displayName === "string" && displayName.trim().length > 0
        ? displayName.trim().split(" ")[0]
        : null;

    const greeting = firstName ? `Welcome to Voyome, ${firstName}.` : "Welcome to Voyome.";

    const { error } = await resend.emails.send({
      from: "Voyome <hello@voyome.com>",
      to: email,
      subject: "Welcome to Voyome",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1c1917; line-height: 1.6;">
          <h2 style="margin: 0 0 16px; color: #1c1917;">${greeting}</h2>

          <p style="margin: 0 0 16px;">
            Your account is ready, and you can now start planning trips with shared itineraries,
            cost tracking, and smart packing suggestions.
          </p>

          <p style="margin: 0 0 12px; font-weight: 600;">With Voyome, you can:</p>

          <ul style="margin: 0 0 20px; padding-left: 20px;">
            <li>organize your trip day by day</li>
            <li>invite travel companions</li>
            <li>split expenses and stay on top of shared costs</li>
            <li>build smarter packing lists based on your plans</li>
            <li>revisit past trips and keep your travel memories in one place</li>
          </ul>

          <a
            href="${appUrl}"
            style="
              display: inline-block;
              margin-top: 8px;
              background: #03234b;
              color: #ffffff;
              padding: 12px 18px;
              border-radius: 12px;
              text-decoration: none;
              font-weight: 600;
            "
          >
            Open Voyome
          </a>

          <p style="margin: 24px 0 0;">
            Thanks for joining,<br />
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
