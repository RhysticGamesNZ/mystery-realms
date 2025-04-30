import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  trackCorrectGuess,
  trackIncorrectGuess,
  trackMysterySolved,
  validateStreak
} from "./statsTracker.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.firebasestorage.app",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066",
  measurementId: "G-ELW3HVV36V"
};

const db = getFirestore(app);
const auth = getAuth(app);

function formatText(text) {
  return text.split("\n").map(line => `<p>${line.trim()}</p>`).join("");
}

function getQueryDateRange(dateStr) {
  const date = new Date(dateStr);
  date.setUTCHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setUTCDate(date.getUTCDate() + 1);
  return [Timestamp.fromDate(date), Timestamp.fromDate(nextDay)];
}

async function loadTodayMystery(user) {
  let q;
  const urlParams = new URLSearchParams(window.location.search);
  const docId = urlParams.get("id");
  
  console.log("📦 Attempting to fetch document with ID:", docId);

  if (docId) {
    // Fetch mystery by docId if it's present in the URL
    const docRef = doc(db, "mysteries", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn("⚠️ Document not found:", docId);
      document.getElementById("mystery-title").textContent = "Mystery not found.";
      return;
    }

    console.log("✅ Document fetched:", docId);
    renderMystery(docSnap.data(), user);
  } else {
    // Load today's mystery if no docId is provided
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);
    const start = Timestamp.fromDate(today);
    const end = Timestamp.fromDate(tomorrow);

    q = query(
      collection(db, "mysteries"),
      where("date", ">=", start),
      where("date", "<", end)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      renderMystery(doc.data(), user);
    });
  }
}

function showCountdownToMidnightUTC() {
  const timerContainer = document.getElementById("next-mystery-timer");
  const countdownSpan = document.getElementById("countdown");
  timerContainer.style.display = "block";

  function updateCountdown() {
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const nextMidnight = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate() + 1));

    const diffMs = nextMidnight - utcNow;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    countdownSpan.textContent = `${hours}h ${minutes}m ${seconds}s`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function showWelcomeModalOncePerDay() {
  const todayKey = `welcome-modal-shown-${new Date().toISOString().slice(0, 10)}`;
  const modal = document.getElementById("welcome-modal");
  const closeBtn = document.getElementById("close-welcome");

  if (!modal || !closeBtn) return;

  if (!localStorage.getItem(todayKey)) {
    modal.classList.add("show");

    closeBtn.addEventListener("click", () => {
      modal.classList.remove("show");
      localStorage.setItem(todayKey, "true");
    });

    // Optional: click outside to close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
        localStorage.setItem(todayKey, "true");
      }
    });
  }
}

function renderMystery(data, user) {
  document.getElementById("mystery-title").textContent = data.title;
  document.getElementById("mystery-premise").innerHTML = formatText(data.premise);

  const cluesList = document.getElementById("mystery-clues");
  cluesList.innerHTML = "";
  data.clues.forEach(clue => {
    const li = document.createElement("li");
    li.innerHTML = formatText(clue);
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

  const formKey = `mystery-submitted-${data.title.replace(/\s+/g, "-").toLowerCase()}`;
  const saved = JSON.parse(localStorage.getItem(formKey));

  if (saved) {
    // Already answered — auto-render result
    choicesFieldset.style.display = "none";
    form.style.display = "none";
    resultDiv.innerHTML = `
      <p><strong>${saved.correct ? 'Correct!' : 'Incorrect.'}</strong></p>
      <p><strong>Answer:</strong> ${formatText(data.answer)}</p>
      <p><em>${formatText(data.explanation)}</em></p>
      <p><em><strong>Archive Note:</strong> ${data.archive_note}</em></p>
    `;
  } else {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const selected = document.querySelector("input[name='mystery-choice']:checked");
      if (!selected) return;

      const isCorrect = selected.value === data.answer;

      localStorage.setItem(formKey, JSON.stringify({
        selected: selected.value,
        correct: isCorrect
      }));

      
      if (isCorrect && user) {
      await validateStreak(db, user.uid);
      await trackCorrectGuess(db, user.uid);
      await trackMysterySolved(db, user.uid);
      } else if (!isCorrect && user) {
      await trackIncorrectGuess(db, user.uid);
      }

      // Hide form & show result
      choicesFieldset.style.display = "none";
      form.style.display = "none";
    resultDiv.innerHTML = `
        <div class="result-text">
        <p><strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong></p>
        <p><strong>Answer:</strong> ${formatText(data.answer)}</p>
        <p><em>${formatText(data.explanation)}</em></p>
        <p><em><strong>Archive Note:</strong> ${data.archive_note}</em></p>
        </div>
              `;
        showCountdownToMidnightUTC();
      if (!user) {
          resultDiv.innerHTML += `<p><em><a href="stats.html">Log in to start tracking your streak →</a></em></p>`;
      }
    };
  }
}

showWelcomeModalOncePerDay();

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadTodayMystery(user);
  } else {
    console.warn("🔓 No user signed in. Loading public mystery.");
    loadTodayMystery(null); // allow anonymous access
  }
});
