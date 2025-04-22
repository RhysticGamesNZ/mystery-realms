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

async function loadTodayMystery() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const midnightTimestamp = Timestamp.fromDate(today);

  const q = query(collection(db, "mysteries"), where("date", "==", midnightTimestamp));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    document.getElementById("mystery-title").textContent = data.title;
    document.getElementById("mystery-premise").textContent = data.premise;

    const cluesList = document.getElementById("mystery-clues");
    cluesList.innerHTML = "";
    data.clues.forEach(clue => {
      const li = document.createElement("li");
      li.textContent = clue;
      cluesList.appendChild(li);
    });

    const choicesDiv = document.getElementById("mystery-choices");
    const resultDiv = document.getElementById("mystery-result");
    choicesDiv.innerHTML = "";
    data.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice;
      btn.className = "choice-btn";
      btn.onclick = () => {
        const isCorrect = choice === data.answer;
        resultDiv.innerHTML = `
          <p><strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong></p>
          <p><em>${data.explanation}</em></p>
        `;
      };
      choicesDiv.appendChild(btn);
    });
  });
}

loadTodayMystery();

