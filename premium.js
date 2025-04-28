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
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists() || !userSnap.data().premium) {
    checkoutContainer.style.display = "block";
    premiumContainer.style.display = "none";
    return;
  }

  // User is premium
  checkoutContainer.style.display = "none";
  premiumContainer.style.display = "block";

  loadWeeklyMystery(user.uid);
});

async function loadWeeklyMystery(userId) {
  // Find current week's Monday UTC+12
  const now = new Date();
  const utcPlus12 = new Date(now.getTime() + (12 * 60 * 60 * 1000));
  const day = utcPlus12.getUTCDay(); // Sunday=0
  const monday = new Date(utcPlus12);
  monday.setUTCDate(monday.getUTCDate() - ((day + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);
  const mondayTimestamp = Timestamp.fromDate(monday);

  const q = query(
    collection(db, "weeklyMysteries"),
    where("date", "==", mondayTimestamp)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    title.textContent = "Mystery Not Available Yet.";
    return;
  }

  const mysteryDoc = snapshot.docs[0];
  const data = mysteryDoc.data();
  const docId = mysteryDoc.id;

  title.textContent = data.title;
  premise.textContent = data.premise;
  cluesList.innerHTML = "";

  const today = (new Date()).getUTCDay(); // Sunday = 0, Saturday = 6

  const clues = [
    { day: 1, text: data.day1clue },
    { day: 2, text: data.day2clue },
    { day: 3, text: data.day3clue },
    { day: 4, text: data.day4clue },
    { day: 5, text: data.day5clue }
  ];

  clues.forEach((clue, index) => {
    if (today >= clue.day && clue.text) {
      const li = document.createElement("li");
      li.textContent = clue.text;
      cluesList.appendChild(li);
    }
  });

  if (today === 6) {
    // Show voting
    form.style.display = "block";
    choicesFieldset.innerHTML = "";
    data.choices.forEach((choice, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "premium-choice";
      input.value = index;
      if (index === 0) input.checked = true;
      label.appendChild(input);
      label.appendChild(document.createTextNode(choice));
      choicesFieldset.appendChild(label);
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const selected = document.querySelector("input[name='premium-choice']:checked");
      if (!selected) return;

      await setDoc(doc(db, `weeklyMysteries/${docId}/votes/${userId}`), {
        choice: parseInt(selected.value),
        timestamp: serverTimestamp()
      });

      result.innerHTML = `<p><strong>Thank you, Seeker. Your choice has been recorded.</strong></p>`;
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
