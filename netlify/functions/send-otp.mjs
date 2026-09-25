import crypto from "node:crypto";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export default async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ message: "Please enter a valid email address." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const otpSecret = process.env.OTP_SECRET;

    if (!resendApiKey || !fromEmail || !otpSecret) {
      console.error("Missing environment variables.");

      return new Response(
        JSON.stringify({
          message: "Server configuration is incomplete."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    // Hash OTP so the actual code isn't stored in the verification token
    const otpHash = crypto
      .createHmac("sha256", otpSecret)
      .update(otp)
      .digest("hex");

    // Create signed verification token
    const tokenData = `${email}|${expiresAt}|${otpHash}`;

    const signature = crypto
      .createHmac("sha256", otpSecret)
      .update(tokenData)
      .digest("hex");

    const verificationToken = Buffer.from(
      JSON.stringify({
        email,
        expiresAt,
        otpHash,
        signature
      })
    ).toString("base64url");

    // Send OTP using Resend
    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: "Your Studio Stick verification code",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
              <h2>📚 Studio Stick</h2>
              <p>Your email verification code is:</p>

              <div style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:25px 0;">
                ${otp}
              </div>

              <p>This code will expire in 10 minutes.</p>
              <p>If you did not request this code, you can ignore this email.</p>
            </div>
          `
        })
      }
    );

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);

      return new Response(
        JSON.stringify({
          message:
            resendData?.message ||
            "Resend could not send the verification email."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "OTP sent successfully.",
        verificationToken
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Send OTP error:", error);

    return new Response(
      JSON.stringify({
        message: "Something went wrong while sending the OTP."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
