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

  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);

  const start = Timestamp.fromDate(today);
  const end = Timestamp.fromDate(tomorrow);

  const q = query(
    collection(db, "mysteries"),
    where("date", ">=", start),
    where("date", "<", end)
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data(); // ✅ `data` is declared inside the loop

    document.getElementById("mystery-title").textContent = data.title;
    document.getElementById("mystery-premise").textContent = data.premise;

    const cluesList = document.getElementById("mystery-clues");
    cluesList.innerHTML = "";
    data.clues.forEach(clue => {
      const li = document.createElement("li");
      li.textContent = clue;
      cluesList.appendChild(li);
    });

    const choicesFieldset = document.getElementById("mystery-choices");
    const form = document.getElementById("mystery-form");
    const resultDiv = document.getElementById("mystery-result");

    choicesFieldset.innerHTML = "";
    data.choices.forEach((choice, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "mystery-choice";
      input.value = choice;
      if (index === 0) input.checked = true;
      label.appendChild(input);
      label.appendChild(document.createTextNode(choice));
      choicesFieldset.appendChild(label);
    });

   if (form && choicesFieldset && resultDiv) {
  form.onsubmit = (e) => {
    e.preventDefault();
    const selected = document.querySelector("input[name='mystery-choice']:checked");
    if (!selected) return;

    const isCorrect = selected.value === data.answer;
    resultDiv.innerHTML = `
      <p><strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong></p>
      <p><em>${data.explanation}</em></p>
    `;
  };
}


loadTodayMystery();
