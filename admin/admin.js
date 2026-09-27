import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyAo__DXwHqckn2ULcjYJea9ICmbV5-Jsug",
  authDomain: "book-orders-65305.firebaseapp.com",
  projectId: "book-orders-65305",
  storageBucket: "book-orders-65305.firebasestorage.app",
  messagingSenderId: "162519349393",
  appId: "1:162519349393:web:9c370311b5c6565a6aa730",
  measurementId: "G-RYRNSN9ZS2"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================
// ELEMENTS
// ==========================================

const loginScreen =
  document.getElementById("loginScreen");

const dashboard =
  document.getElementById("dashboard");

const loginForm =
  document.getElementById("loginForm");

const loginError =
  document.getElementById("loginError");

const logoutButton =
  document.getElementById("logoutButton");

const refreshButton =
  document.getElementById("refreshButton");

const ordersContainer =
  document.getElementById("ordersContainer");

const totalOrders =
  document.getElementById("totalOrders");

const newOrders =
  document.getElementById("newOrders");

const pendingPayments =
  document.getElementById("pendingPayments");

const readyOrders =
  document.getElementById("readyOrders");


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  loginError.textContent = "";

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  } catch (error) {

    console.error(error);

    loginError.textContent =
  error.code + " — " + error.message;

  }

});


// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(auth, (user) => {

  if (user) {

    loginScreen.classList.add("hidden");

    dashboard.classList.remove("hidden");

    loadOrders();

  } else {

    loginScreen.classList.remove("hidden");

    dashboard.classList.add("hidden");

  }

});


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener("click", async () => {

  await signOut(auth);

});


// ==========================================
// LOAD ORDERS
// ==========================================

let unsubscribeOrders = null;

function loadOrders() {

  if (unsubscribeOrders) {
    unsubscribeOrders();
  }

  const ordersQuery = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  unsubscribeOrders = onSnapshot(
    ordersQuery,
    (snapshot) => {

      const orders = [];

      snapshot.forEach((orderDoc) => {

        orders.push({
          id: orderDoc.id,
          ...orderDoc.data()
        });

      });

      displayOrders(orders);

    },

    (error) => {

      console.error(error);

      ordersContainer.innerHTML = `
        <div class="error-box">
          ❌ Could not load orders.
          <br><br>
          Check your Firestore database and security rules.
        </div>
      `;

    }
  );

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders(orders) {

  updateStats(orders);

  if (orders.length === 0) {

    ordersContainer.innerHTML = `
      <div class="empty">
        📦 No orders yet.
      </div>
    `;

    return;

  }


  ordersContainer.innerHTML = "";


  orders.forEach((order) => {

    const card =
      document.createElement("div");

    card.className = "order-card";


    card.innerHTML = `

      <div class="order-top">

        <div>

          <h3>
            📦 Order
            <span>#${order.id.substring(0, 8)}</span>
          </h3>

          <p class="date">
            ${formatDate(order.createdAt)}
          </p>

        </div>

        <span class="status ${getStatusClass(order.orderStatus)}">
          ${escapeHTML(order.orderStatus || "new")}
        </span>

      </div>


      <div class="order-grid">

        <div>
          <label>Student</label>
          <strong>
            ${escapeHTML(order.studentName || "-")}
          </strong>
        </div>

        <div>
          <label>Class</label>
          <strong>
            ${escapeHTML(order.className || "-")}
          </strong>
        </div>

        <div>
          <label>Section</label>
          <strong>
            ${escapeHTML(order.section || "-")}
          </strong>
        </div>

        <div>
          <label>Quantity</label>
          <strong>
            ${escapeHTML(order.quantity || "-")}
          </strong>
        </div>

        <div>
          <label>Phone</label>
          <strong>
            ${escapeHTML(order.phone || "-")}
          </strong>
        </div>

        <div>
          <label>Email</label>
          <strong>
            ${escapeHTML(order.email || "-")}
          </strong>
        </div>

      </div>


      <div class="description">

        <label>Sticker Description</label>

        <p>
          ${escapeHTML(
            order.stickerDescription || "-"
          )}
        </p>

      </div>


      <div class="payment">

        <div>

          <label>Payment Method</label>

          <strong>
            ${escapeHTML(
              order.paymentMethod || "-"
            )}
          </strong>

        </div>


        <div>

          <label>Payment Status</label>

          <select
            class="payment-select"
            data-id="${order.id}"
          >

            <option value="pending"
              ${order.paymentStatus === "pending"
                ? "selected"
                : ""}>
              Pending
            </option>

            <option value="paid"
              ${order.paymentStatus === "paid"
                ? "selected"
                : ""}>
              Paid
            </option>

          </select>

        </div>

      </div>


      ${
        order.notes
          ? `
            <div class="notes">

              <label>Additional Notes</label>

              <p>
                ${escapeHTML(order.notes)}
              </p>

            </div>
          `
          : ""
      }


      <div class="actions">

        <select
          class="status-select"
          data-id="${order.id}"
        >

          <option value="new"
            ${order.orderStatus === "new"
              ? "selected"
              : ""}>
            🆕 New
          </option>

          <option value="making"
            ${order.orderStatus === "making"
              ? "selected"
              : ""}>
            🛠 Making
          </option>

          <option value="ready"
            ${order.orderStatus === "ready"
              ? "selected"
              : ""}>
            ✅ Ready
          </option>

          <option value="completed"
            ${order.orderStatus === "completed"
              ? "selected"
              : ""}>
            🎉 Completed
          </option>

        </select>


        <button
          class="whatsapp"
          data-phone="${escapeHTML(order.phone || "")}"
          data-name="${escapeHTML(order.studentName || "")}"
        >

          💬 WhatsApp: Order Ready

        </button>

      </div>

    `;


    ordersContainer.appendChild(card);

  });


  // PAYMENT STATUS

  document
    .querySelectorAll(".payment-select")
    .forEach((select) => {

      select.addEventListener(
        "change",
        async () => {

          await updateOrder(
            select.dataset.id,
            {
              paymentStatus: select.value
            }
          );

        }
      );

    });


  // ORDER STATUS

  document
    .querySelectorAll(".status-select")
    .forEach((select) => {

      select.addEventListener(
        "change",
        async () => {

          await updateOrder(
            select.dataset.id,
            {
              orderStatus: select.value
            }
          );

        }
      );

    });


  // WHATSAPP

  document
    .querySelectorAll(".whatsapp")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          sendWhatsApp(
            button.dataset.phone,
            button.dataset.name
          );

        }
      );

    });

}


