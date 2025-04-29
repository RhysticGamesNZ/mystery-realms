// lore.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js"; // adjust if needed

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
        const entryDetails = document.createElement("details");
        const entrySummary = document.createElement("summary");
        entrySummary.textContent = entry.title;
        entryDetails.appendChild(entrySummary);

        const entryContent = document.createElement("div");
        entryContent.innerHTML = formatText(entry.details);
        entryContent.className = "lore-details";

        entryDetails.appendChild(entryContent);
        innerWrapper.appendChild(entryDetails);
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
