import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
    authDomain: "mystery-realms.firebaseapp.com",
    projectId: "mystery-realms",
    storageBucket: "mystery-realms.firebasestorage.app",
    messagingSenderId: "511471364499",
    appId: "1:511471364499:web:fbc7d813e9b8d28cf32066",
    measurementId: "G-ELW3HVV36V"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadLore() {
  const loreSnapshot = await getDocs(collection(db, "lore"));
  const loreContainer = document.getElementById("lore-container");

  const loreByCategory = {};

  loreSnapshot.forEach((doc) => {
    const data = doc.data();
    if (!loreByCategory[data.category]) {
      loreByCategory[data.category] = [];
    }
    loreByCategory[data.category].push(data);
  });

  for (const [category, entries] of Object.entries(loreByCategory)) {
    const section = document.createElement("section");
    section.classList.add("lore-section");

    const heading = document.createElement("h2");
    heading.textContent = category;
    heading.className = "lore-category";
    section.appendChild(heading);

    entries.forEach(entry => {
      const entryDiv = document.createElement("div");
      entryDiv.className = "lore-entry";

      const summary = document.createElement("div");
      summary.className = "lore-summary";
      summary.textContent = entry.title;
      summary.onclick = () => entryDiv.classList.toggle("open");

      const details = document.createElement("div");
      details.className = "lore-details";
      details.textContent = entry.details;

      entryDiv.appendChild(summary);
      entryDiv.appendChild(details);
      section.appendChild(entryDiv);
    });

    loreContainer.appendChild(section);
  }
}

loadLore();
