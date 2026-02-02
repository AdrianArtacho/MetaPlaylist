// ==========================
// Meta-Playlist Controller
// ==========================

const params = new URLSearchParams(window.location.search);
const csvUrl = params.get("csv");
const title = params.get("title");

const editUrl = params.get("edit");

// UI
const tableBody = document.querySelector("#playlist tbody");
const embed = document.getElementById("embed");
const pageTitle = document.getElementById("pageTitle");

const openSpotifyBtn = document.getElementById("openSpotify");
const shuffleBtn = document.getElementById("shuffleBtn");
const clearChecksBtn = document.getElementById("clearChecks");

// State
let spotifyPlaylist = null;
let rowsData = [];
let selectedIndex = 0;

let shuffleMode = localStorage.getItem("shuffleMode") === "true";
let playedSet = new Set(JSON.parse(localStorage.getItem("playedSet") || "[]"));

let ytPlayer = null;
let spotifyEmbed = null;
let mediaUnlocked = false;

// Init
shuffleBtn.textContent = shuffleMode ? "🔀 Shuffle ON" : "🔀 Shuffle OFF";
if (title) pageTitle.textContent = decodeURIComponent(title);

if (!csvUrl) {
  embed.innerHTML = "<p>No CSV provided. Use ?csv=YOUR_URL</p>";
  throw new Error("No CSV URL");
}

fetch(csvUrl)
  .then(res => res.text())
  .then(parseCSV)
  .then(data => {
    rowsData = data;
    renderTable();
    highlightRow();
  });

// ==========================
// CSV
// ==========================

function parseCSV(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const headers = lines.shift().split(",");

  return lines.map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || "");
    return obj;
  });
}

// ==========================
// Platform Detection
// ==========================

function detectPlatform(link) {
  if (!link) return "Link";
  if (link.includes("spotify.com/playlist")) return "SpotifyPlaylist";
  if (link.includes("spotify.com/track")) return "SpotifyTrack";
  if (link.includes("youtube.com") || link.includes("youtu.be")) return "YouTube";
  if (link.includes("hearthis.at")) return "hearthis.at";
  if (link.includes("drive.google.com")) return "GDrive";
  return "Link";
}

// ==========================
// Render
// ==========================

function renderTable() {
  tableBody.innerHTML = "";

  rowsData.forEach((row, i) => {
    const platform = detectPlatform(row.link);

    if (platform === "SpotifyPlaylist") {
      spotifyPlaylist = row.link;
    }

    const tr = document.createElement("tr");
    tr.dataset.index = i;

    if (playedSet.has(i)) tr.classList.add("played");

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${row.title || ""}</td>
      <td>${row.artist || ""}</td>
      <td>${platform.replace("Spotify", "Spotify ")}</td>
      <td><span class="play-btn">▶️</span></td>
      <td><input type="checkbox" ${playedSet.has(i) ? "checked" : ""}/></td>
    `;

    tr.onclick = () => {
      selectedIndex = i;
      highlightRow();
    };

    const playBtn = tr.querySelector(".play-btn");
    const checkbox = tr.querySelector("input");

    playBtn.onclick = (e) => {
      e.stopPropagation();
      unlockMedia();
      playRow(i);
    };

    checkbox.onchange = () => togglePlayed(i, tr, checkbox);

    tableBody.appendChild(tr);
  });
}

function highlightRow() {
  document.querySelectorAll("tr").forEach(tr => tr.classList.remove("selected"));
  const row = document.querySelector(`tr[data-index="${selectedIndex}"]`);
  if (row) {
    row.classList.add("selected");
    row.scrollIntoView({ block: "nearest" });
  }
}

// ==========================
// Played State
// ==========================

function togglePlayed(i, tr, checkbox) {
  if (checkbox.checked) {
    playedSet.add(i);
    tr.classList.add("played");
  } else {
    playedSet.delete(i);
    tr.classList.remove("played");
  }
  localStorage.setItem("playedSet", JSON.stringify([...playedSet]));
}

function markPlayed(i) {
  playedSet.add(i);
  localStorage.setItem("playedSet", JSON.stringify([...playedSet]));
  renderTable();
  highlightRow();
}

// ==========================
// Playback
// ==========================

function playRow(i) {
  const row = rowsData[i];
  if (!row) return;

  const platform = detectPlatform(row.link);

  ytPlayer = null;
  spotifyEmbed = null;
  embed.innerHTML = "";

  markPlayed(i);

  // ---- YouTube ----
  if (platform === "YouTube") {
    const videoId = extractYouTubeID(row.link);
    embed.innerHTML = `
      <iframe id="ytplayer"
        width="560"
        height="315"
        src="https://www.youtube.com/embed/${videoId}?enablejsapi=1"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;
    ytPlayer = document.getElementById("ytplayer");
  }

  // ---- Spotify Track ----
  else if (platform === "SpotifyTrack") {
    const trackId = row.link.split("/track/")[1]?.split("?")[0];
    embed.innerHTML = `
      <iframe id="spotifyPlayer"
        style="border-radius:12px"
        src="https://open.spotify.com/embed/track/${trackId}"
        width="100%" height="152"
        frameborder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
      </iframe>
    `;
    spotifyEmbed = document.getElementById("spotifyPlayer");
  }

  // ---- Spotify Playlist ----
  else if (platform === "SpotifyPlaylist") {
    window.open(row.link, "_blank");
  }

  // ---- Everything else ----
  else {
    window.open(row.link, "_blank");
  }
}

// ==========================
// Media Control
// ==========================


const editSheetBtn = document.getElementById("editSheet");

if (editUrl) {
  editSheetBtn.onclick = () => {
    window.open(editUrl, "_blank");
  };
} else {
  editSheetBtn.style.display = "none";
}

// ==========================

function unlockMedia() {
  mediaUnlocked = true;
}

function togglePlayback() {
  // YouTube play/pause toggle
  if (ytPlayer) {
    ytPlayer.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: "playVideo",
        args: []
      }),
      "*"
    );
    return;
  }

  // Spotify best-effort focus (user can space/click inside)
  if (spotifyEmbed) {
    spotifyEmbed.focus();
  }
}

