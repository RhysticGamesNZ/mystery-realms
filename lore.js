import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { trackLoreRead } from "./statsTracker.js";

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
const auth = getAuth(app);

function formatText(text) {
  if (!text) return "";
  return text.split("\n").map(line => `<p>${line.trim()}</p>`).join("");
}

async function loadLore(user) {
  const container = document.getElementById("lore-container");
  const readSet = new Set(); // Prevent multiple counts per entry this session

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
        entryContent.className = "lore-details hidden";
        entryContent.innerHTML = formatText(entry.details);

        entryHeader.addEventListener("click", async () => {
          innerWrapper.querySelectorAll(".lore-entry").forEach(entryEl => {
            if (entryEl !== entryWrapper) {
              entryEl.classList.remove("open");
              entryEl.querySelector(".lore-details").classList.add("hidden");
            }
          });

          entryWrapper.classList.toggle("open");
          entryContent.classList.toggle("hidden");

          // 🧠 Track lore read ONCE per session per title
          const loreKey = `${categoryName}-${entry.title}`;
          if (user && !readSet.has(loreKey)) {
            await trackLoreRead(db, user.uid);
            readSet.add(loreKey);
          }
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

// 🔐 Auth check before loading lore
onAuthStateChanged(auth, (user) => {
  loadLore(user);
});
