# 🗺️ Interactive Collectibles Wiki

You can access to the website here : https://louis-cagnion.github.io/Heartopia_map_tracking/

## 📋 Table of Contents
- [Description](#description)
- [Overview](#overview)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Core system](#core-system)
  - [User features](#user-features)
  - [Localization & progression system](#localization--progression-system)
  - [Admin panel](#admin-panel)
  - [Recipes system](#recipes-system)
  - [Data & UI improvements](#data--ui-improvements)
  - [Technical improvements](#technical-improvements)
  - [Important note](#important-note)
- [Technical Stack](#technical-stack)
- [Author](#author)

---

# 🗺️ Description <a id="description"></a>

This project is an interactive map-based wiki designed to help users explore and locate collectibles in **Heartopia**.

It provides a visual map interface where users can navigate through points of interest and access structured information about different collectible categories.

---

# 👀 Overview <a id="overview"></a>

This is a single-developer project focused on building a lightweight interactive web application based on a map-driven interface.

It focuses on:
- Interactive map navigation
- Collectible discovery
- Structured data visualization
- Category-based exploration
- Clean and modular frontend architecture

---

# 🛠️ Installation <a id="installation"></a>

## Prerequisites

- Python 3.x

No external dependencies are required.

---

## Clone the repository

```bash
git clone https://github.com/Louis-Cagnion/heartopia.git
cd heartopia
```

---

# 📁 Project Structure <a id="project-structure"></a>

```text
Heartopia/
├── database/
│   ├── collectibles.json
│   ├── lieux.json
│   ├── poissons.json
│   ├── insectes.json
│   └── oiseaux.json
│
├── map/
│   └── map.jpg
│
├── index.html
├── script.js
├── style.css
└── README.md
```

---

# ✨ Features <a id="features"></a>

### 🗺️  system <a id="core-system"></a>
- Interactive map-based navigation
- Collectible markers and location system
- Zone-based exploration (global zones + sub-zones hierarchy)
- Dynamic panel system (open/close UI panels)
- Category-based browsing of collectibles
- Search and filtering system
- Fully static lightweight web application

---

### 👤 User features <a id="user-features"></a>
- Collectible tracking system (progress-based)
- Fauna database (fish, birds, insects up to level 10)
- Organized progression by unlock level
- Bulk selection per level (select all items in a tier)
- Toggle display of collected fauna on the map
- Toggle display of locked/unlocked items (grayed-out system)
- Hobby level filtering system (dynamic content filtering)
- Interactive map zones selection with dynamic updates
- Dedicated “special items” panel for non-fixed collectibles (mobile objects, movable entities, spawn-based items)

---

### 🌍 Localization & progression system <a id="localization--progression-system"></a>
- Multi-language support (FR / EN, partially implemented)
- Dynamic UI translation system
- Server system with time-zone dependent logic
- Weather-based filtering system
- Time-based filtering system (hours & time ranges)
- Advanced weather conditions filtering (exact or minimum conditions)

---

### 🛠️ Admin panel <a id="admin-panel"></a>
- Fully redesigned admin interface
- Separate admin and user environments
- CRUD system for all data (create / update / delete)
- Import / export system for JSON databases
- Automatic detection of database files (based on filename)
- Map used only for precise positioning of collectibles
- Interactive placement system (drag & drop positioning)
- Support for movable collectible positions

---

### 🍳 Recipes system <a id="recipes-system"></a>
- Recipe creation / editing / deletion system
- Recipes composed of 2 to 4 ingredients
- Ingredient filtering system
- Multi-selection support (Ctrl + click / Shift + click)
- Dedicated databases for:
  - ingredients
  - recipes
- Recipe system foundation prepared for future gameplay features

---

### 📊 Data & UI improvements <a id="data--ui-improvements"></a>
- Structured JSON-based database system
- Automatic loading of datasets on first connection
- Alphabetical and type-based sorting of collectibles
- Improved UI consistency and layout system
- Improved handling of non-unlocked elements
- Responsive interface (mobile + desktop)
- Pinch zoom support on mobile
- Swipe navigation between tabs (mobile)
- Keyboard navigation support (desktop arrows / buttons)

---

### 🧠 Technical improvements <a id="technical-improvements"></a>
- Modular refactor of JS and CSS files (partial but improved architecture)
- Separation of concerns between UI / data / logic
- Dynamic filtering engine for map rendering
- Hierarchical zone aggregation logic
- Improved data structure for fauna, recipes, and collectibles
- Support for dynamic and non-static map entities

---

### 🧩 Important note <a id="important-note"></a>
- Project is currently still evolving with ongoing refactoring

---

# 🧰 Technical Stack <a id="technical-stack"></a>

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Python HTTP server (local development)

---

# 👤 Author <a id="author"></a>

Created by **Louis-Cagnion**  
GitHub: https://github.com/Louis-Cagnion
