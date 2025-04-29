import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firebase
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

// Elements
const container = document.getElementById("lore-container");

// Fetch and Render Lore
async function loadLore() {
  try {
    const loreRef = collection(db, "lore");
    const loreQuery = query(loreRef, orderBy("category"), orderBy("title"));
    const snapshot = await getDocs(loreQuery);

    if (snapshot.empty) {
      container.innerHTML = "<p>No lore found.</p>";
      return;
    }

    const loreByCategory = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!loreByCategory[data.category]) {
        loreByCategory[data.category] = [];
      }
      loreByCategory[data.category].push({
        title: data.title,
        details: data.details
      });
    });

    renderLore(loreByCategory);
  } catch (err) {
    console.error("Error loading lore:", err);
    container.innerHTML = "<p>Failed to load lore entries. Please try again later.</p>";
  }
}

// Render Lore by Category
function renderLore(loreData) {
  for (const category in loreData) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = category;
    details.appendChild(summary);

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "content-wrapper";

    loreData[category].forEach(entry => {
      const loreEntry = document.createElement("div");
      loreEntry.className = "lore-entry";

      const loreSummary = document.createElement("div");
      loreSummary.className = "lore-summary";
      loreSummary.textContent = entry.title;

      const loreDetails = document.createElement("div");
      loreDetails.className = "lore-details";
      
      loreDetails.innerHTML = entry.details
          .split('\n\n') // split into paragraphs (2 newlines)
          .map(paragraph => `<p>${paragraph.trim()}</p>`)
          .join('');
      
      loreEntry.appendChild(loreSummary);
      loreEntry.appendChild(loreDetails);
      contentWrapper.appendChild(loreEntry);
    });

    details.appendChild(contentWrapper);
    container.appendChild(details);
  }

  // Attach expand/collapse behavior to lore summaries
  setupLoreExpand();
}

// Setup expand/collapse for each lore summary
function setupLoreExpand() {
  const summaries = document.querySelectorAll(".lore-summary");

  summaries.forEach(summary => {
    summary.addEventListener("click", () => {
      const entry = summary.parentElement;
      entry.classList.toggle("open");

      // Close others if you want accordion-like behavior
   document.querySelectorAll('.lore-entry').forEach(other => {
      if (other !== entry) other.classList.remove('open');
      });
    });
  });
}

// Initialize
loadLore();
