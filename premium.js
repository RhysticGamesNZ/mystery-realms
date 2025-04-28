import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, Timestamp, query, where, collection, getDocs, getDoc, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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

  title.textContent = data.title;
  premise.textContent = data.premise;

const today = new Date().getUTCDay(); // Sunday=0, Monday=1, ..., Saturday=6
const clues = [
  { text: data.day1clue, dayAvailable: 1 },
  { text: data.day2clue, dayAvailable: 2 },
  { text: data.day3clue, dayAvailable: 3 },
  { text: data.day4clue, dayAvailable: 4 },
  { text: data.day5clue, dayAvailable: 5 }
];

// Only show clues up to today
clues.forEach((clue, index) => {
  if (today >= clue.dayAvailable && clue.text) {
    const li = document.createElement("li");
    li.textContent = clue.text;
    li.classList.add('clue-reveal');
    cluesList.appendChild(li);
  }
});

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
