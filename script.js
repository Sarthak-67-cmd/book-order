```javascript
/* =========================
   ELEMENTS
========================= */

const description =
  document.getElementById("description");

const count =
  document.getElementById("count");

const form =
  document.getElementById("orderForm");

const submitButton =
  document.getElementById("submitButton");

const payment =
  document.getElementById("payment");

const upiPayment =
  document.getElementById("upiPayment");

const cashPayment =
  document.getElementById("cashPayment");

const email =
  document.getElementById("email");

const sendOtpButton =
  document.getElementById("sendOtpButton");

const otpArea =
  document.getElementById("otpArea");

const otp =
  document.getElementById("otp");

const verifyOtpButton =
  document.getElementById("verifyOtpButton");

const otpMessage =
  document.getElementById("otpMessage");

const verifiedMessage =
  document.getElementById("verifiedMessage");


let emailVerified = false;


/* =========================
   GO TO ORDER
========================= */

function goToOrder() {

  document
    .getElementById("order")
    .scrollIntoView({
      behavior: "smooth"
    });

  setTimeout(function () {
    description.focus();
  }, 500);
}


/* =========================
   CHARACTER COUNTER
========================= */

description.addEventListener(
  "input",
  function () {

    count.textContent =
      description.value.length;

  }
);


/* =========================
   PAYMENT METHOD
========================= */

payment.addEventListener(
  "change",
  function () {

    if (payment.value === "UPI") {

      upiPayment.style.display = "block";

      cashPayment.style.display = "none";

    }

    else if (payment.value === "Cash") {

      upiPayment.style.display = "none";

      cashPayment.style.display = "flex";

    }

    else {

      upiPayment.style.display = "none";

      cashPayment.style.display = "none";

    }

  }
);


/* =========================
   RESET VERIFICATION
   IF EMAIL CHANGES
========================= */

email.addEventListener(
  "input",
  function () {

    emailVerified = false;

    verifiedMessage.style.display = "none";

    submitButton.disabled = true;

    submitButton.textContent =
      "🔒 Verify Email First";

    otpArea.style.display = "none";

    otp.value = "";

    otpMessage.textContent = "";

  }
);


/* =========================
   SEND OTP
========================= */

sendOtpButton.addEventListener(
  "click",
  async function () {

    const emailAddress =
      email.value.trim();

    if (!emailAddress) {

      alert("Please enter your email address first.");

      email.focus();

      return;
    }


    if (!email.checkValidity()) {

      alert("Please enter a valid email address.");

      email.focus();

      return;
    }


    sendOtpButton.disabled = true;

    sendOtpButton.textContent =
      "⏳ Sending OTP...";

    otpMessage.textContent = "";


    try {

      const response =
        await fetch("/.netlify/functions/send-otp", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: emailAddress
          })

        });


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to send OTP."
        );

      }


      otpArea.style.display = "block";

      otpMessage.textContent =
        "✅ OTP sent. Check your email.";

      otpMessage.style.color =
        "#2e7d32";

      otp.focus();


      sendOtpButton.textContent =
        "📩 Send OTP Again";

    }

    catch (error) {

      otpMessage.textContent =
        error.message;

      otpMessage.style.color =
        "#c62828";

      sendOtpButton.textContent =
        "📩 Send OTP";

    }

    finally {

      sendOtpButton.disabled = false;

    }

  }
);


/* =========================
   VERIFY OTP
========================= */

verifyOtpButton.addEventListener(
  "click",
  async function () {

    const emailAddress =
      email.value.trim();

    const code =
      otp.value.trim();


    if (!emailAddress) {

      alert("Please enter your email first.");

      return;
    }


    if (!/^\d{6}$/.test(code)) {

      otpMessage.textContent =
        "Please enter the 6-digit OTP.";

      otpMessage.style.color =
        "#c62828";

      otp.focus();

      return;
    }


    verifyOtpButton.disabled = true;

    verifyOtpButton.textContent =
      "⏳ Checking...";


    try {

      const response =
        await fetch("/.netlify/functions/verify-otp", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: emailAddress,
            code: code
          })

        });


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Incorrect OTP."
        );

      }


      emailVerified = true;


      otpMessage.textContent =
        "✅ OTP verified successfully.";

      otpMessage.style.color =
        "#2e7d32";


      verifiedMessage.style.display =
        "block";


      submitButton.disabled =
        false;

      submitButton.textContent =
        "🛍️ Place Order";


      verifyOtpButton.textContent =
        "✅ Verified";

      verifyOtpButton.disabled =
        true;

      sendOtpButton.disabled =
        true;


    }

    catch (error) {

      emailVerified = false;

      otpMessage.textContent =
        error.message;

      otpMessage.style.color =
        "#c62828";

      verifyOtpButton.disabled =
        false;

      verifyOtpButton.textContent =
        "✅ Verify OTP";

    }

  }
);


/* =========================
   FORM SUBMISSION
========================= */

form.addEventListener(
  "submit",
  function (event) {

    /*
      Do not allow Formspree submission
      until the email has been verified.
    */

    if (!emailVerified) {

      event.preventDefault();

      alert(
        "Please verify your email with the OTP before placing your order."
      );

      return;

    }


    /*
      Allow the normal Formspree submission.
      Formspree will then handle the order.
    */

    submitButton.disabled = true;

    submitButton.textContent =
      "⏳ Sending Order...";

  }
);
```
