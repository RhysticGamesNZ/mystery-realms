// --- Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { trackLoreRead } from "./statsTracker.js"; // 🛡️ new import

// --- Firebase Init ---
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

// --- DOM Reference ---
const loreContainer = document.getElementById("lore-container");

// --- Utility ---
function formatText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .split('\n')
    .map(line => `<p>${line.trim()}</p>`)
    .join('');
}


// --- Load Lore ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("🚫 User not signed in");
    return;
  }

  try {
    await loadLore(user.uid);
  } catch (error) {
    console.error("Error loading lore:", error);
  }
});

async function loadLore(userId) {
  const loreRef = collection(db, "lore");
  const loreQuery = query(loreRef, orderBy("category"), orderBy("title"));
  const snapshot = await getDocs(loreQuery);

  if (snapshot.empty) {
    loreContainer.innerHTML = "<p>No lore entries available yet.</p>";
    return;
  }

  let currentCategory = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    if (data.category !== currentCategory) {
      currentCategory = data.category;
      const categoryHeader = document.createElement("h2");
      categoryHeader.className = "lore-category";
      categoryHeader.textContent = currentCategory;
      loreContainer.appendChild(categoryHeader);
    }

    const loreEntry = document.createElement("details");
    loreEntry.className = "lore-entry";

    const summary = document.createElement("summary");
    summary.className = "lore-summary";
    summary.textContent = data.title;
    loreEntry.appendChild(summary);

    const details = document.createElement("div");
    details.className = "lore-details";
    details.innerHTML = formatText(data.text);
    loreEntry.appendChild(details);

    // Open / Close Event
    summary.addEventListener("click", async () => {
      if (!loreEntry.classList.contains("open")) {
        loreEntry.classList.add("open");
        await trackLoreRead(db, userId); // 📈 Count as "read"
      } else {
        loreEntry.classList.remove("open");
      }
    });

    loreContainer.appendChild(loreEntry);
  });
}
