/**
 * Geographic Story Builder – index page.
 * Loads config, renders 6 story cards (links to stories.html), and handles LLM story generation.
 */

import { openaiConfig } from "https://cdn.jsdelivr.net/npm/bootstrap-llm-provider@1.4.0/+esm";
import { parse } from "https://cdn.jsdelivr.net/npm/partial-json@0.1.7/+esm";

const $ = (sel, el = document) => el.querySelector(sel);
const STORAGE_KEY = "storyTellingGeneratedConfig";

/** Encode story config for URL hash (compressed). */
function encodeStoryForUrl(config) {
  if (typeof globalThis.LZString === "undefined") return null;
  try {
    return globalThis.LZString.compressToEncodedURIComponent(JSON.stringify(config));
  } catch {
    return null;
  }
}

/** Show a popup notification in the top-right. type: "success" | "warning" | "danger" */
function showNotification(message, type = "warning") {
  const container = $("#toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast-notification " + type;
  el.setAttribute("role", "alert");
  el.innerHTML = `<span class="toast-message">${message}</span><span class="toast-close" aria-label="Close">&times;</span>`;
  el.querySelector(".toast-close").addEventListener("click", () => el.remove());
  container.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 8000);
}

/** Extract and parse JSON from LLM response (handles markdown, extra text, truncation) */
function parseStoryConfig(raw) {
  if (!raw || typeof raw !== "string") return null;
  let str = raw.trim();

  // Strip markdown code blocks: ```json ... ``` or ``` ... ```
  const codeBlock = str.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) str = codeBlock[1].trim();

  // Find first { and last } to get the outermost JSON object
  const firstBrace = str.indexOf("{");
  if (firstBrace === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = firstBrace; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) end = str.length;
  str = str.slice(firstBrace, end + 1);

  // Try full parse first
  try {
    return JSON.parse(str);
  } catch (_) {}

  // Try partial-json for truncated output
  try {
    return parse(str);
  } catch (_) {}

  return null;
}

/** Ensure config has required fields and storyData items have lat/lng/zoom */
function normalizeStoryConfig(config) {
  if (!config || !Array.isArray(config.storyData) || config.storyData.length === 0) return null;
  const defaults = {
    meta: { title: "Geographic Story | The Story" },
    header: { logo: "The Geographic Story" },
    hero: { label: "A Visual Biography", title: "Story", subtitle: "", author: "Visual Stories Team", date: "2026" },
    articleIntro: { lead: "", dropCap: "", dropCapHighlight: "", paragraph: "" },
    dataSection: { title: "The Numbers Behind the Journey", cards: [{ value: "-", label: "Key Locations" }] },
    mapSection: { intro: "Scroll to follow the journey. The map updates as you move." },
    articleReturn: { title: "Legacy", paragraphs: [""] },
    timeline: { title: "Key Milestones", items: [] },
    footer: { lines: ["A scrollytelling experience.", "Built with Leaflet.js"] },
  };
  const out = { ...defaults, ...config };
  out.meta = { ...defaults.meta, ...(config.meta || {}) };
  out.hero = { ...defaults.hero, ...(config.hero || {}) };
  out.articleIntro = { ...defaults.articleIntro, ...(config.articleIntro || {}) };
  out.dataSection = { ...defaults.dataSection, ...(config.dataSection || {}) };
  out.mapSection = { ...defaults.mapSection, ...(config.mapSection || {}) };
  out.articleReturn = { ...defaults.articleReturn, ...(config.articleReturn || {}) };
  out.timeline = { ...defaults.timeline, ...(config.timeline || {}) };
  out.footer = { ...defaults.footer, ...(config.footer || {}) };
  out.storyData = (config.storyData || []).map((item, i) => ({
    year: item.year ?? 1900 + i,
    place: item.place ?? "Unknown",
    lat: typeof item.lat === "number" ? item.lat : 20,
    lng: typeof item.lng === "number" ? item.lng : 0,
    zoom: typeof item.zoom === "number" ? item.zoom : 11,
    text: item.text ?? "",
    detail: item.detail ?? "",
  }));
  return out;
}

// Load index config and render page
const indexConfig = await fetch("index-config.json").then((r) => r.json());

$("#pageTitle").textContent = indexConfig.title || "Geographic Story Builder";
$("#pageSubtitle").textContent = indexConfig.subtitle || "";
$("#narrative").textContent = indexConfig.narrative || "";
if (indexConfig.defaults && indexConfig.defaults.model) {
  const modelEl = $("#model");
  if (modelEl) modelEl.value = indexConfig.defaults.model;
}

