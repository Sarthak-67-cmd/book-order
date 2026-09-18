/* =========================
   ELEMENTS
========================= */

const stickerDescription =
  document.getElementById("stickerDescription");

const characterCount =
  document.getElementById("characterCount");

const summaryDescription =
  document.getElementById("summaryDescription");

const quantity =
  document.getElementById("quantity");

const summaryQuantity =
  document.getElementById("summaryQuantity");

const form =
  document.getElementById("orderForm");

const submitButton =
  document.getElementById("submitButton");

const stickerCustomization =
  document.getElementById("stickerCustomization");

const successModal =
  document.getElementById("successModal");


/* =========================
   SCROLL TO ORDER
========================= */

function scrollToOrder() {

  document
    .getElementById("order")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* =========================
   CHARACTER COUNTER
========================= */

stickerDescription.addEventListener(
  "input",
  function () {

    const length =
      stickerDescription.value.length;

    characterCount.textContent = length;

    updateSummary();

  }
);


/* =========================
   QUANTITY UPDATE
========================= */

quantity.addEventListener(
  "change",
  function () {

    updateSummary();

  }
);


/* =========================
   UPDATE SUMMARY
========================= */

function updateSummary() {

  const description =
    stickerDescription.value.trim();

  const selectedQuantity =
    quantity.value;


  if (description) {

    summaryDescription.textContent =
      description;

  } else {

    summaryDescription.textContent =
      "Not entered";

  }


  if (selectedQuantity) {

    const number =
      parseInt(selectedQuantity);

    summaryQuantity.textContent =
      number +
      (number === 1 ? " Sticker" : " Stickers");

  } else {

    summaryQuantity.textContent =
      "Not selected";

  }

}


/* =========================
   FORM SUBMISSION
========================= */

form.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const description =
      stickerDescription.value.trim();


    /*
      Sticker customization is optional.
      If the student doesn't enter anything,
      the order can still be submitted.
    */

    if (description === "") {

      stickerCustomization.value =
        "No custom sticker description provided.";

    } else {

      stickerCustomization.value =
        description;

    }


    submitButton.disabled = true;

    submitButton.textContent =
      "Submitting Order...";


    try {

      const response =
        await fetch(
          form.action,
          {
            method: "POST",

            body: new FormData(form),

            headers: {
              "Accept": "application/json"
            }
          }
        );


      if (!response.ok) {

        throw new Error(
          "Form submission failed"
        );

      }


      /*
        Show success message
      */

      successModal.classList.add("show");


      /*
        Reset form
      */

      form.reset();

      stickerDescription.value = "";

      characterCount.textContent = "0";

      updateSummary();


    } catch (error) {

      console.error(error);

      showToast(
        "Something went wrong. Please try again."
      );

    } finally {

      submitButton.disabled = false;

      submitButton.textContent =
        "🛍️ Place Order";

    }

  }
);


/* =========================
   CLOSE SUCCESS MODAL
========================= */

function closeSuccess() {

  successModal.classList.remove("show");

}


/* =========================
   CLICK OUTSIDE MODAL
========================= */

successModal.addEventListener(
  "click",
  function (event) {

    if (event.target === successModal) {

      closeSuccess();

    }

  }
);


/* =========================
   TOAST
========================= */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");


  setTimeout(
    function () {

      toast.classList.remove("show");

    },
    3000
  );

}


/* =========================
   INITIALIZE
========================= */

updateSummary();
