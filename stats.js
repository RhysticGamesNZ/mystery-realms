// stats.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.firebasestorage.app",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM References ---
const authContainer = document.getElementById("auth-container");
const profileContainer = document.getElementById("profile-container");
const form = document.getElementById("auth-form");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const errorDisplay = document.getElementById("auth-error");
const forgotPasswordLink = document.getElementById("forgot-password-link");

// --- Login or Sign Up ---
form.onsubmit = async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        email: auth.currentUser.email,
        premium: false,
        level: "Apprentice Seeker",
        streak: 0,
        correct: 0,
        incorrect: 0,
        loreRead: 0,
        lastSolved: Date
      });
    } catch (createErr) {
      errorDisplay.textContent = createErr.message;
    }
  }
};

// --- Forgot Password ---
forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value;

  if (!email) {
    errorDisplay.textContent = "Enter your email first, then click 'Forgot Password'.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    errorDisplay.style.color = "green";
    errorDisplay.textContent = "📧 Password reset email sent!";
  } catch (err) {
    errorDisplay.style.color = "darkred";
    errorDisplay.textContent = "Error: " + err.message;
  }
});

// --- Logout ---
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});

// --- Auth State Listener ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authContainer.style.display = "none";
    profileContainer.style.display = "block";

    document.getElementById("user-email").textContent = user.email;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      document.getElementById("user-level").textContent = data.level ?? "Seeker";
      document.getElementById("user-premium").textContent = data.premium ? "Yes" : "No";
      document.getElementById("user-streak").textContent = data.streak ?? 0;
      document.getElementById("user-correct").textContent = data.correct ?? 0;
      document.getElementById("user-incorrect").textContent = data.incorrect ?? 0;
      document.getElementById("user-lore-read").textContent = data.loreRead ?? 0;
    } else {
      document.getElementById("user-premium").textContent = "Unknown";
    }
  } else {
    authContainer.style.display = "block";
    profileContainer.style.display = "none";
  }
});
