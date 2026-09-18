const description =
  document.getElementById("description");

const count =
  document.getElementById("count");

const hiddenDescription =
  document.getElementById("hiddenDescription");


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
   BEFORE FORM SUBMISSION
========================= */

document
  .querySelector("form")
  .addEventListener(
    "submit",
    function () {

      /*
       * Custom sticker description is optional.
       */

      if (
        description.value.trim() === ""
      ) {

        hiddenDescription.value =
          "No custom sticker description provided.";

      } else {

        hiddenDescription.value =
          description.value.trim();

      }

    }
  );
