// lore.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { trackLoreRead } from "./statsTracker.js"; // optional

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.appspot.com",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const container = document.getElementById("lore-container");

function formatText(text) {
  return (text || "")
    .split("\n")
    .map(line => `<p>${line.trim()}</p>`)
    .join("");
}

async function loadLore(user) {
  try {
    const snap = await getDocs(collection(db, "lore"));
    const entriesByCategory = {};

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const category = data.category || "Uncategorized";
      if (!entriesByCategory[category]) entriesByCategory[category] = [];
      entriesByCategory[category].push({ id: docSnap.id, ...data });
    });

    for (const category in entriesByCategory) {
      const detailsGroup = document.createElement("details");
      detailsGroup.className = "lore-category-wrapper";
      const summary = document.createElement("summary");
      summary.className = "lore-category";
      summary.textContent = category;
      detailsGroup.appendChild(summary);

      entriesByCategory[category].forEach(entry => {
        const entryDetails = document.createElement("details");
        entryDetails.className = "lore-entry";

        const entrySummary = document.createElement("summary");
        entrySummary.className = "lore-summary";
        entrySummary.textContent = entry.title;

        const content = document.createElement("div");
        content.className = "lore-details";
        content.innerHTML = formatText(entry.details);

        entryDetails.appendChild(entrySummary);
        entryDetails.appendChild(content);

        entryDetails.addEventListener("toggle", () => {
          if (entryDetails.open && user) {
            trackLoreRead(db, user.uid, entry.id);
          }
        });

        detailsGroup.appendChild(entryDetails);
      });

      container.appendChild(detailsGroup);
    }
  } catch (err) {
    console.error("Error loading lore:", err);
    container.innerHTML = `<p>Failed to load lore. Please try again later.</p>`;
  }
}

onAuthStateChanged(auth, (user) => {
  loadLore(user);
});
