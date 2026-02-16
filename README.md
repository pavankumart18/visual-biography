# Geographic Story Builder 🗺️

Create and explore interactive map-based biographies. Generate stories with AI and share them via a single URL — no sign-in or save step needed. Bookmark or share the link to keep a story forever.

## ✨ Features

- **Explore stories** – Pre-made biographies (Gandhi, Einstein, Elon Musk, Nelson Mandela, Mother Teresa, Swami Vivekananda, and Narendra Modi) with map, timeline, and narrative.
- **Generate your own** – Enter a person's name or story outline; an AI produces a geographic biography in the same format.
- **Shareable URLs** – The full story is encoded in the URL hash (LZ-compressed). Share the link or bookmark it; no server save or login needed.
- **Scrollytelling map** – Scroll through the story while the map pans and zooms to each location (MapLibre GL JS).
- **Intelligent Image Discovery** – Automatically fetches photos from Wikipedia, with smart fallbacks (City → Region → Country) to ensure visual rich biographies.
- **Persistent Story History** – Automatically remembers your generated biographies in a local history list, so you never lose a story.
- **Map Reliability** – Integrated loading overlays and robust error handling for network-resilient map rendering.
- **Multiple map styles** – Switch between high-quality styles (Map, Satellite, Terrain, Streets, etc.) on the fly.

  | Style | Provider | Description |
  |-------|----------|-------------|
  | **Map** | MapTiler (Vector) | Standard high-detail streets and roads |
  | **Satellite** | ArcGIS (Raster) | High-resolution aerial and satellite imagery |
  | **Terrain** | MapTiler (Vector) | Topographic map with elevation and contours |
  | **Streets** | MapTiler (Vector) | Clean OpenStreetMap-based vector style |
  | **Light** | MapTiler (Vector) | Minimal, light-themed map for visualization |
  | **Dark** | MapTiler (Vector) | High-contrast dark-themed professional map |

- **Editorial layout** – Drop caps, Playfair Display typography, data cards, timeline section, and comic-style map popups.
- **Wikipedia images** – Story cards auto-fetch relevant images from Wikimedia for each location.
- **Dark / Light mode** – Toggle between dark, light, and auto themes from the navbar.
- **LLM configuration** – Configure any OpenAI-compatible API (OpenAI, OpenRouter, etc.) via the navbar.

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- (Optional) Python 3 for a local development server
- (Optional) An OpenAI-compatible API key for AI story generation

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/pavankumart18/visual-biography.git
   cd visual-biography
   ```

2. Start a local server:

   ```bash
   python -m http.server 8000
   ```

3. Open **http://localhost:8000** in your browser.

### Explore a pre-made story

Click any story card on the home page (e.g. *Gandhi*, *Albert Einstein*). You'll be taken to the scrollytelling view with the map on the left and story cards on the right.

### Generate a story

1. On the home page, enter a name or short outline (e.g. *Marie Curie, physicist born in Warsaw*) and click **Generate story**.
2. Configure the LLM if prompted (navbar → magic wand icon): set the API base URL and key (e.g. OpenAI or OpenRouter).
3. After generation, you're taken to the story view. The URL contains the full story — **copy or bookmark it** to share or keep it.

### Saving / sharing

- **No sign-in required.** The story data lives in the URL (LZ-compressed in the hash).
- **Share** – Send the story page URL; anyone who opens it sees the same story.
- **Keep it** – Bookmark the URL in your browser.

## 📁 Project Structure

| Path | Description |
|------|-------------|
| `index.html` | Home page: explore stories, view current draft, generate new stories |
| `index.js` | Home page logic: config loading, cards, draft link, LLM generation, URL encoding |
| `stories.html` | Story viewer: scrollytelling map layout with editorial narrative |
| `script.js` | Story viewer logic: config loading (URL hash / pre-made ID), map initialization, map type switching, story step scrolling, Wikipedia image fetching |
| `index-config.json` | App configuration: title, subtitle, story cards, default model, Supabase config |
| `config.json` | Default story config (Gandhi) |
| `configs/` | Pre-made story configs: |
| `configs/gandhi.json` | Mahatma Gandhi |
| `configs/elon-musk.json` | Elon Musk |
| `configs/swami-vivekananda.json` | Swami Vivekananda |
| `configs/albert-einstein.json` | Albert Einstein |
| `configs/nelson-mandela.json` | Nelson Mandela |
| `configs/mother-teresa.json` | Mother Teresa |
| `configs/narendra-modi.json` | Narendra Modi |
| `data.csv` | Supplementary data |

## 🛠️ Built With

- **[MapLibre GL JS](https://maplibre.org/)** – Open-source map rendering (raster tile sources)
- **[Bootstrap 5](https://getbootstrap.com/)** – Layout, components, and responsive UI
- **[bootstrap-llm-provider](https://www.npmjs.com/package/bootstrap-llm-provider)** – LLM API configuration dialog
- **[LZString](https://pieroxy.net/blog/pages/lz-string/index.html)** – Compress story JSON for shareable URLs
- **[Google Fonts](https://fonts.google.com/)** – Playfair Display, Source Sans Pro, Comic Neue

### Tile Providers

- [MapTiler](https://www.maptiler.com/) – Primary provider for high-performance Vector Tiles
- [ArcGIS / Esri](https://www.arcgis.com/) – Satellite imagery (Raster)
- [OpenStreetMap](https://www.openstreetmap.org/) – Map data source

## 📝 License

Conceptual prototype for geographic biographies.
