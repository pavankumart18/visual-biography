# Gandhi: A Geographic Biography 🗺️

An interactive scrollytelling map exploring the life and journey of Mahatma Gandhi across three continents. Designed in a **New York Times-style editorial layout** with **comic-style interactive elements**.

## ✨ Features

- **NYT-Style Editorial Layout**: A professional, long-form article structure with drop caps, elegant typography (Playfair Display), and editorial flow.
- **Interactive Scrollytelling**: A "chart that happens to be a map" embedded in the middle of the story. Scrolling through the story panel on the right dynamically pans and zooms the map on the left.
- **Comic-Style Visuals**: Interactive map popups and active story cards feature a playful comic aesthetic (Comic Neue font, yellow highlights, thick borders, and shadows).
- **Data-Driven Storytelling**: A dedicated section highlighting key statistics (years documented, locations, distance traveled).
- **Smooth Map Transitions**: Uses Leaflet.js `flyTo` for cinematic movement between historical locations.
- **Responsive Design**: Adapts for a premium reading experience on desktop.

## 🚀 Getting Started

### Prerequisites
You only need a web browser. The project uses standard web technologies (HTML/CSS/JS) and loads Leaflet.js via CDN.

### How to Run
1. Clone the repository or download the files.
2. Open `index.html` in any modern web browser.
3. For the best experience (to avoid local file security restrictions), run a simple local server:

```bash
# Using Python
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

## 📊 Data
The story data is managed within `index.html` but is based on the `data.csv` file included in the repository, covering 13 pivotal moments from 1869 (Porbandar) to 1948 (New Delhi).

## 🛠️ Built With
- **Leaflet.js**: For interactive mapping.
- **CartoDB Voyager**: For the clean, illustrated map tiles.
- **Google Fonts**:
  - *Playfair Display* (Editorial titles)
  - *Source Sans Pro* (Body text)
  - *Comic Neue* (Interactive elements)

## 📝 Author
Created as a conceptual prototype for a geographic biography.
