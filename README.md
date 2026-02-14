# Geographic Story Builder 🗺️

Create and explore interactive map-based biographies. Generate stories with AI and share them via a single URL—no sign-in or save step. Bookmark or share the link to keep a story.

## ✨ Features

- **Explore stories** – Pre-made biographies (Gandhi, Einstein, Nelson Mandela, and more) with map, timeline, and narrative.
- **Generate your own** – Enter a person’s name or story outline; an AI produces a geographic biography in the same format.
- **Shareable URLs** – The full story is encoded in the URL hash (compressed). Share the link or bookmark it; no server save or login needed.
- **Scrollytelling map** – Scroll through the story while the map pans and zooms to each location (MapLibre GL JS).
- **Editorial layout** – Drop caps, Playfair Display typography, and comic-style map popups.

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- (Optional) Python for a local server
- (Optional) OpenAI-compatible API key for story generation

### Run locally

1. Clone or download the repo.
2. Serve the folder (recommended):

   ```bash
   python -m http.server 8080
   ```

3. Open **http://localhost:8080** in your browser.

### Generate a story

1. On the home page, enter a name or short outline (e.g. *Marie Curie, physicist*) and click **Generate story**.
2. Configure the LLM if prompted (navbar → magic wand): set API base URL and key (e.g. OpenAI or OpenRouter).
3. After generation, you’re taken to the story view. The URL contains the story—**copy or bookmark it** to share or keep it. Use **Copy link** in the header to copy the URL.

### Saving / sharing

- **No sign-in.** The story data lives in the URL (compressed in the hash).
- **Share** – Send the story page URL; anyone who opens it sees the same story.
- **Keep it** – Bookmark the URL in your browser.

## 📁 Project structure

| Path | Description |
|------|-------------|
| `index.html` | Home: explore stories, current draft link, generate form |
| `index.js` | Home logic: config, cards, draft link, LLM generation, URL encoding |
| `stories.html` | Story view: scrollytelling map and narrative |
| `script.js` | Story view: load config from URL hash or pre-made id, map, Copy link |
| `index-config.json` | App config: title, cards, defaults |
| `configs/*.json` | Pre-made story configs (Gandhi, Einstein, etc.) |

## 🛠️ Built with

- **MapLibre GL JS** – Vector/raster maps (maplibre.org)
- **Bootstrap 5** – Layout and UI
- **bootstrap-llm-provider** – LLM API configuration
- **LZString** – Compress story JSON for the URL
- **Google Fonts** – Playfair Display, Source Sans Pro, Comic Neue

## 📝 License

Conceptual prototype for geographic biographies.
