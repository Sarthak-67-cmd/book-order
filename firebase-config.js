// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAo__DXwHqckn2ULcjYJea9ICmbV5-Jsug",
  authDomain: "book-orders-65305.firebaseapp.com",
  projectId: "book-orders-65305",
  storageBucket: "book-orders-65305.firebasestorage.app",
  messagingSenderId: "162519349393",
  appId: "1:162519349393:web:9c370311b5c6565a6aa730",
  measurementId: "G-RYRNSN9ZS2"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };
