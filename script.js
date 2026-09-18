```javascript
let cart = [];


/* =========================
   ADD STICKER
========================= */

function addSticker(name, price) {

  const existing =
    cart.find(item => item.name === name);

  if (existing) {

    existing.quantity++;

  } else {

    cart.push({
      name: name,
      price: price,
      quantity: 1
    });

  }

  updateCart();

  showAddedMessage(name);
}


/* =========================
   ADDED MESSAGE
========================= */

function showAddedMessage(name) {

  const message =
    document.createElement("div");

  message.textContent =
    `✓ ${name} added to cart`;

  message.style.position = "fixed";
  message.style.bottom = "25px";
  message.style.right = "25px";
  message.style.background = "#242124";
  message.style.color = "white";
  message.style.padding = "14px 20px";
  message.style.borderRadius = "10px";
  message.style.zIndex = "999";
  message.style.boxShadow =
    "0 10px 30px rgba(0,0,0,.2)";

  document.body.appendChild(message);

  setTimeout(() => {

    message.remove();

  }, 1800);
}


/* =========================
   UPDATE CART
========================= */

function updateCart() {

  const cartCount =
    document.getElementById("cartCount");

  const count =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  cartCount.textContent = count;


  const total = getTotal();


  document.getElementById(
    "totalPrice"
  ).textContent = `₹${total}`;


  document.getElementById(
    "modalTotal"
  ).textContent = `₹${total}`;


  renderOrderItems();

  renderCartItems();

  updateFormData();
}


/* =========================
   TOTAL
========================= */

function getTotal() {

  return cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

}


/* =========================
   ORDER ITEMS
========================= */

function renderOrderItems() {

  const container =
    document.getElementById("orderItems");


  if (cart.length === 0) {

    container.innerHTML = `
      <p class="empty-cart">
        No stickers selected — that's okay!
      </p>
    `;

    return;
  }


  container.innerHTML =
    cart.map((item, index) => {

      return `
        <div class="order-item">

          <div>

            <strong>
              ${escapeHTML(item.name)}
            </strong>

            <div style="color:#aaa;margin-top:4px;">
              ₹${item.price} each
            </div>

          </div>


          <div class="item-controls">

            <button
              class="quantity-button"
              type="button"
              onclick="changeQuantity(${index},-1)"
            >
              −
            </button>


            <strong>
              ${item.quantity}
            </strong>


            <button
              class="quantity-button"
              type="button"
              onclick="changeQuantity(${index},1)"
            >
              +
            </button>


            <strong>
              ₹${item.price * item.quantity}
            </strong>

          </div>

        </div>
      `;

    }).join("");
}


/* =========================
   CART MODAL
========================= */

function renderCartItems() {

  const container =
    document.getElementById("cartItems");


  if (cart.length === 0) {

    container.innerHTML = `
      <p style="color:#777;padding:20px 0;">
        Your cart is empty.
      </p>
    `;

    return;
  }


  container.innerHTML =
    cart.map(item => {

      return `
        <div class="modal-item">

          <div>

            <strong>
              ${escapeHTML(item.name)}
            </strong>

            <div style="color:#777;">
              ${item.quantity} × ₹${item.price}
            </div>

          </div>


          <strong>
            ₹${item.quantity * item.price}
          </strong>

        </div>
      `;

    }).join("");
}


/* =========================
   QUANTITY
========================= */

function changeQuantity(index, amount) {

  cart[index].quantity += amount;


  if (cart[index].quantity <= 0) {

    cart.splice(index, 1);

  }


  updateCart();
}


/* =========================
   CLEAR
========================= */

function clearCart() {

  cart = [];

  updateCart();
}


/* =========================
   OPEN CART
========================= */

function openCart() {

  document.getElementById(
    "cartModal"
  ).style.display = "flex";
}


/* =========================
   CLOSE CART
========================= */

function closeCart() {

  document.getElementById(
    "cartModal"
  ).style.display = "none";
}


/* =========================
   CHECKOUT
========================= */

function goToCheckout() {

  closeCart();

  document
    .querySelector(".order-section")
    .scrollIntoView({
      behavior: "smooth"
    });
}


/* =========================
   FORM DATA
========================= */

function updateFormData() {

  const orderInput =
    document.getElementById(
      "stickerOrderInput"
    );

  const totalInput =
    document.getElementById(
      "totalInput"
    );


  if (cart.length === 0) {

    orderInput.value =
      "No stickers selected";

  } else {

    orderInput.value =
      cart.map(item => {

        return (
          `${item.name} x ${item.quantity}` +
          ` = ₹${item.price * item.quantity}`
        );

      }).join("\n");

  }


  totalInput.value =
    `₹${getTotal()}`;
}


/* =========================
   SCROLL
========================= */

function scrollToStickers() {

  document
    .getElementById("stickers")
    .scrollIntoView({
      behavior: "smooth"
    });
}


/* =========================
   SUCCESS
========================= */

function closeSuccess() {

  document.getElementById(
    "successMessage"
  ).style.display = "none";
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


/* =========================
   FORMSPREE SUBMISSION
========================= */

document
  .getElementById("orderForm")
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      updateFormData();


      const form = event.target;


      const submitButton =
        form.querySelector(
          ".place-order"
        );


      submitButton.disabled = true;

      submitButton.textContent =
        "Sending Order...";


      try {

        const response =
          await fetch(
            form.action,
            {
              method: "POST",

              body:
                new FormData(form),

              headers: {
                "Accept":
                  "application/json"
              }
            }
          );


        if (response.ok) {

          form.reset();

          cart = [];

          updateCart();


          document.getElementById(
            "successMessage"
          ).style.display = "flex";


        } else {

          alert(
            "There was a problem submitting your order. Please try again."
          );

        }


      } catch (error) {

        alert(
          "Could not connect to Formspree. Please check your internet connection."
        );

      }


      submitButton.disabled = false;

      submitButton.textContent =
        "Place Order →";

    }
  );


/* =========================
   INITIALIZE
========================= */

updateCart();
```
