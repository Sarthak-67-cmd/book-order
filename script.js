const payment = document.getElementById("payment");
const upiPayment = document.getElementById("upiPayment");
const cashPayment = document.getElementById("cashPayment");

payment.addEventListener("change", function () {

  if (payment.value === "UPI") {

    upiPayment.style.display = "block";
    cashPayment.style.display = "none";

  } else if (payment.value === "Cash") {

    upiPayment.style.display = "none";
    cashPayment.style.display = "flex";

  } else {

    upiPayment.style.display = "none";
    cashPayment.style.display = "none";

  }

});