// ==========================
// Helpers
// ==========================

function extractYouTubeID(url) {
  if (url.includes("youtu.be")) return url.split("/").pop();
  return url.split("v=")[1]?.split("&")[0];
}

function getNextIndex() {
  if (!shuffleMode) {
    return (selectedIndex + 1) % rowsData.length;
  }

  const unplayed = rowsData
    .map((_, i) => i)
    .filter(i => !playedSet.has(i));

  if (unplayed.length === 0) {
    return Math.floor(Math.random() * rowsData.length);
  }

  return unplayed[Math.floor(Math.random() * unplayed.length)];
}

// ==========================
// Controls
// ==========================

shuffleBtn.onclick = () => {
  shuffleMode = !shuffleMode;
  localStorage.setItem("shuffleMode", shuffleMode);
  shuffleBtn.textContent = shuffleMode ? "🔀 Shuffle ON" : "🔀 Shuffle OFF";
};

clearChecksBtn.onclick = () => {
  playedSet.clear();
  localStorage.removeItem("playedSet");
  renderTable();
  highlightRow();
};

openSpotifyBtn.onclick = () => {
  if (spotifyPlaylist) {
    window.open(spotifyPlaylist, "_blank");
  } else {
    alert("No Spotify playlist found in CSV.");
  }
};

// ==========================
// Keyboard
// ==========================

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;

  // Down
  if (e.key === "ArrowDown") {
    selectedIndex = Math.min(selectedIndex + 1, rowsData.length - 1);
    highlightRow();
  }

  // Up
  if (e.key === "ArrowUp") {
    selectedIndex = Math.max(selectedIndex - 1, 0);
    highlightRow();
  }

  // Enter = play
  if (e.key === "Enter") {
    unlockMedia();
    playRow(selectedIndex);
  }

  // S = shuffle
  if (e.key.toLowerCase() === "s") {
    shuffleBtn.click();
  }

  // C = clear
  if (e.key.toLowerCase() === "c") {
    clearChecksBtn.click();
  }

  // Space = play/pause or next
  if (e.key === " ") {
    e.preventDefault();
    unlockMedia();

    if (ytPlayer || spotifyEmbed) {
      togglePlayback();
    } else {
      selectedIndex = getNextIndex();
      highlightRow();
      playRow(selectedIndex);
    }
  }
});
