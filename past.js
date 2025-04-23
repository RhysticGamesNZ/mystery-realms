import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

async function loadPastMysteries() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStart = Timestamp.fromDate(today);

  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);
  const todayEnd = Timestamp.fromDate(tomorrow);

  const q = query(collection(db, "mysteries"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  const container = document.getElementById("past-container");

  snapshot.forEach(doc => {
    const data = doc.data();

    // Skip today’s mystery using a range check
    if (data.date && data.date >= todayStart && data.date < todayEnd) {
      return;
    }

    const section = document.createElement("section");
    section.className = "card";

    const title = document.createElement("h2");
    title.textContent = data.title;

    const premise = document.createElement("p");
    premise.textContent = data.premise;

    const clues = document.createElement("ul");
    data.clues.forEach(clue => {
      const li = document.createElement("li");
      li.textContent = clue;
      clues.appendChild(li);
    });

    const choices = document.createElement("ul");
    data.choices.forEach(choice => {
      const li = document.createElement("li");
      li.textContent = choice;
      choices.appendChild(li);
    });

    const explanation = document.createElement("p");
    explanation.innerHTML = `<strong>Explanation:</strong> ${data.explanation}`;

    section.appendChild(title);
    section.appendChild(premise);
    section.appendChild(clues);
    section.appendChild(choices);
    section.appendChild(explanation);
    container.appendChild(section);
  });
}
loadPastMysteries();
