```javascript
import crypto from "node:crypto";


/*
  OTP SETTINGS
*/

const OTP_EXPIRY_SECONDS = 10 * 60;


/*
  JSON RESPONSE HELPER
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
  CREATE SIGNED OTP TOKEN
*/

function createToken(email, otp, secret) {

  const expiresAt =
    Math.floor(Date.now() / 1000)
    + OTP_EXPIRY_SECONDS;


  const hash =
    hashOtp(
      email,
      otp,
      secret
    );


  const payload = Buffer
    .from(
      JSON.stringify({
        email: email.toLowerCase(),
        expiresAt,
        hash
      })
    )
    .toString("base64url");


  const signature =
    crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");


  return `${payload}.${signature}`;

}


/*
  FUNCTION
*/

export default async function (request) {

  if (request.method !== "POST") {

    return jsonResponse(
      405,
      {
        message: "Method not allowed."
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


    /*
      BASIC EMAIL VALIDATION
    */

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

      return jsonResponse(
        400,
        {
          message: "Please enter a valid email address."
        }
      );

    }


    /*
      REQUIRED ENVIRONMENT VARIABLES
    */

    const resendApiKey =
      process.env.RESEND_API_KEY;

    const fromEmail =
      process.env.RESEND_FROM_EMAIL;

    const otpSecret =
      process.env.OTP_SECRET;


    if (
      !resendApiKey ||
      !fromEmail ||
      !otpSecret
    ) {

      console.error(
        "Missing required environment variables."
      );

      return jsonResponse(
        500,
        {
          message:
            "Email verification is not configured yet."
        }
      );

    }


    /*
      GENERATE 6-DIGIT OTP
    */

    const otp =
      crypto
        .randomInt(100000, 1000000)
        .toString();


    /*
      CREATE SIGNED TOKEN

      The browser receives this token,
      but the secret itself never leaves
      the server.
    */

    const verificationToken =
      createToken(
        email,
        otp,
        otpSecret
      );


    /*
      SEND EMAIL THROUGH RESEND
    */

    const resendResponse =
      await fetch(
        "https://api.resend.com/emails",
        {

          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${resendApiKey}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            from: fromEmail,

            to: [email],

            subject:
              "Your Studio Stick verification code",

            html: `
              <div style="
                font-family: Arial, sans-serif;
                max-width: 520px;
                margin: auto;
                padding: 25px;
              ">

                <h2>
                  📚 Studio Stick
                </h2>

                <p>
                  Your email verification code is:
                </p>

                <div style="
                  font-size: 34px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  padding: 20px;
                  background: #f4f1ff;
                  border-radius: 12px;
                  text-align: center;
                ">
                  ${otp}
                </div>

                <p>
                  This code expires in 10 minutes.
                </p>

                <p style="color:#777;">
                  If you did not request this code,
                  you can ignore this email.
                </p>

              </div>
            `

          })

        }
      );


    if (!resendResponse.ok) {

      const errorText =
        await resendResponse.text();

      console.error(
        "Resend error:",
        errorText
      );

      return jsonResponse(
        502,
        {
          message:
            "We couldn't send the OTP email. Please try again."
        }
      );

    }


    /*
      Return token to browser.

      The token contains only:
      - email
      - expiry
      - OTP hash
      - server signature

      The actual OTP is NOT returned.
    */

    return jsonResponse(
      200,
      {
        message:
          "OTP sent successfully.",

        verificationToken
      }
    );


  } catch (error) {

    console.error(
      "send-otp error:",
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
