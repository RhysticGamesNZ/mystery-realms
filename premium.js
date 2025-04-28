import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

const checkoutContainer = document.getElementById("premium-checkout");
const premiumContainer = document.getElementById("premium-content");

const title = document.getElementById("mystery-title");
const premise = document.getElementById("mystery-premise");
const cluesList = document.getElementById("mystery-clues");
const choicesFieldset = document.getElementById("mystery-choices");
const form = document.getElementById("mystery-form");
const result = document.getElementById("mystery-result");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    checkoutContainer.style.display = "block";
    premiumContainer.style.display = "none";
    console.log("User not signed in");
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists() || !userSnap.data().premium) {
    checkoutContainer.style.display = "block";
    premiumContainer.style.display = "none";
    console.log("User is not premium");
    return;
  }

  console.log("✅ User is premium");
  checkoutContainer.style.display = "none";
  premiumContainer.style.display = "block";

  loadWeeklyMystery(user.uid);
});

async function loadWeeklyMystery(userId) {
  console.log("🔎 Loading weekly mystery...");

  // PURE UTC Monday
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday
  const diffToMonday = (day === 0) ? -6 : 1 - day; // If Sunday (-6), else (1 - day)

  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  
  const mondayTimestamp = Timestamp.fromDate(monday);

  const nextMonday = new Date(monday);
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  const nextMondayTimestamp = Timestamp.fromDate(nextMonday);

  console.log("🗓️ Correct Monday:", monday.toISOString());
  console.log("🗓️ Correct Next Monday:", nextMonday.toISOString());

  const weeklyQuery = query(
    collection(db, "weeklyMysteries"),
    where("date", ">=", mondayTimestamp),
    where("date", "<", nextMondayTimestamp)
  );

  const snapshot = await getDocs(weeklyQuery);
  console.log(`📚 Mysteries found: ${snapshot.size}`);

  if (snapshot.empty) {
    title.textContent = "Mystery Not Available Yet.";
    console.warn("⚠️ No mystery found between this Monday and next Monday.");
    return;
  }

  const mysteryDoc = snapshot.docs[0];
  const data = mysteryDoc.data();
  const docId = mysteryDoc.id;
  console.log("✅ Loaded mystery:", docId, data);

  title.textContent = data.title;
  premise.textContent = data.premise;
  cluesList.innerHTML = "";

  const today = (new Date()).getUTCDay(); // Sunday=0, Monday=1,..., Saturday=6

const clues = [
  { day: 1, title: data.day1title, text: data.day1clue },
  { day: 2, title: data.day2title, text: data.day2clue },
  { day: 3, title: data.day3title, text: data.day3clue },
  { day: 4, title: data.day4title, text: data.day4clue },
  { day: 5, title: data.day5title, text: data.day5clue }
];

// Clear previous clues
cluesList.innerHTML = "";

// Render only up to today’s clue
clues.forEach((clue) => {
  if (today >= clue.day && clue.text) {
    const clueBlock = document.createElement('div');
    clueBlock.className = "clue-block";

    const title = document.createElement('h4');
    title.className = "clue-title";
    title.textContent = clue.title;

    const paragraph = document.createElement('p');
    paragraph.className = "clue-text";
    paragraph.textContent = clue.text;

    clueBlock.appendChild(title);
    clueBlock.appendChild(paragraph);
    cluesList.appendChild(clueBlock);
  }
});

    form.onsubmit = async (e) => {
      e.preventDefault();
      const selected = document.querySelector("input[name='premium-choice']:checked");
      if (!selected) return;

      await setDoc(doc(db, `weeklyMysteries/${docId}/votes/${userId}`), {
        choice: parseInt(selected.value),
        timestamp: serverTimestamp()
      });

      result.innerHTML = `<p><strong>✅ Thank you, Seeker. Your choice has been recorded.</strong></p>`;
      form.style.display = "none";
    };
  } else {
    form.style.display = "none";
  }
}

// Stripe Checkout Button
const checkoutButton = document.getElementById('checkout-button');
checkoutButton?.addEventListener('click', async () => {
  const stripe = Stripe('pk_live_51RHbVmDN3UWo9IgN2cmBCfP9bB6UEW6sRwGiaEruXAz6XzCPurlzqcGJf8VYpb3a2I7G4cdUK6dBOv0MkjLAPgmv00s42wtmzi');
  checkoutButton.textContent = "Redirecting...";
  checkoutButton.disabled = true;

  await stripe.redirectToCheckout({
    lineItems: [{ price: 'price_1RIKt2DN3UWo9IgNhJaL8v1L', quantity: 1 }],
    mode: 'subscription',
    successUrl: 'https://rhysticgamesnz.github.io/mystery-realms/stats.html',
    cancelUrl: 'https://rhysticgamesnz.github.io/mystery-realms/premium.html',
  });
});