// Render 6 cards as links to stories.html
const cardsContainer = $("#demo-cards");
cardsContainer.innerHTML = (indexConfig.cards || []).map(
  ({ icon, title, body, storyId }) => `
  <div class="col-md-4 col-lg-3">
    <a href="stories.html?story=${encodeURIComponent(storyId)}" class="text-decoration-none text-dark">
      <div class="card demo-card h-100 text-center">
        <div class="card-body d-flex flex-column">
          <div class="mb-3"><i class="display-4 text-primary ${icon}"></i></div>
          <h6 class="card-title h5 mb-2">${title}</h6>
          <p class="card-text small text-muted">${body}</p>
          <span class="mt-auto btn btn-outline-primary btn-sm">View story</span>
        </div>
      </div>
    </a>
  </div>`
).join("");

function getDraftConfig() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function renderSavedStories() {
  const container = $("#saved-stories");
  if (!container) return;
  const draft = getDraftConfig();
  if (draft) {
    const title = (draft.meta && draft.meta.title) ? draft.meta.title.replace(/\s*\|\s*The Story.*$/i, "").trim() : "Untitled story";
    const encoded = encodeStoryForUrl(draft);
    const href = encoded ? `stories.html#story=${encoded}` : "stories.html?generated=1";
    container.innerHTML = `
    <div class="col-md-4 col-lg-3">
      <a href="${href}" class="text-decoration-none text-dark">
        <div class="card demo-card h-100 text-center">
          <div class="card-body d-flex flex-column">
            <div class="mb-3"><i class="display-4 text-primary bi bi-link-45deg"></i></div>
            <h6 class="card-title h5 mb-2">${title}</h6>
            <p class="card-text small text-muted">Share or bookmark the link to keep it</p>
            <span class="mt-auto btn btn-outline-primary btn-sm">View story</span>
          </div>
        </div>
      </a>
    </div>`;
  } else {
    container.innerHTML = '<p class="text-muted">Generate a story below—the link will be shareable and you can bookmark it.</p>';
  }
}

renderSavedStories();

// Configure LLM button
$("#configure-llm").addEventListener("click", () => openaiConfig({ show: true }));

