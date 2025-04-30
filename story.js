import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.firebasestorage.app",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const container = document.getElementById("chapter-container");

function formatText(text) {
  return text.split("\n").map(line => `<p>${line.trim()}</p>`).join("");
}

async function loadPremiumStory() {
  const snapshot = await getDocs(collection(db, "premiumStory"));
  const stories = [];

  snapshot.forEach(docSnap => {
    stories.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Group by season
  const grouped = {};
  for (const story of stories) {
    const season = story.season || "Unknown Season";
    if (!grouped[season]) grouped[season] = [];
    grouped[season].push(story);
  }

  // Render
  Object.entries(grouped).forEach(([season, chapters]) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = season;
    details.appendChild(summary);

    chapters.sort((a, b) => a.chapter.localeCompare(b.chapter));

    chapters.forEach(({ chapter, title, content }) => {
      const div = document.createElement("div");
      div.className = "chapter-body lore-entry";
      div.innerHTML = `<h3>${chapter}: ${title}</h3>${formatText(content)}`;
      details.appendChild(div);
    });

    container.appendChild(details);
  });
}

loadPremiumStory();
