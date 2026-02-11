# Geographic Story Builder 🗺️

Create and explore interactive map-based biographies. Generate geographic stories with AI, view them in a scrollytelling map, and save your stories (with optional sign-in).

## ✨ Features

- **Explore stories** – Pre-made biographies (Gandhi, Einstein, Nelson Mandela, and more) with map, timeline, and narrative.
- **Generate your own** – Enter a person’s name or story outline; an AI produces a geographic biography in the same format.
- **Scrollytelling map** – Scroll through the story while the map pans and zooms to each location (Leaflet.js).
- **Save stories** – Sign in with Google to save stories to your account (Supabase). Unsaved drafts appear on the home page so you can save them later.
- **Editorial layout** – Drop caps, Playfair Display typography, and comic-style map popups.

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- (Optional) Node or Python for a local server
- (Optional) OpenAI-compatible API key for story generation
- (Optional) Supabase project for saving stories

### Run locally

1. Clone or download the repo.
2. Serve the folder (recommended, to avoid CORS):

   ```bash
   python -m http.server 8080
   ```

3. Open **http://localhost:8080** in your browser.

### Generate a story

1. On the home page, enter a name or short outline (e.g. *Marie Curie, physicist*) and click **Generate story**.
2. Configure the LLM if prompted (navbar → magic wand): set API base URL and key (e.g. OpenAI or OpenRouter).
3. After generation, you’re taken to the story view. Use **Save** to store it (requires sign-in).

### Save stories (Supabase)

1. **Configure Supabase** (one-time):
   - Create a project at [supabase.com](https://supabase.com).
   - In **Authentication → Providers**, enable **Google**.
   - In **Authentication → URL Configuration**, add your redirect URL (e.g. `http://localhost:8080/index.html`).
   - In **SQL Editor**, run the script in `supabase-stories-table.sql` to create the `stories` table and RLS.

2. **Add credentials** in `index-config.json`:

   ```json
   "supabase": {
     "url": "https://YOUR_PROJECT.supabase.co",
     "key": "YOUR_ANON_KEY"
   }
   ```

3. On the site, click **Log in** and sign in with Google. After that, **Save** on a story will store it under **Your generated stories**.

## 📁 Project structure

| Path | Description |
|------|-------------|
| `index.html` | Home: explore stories, your saved/draft stories, generate form |
| `index.js` | Home logic: config, cards, auth UI, saved/draft list, LLM generation |
| `stories.html` | Story view: scrollytelling map and narrative |
| `script.js` | Story view logic: load config, map, save to Supabase |
| `storage.js` | Supabase client: auth, list/save/get stories |
| `index-config.json` | App config: title, cards, defaults, Supabase url/key |
| `configs/*.json` | Pre-made story configs (Gandhi, Einstein, etc.) |
| `supabase-stories-table.sql` | SQL to create `public.stories` table and RLS |

## 🛠️ Built with

- **Leaflet.js** – Maps
- **Bootstrap 5** – Layout and UI
- **bootstrap-llm-provider** – LLM API configuration
- **Supabase** – Auth (Google) and storage for saved stories
- **Google Fonts** – Playfair Display, Source Sans Pro, Comic Neue

## 📝 License

Conceptual prototype for geographic biographies.
