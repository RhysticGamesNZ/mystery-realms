// lore.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { trackLoreRead } from "./statsTracker.js"; // ✅

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

// Where lore will be inserted
const container = document.getElementById("lore-container");

// Helper to preserve paragraph breaks
function formatText(text) {
  if (!text) return "";
  return text
    .split('\n')
    .map(p => `<p>${p.trim()}</p>`)
    .join('');
}

// Group lore entries by category
async function loadLore() {
  try {
    const q = query(collection(db, "lore"), orderBy("category"), orderBy("title"));
    const snapshot = await getDocs(q);

    const loreByCategory = {};

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const { category, title, summary, details } = data;

      if (!loreByCategory[category]) {
        loreByCategory[category] = [];
      }
      loreByCategory[category].push({
        id: docSnap.id,
        title,
        summary,
        details
      });
    });

    // Now render grouped lore
    for (const category in loreByCategory) {
      const categoryDetails = document.createElement("details");
      categoryDetails.classList.add("lore-category-wrapper");

      const categorySummary = document.createElement("summary");
      categorySummary.textContent = category;
      categorySummary.classList.add("lore-category");

      categoryDetails.appendChild(categorySummary);

      loreByCategory[category].forEach(entry => {
        const loreEntry = document.createElement("details");
        loreEntry.className = "lore-entry";

        const loreSummary = document.createElement("summary");
        loreSummary.className = "lore-summary";
        loreSummary.textContent = entry.title;

        const loreDetails = document.createElement("div");
        loreDetails.className = "lore-details";

        // Insert formatted summary + details
        loreDetails.innerHTML = `
          <h4>Summary</h4>
          ${formatText(entry.summary)}
          <h4>Details</h4>
          ${formatText(entry.details)}
        `;

        loreEntry.appendChild(loreSummary);
        loreEntry.appendChild(loreDetails);

        // Track read when user opens the entry
        loreEntry.addEventListener("toggle", async () => {
          if (loreEntry.open) {
            const user = auth.currentUser;
            if (user) {
              await trackLoreRead(db, user.uid, entry.id);
            }
          }
        });

        categoryDetails.appendChild(loreEntry);
      });

      container.appendChild(categoryDetails);
    }
  } catch (error) {
    console.error("❌ Error loading lore:", error);
    container.innerHTML = `<p>Failed to load lore archive. Please try again later.</p>`;
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadLore();
  } else {
    loadLore(); // Public users should still see lore
  }
});
