// lore.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.firebasestorage.app",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066",
  measurementId: "G-ELW3HVV36V"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Format text (preserve paragraph breaks)
function formatText(text) {
  if (!text) return "";
  return text.split("\n").map(line => `<p>${line.trim()}</p>`).join("");
}

// Load Lore
async function loadLore() {
  const container = document.getElementById("lore-container");

  try {
    const snapshot = await getDocs(collection(db, "lore"));

    const loreByCategory = {};

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const category = data.category || "Other";
      if (!loreByCategory[category]) {
        loreByCategory[category] = [];
      }
      loreByCategory[category].push({
        title: data.title,
        details: data.details
      });
    });

    // Sort categories alphabetically
    const sortedCategories = Object.keys(loreByCategory).sort();

    sortedCategories.forEach(categoryName => {
      const categoryDetails = document.createElement("details");
      const categorySummary = document.createElement("summary");
      categorySummary.textContent = categoryName;
      categoryDetails.appendChild(categorySummary);

      const innerWrapper = document.createElement("div");
      innerWrapper.className = "content-wrapper";

      loreByCategory[categoryName].forEach(entry => {
        const entryWrapper = document.createElement("div");
        entryWrapper.className = "lore-entry";

const entryHeader = document.createElement("div");
entryHeader.className = "lore-title";
entryHeader.textContent = entry.title;

const entryContent = document.createElement("div");
entryContent.className = "lore-details hidden"; // hidden by default
entryContent.innerHTML = formatText(entry.details);

// Toggle visibility
entryHeader.addEventListener("click", () => {
  entryContent.classList.toggle("hidden");
});

entryWrapper.appendChild(entryHeader);
entryWrapper.appendChild(entryContent);
innerWrapper.appendChild(entryWrapper);
      });

      categoryDetails.appendChild(innerWrapper);
      container.appendChild(categoryDetails);
    });

  } catch (error) {
    console.error("Error loading lore:", error);
  }
}

// Start
loadLore();
