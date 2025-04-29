// --- Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { trackCorrectGuess, trackIncorrectGuess, trackMysterySolved } from "./statsTracker.js";

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

// --- DOM References ---
const title = document.getElementById("mystery-title");
const premise = document.getElementById("mystery-premise");
const cluesList = document.getElementById("mystery-clues");
const form = document.getElementById("mystery-form");
const fieldset = document.getElementById("mystery-choices");
const result = document.getElementById("mystery-result");

// --- Utility ---
function formatText(text) {
  return text.split("\n").map(line => `<p>${line.trim()}</p>`).join("");
}

// --- Main Load ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("🚫 User not logged in");
    return;
  }

  try {
    await loadMystery(user);
  } catch (error) {
    console.error("Error loading mystery:", error);
  }
});

async function loadMystery(user) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today); // fixed

  const mysteriesRef = collection(db, "mysteries");
  const q = query(mysteriesRef, where("date", "==", todayTimestamp));

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    title.textContent = "No Mystery Available";
    premise.innerHTML = "<p>Please return tomorrow for a new enigma.</p>";
    return;
  }

  const mysteryDoc = snapshot.docs[0];
  const data = mysteryDoc.data();

  title.textContent = data.title;
  premise.innerHTML = formatText(data.premise);
  cluesList.innerHTML = "";

  // Load clues
  data.clues.forEach((clueText) => {
    const li = document.createElement("li");
    li.className = "clue-reveal";
    li.innerHTML = formatText(clueText);
    cluesList.appendChild(li);
  });

  // Load choices
  fieldset.innerHTML = "";
  data.choices.forEach((choice, index) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "mystery-choice";
    input.value = index;
    label.appendChild(input);
    label.appendChild(document.createTextNode(choice));
    fieldset.appendChild(label);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const selected = document.querySelector('input[name="mystery-choice"]:checked');
    if (!selected) return;

    const selectedIndex = parseInt(selected.value);
    const correctIndex = data.correctAnswerIndex;

    if (selectedIndex === correctIndex) {
      result.innerHTML = "<p><strong>✅ Correct! Well done, Seeker.</strong></p>";
      await validateStreak(db, user.uid); // check for skipped day
      await trackCorrectGuess(db, user.uid);
      await trackMysterySolved(db, user.uid);
    } else {
      result.innerHTML = `<p><strong>❌ Incorrect. The truth eludes you... It was: ${data.choices[correctIndex]}</strong></p>`;
      await trackIncorrectGuess(db, user.uid);
    }

    form.style.display = "none";
  });
}
