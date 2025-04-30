import

const container = document.getElementById("chapter-container");

async function loadPremiumStory() {
  const snapshot = await getDocs(collection(db, "premiumStory"));
  const chapters = [];

  snapshot.forEach(docSnap => {
    chapters.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  // Optional: sort by doc ID (e.g. prologue, chapter-one, chapter-two)
  chapters.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  chapters.forEach(({ title, content }) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = title;

    const body = document.createElement("div");
    body.className = "chapter-body";
    body.innerHTML = formatText(content);

    details.appendChild(summary);
    details.appendChild(body);
    container.appendChild(details);
  });
}

loadPremiumStory();
