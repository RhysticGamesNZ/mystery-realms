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
  const querySnapshot = await getDocs(collection(db, "lore"));
  const container = document.getElementById("lore-container");

  const categorized = {};

  // Group by category
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (!categorized[data.category]) categorized[data.category] = [];
    categorized[data.category].push(data);
  });

  // Render categories
  for (const category in categorized) {
    const categoryDetails = document.createElement("details");
    const categorySummary = document.createElement("summary");
    categorySummary.textContent = category;
    categoryDetails.appendChild(categorySummary);

    categorized[category].forEach(entry => {
      const entryDetails = document.createElement("details");
      const entrySummary = document.createElement("summary");
      entrySummary.textContent = entry.title;

      const content = document.createElement("p");
      content.textContent = entry.details;

      entryDetails.appendChild(entrySummary);
      entryDetails.appendChild(content);
      categoryDetails.appendChild(entryDetails);
    });

    container.appendChild(categoryDetails);
  }
}
document.getElementById("hamburger-icon").addEventListener("click", function() {
  const navLinks = document.querySelector(".nav-links");
  navLinks.classList.toggle("active"); // Toggle visibility of navigation links
});

loadLore();
