const params = new URLSearchParams(window.location.search);
const csvUrl = params.get("csv");
const title = params.get("title");

const tableBody = document.querySelector("#playlist tbody");
const embed = document.getElementById("embed");
const pageTitle = document.getElementById("pageTitle");

const openSpotifyBtn = document.getElementById("openSpotify");
const shuffleBtn = document.getElementById("shuffleBtn");
const clearChecksBtn = document.getElementById("clearChecks");

let spotifyPlaylist = null;
let rowsData = [];
let selectedIndex = 0;
let shuffleMode = localStorage.getItem("shuffleMode") === "true";
let playedSet = new Set(JSON.parse(localStorage.getItem("playedSet") || "[]"));

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

function detectPlatform(link) {
  if (!link) return "Link";
  if (link.includes("spotify.com/playlist")) return "SpotifyPlaylist";
  if (link.includes("spotify.com/track")) return "SpotifyTrack";
  if (link.includes("youtube.com") || link.includes("youtu.be")) return "YouTube";
  if (link.includes("hearthis.at")) return "hearthis.at";
  if (link.includes("drive.google.com")) return "GDrive";
  return "Link";
}

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

function playRow(i) {
  const row = rowsData[i];
  if (!row) return;

  const platform = detectPlatform(row.link);
  embed.innerHTML = "";

  markPlayed(i);

  if (platform === "YouTube") {
    const videoId = extractYouTubeID(row.link);
    embed.innerHTML = `
      <iframe width="560" height="315"
        src="https://www.youtube.com/embed/${videoId}?autoplay=1"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;
  }

  else if (platform === "SpotifyTrack") {
    const trackId = row.link.split("/track/")[1]?.split("?")[0];
    embed.innerHTML = `
      <iframe style="border-radius:12px"
        src="https://open.spotify.com/embed/track/${trackId}"
        width="100%" height="152"
        frameborder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
      </iframe>
    `;
  }

  else if (platform === "SpotifyPlaylist") {
    window.open(row.link, "_blank");
  }

  else {
    window.open(row.link, "_blank");
  }
}

function markPlayed(i) {
  playedSet.add(i);
  localStorage.setItem("playedSet", JSON.stringify([...playedSet]));
  renderTable();
  highlightRow();
}

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

// Controls
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

// Keyboard
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;

  if (e.key === "ArrowDown") {
    selectedIndex = Math.min(selectedIndex + 1, rowsData.length - 1);
    highlightRow();
  }

  if (e.key === "ArrowUp") {
    selectedIndex = Math.max(selectedIndex - 1, 0);
    highlightRow();
  }

  if (e.key === "Enter") {
    playRow(selectedIndex);
  }

  if (e.key.toLowerCase() === "s") {
    shuffleBtn.click();
  }

  if (e.key.toLowerCase() === "c") {
    clearChecksBtn.click();
  }

  if (e.key === " ") {
    e.preventDefault();
    selectedIndex = getNextIndex();
    highlightRow();
    playRow(selectedIndex);
  }
});
