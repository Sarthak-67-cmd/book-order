const description = document.getElementById("description");
const count = document.getElementById("count");

const form = document.getElementById("orderForm");
const hiddenDescription =
  document.getElementById("hiddenDescription");

const submitButton =
  document.getElementById("submitButton");

const success =
  document.getElementById("success");


/* SCROLL TO ORDER */

function goToOrder() {
  document.getElementById("order").scrollIntoView({
    behavior: "smooth"
  });
}


/* CHARACTER COUNTER */

description.addEventListener("input", function () {

  count.textContent = description.value.length;

});


/* FORM SUBMISSION */

form.addEventListener("submit", async function (event) {

  event.preventDefault();

  hiddenDescription.value =
    description.value.trim() ||
    "No custom sticker description provided.";


  submitButton.disabled = true;

  submitButton.textContent =
    "Submitting Order...";


  try {

    const response = await fetch(
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
      throw new Error("Submission failed");
    }


    form.reset();

    description.value = "";

    count.textContent = "0";

    success.classList.add("show");


  } catch (error) {

    console.error(error);

    alert(
      "Unable to submit the order. Please try again."
    );

  }


  submitButton.disabled = false;

  submitButton.textContent =
    "🛍️ Place Order";

});


/* CLOSE SUCCESS */

function closeSuccess() {

  success.classList.remove("show");

}


/* CLOSE WHEN CLICKING OUTSIDE */

success.addEventListener("click", function (event) {

  if (event.target === success) {
    closeSuccess();
  }

});
