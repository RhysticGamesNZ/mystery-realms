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
  const grouped = {};

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const { season, chapter, content, title } = data;

    if (!grouped[season]) grouped[season] = [];
    grouped[season].push({ chapter, content, title });
  });

  // Sort seasons alphabetically or chronologically if desired
  Object.entries(grouped).forEach(([season, chapters]) => {
    chapters.sort((a, b) => a.chapter.localeCompare(b.chapter, undefined, { numeric: true }));

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = season;
    details.appendChild(summary);

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "content-wrapper";

    chapters.forEach(({ chapter, content, title }) => {
      const entry = document.createElement("div");
      entry.className = "lore-entry"; // reuse lore styles

      const header = document.createElement("div");
      header.className = "lore-title";
      header.textContent = `${chapter}: ${title}`;

      const body = document.createElement("div");
      body.className = "lore-details";
      body.innerHTML = formatText(content);

      // Expand/collapse individual entries
      header.addEventListener("click", () => {
        entry.classList.toggle("open");
        body.classList.toggle("hidden");
      });

      body.classList.add("hidden");

      entry.appendChild(header);
      entry.appendChild(body);
      contentWrapper.appendChild(entry);
    });

    details.appendChild(contentWrapper);
    container.appendChild(details);
  });
}
