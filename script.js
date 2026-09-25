const description =
  document.getElementById("description");

const count =
  document.getElementById("count");

const hiddenDescription =
  document.getElementById("hiddenDescription");

const payment =
  document.getElementById("payment");

const upiPayment =
  document.getElementById("upiPayment");

const cashPayment =
  document.getElementById("cashPayment");

const form =
  document.getElementById("orderForm");

const submitButton =
  document.getElementById("submitButton");


/* =========================
   GO TO ORDER
========================= */

function goToOrder() {

  document
    .getElementById("order")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* =========================
   CHARACTER COUNTER
========================= */

description.addEventListener(
  "input",
  function () {

    count.textContent =
      description.value.length;

    hiddenDescription.value =
      description.value.trim();

  }
);


/* =========================
   PAYMENT SELECTION
========================= */

payment.addEventListener(
  "change",
  function () {

    if (payment.value === "UPI") {

      upiPayment.style.display =
        "block";

      cashPayment.style.display =
        "none";

    }

    else if (payment.value === "Cash") {

      upiPayment.style.display =
        "none";

      cashPayment.style.display =
        "flex";

    }

    else {

      upiPayment.style.display =
        "none";

      cashPayment.style.display =
        "none";

    }

  }
);


/* =========================
   FORM SUBMISSION
========================= */

form.addEventListener(
  "submit",
  function (event) {

    const stickerText =
      description.value.trim();


    if (stickerText === "") {

      event.preventDefault();

      alert(
        "Please describe the sticker you want."
      );

      description.focus();

      return;

    }


    hiddenDescription.value =
      stickerText;


    submitButton.disabled =
      true;

    submitButton.textContent =
      "⏳ Sending Order...";

  }
);
