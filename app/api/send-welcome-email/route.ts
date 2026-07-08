import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

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