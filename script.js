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
   FORM SUBMISSION
========================= */

form.addEventListener(
  "submit",
  function (event) {

    const stickerDescription =
      description.value.trim();

    /* Make sure description exists */

    if (stickerDescription === "") {

      event.preventDefault();

      alert(
        "Please describe the sticker you want."
      );

      description.focus();

      return;

    }


    /* Prevent accidental double click */

    submitButton.disabled = true;

    submitButton.textContent =
      "⏳ Sending Order...";

  }
);
