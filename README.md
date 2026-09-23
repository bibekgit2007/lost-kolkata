# 🏛️ LOST KOLKATA — The Archaeology of a Vanished City

> *"Beneath the Kolkata we know lies a city that time has almost erased. Can you bring it back?"*

An award-winning, immersive digital excavation web experience created for the Web Design & Development Competition. Blending **faded colonial grandeur** with **modern digital archaeology**, this project unearths the lost waterways, ghost tramlines, forgotten communities, and vanished architectural masterpieces of 18th–20th century Calcutta.

---

## 🌟 Key Interactive Features

### 1. ⏳ The 1826 ➔ 2026 Bicentennial Time Slider
- **Digital Archaeology HUD**: Telemetry stream displaying live coordinates (`22°34'N 88°21'E`), chronological scan indicators, and an animated laser scanning reticle.
- **Split-Screen Era Transition**: Peels back modern Kolkata's asphalt, yellow cabs, and commercial signs to uncover the gaslit cobblestones, horse trams, and neoclassical colonnades of 1826 colonial Calcutta.
- **Dynamic Chrono-Depth Computation**: Real-time readout computing years unearthed across the 200-year bicentennial span.

### 2. 🏛️ Rajbari Courtyard Before & After Slider
- **Architectural Etching vs. Modern Decay**: Contrasts an intact 19th-century black-and-white architectural ink sketch of a North Kolkata Rajbari courtyard against its 2026 moss-covered, banyan-strangled ruin.
- **Hardware-Accelerated CSS `clip-path`**: High-performance 60fps sliding without layout reflows.
- **Custom Vintage Key Handle**: Antique Victorian brass key handle supporting pointer drag events and accessible keyboard input.

### 3. 📜 The Five Vanished Realms (Curated Chronicles)
- **Realm I: The Vanished River (Adi Ganga & The Silted Ghats)** — The original sacred course of the Ganges, 108 terracotta shrines, and ancient pilgrim fleets.
- **Realm II: The Whispering Tracks (Ghost Trams of Chitpur)** — Asia's first tramway (1873) and the iron bells of Route 36.
- **Realm III: The Cosmopolitan Mosaic (Tiretti Chinatown & Synagogues)** — Early morning dim sum markets, Magen David Synagogue, and the Armenian Church of 1724.
- **Realm IV: The Battala Press & The Golden Adda** — 19th-century woodblock engravings, satirical broadsheets, and intellectual awakening.
- **Realm V: The Black Town & The Fallen Mansions** — Contrast between 19th-century Babu revelry and modern silent, weed-choked ruins.

### 4. 🗺️ The Cartography of Shadows (Interactive 1890 Map)
- High-resolution 1848 hand-drawn colonial cartographic map with pulsating radar survey pins.
- Clicking any pin reveals an archival **Historical Dossier** with coordinates, testimonials, and period acoustic cues.

### 5. 🎧 Audio Archaeology Engine (Native Web Audio API)
- 100% procedural Web Audio API synthesis (zero external audio files needed; zero 404s).
- **Monsoon & Twilight Drone**: Real-time rainfall on terracotta tiles and meditative harmonics.
- **Historical Soundboard**: Tram No. 36 bell (*ting-ting*), Hooghly steam foghorn, temple bronze chime, and Battala letterpress clack.

### 6. 🪷 "Bring It Back" — The Memory Vault
- Community archival postcards with vintage stamps, filterable by architecture, flavors, streets, and river sounds.
- Real-time submission drawer that persists new family oral histories to `localStorage`.

### 7. 📜 The Calcutta Archivist Quest & Certificate
- 4-stage historical inquiry testing knowledge of lost Calcutta relics.
- Generates a personalized, printable **Certificate of Heritage Stewardship** with unique registration codes and official seal.

---

## 🎨 Color Palette & Design Tokens

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Deep Charcoal** | `#0a0c10` / `#11141a` | Dark foundational surface evoking soot, night fog, and subterranean archives |
| **Crumbling Brick Red** | `#8B4513` | Terracotta rajbaris, crumbling brickwork, and excavation meters |
| **Tarnished Gold** | `#D4AF37` | Ornate brass framing, compass dials, radar pins, and glowing highlights |
| **Mist White** | `#eef2f7` / `#c5cdd8` | Hooghly river mist, luminous headers, and crisp modern typography |
| **Telemetry HUD Green** | `#38ef7d` | Coordinate readouts, scanner laser, and radar status indicators |

---

## 📁 Repository Structure

```text
LOST KOLKATA/
├── index.html                 # Semantic HTML5 entry point with full SEO & OpenGraph
├── README.md                  # Project overview and documentation
├── css/
│   └── style.css              # Design system, glassmorphism, responsive styles
├── js/
│   ├── app.js                 # Slider logic, map dossiers, memory vault, and quiz
│   └── audio-engine.js        # Native Web Audio API sound synthesis engine
├── components/
│   └── rajbari-slider.html    # Standalone Rajbari Before/After slider module
└── assets/
    └── images/                # High-resolution period-accurate visual assets
```

---

## 🚀 Local Preview

Simply open `index.html` in any modern web browser:
```powershell
Start-Process "index.html"
```
Or serve via any static server:
```bash
python -m http.server 3000
# or
npx serve
```

---

*Dedicated to the soul of Calcutta — a city that was never just bricks and mortar, but a living poem written in mist and tea smoke.*