// Generate form: call LLM, get config-shaped JSON, save to sessionStorage, redirect to stories.html?generated=1
$("#generate-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("#storyInput").value.trim();
  if (!input) return;

  const outputEl = $("#output");
  const btn = $("#generateBtn");
  const btnText = btn.querySelector(".btn-text");
  const spinner = $("#generateSpinner");

  outputEl.innerHTML = "";
  btn.disabled = true;
  btnText.textContent = "Generating…";
  spinner.classList.remove("d-none");

  const prompt = `Generate a rich, descriptive geographic biography as ONE valid JSON object. Rules: (1) Reply with ONLY the JSON object. (2) Do NOT use markdown or \`\`\`json. (3) Start with { and end with }. (4) Double quotes for keys and strings. (5) Real numbers for year, lat, lng, zoom.

Person or topic: "${input}"

IMPORTANT – Be descriptive and detailed:
- hero.subtitle: 1–2 full sentences summarizing their journey and why it matters.
- articleIntro.lead: 3–4 sentences setting the scene and why this person's geography matters.
- articleIntro.dropCap: A full paragraph (4–5 sentences) starting with their birth/roots; vivid and narrative.
- articleIntro.dropCapHighlight: A short 3–5 word phrase from dropCap to highlight.
- articleIntro.paragraph: 2–3 sentences linking the map to the story.
- articleReturn.paragraphs: Two substantial paragraphs (3–4 sentences each) on their legacy and impact.
- timeline.items: 8–12 items; each event can be a short phrase (e.g. "Elected president; launches reform programme").
- storyData: 6–10 items. For EACH item: "text" = 2–3 sentences (what happened here, why it matters). "detail" = a full paragraph (4–6 sentences) with context, consequences, and vivid detail. Write like a biography, not a list.

PLACES – Use accurate, full place names:
- "place" must be "City, Country" (e.g. "London, United Kingdom", "New York, United States", "Mumbai, India"). For US cities you may use "City, State, United States" (e.g. "Palo Alto, California, United States"). Use the correct spelling and the country name, not abbreviations.
- Use the latitude and longitude table below for each location. If a city is not listed, look up and use precise decimal coordinates (lat and lng as numbers, e.g. 51.5074 and -0.1278). Every storyData entry MUST have exact numeric "lat" and "lng"; do not omit or approximate vaguely.

LATITUDE & LONGITUDE – Use these exact values (lat, lng) for these places:
London, United Kingdom: lat 51.5074, lng -0.1278
Paris, France: lat 48.8566, lng 2.3522
New York, United States: lat 40.7128, lng -74.0060
Los Angeles, United States: lat 34.0522, lng -118.2437
San Francisco, United States: lat 37.7749, lng -122.4194
Palo Alto, United States: lat 37.4419, lng -122.1430
Seattle, United States: lat 47.6062, lng -122.3321
Boston, United States: lat 42.3601, lng -71.0589
Washington, D.C., United States: lat 38.9072, lng -77.0369
Chicago, United States: lat 41.8781, lng -87.6298
Berlin, Germany: lat 52.5200, lng 13.4050
Munich, Germany: lat 48.1351, lng 11.5820
Zurich, Switzerland: lat 47.3769, lng 8.5417
Moscow, Russia: lat 55.7558, lng 37.6173
Tokyo, Japan: lat 35.6762, lng 139.6503
Kyoto, Japan: lat 35.0116, lng 135.7681
Delhi, India: lat 28.7041, lng 77.1025
Mumbai, India: lat 19.0760, lng 72.8777
Hyderabad, India: lat 17.3850, lng 78.4867
Chennai, India: lat 13.0827, lng 80.2707
Kolkata, India: lat 22.5726, lng 88.3639
Ahmedabad, India: lat 23.0225, lng 72.5714
Johannesburg, South Africa: lat -26.2041, lng 28.0473
Cape Town, South Africa: lat -33.9249, lng 18.4241
Cairo, Egypt: lat 30.0444, lng 31.2357
Nairobi, Kenya: lat -1.2921, lng 36.8219
Oxford, United Kingdom: lat 51.7520, lng -1.2577
Cambridge, United Kingdom: lat 52.2053, lng 0.1218
Pretoria, South Africa: lat -25.7479, lng 28.2293
Robben Island, South Africa: lat -33.8066, lng 18.3662
Princeton, United States: lat 40.3573, lng -74.6672
Vienna, Austria: lat 48.2082, lng 16.3738
Rome, Italy: lat 41.9028, lng 12.4964
Beijing, China: lat 39.9042, lng 116.4074
For any other city: use precise decimal lat/lng (negative lat = Southern hemisphere; negative lng = West). Order storyData by year ascending.

JSON shape (use this structure; fill with rich content and exact place names + lat/lng):
{"meta":{"title":"Full Name – A Geographic Biography | The Story"},"header":{"logo":"The Geographic Story"},"hero":{"label":"A Visual Biography","title":"The Journey of [Name]","subtitle":"One or two sentences.","author":"Visual Stories Team","date":"2026"},"articleIntro":{"lead":"Three to four sentences.","dropCap":"Full paragraph.","dropCapHighlight":"phrase","paragraph":"Two to three sentences."},"dataSection":{"title":"The Numbers Behind the Journey","cards":[{"value":"XX","label":"Years of Life"},{"value":"X","label":"Key Locations"},{"value":"X","label":"Continents"},{"value":"X","label":"Years Abroad"}]},"mapSection":{"intro":"Scroll to follow the journey."},"articleReturn":{"title":"Legacy","paragraphs":["First full paragraph.","Second full paragraph."]},"timeline":{"title":"Key Milestones","items":[{"year":"YYYY","event":"Event"},{"year":"YYYY","event":"Event"}]},"footer":{"lines":["A scrollytelling experience.","Built with Leaflet.js"]},"storyData":[{"year":1900,"place":"City, Country","lat":48.8566,"lng":2.3522,"zoom":11,"text":"Two to three sentences.","detail":"Full paragraph with context and impact."}]}

Reply with ONLY the JSON object.`;

  try {
    const { baseUrl, apiKey } = await openaiConfig({
      defaultBaseUrls: [
        "https://api.openai.com/v1",
        "https://openrouter.ai/api/v1",
      ],
    });

    // Use non-streaming so we get the full JSON in one response (avoids truncation and parse errors)
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: $("#model").value || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(res.status + " " + res.statusText + (errBody ? ": " + errBody.slice(0, 200) : ""));
    }
    const data = await res.json();
    let fullContent = "";
    const msg = data.choices?.[0]?.message ?? data.choices?.[0];
    if (msg) {
      fullContent = typeof msg.content === "string" ? msg.content : msg.text ?? "";
      if (Array.isArray(msg.content)) fullContent = (msg.content.find((p) => p.type === "text")?.text ?? msg.content[0]?.text ?? "") || fullContent;
    }
    if (!fullContent && typeof data.content === "string") fullContent = data.content;
    if (!fullContent && data.result) fullContent = typeof data.result === "string" ? data.result : data.result?.content ?? "";

    let config = parseStoryConfig(fullContent);
    config = config ? normalizeStoryConfig(config) : null;
    if (config && config.storyData && config.storyData.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      const encoded = encodeStoryForUrl(config);
      const target = encoded ? `stories.html#story=${encoded}` : "stories.html?generated=1";
      showNotification("Story generated! Opening…", "success");
      setTimeout(() => { window.location.href = target; }, 600);
      return;
    }

    showNotification("Could not read story from the AI response. Try a full name (e.g. Marie Curie) or try again.", "warning");
    outputEl.innerHTML = "";
  } catch (err) {
    console.error(err);
    showNotification("Error: " + err.message + " Make sure the LLM is configured (click the magic wand in the navbar).", "danger");
    outputEl.innerHTML = "";
  } finally {
    btn.disabled = false;
    btnText.textContent = "Generate story";
    spinner.classList.add("d-none");
  }
});

