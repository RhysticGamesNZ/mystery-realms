import { getFirestore, collection, getDocs, query, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.firebasestorage.app",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadPastMysteries() {
  const container = document.getElementById("past-container");
  const q = query(collection(db, "mysteries"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  // Get today at 00:00 UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  snapshot.forEach(doc => {
    const data = doc.data();
    const id = doc.id;

    // ✅ Skip today's and future mysteries
    if (!data.date || data.date.toMillis() >= todayTimestamp.toMillis()) return;

    // ✅ Add link
    const link = document.createElement("a");
    link.href = `index.html?id=${id}`;
    link.textContent = data.title;
    link.className = "mystery-link";

    const wrapper = document.createElement("div");
    wrapper.appendChild(link);
    container.appendChild(wrapper);
  });
}

loadPastMysteries();
