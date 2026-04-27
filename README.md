# 🗺️ Interactive Collectibles Wiki

## 📋 Table of Contents
- [Description](#description)
- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Features](#features)
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

# ▶️ Usage <a id="usage"></a>

Start a local server:

```bash
python -m http.server 8000
```

Then open in your browser:

http://localhost:8000

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

- Interactive map-based navigation
- Collectible markers and locations
- Category-based data browsing
- Search and filtering system (if implemented)
- Responsive interface
- Fully static and lightweight project

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
