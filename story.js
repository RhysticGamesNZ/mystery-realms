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
const container = document.getElementById("chapter-container");

function formatText(text) {
  return text
    .split("\n")
    .map(line => `<p>${line.trim()}</p>`)
    .join("");
}

async function loadPremiumStory() {
  const snapshot = await getDocs(collection(db, "premiumStory"));
  const chapters = [];

  snapshot.forEach(docSnap => {
    chapters.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  // Optional: sort by doc ID (e.g. prologue, chapter-one, chapter-two)
  chapters.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  chapters.forEach(({ title, content }) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = title;

    const body = document.createElement("div");
    body.className = "chapter-body";
    body.innerHTML = formatText(content);

    details.appendChild(summary);
    details.appendChild(body);
    container.appendChild(details);
  });
}

loadPremiumStory();
