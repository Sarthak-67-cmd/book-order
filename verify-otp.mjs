```javascript
import crypto from "node:crypto";


/*
  JSON RESPONSE
*/

function jsonResponse(statusCode, data) {

  return new Response(
    JSON.stringify(data),
    {
      status: statusCode,

      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );

}


/*
  SAFE STRING COMPARISON
*/

function safeEqual(a, b) {

  const aBuffer =
    Buffer.from(a);

  const bBuffer =
    Buffer.from(b);


  if (
    aBuffer.length !==
    bBuffer.length
  ) {

    return false;

  }


  return crypto.timingSafeEqual(
    aBuffer,
    bBuffer
  );

}


/*
  HASH OTP
*/

function hashOtp(email, otp, secret) {

  return crypto
    .createHmac("sha256", secret)
    .update(
      `${email.toLowerCase()}:${otp}`
    )
    .digest("hex");

}


/*
  VERIFY SIGNED TOKEN
*/

function verifyToken(
  token,
  email,
  code,
  secret
) {

  if (!token) {
    return false;
  }


  const parts =
    token.split(".");


  if (parts.length !== 2) {
    return false;
  }


  const payload =
    parts[0];

  const signature =
    parts[1];


  /*
    Recreate server signature
  */

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(payload)
      .digest("base64url");


  if (
    !safeEqual(
      signature,
      expectedSignature
    )
  ) {

    return false;

  }


  /*
    Decode payload
  */

  let decoded;

  try {

    decoded =
      JSON.parse(
        Buffer
          .from(
            payload,
            "base64url"
          )
          .toString("utf8")
      );

  } catch {

    return false;

  }


  /*
    Check email
  */

  if (
    decoded.email !==
    email.toLowerCase()
  ) {

    return false;

  }


  /*
    Check expiry
  */

  const now =
    Math.floor(
      Date.now() / 1000
    );


  if (
    now > decoded.expiresAt
  ) {

    return false;

  }


  /*
    Recalculate OTP hash
  */

  const expectedHash =
    hashOtp(
      email,
      code,
      secret
    );


  return safeEqual(
    decoded.hash,
    expectedHash
  );

}


/*
  FUNCTION
*/

export default async function (request) {

  if (request.method !== "POST") {

    return jsonResponse(
      405,
      {
        message:
          "Method not allowed."
      }
    );

  }


  try {

    const body =
      await request.json();


    const email =
      String(body.email || "")
        .trim()
        .toLowerCase();


    const code =
      String(body.code || "")
        .trim();


    const verificationToken =
      String(
        body.verificationToken || ""
      );


    /*
      IMPORTANT:
      The current frontend doesn't need
      to manually send the token because
      we store it in sessionStorage below.
      This fallback makes the function
      reject missing tokens safely.
    */

    if (!email) {

      return jsonResponse(
        400,
        {
          message:
            "Email is required."
        }
      );

    }


    if (!/^\d{6}$/.test(code)) {

      return jsonResponse(
        400,
        {
          message:
            "Enter the 6-digit OTP."
        }
      );

    }


    if (!verificationToken) {

      return jsonResponse(
        400,
        {
          message:
            "Please request a new OTP."
        }
      );

    }


    const otpSecret =
      process.env.OTP_SECRET;


    if (!otpSecret) {

      console.error(
        "OTP_SECRET is missing."
      );

      return jsonResponse(
        500,
        {
          message:
            "OTP verification is not configured."
        }
      );

    }


    /*
      VERIFY
    */

    const valid =
      verifyToken(
        verificationToken,
        email,
        code,
        otpSecret
      );


    if (!valid) {

      return jsonResponse(
        400,
        {
          message:
            "Incorrect or expired OTP."
        }
      );

    }


    /*
      SUCCESS
    */

    return jsonResponse(
      200,
      {
        verified: true,

        message:
          "Email verified successfully."
      }
    );


  } catch (error) {

    console.error(
      "verify-otp error:",
      error
    );

    return jsonResponse(
      500,
      {
        message:
          "Something went wrong. Please try again."
      }
    );

  }

}
```
