import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { Timestamp, query, where, collection, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.firebasestorage.app",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const title = document.getElementById("premium-title");
const premise = document.getElementById("premium-premise");
const cluesList = document.getElementById("premium-clues");
const choicesFieldset = document.getElementById("premium-choices");
const form = document.getElementById("vote-form");
const result = document.getElementById("vote-result");
const error = document.getElementById("vote-error");

function getCurrentWeekKey() {
  const now = new Date();
  now.setUTCHours(0,0,0,0);
  const year = now.getUTCFullYear();
  const firstJan = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = Math.floor((now - firstJan) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil((dayOfYear + firstJan.getUTCDay() + 1) / 7);
  return `${year}-W${weekNumber}`;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    title.textContent = "Premium Access Required";
    premise.textContent = "Please sign in with a premium account to access this content.";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists() || !userSnap.data().premium) {
    title.textContent = "Premium Only";
    premise.textContent = "This content is available to premium members only.";
    return;
  }

// Get this week’s Monday 00:00 UTC+12
const now = new Date();
const utcPlus12 = new Date(now.getTime() + (12 * 60 * 60 * 1000));
const monday = new Date(utcPlus12);
monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
monday.setUTCHours(0, 0, 0, 0);
const mondayTimestamp = Timestamp.fromDate(monday);

// Query for the matching weekly mystery
const weeklyQuery = query(
  collection(db, "weeklyMysteries"),
  where("date", "==", mondayTimestamp)
);

const snapshot = await getDocs(weeklyQuery);
if (snapshot.empty) {
  title.textContent = "Mystery Not Available";
  return;
}

const mysteryDoc = snapshot.docs[0];
const data = mysteryDoc.data();
const docId = mysteryDoc.id;


  const data = mysterySnap.data();
  title.textContent = data.title;
  premise.textContent = data.premise;

  const today = new Date().getUTCDay(); // 0 (Sun) - 6 (Sat)
  const clues = [
    data.day1clue, data.day2clue, data.day3clue,
    data.day4clue, data.day5clue
  ];
  for (let i = 0; i < today && i < clues.length; i++) {
    const li = document.createElement("li");
    li.textContent = clues[i];
    cluesList.appendChild(li);
  }

  if (today === 6) { // Saturday
    form.style.display = "block";
    data.choices.forEach((choice, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "weekly-choice";
      input.value = index;
      if (index === 0) input.checked = true;
      label.appendChild(input);
      label.appendChild(document.createTextNode(choice));
      choicesFieldset.appendChild(label);
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const selected = document.querySelector("input[name='weekly-choice']:checked");
      if (!selected) return;

   await setDoc(doc(db, `weeklyMysteries/${docId}/votes/${user.uid}`), {
  choice: selected.value,
  timestamp: serverTimestamp()
});


      result.innerHTML = "<p><strong>Thank you for voting. Your choice has been recorded.</strong></p>";
      form.style.display = "none";
    };
  }
});
