import { getFirestore, collection, getDocs, query, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXY7DEhinmbYLQ7zBRgEUJoc_eRsp-aNU",
  authDomain: "mystery-realms.firebaseapp.com",
  projectId: "mystery-realms",
  storageBucket: "mystery-realms.firebasestorage.app",
  messagingSenderId: "511471364499",
  appId: "1:511471364499:web:fbc7d813e9b8d28cf32066"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore();
const container = document.getElementById("past-container");

async function loadPastMysteries() {
  const today = new Date();
  const mysteriesByMonth = {};

  const querySnapshot = await getDocs(collection(db, "mysteries"));
  
  querySnapshot.forEach(doc => {
    const data = doc.data();

    // ✅ Only include mysteries with a date <= today
    if (data.date.toDate() <= today) {
      const dateObj = data.date.toDate();
      const monthYear = `${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;

      if (!mysteriesByMonth[monthYear]) {
        mysteriesByMonth[monthYear] = [];
      }
      mysteriesByMonth[monthYear].push({ id: doc.id, title: data.title });
    }
  });

  // Sort months by newest first
  const sortedMonths = Object.keys(mysteriesByMonth).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA;
  });

  sortedMonths.forEach(monthYear => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = monthYear;
    details.appendChild(summary);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper'; // for smooth open/close

    mysteriesByMonth[monthYear].forEach(mystery => {
      const link = document.createElement('a');
      link.href = `index.html?id=${mystery.id}`;
      link.className = 'mystery-link';
      link.textContent = mystery.title;
      contentWrapper.appendChild(link);
    });

    details.appendChild(contentWrapper);

    // Accordion: close other open sections
    summary.addEventListener('click', (e) => {
      document.querySelectorAll('#past-container details').forEach(d => {
        if (d !== details) {
          d.removeAttribute('open');
        }
      });
    });

    container.appendChild(details);
  });
}

loadPastMysteries();
