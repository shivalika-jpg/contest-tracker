async function fetchCodeforcesContests() {
    const response = await fetch("https://codeforces.com/api/contest.list");
    const data = await response.json();

    if (data.status !== "OK") {
        console.error("Failed to fetch contests");
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    const oneWeekAgo = now - 7 * 24 * 60 * 60;

    const upcomingContests = data.result
        .filter(contest => contest.phase === "BEFORE")
        .map(contest => formatContest(contest));

    const pastContests = data.result
        .filter(contest => contest.phase === "FINISHED" && contest.startTimeSeconds > oneWeekAgo)
        .map(contest => formatContest(contest));

    updateContests(upcomingContests, pastContests);
    loadBookmarks();
}

function formatContest(contest) {
    return {
        id: contest.id,
        name: contest.name,
        date: new Date(contest.startTimeSeconds * 1000).toISOString(),
        link: `https://codeforces.com/contest/${contest.id}`
    };
}

function updateContests(upcomingContests, pastContests) {
    const upcomingContainer = document.getElementById("upcoming-contests");
    const pastContainer = document.getElementById("past-contests");

    upcomingContainer.innerHTML = "";
    pastContainer.innerHTML = "";

    upcomingContests.forEach(contest => createContestCard(contest, upcomingContainer));
    pastContests.forEach(contest => createContestCard(contest, pastContainer));
}

function createContestCard(contest, container) {
    const div = document.createElement("div");
    div.className = "contest-card";
    div.innerHTML = `<h2>${contest.name}</h2>
                     <p>${contest.date.includes("T") ? `Starts in: ${timeRemaining(contest.date)}` : `Ended on: ${new Date(contest.date).toLocaleString()}`}</p>
                     <a href="${contest.link}" target="_blank">View Contest</a>
                     <button onclick="toggleBookmark(${contest.id}, '${contest.name}', '${contest.link}')">
                        ${isBookmarked(contest.id) ? "Remove Bookmark" : "Bookmark"}
                     </button>`;

    container.appendChild(div);
}

function toggleBookmark(id, name, link) {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

    if (bookmarks.some(contest => contest.id === id)) {
        bookmarks = bookmarks.filter(contest => contest.id !== id);
    } else {
        bookmarks.push({ id, name, link });
    }

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    loadBookmarks();
    fetchCodeforcesContests(); // Refresh contest list to update buttons
}

function loadBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    const bookmarkContainer = document.getElementById("bookmarked-contests");

    bookmarkContainer.innerHTML = bookmarks.length ? "" : "<p>No bookmarks yet.</p>";

    bookmarks.forEach(contest => {
        const div = document.createElement("div");
        div.className = "contest-card";
        div.innerHTML = `<h2>${contest.name}</h2>
                         <a href="${contest.link}" target="_blank">View Contest</a>
                         <button onclick="toggleBookmark(${contest.id}, '${contest.name}', '${contest.link}')">Remove Bookmark</button>`;

        bookmarkContainer.appendChild(div);
    });
}

function isBookmarked(id) {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    return bookmarks.some(contest => contest.id === id);
}

function timeRemaining(date) {
    const diff = new Date(date) - new Date();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours} hours` : "Starting soon";
}

fetchCodeforcesContests();
