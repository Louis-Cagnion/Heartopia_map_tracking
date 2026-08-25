# 🗺️ Interactive Collectibles Wiki

You can access to the website here : https://louis-cagnion.github.io/Heartopia_map_tracking/

An interactive map-based wiki for the game **Heartopia**, letting players locate collectibles and wildlife, track their progress, browse recipes, and (in admin mode) manage the underlying JSON databases directly from the browser.

## 📋 Table of Contents
- [Description](#description)
- [Overview](#overview)
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
- [AI Usage](#ai-usage)
- [Author](#author)

---

# 🗺️ Description <a id="description"></a>

This project is an interactive map-based wiki designed to help users explore, understand, and locate collectibles in **Heartopia**.

It acts as a structured companion tool for the game, transforming raw in-game data into a clear and navigable visual interface.

The goal is to centralize and organize a large amount of collectible-related information into a single, intuitive experience, allowing users to:
- visually explore the game world through an interactive map
- quickly identify collectible locations and categories
- filter and access data based on progression, type, and conditions
- track collected and uncollected items efficiently

Unlike a simple static wiki, this project focuses on **dynamic interaction with data**, including filtering systems, progression logic, and contextual display of information directly on the map.

It is built as a single-developer project with a strong focus on:
- clean and modular frontend architecture
- scalable JSON-based data structure
- maintainability and future extensibility
- user-friendly interface for both exploration and tracking

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

# 📁 Project Structure <a id="project-structure"></a>

```text
Heartopia/
├── css/                  # One stylesheet per feature area (map, filters, panels, admin, recipes...)
├── js/                   # One module per feature area (data, map, filters, admin-*, recipes-*...)
├── database/
│   ├── collectibles.json
│   ├── lieux.json
│   ├── poissons.json
│   ├── insectes.json
│   ├── oiseaux.json
│   ├── ingredients.json
│   ├── recettes.json
│   └── tutoriels/        # French-language written guides (basics + 100% completion)
├── tests/                # Vitest unit tests for pure/testable logic
├── map/
│   └── map.jpg
├── icone/
├── index.html
├── package.json
├── vitest.config.js
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
- Profit ranking, energy ranking, and cooking-mastery calculator sub-tabs
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
- Modular refactor of JS and CSS files, one file per responsibility, each kept under 750 lines
- Separation of concerns between UI / data / logic
- Dynamic filtering engine for map rendering
- Hierarchical zone aggregation logic
- Improved data structure for fauna, recipes, and collectibles
- Support for dynamic and non-static map entities
- Unit-tested pure logic (price calculations, name grouping, data registry) via Vitest

---

### 🧩 Important note <a id="important-note"></a>
- Project is currently still evolving with ongoing refactoring

---

# 🧰 Technical Stack <a id="technical-stack"></a>

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Python HTTP server (local development)
- Vitest (unit tests for pure logic, run with `npm test`)

---

# 🤖 AI Usage <a id="ai-usage"></a>

AI assistance (Claude Code) is used throughout this project's development: implementing features, refactoring and splitting large files, writing unit tests, fixing bugs found during code review, and drafting documentation. All AI-assisted changes are reviewed before being kept. Game data (collectibles, wildlife, recipes) is entered manually by the author through the admin panel.

---

# 👤 Author <a id="author"></a>

Created by **Louis-Cagnion**  
GitHub: https://github.com/Louis-Cagnion
