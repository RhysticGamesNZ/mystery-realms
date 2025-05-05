// hide-ads.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.firebasestorage.app",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066"
};

// ✅ Only initialize Firebase if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();
const auth = getAuth();

// Hide ads if premium
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().premium) {
      console.log("🌟 Premium user detected, hiding ads...");
      document.getElementById("ad-left")?.remove();
      document.getElementById("ad-right")?.remove();
      document.getElementById("ad-bottom")?.remove();
      document.getElementById("premium-cta")?.remove();
    }
  }
});
