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

function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(func, delay);
  };
}

async function loadDesktopLayout(user) {
  const categoryList = document.getElementById("category-list");
  const entryList = document.getElementById("entry-list");
  const content = document.getElementById("lore-content");
  const readSet = new Set();

  categoryList.innerHTML = "<h2>Loading categories...</h2>";
  categoryList.style.display = "block";
  entryList.style.display = "none";

  try {
    const categorySnapshot = await getDocs(collection(db, "lore"));
    categoryList.innerHTML = "";

    categorySnapshot.forEach((categoryDoc) => {
      const categoryId = categoryDoc.id;
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "category";
      categoryDiv.textContent = categoryId;
      categoryList.appendChild(categoryDiv);

      categoryDiv.addEventListener("click", async () => {
        categoryList.style.display = "none";
        entryList.innerHTML = "";
        entryList.style.display = "block";

        const backButton = document.createElement("div");
        backButton.id = "back-button";
        backButton.textContent = "← Back to Categories";
        entryList.appendChild(backButton);

        backButton.addEventListener("click", () => {
          categoryList.style.display = "block";
          entryList.style.display = "none";
        });

        const entriesSnapshot = await getDocs(collection(db, "lore", categoryId, "entries"));

        entriesSnapshot.forEach(entryDoc => {
          const entry = entryDoc.data();
          const entryDiv = document.createElement("div");
          entryDiv.className = "entry";
          entryDiv.textContent = entry.title;

          entryDiv.addEventListener("click", async () => {
            content.innerHTML = `<h2>${entry.title}</h2>${formatText(entry.details)}`;
            const loreKey = `${categoryId}-${entry.title}`;
            if (user && !readSet.has(loreKey)) {
              await trackLoreRead(db, user.uid);
              readSet.add(loreKey);
            }
          });

          entryList.appendChild(entryDiv);
        });
      });
    });
  } catch (err) {
    console.error("Failed to load lore:", err);
    categoryList.innerHTML = "<p>Failed to load lore.</p>";
  }
}

async function loadMobileLayout(user) {
  const container = document.getElementById("lore-container");
  const content = document.getElementById("lore-content"); // Optional if used elsewhere
  container.innerHTML = "";
  const readSet = new Set();

  // Show categories
  async function renderCategories() {
    container.innerHTML = "<h2>Categories</h2>";

    const snapshot = await getDocs(collection(db, "lore"));
    snapshot.forEach(doc => {
      const categoryId = doc.id;
      const div = document.createElement("div");
      div.className = "category";
      div.textContent = categoryId;
      div.onclick = () => renderEntries(categoryId);
      container.appendChild(div);
    });
  }

  // Show entries for a category
  async function renderEntries(categoryId) {
    container.innerHTML = `
      <div class="back-button" id="back-to-categories">← Back to Categories</div>
      <h2>${categoryId}</h2>
    `;

    const backBtn = container.querySelector("#back-to-categories");
    backBtn.onclick = renderCategories;

    const snapshot = await getDocs(collection(db, "lore", categoryId, "entries"));
    snapshot.forEach(doc => {
      const entry = doc.data();
      const div = document.createElement("div");
      div.className = "entry";
      div.textContent = entry.title;
      div.onclick = () => renderDetails(categoryId, entry);
      container.appendChild(div);
    });
  }

  // Show full entry
  function renderDetails(categoryId, entry) {
    container.innerHTML = `
      <div class="back-button" id="back-to-entries">← Back to ${categoryId}</div>
      <h2>${entry.title}</h2>
      ${formatText(entry.details)}
    `;

    document.getElementById("back-to-entries").onclick = () => renderEntries(categoryId);

    const loreKey = `${categoryId}-${entry.title}`;
    if (user && !readSet.has(loreKey)) {
      trackLoreRead(db, user.uid);
      readSet.add(loreKey);
    }
  }

  await renderCategories();
}

function determineLayout(user) {
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    loadMobileLayout(user);
  } else {
    loadDesktopLayout(user);
  }
}

let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  determineLayout(user);
});

window.addEventListener("resize", debounce(() => {
  determineLayout(currentUser);
}, 300));
