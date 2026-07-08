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

    const heading = firstName
      ? `Welcome to Voyome, ${firstName}`
      : "Welcome to Voyome";

    const text = `${heading}

Your account has been created successfully.

You can now:
- organize your trip day by day
- invite travel companions
- split expenses and keep track of shared costs
- build smarter packing lists
- revisit past trips in one place

Open Voyome: ${appUrl}

Thanks for joining,
The Voyome team`;

    const { error } = await resend.emails.send({
      from: "Voyome <hello@voyome.com>",
      to: email,
      replyTo: "hello@voyome.com",
      subject: "Your Voyome account is ready",
      text,
      html: `
        <div style="font-family: sans-serif; padding: 24px;">
          <h2>${heading}</h2>

          <p>
            Your account has been created successfully.
          </p>

          <p>
            You can now organize trips, invite travel companions, track shared expenses,
            build smarter packing lists, and revisit past trips in one place.
          </p>

          <a
            href="${appUrl}"
            style="
              display: inline-block;
              margin-top: 16px;
              background: #03234b;
              color: white;
              padding: 12px 18px;
              border-radius: 12px;
              text-decoration: none;
              font-weight: 600;
            "
          >
            Open Voyome
          </a>

          <p style="margin-top: 24px;">
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