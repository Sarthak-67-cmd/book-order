import crypto from "node:crypto";

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
    const { email, code, verificationToken } = await req.json();

    if (!email || !code || !verificationToken) {
      return new Response(
        JSON.stringify({
          message: "Email, OTP, and verification token are required."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // OTP must be exactly 6 digits
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({
          message: "OTP must be a 6-digit number."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const otpSecret = process.env.OTP_SECRET;

    if (!otpSecret) {
      console.error("OTP_SECRET is missing.");

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

    // Decode the verification token
    let tokenData;

    try {
      tokenData = JSON.parse(
        Buffer.from(verificationToken, "base64url").toString("utf8")
      );
    } catch {
      return new Response(
        JSON.stringify({
          message: "Invalid verification token."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const {
      email: tokenEmail,
      expiresAt,
      otpHash,
      signature
    } = tokenData;

    // Check token fields
    if (!tokenEmail || !expiresAt || !otpHash || !signature) {
      return new Response(
        JSON.stringify({
          message: "Invalid verification token."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Make sure the token belongs to the same email
    if (tokenEmail.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({
          message: "Email does not match the verification request."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check expiration
    if (Date.now() > Number(expiresAt)) {
      return new Response(
        JSON.stringify({
          message: "This OTP has expired. Please request a new one."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Re-create the signature
    const tokenString = `${tokenEmail}|${expiresAt}|${otpHash}`;

    const expectedSignature = crypto
      .createHmac("sha256", otpSecret)
      .update(tokenString)
      .digest("hex");

    // Compare signatures safely
    const signatureMatches =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

    if (!signatureMatches) {
      return new Response(
        JSON.stringify({
          message: "Invalid verification token."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Hash the OTP entered by the user
    const enteredOtpHash = crypto
      .createHmac("sha256", otpSecret)
      .update(code)
      .digest("hex");

    // Compare OTP hashes safely
    const otpMatches =
      enteredOtpHash.length === otpHash.length &&
      crypto.timingSafeEqual(
        Buffer.from(enteredOtpHash),
        Buffer.from(otpHash)
      );

    if (!otpMatches) {
      return new Response(
        JSON.stringify({
          message: "Incorrect OTP. Please try again."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // OTP is correct
    return new Response(
      JSON.stringify({
        verified: true,
        message: "Email verified successfully."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);

    return new Response(
      JSON.stringify({
        message: "Something went wrong while verifying the OTP."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
