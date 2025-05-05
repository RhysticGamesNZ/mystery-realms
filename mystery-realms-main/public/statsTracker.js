// statsTracker.js
import { doc, updateDoc, increment, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function trackCorrectGuess(db, uid) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    correct: increment(1),
    streak: increment(1)
  });

  // Fetch updated correct count
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const correct = data.correct || 0;
  const levelIndex = Math.floor(correct / 7);
  const cappedIndex = Math.min(levelIndex, 19); // prevent overflow

  // Fetch level title from Firestore
  const levelRef = doc(db, "levelTitles", String(cappedIndex));
  const levelSnap = await getDoc(levelRef);
  if (!levelSnap.exists()) return;

  const newLevel = levelSnap.data().name;
  if (data.level !== newLevel) {
    await updateDoc(ref, { level: newLevel });
  }
}

/**
 * Increments incorrect guesses and resets streak to 0
 */
export async function trackIncorrectGuess(db, uid) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    incorrect: increment(1),
    streak: 0 // ✅ Directly resets the streak field
  });
}

/**
 * Increments lore documents read count
 */
export async function trackLoreRead(db, uid) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    loreRead: increment(1)
  });
}

/**
 * Increments mysteries solved and updates last solved timestamp
 */
export async function trackMysterySolved(db, uid) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    mysteriesSolved: increment(1),
    lastSolved: serverTimestamp()
  });
}

export async function validateStreak(db, uid) {
  const ref = doc(db, "users", uid);
  const userSnap = await getDoc(ref);
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const last = data.lastSolved?.toDate?.() || null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!last) return; // no previous activity, no reset needed

  const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    // Skipped at least one day, reset streak
    await updateDoc(ref, { streak: 0 });
  }
}
