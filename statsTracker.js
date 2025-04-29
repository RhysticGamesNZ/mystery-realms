// statsTracker.js
import { doc, updateDoc, increment, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function trackCorrectGuess(db, uid) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    correct: increment(1),
    streak: increment(1)
  });
}

export async function trackIncorrectGuess(db, uid) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    incorrect: increment(1),
    streak: 0
  });
}

export async function trackLoreRead(db, uid, docId = null) {
  const ref = doc(db, "users", uid);
  const update = docId
    ? { loreRead: arrayUnion(docId) }
    : { loreRead: increment(1) };
  await updateDoc(ref, update);
}

export async function trackMysterySolved(db, uid) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    mysteriesSolved: increment(1),
    lastSolved: serverTimestamp()
  });
}