// ==========================================
// UPDATE ORDER
// ==========================================

async function updateOrder(orderId, changes) {

  try {

    await updateDoc(
      doc(db, "orders", orderId),
      changes
    );

  } catch (error) {

    console.error(error);

    alert(
      "Could not update this order."
    );

  }

}


// ==========================================
// WHATSAPP
// ==========================================

function sendWhatsApp(phone, name) {

  if (!phone) {

    alert(
      "This order has no phone number."
    );

    return;

  }


  const cleanPhone =
    phone.replace(/\D/g, "");


  if (cleanPhone.length < 10) {

    alert(
      "Please check the WhatsApp number."
    );

    return;

  }


  const message = `📚 Book Sticker Order

Hello ${name || "there"}!

Your book sticker order is ready! 🎉

Please collect your order.

Thank you! ✨`;


  const whatsappURL =
    `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;


  window.open(
    whatsappURL,
    "_blank"
  );

}


// ==========================================
// STATISTICS
// ==========================================

function updateStats(orders) {

  totalOrders.textContent =
    orders.length;


  newOrders.textContent =
    orders.filter(
      order =>
        (order.orderStatus || "new") === "new"
    ).length;


  pendingPayments.textContent =
    orders.filter(
      order =>
        (order.paymentStatus || "pending") === "pending"
    ).length;


  readyOrders.textContent =
    orders.filter(
      order =>
        order.orderStatus === "ready"
    ).length;

}


// ==========================================
// DATE
// ==========================================

function formatDate(timestamp) {

  if (!timestamp) {
    return "Date unavailable";
  }

  try {

    return timestamp
      .toDate()
      .toLocaleString();

  } catch {

    return "Date unavailable";

  }

}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

  switch (status) {

    case "making":
      return "making";

    case "ready":
      return "ready";

    case "completed":
      return "completed";

    default:
      return "new";

  }

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ==========================================
// REFRESH
// ==========================================

refreshButton.addEventListener(
  "click",
  () => loadOrders()
);
