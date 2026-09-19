const description = document.getElementById("description");
const count = document.getElementById("count");
const hiddenDescription = document.getElementById("hiddenDescription");
const form = document.getElementById("orderForm");
const submitButton = document.getElementById("submitButton");


/* =========================
   GO TO ORDER
========================= */

function goToOrder() {
  document.getElementById("order").scrollIntoView({
    behavior: "smooth"
  });

  setTimeout(() => {
    description.focus();
  }, 500);
}


/* =========================
   CHARACTER COUNTER
========================= */

description.addEventListener("input", function () {

  const text = description.value.trim();

  count.textContent = description.value.length;

  hiddenDescription.value = text;

});


/* =========================
   FORM SUBMISSION
========================= */

form.addEventListener("submit", function (event) {

  const stickerDescription = description.value.trim();

  /* Make sure description exists */
  if (stickerDescription === "") {

    event.preventDefault();

    alert("Please describe the sticker you want.");

    description.focus();

    return;
  }


  /* Put description into Formspree field */
  hiddenDescription.value = stickerDescription;


  /* Prevent accidental double-click */
  submitButton.disabled = true;

  submitButton.textContent = "⏳ Sending Order...";

});
