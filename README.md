# 🎛️ MetaPlaylist

*A CSV-driven, cross-platform playlist and performance interface for GitHub Pages*

**MetaPlaylist** is a lightweight, browser-based web interface that turns a simple spreadsheet (CSV) into a **universal playlist, control surface, and action-score player**.

It allows you to **navigate, trigger, and track media across multiple platforms** — such as Spotify, YouTube, Google Drive, and audio hosting services — from a single, keyboard-driven interface. The project is designed to run entirely on **GitHub Pages**, with no backend, no authentication, and no external dependencies.

---

## ✨ What It Does

* 📊 **Loads a public CSV** (e.g. Google Sheets “Publish to Web”)
* 🎧 **Detects platform automatically**

  * Spotify (playlist → external, track → embedded)
  * YouTube (embedded)
  * Google Drive
  * Audio platforms (e.g. hearthis.at, Bandcamp, SoundCloud, etc.)
* ⌨️ **Keyboard control**

  * ↑ / ↓ — Navigate tracks
  * Enter — Play selected
  * Space — Play / Pause (YouTube + best-effort Spotify)
  * S — Toggle shuffle
  * C — Clear played state
* 🔀 **Shuffle mode**
* ☑️ **Played tracking** (stored locally in the browser)
* 💾 **Persistent state** using `localStorage`
* ✏️ **One-click edit button** to jump back into the source spreadsheet

---

## 🧠 Conceptual Use Cases

MetaPlaylist works equally well as:

* 🎵 **Hybrid playlist player**
* 🎭 **Performance control surface**
* 📱 **Audience-facing portal**
* 🧩 **Action-score interpreter**
* 🧪 **Teaching / workshop interface**
* 🎲 **Indeterminate / shuffle-based set generator**

The spreadsheet becomes the **score**, and the browser becomes the **instrument**.

---

## 📁 Repository Structure

```
MetaPlaylist/
├─ index.html      → Main performance interface
├─ app.js          → Controller logic
├─ style.css      → UI styling
├─ helper.html    → Link generator (authoring / publishing tool)
└─ README.md      → This file
```

---

## 🧾 CSV Format

Your spreadsheet must be **published as CSV** and include at least:

```csv
title,artist,link,notes
```

### Example (Anonymized)

```csv
Track A,Composer X,https://open.spotify.com/track/XXXXXXXX,Opening
Track B,,https://youtube.com/watch?v=XXXXXXXX,Video
Track C,,https://example-audio-platform.com/track/XXXX,Sketch
Track D,,https://drive.google.com/file/d/XXXX/view,Reference
```

Only the `link` column is strictly required.
All other columns are optional and displayed as metadata.

---

## 🚀 Deployment (GitHub Pages)

1. Create a new GitHub repository
2. Upload all files
3. Go to **Settings → Pages**
4. Set source to:

   ```
   Branch: main
   Folder: / (root)
   ```
5. Your interface will be available at:

   ```
   https://USERNAME.github.io/MetaPlaylist/
   ```

---

## 🔗 Using the Interface

MetaPlaylist is controlled entirely via **URL parameters**.

### Parameters

| Parameter | Description                                    |
| --------- | ---------------------------------------------- |
| `title`   | Page title (displayed in the header)           |
| `csv`     | Public CSV URL                                 |
| `edit`    | Editable spreadsheet URL (opens via ✏️ button) |

### Example (Anonymized)

```
https://USERNAME.github.io/MetaPlaylist/
?title=My%20Hybrid%20Set
&csv=https://docs.google.com/spreadsheets/d/e/XXXXXXXX/pub?output=csv
&edit=https://docs.google.com/spreadsheets/d/XXXXXXXX/edit
```

> Note: All parameters are automatically URL-encoded when generated via the helper tool.

---

## 🎹 Keyboard Controls

| Key   | Action                                 |
| ----- | -------------------------------------- |
| ↑ / ↓ | Navigate playlist                      |
| Enter | Play selected item                     |
| Space | Play / Pause (YouTube + Spotify focus) |
| S     | Toggle shuffle                         |
| C     | Clear played marks                     |

---

## ✏️ `helper.html` — Link Generator

The helper is a **small authoring tool** that generates a fully encoded, performance-ready MetaPlaylist link.

### What It Solves

* Automatically URL-encodes:

  * Titles
  * CSV links
  * Edit links
* Removes unsupported URL fragments (e.g. `#gid=...`)
* Copies the final link to clipboard with one click

### Workflow

1. Open:

   ```
   https://USERNAME.github.io/MetaPlaylist/helper.html
   ```
2. Paste:

   * Base URL
   * Title
   * CSV URL
   * Edit URL
3. Click **Generate**
4. The final link is:

   * Displayed
   * Automatically copied to clipboard
5. Share or deploy immediately (QR code, email, OBS, slides, etc.)

This creates a clean **compose → publish → perform** loop.

---

## 🎧 Platform Behavior

| Platform         | Behavior                   |
| ---------------- | -------------------------- |
| Spotify Playlist | Opens in Spotify app / web |
| Spotify Track    | Embedded player            |
| YouTube          | Embedded player            |
| Other Links      | Opens in new tab           |

> Browser and platform policies prevent full autoplay and deep remote control of embedded players. MetaPlaylist uses the **maximum legally supported level of control** available in modern browsers.

---

## 🔐 Privacy & Hosting

* No backend
* No cookies
* No tracking
* No authentication
* All state stored locally in the user’s browser
* Fully static hosting via GitHub Pages

---

## 🧩 Extensibility

This system is intentionally simple to extend. Common upgrades include:

* 🎮 Game-master / conductor view
* 🕒 Auto-advance on track end
* 🔊 MIDI / OSC output on play
* 📱 QR-based audience interface
* 🔄 Live CSV reload during performance
* 🌐 Multi-browser sync for distributed performance

---

## 🛠️ License

This project is released under the **MIT License**.
Use, modify, and adapt freely for artistic, educational, and research purposes.

---

## 🧠 Credits / Philosophy

MetaPlaylist treats playlists not as static lists, but as **procedural scores**:
editable, navigable, performable, and distributable in real time.

The tool is designed to sit somewhere between:

> **utility, instrument, and performance interface**

---

## [To-Do](https://trello.com/c/t8JeOlrb/53-metaplaylist)
