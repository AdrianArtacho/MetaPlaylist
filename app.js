const params = new URLSearchParams(window.location.search);
const csvUrl = params.get("csv");
const title = params.get("title");

const tableBody = document.querySelector("#playlist tbody");
const embed = document.getElementById("embed");
const pageTitle = document.getElementById("pageTitle");
const openSpotifyBtn = document.getElementById("openSpotify");
const clearChecksBtn = document.getElementById("clearChecks");

let spotifyPlaylist = null;

if (title) pageTitle.textContent = decodeURIComponent(title);

if (!csvUrl) {
  embed.innerHTML = "<p>No CSV provided. Use ?csv=YOUR_URL</p>";
  throw new Error("No CSV URL");
}

fetch(csvUrl)
  .then(res => res.text())
  .then(parseCSV)
  .then(renderTable);

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
  if (link.includes("spotify.com")) return "Spotify";
  if (link.includes("youtube.com") || link.includes("youtu.be")) return "YouTube";
  if (link.includes("hearthis.at")) return "hearthis.at";
  if (link.includes("drive.google.com")) return "GDrive";
  return "Link";
}

function renderTable(rows) {
  rows.forEach((row, i) => {
    const platform = detectPlatform(row.link);

    if (platform === "Spotify" && row.link.includes("playlist")) {
      spotifyPlaylist = row.link;
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${row.title || ""}</td>
      <td>${row.artist || ""}</td>
      <td>${platform}</td>
      <td><span class="play-btn">▶️</span></td>
      <td><input type="checkbox" /></td>
    `;

    const playBtn = tr.querySelector(".play-btn");
    const checkbox = tr.querySelector("input");

    playBtn.onclick = () => playLink(row.link, platform);
    checkbox.onchange = () => tr.classList.toggle("played", checkbox.checked);

    tableBody.appendChild(tr);
  });
}

function playLink(link, platform) {
  embed.innerHTML = "";

  if (platform === "YouTube") {
    const videoId = link.split("v=")[1]?.split("&")[0];
    embed.innerHTML = `
      <iframe width="560" height="315"
        src="https://www.youtube.com/embed/${videoId}"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;
  }
  else if (platform === "Spotify") {
    window.open(link, "_blank");
  }
  else {
    window.open(link, "_blank");
  }
}

openSpotifyBtn.onclick = () => {
  if (spotifyPlaylist) {
    window.open(spotifyPlaylist, "_blank");
  } else {
    alert("No Spotify playlist found in CSV.");
  }
};

clearChecksBtn.onclick = () => {
  document.querySelectorAll("tr").forEach(tr => {
    tr.classList.remove("played");
    const cb = tr.querySelector("input");
    if (cb) cb.checked = false;
  });
};
