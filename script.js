let places = JSON.parse(localStorage.getItem("places")) || [];
let selectedPlace = null;
let draggingPlace = null;
let mode = "user";
let zoom = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let langue = "fr";
const traductionsHeures = {
    "matin": "dawn",
    "après-midi": "day",
    "soir": "dusk",
    "nuit": "night"
};

const traductionsMeteos = {
    "soleil": "sunny",
    "pluie": "rainy",
    "arc-en-ciel": "rainbow"
};

const generiquesEN = {
    "Lacs": "Lakes",
    "Rivières": "Rivers",
    "Mers": "Seas",
    "Foyer": "Home",
    "Bord de l'eau": "Waterside",
    "Au sommet de la tête de Blanc": "At the Top of Blanc's Head",
    "Attracteur d'insectes": "Insect Lure"
};

const UI = {
    fr: {
        modeUser: "👀 Mode utilisateur",
        modeAdmin: "🔐 Mode admin",
        niveauPassion: "Niveau de passion",
        peche: "🐟 Pêche",
        observation: "🪶 Observation des oiseaux",
        attrapage: "🐛 Attrapage d'insectes",
        afficherNonDebloques: "Afficher non débloqués",
        aucunLieu: "Aucun lieu sélectionné",
        speciaux: "⭐ Spéciaux",
        panelSpeciaux: "⭐ Éléments spéciaux",
        aucunElement: "Aucun élément répertorié",
        filtrePoissons: "Poissons",
        filtreOiseaux: "Oiseaux",
        filtreInsectes: "Insectes",
        filtreCollectibles: "Collectibles",
        legendeTitre: "🍄 Collectibles"
    },
    en: {
        modeUser: "👀 User mode",
        modeAdmin: "🔐 Admin mode",
        niveauPassion: "Hobby level",
        peche: "🐟 Fishing",
        observation: "🪶 Birdwatching",
        attrapage: "🐛 Insect catching",
        afficherNonDebloques: "Show locked",
        aucunLieu: "No location selected",
        speciaux: "⭐ Specials",
        panelSpeciaux: "⭐ Special elements",
        aucunElement: "No elements found",
        filtrePoissons: "Fish",
        filtreOiseaux: "Birds",
        filtreInsectes: "Insects",
        filtreCollectibles: "Collectibles",
        legendeTitre: "🍄 Collectibles"
    }
};

function t(key) {
    return UI[langue][key] || key;
}

const inner = document.getElementById("map-inner");
const container = document.getElementById("map-container");
container.classList.add("add-mode");

// =========================
// 🐟 ELEMENTS
// =========================

let poissons = JSON.parse(localStorage.getItem("poissons")) || [];
let insectes = JSON.parse(localStorage.getItem("insectes")) || [];
let oiseaux = JSON.parse(localStorage.getItem("oiseaux")) || [];
let collectibles = JSON.parse(localStorage.getItem("collectibles")) || [];

let collectiblePlacementMode = false;
let currentCollectible = null;
const lieuxGeneriques = ["Lacs", "Rivières", "Mers", "Foyer", "Bord de l'eau", "Au sommet de la tête de Blanc", "Attracteur d'insectes"];
let draggingCollectible = null;
let suppressionCollectibleMode = false;

// =========================
// 🔐 MODE MANAGEMENT
// =========================

function setMode(newMode) {
    if (newMode === "admin") {
        const pass = prompt("Mot de passe admin ?");
        if (pass !== "admin") {
            alert("Mot de passe incorrect");
            return;
        }
        mode = "admin";
        document.getElementById("adminPanel").classList.remove("hidden");
        document.getElementById("hobbyPanel").classList.add("hidden");
        document.getElementById("btnLangue").style.marginBottom = "0";
        container.classList.add("editor-mode");
        container.style.cursor = "crosshair";
        selectedPlace = null;
        document.getElementById("placeTitle").textContent = langue === "fr" ? "Aucun lieu sélectionné" : "No location selected";
        document.getElementById("elementsPanel").classList.add("hidden");
        document.getElementById("btnSpeciaux").classList.add("hidden");
        updateModeButtons();
        return;
    }
    mode = "user";
    document.getElementById("adminPanel").classList.add("hidden");
    document.getElementById("hobbyPanel").classList.remove("hidden");
    document.getElementById("btnLangue").style.marginBottom = "";
    container.classList.remove("editor-mode");
    container.style.cursor = "default";
    selectedPlace = null;
    document.getElementById("placeTitle").textContent = langue === "fr" ? "Aucun lieu sélectionné" : "No location selected";
    document.getElementById("elementsPanel").classList.add("hidden");
    document.getElementById("btnSpeciaux").classList.add("hidden");
    updateModeButtons();
    mettreAJourUI();
}

function updateModeButtons() {
    const btnUser = document.getElementById("btnUser");
    const btnAdmin = document.getElementById("btnAdmin");
    btnUser.disabled = mode === "user";
    btnAdmin.disabled = mode === "admin";
}

// =========================
// 💾 SAVE
// =========================

function savePlaces() {
    localStorage.setItem("places", JSON.stringify(places));
}

// =========================
// Heures
// =========================

function traduireHeure(h) {
    return langue === "fr" ? h : (traductionsHeures[h] || h);
}

function traduireMeteo(m) {
    return langue === "fr" ? m : (traductionsMeteos[m] || m);
}

// =========================
// 🌍 LANGUE
// =========================

function toggleLangue() {
    langue = langue === "fr" ? "en" : "fr";
    document.getElementById("btnLangue").textContent = langue === "fr" ? "🇫🇷 FR" : "🇬🇧 EN";
    mettreAJourUI();
    rafraichirAffichage();
}

function mettreAJourUI() {
    document.getElementById("btnUser").textContent = t("modeUser");
    document.getElementById("btnAdmin").textContent = t("modeAdmin");
    document.getElementById("labelNiveauPassion").textContent = t("niveauPassion");
    document.getElementById("labelPeche").textContent = t("peche");
    document.getElementById("labelObservation").textContent = t("observation");
    document.getElementById("labelAttrapage").textContent = t("attrapage");
    document.getElementById("labelAfficherNonDebloques").textContent = t("afficherNonDebloques");
    document.getElementById("btnSpeciaux").textContent = t("speciaux");
    document.getElementById("panelSpeciauxTitre").textContent = t("panelSpeciaux");
    document.getElementById("legendeCollectiblesTitre").textContent = t("legendeTitre");
    document.getElementById("labelFiltrePoissons").textContent = t("filtrePoissons");
    document.getElementById("labelFiltreOiseaux").textContent = t("filtreOiseaux");
    document.getElementById("labelFiltreInsectes").textContent = t("filtreInsectes");
    document.getElementById("labelFiltreCollectibles").textContent = t("filtreCollectibles");
    document.getElementById("titrePage").textContent = langue === "fr" ? "🗺️ Carte Heartopia" : "🗺️ Heartopia Map";
    if (!selectedPlace) {
        document.getElementById("placeTitle").textContent = t("aucunLieu");
    }
}

function getNomLieu(nomFr) {
    if (langue === "fr") return nomFr;
    const place = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === nomFr);
    if (place && Array.isArray(place.name)) return place.name[1];
    return generiquesEN[nomFr] || nomFr;
}

function getNom(element) {
    if (!element || !element.name) return "";
    if (Array.isArray(element.name)) {
        return langue === "fr" ? element.name[0] : element.name[1];
    }
    return element.name;
}

function getLieu(element) {
    if (!element || !element.lieu) return "";
    if (Array.isArray(element.lieu)) {
        return langue === "fr" ? element.lieu[0] : element.lieu[1];
    }
    return element.lieu;
}

function rafraichirAffichage() {
    // Mettre à jour les labels sur la carte
    document.querySelectorAll(".place-marker").forEach(el => {
        const name = el.dataset.name;
        const place = places.find(p => Array.isArray(p.name) ? p.name[0] === name : p.name === name);
        if (place) {
            const label = el.querySelector(".place-label");
            if (label) label.textContent = formatPlaceName(getNom(place));
        }
    });

    // Mettre à jour la légende collectibles
    afficherLegende();

    // Mettre à jour le panneau info si un lieu est sélectionné
    if (selectedPlace) {
        const place = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === selectedPlace);
        const title = document.getElementById("placeTitle");
        if (title && place) title.textContent = getNom(place);
        afficherElementsLieu(selectedPlace);
    }

    // Mettre à jour le panneau spéciaux si ouvert
    const panelSpeciaux = document.getElementById("panelSpeciaux");
    if (!panelSpeciaux.classList.contains("hidden")) {
        toggleSpeciaux();
        toggleSpeciaux();
    }
}

// =========================
// 🗺️ ZONES ET SOUS-ZONES
// =========================

const zoneParent = {
    "Village de pêcheurs": ["Phare", "Quai", "Événement : pêche en mer", "Événement : retour des oiseaux au nid", "Place du village de pêcheurs", "Quai oriental du village de pêcheurs"],
    "Forêt": ["Tour du faon", "Île de la forêt", "Lac de la forêt", "Forêt de chênes spirituels", "Tremplin"],
    "Champ de fleurs": ["Montagne de baleine", "Lac de la prairie", "Champs de fleurs des moulins à vent", "Plage violette"],
    "Montagne thermale": ["Ruines", "Lac de la montagne thermale", "Lac volcanique", "Événement : attirer les insectes hors de leur trou", "Source thermale", "Falaise rocheuse"],
    "Banlieue": ["Lac de banlieue"]
};

const lieuxAquatiquesDoux = ["lac", "rivière", "riviere", "fleuve"];
const lieuxAquatiquesMers = ["mer"];

const lieuxSpeciaux = ["Foyer", "Au sommet de la tête de Blanc", "Attracteur d'insectes"];

function estAquatiqueDoux(nomLieu) {
    return lieuxAquatiquesDoux.some(mot => new RegExp(`\\b${mot}`, "i").test(nomLieu));
}

function estMer(nomLieu) {
    return lieuxAquatiquesMers.some(mot => new RegExp(`\\b${mot}`, "i").test(nomLieu));
}

function getLieuxPourRecherche(nomLieu) {
    const lieuxARechercher = new Set([nomLieu]);
    const nom = nomLieu.toLowerCase();

    if (nom.includes("lac")) {
        lieuxARechercher.add("Lacs");
        lieuxARechercher.add("Bord de l'eau");
    }
    if (nom.includes("rivière") || nom.includes("riviere") || nom.includes("fleuve")) {
        lieuxARechercher.add("Rivières");
        lieuxARechercher.add("Bord de l'eau");
    }
    if (new RegExp(`\\bmer\\b`, "i").test(nomLieu)) {
        lieuxARechercher.add("Mers");
    }

    return lieuxARechercher;
}

function getElementsPourLieu(nomLieu) {
    const estZoneNiv1 = zoneParent.hasOwnProperty(nomLieu);
    const sousZones = estZoneNiv1 ? zoneParent[nomLieu] : [];

    const tousLesLieux = new Set(getLieuxPourRecherche(nomLieu));
    sousZones.forEach(sz => getLieuxPourRecherche(sz).forEach(l => tousLesLieux.add(l)));

    const tous = [...poissons, ...insectes, ...oiseaux];
    const resultats = {};

    tous.forEach(el => {
        const lieuFr = Array.isArray(el.lieu) ? el.lieu[0] : el.lieu;
        if (tousLesLieux.has(lieuFr)) {
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            if (!resultats[lieuFr]) resultats[lieuFr] = [];
            resultats[lieuFr].push(nameFr);
        }
    });

    return { estZoneNiv1, sousZones, resultats };
}

// =========================
// 🗺️ ADD PLACE (ADMIN ONLY)
// =========================

function createCollectibleMarker(x, y, type, collectibleName, spawnIndex, color = "#e67e22") {
    const el = document.createElement("div");
    el.className = "marker collectible-marker";
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.background = color;
    el.dataset.type = type;
    el.dataset.collectibleName = collectibleName;
    el.dataset.spawnIndex = spawnIndex;

    el.onmousedown = function(e) {
        if (mode !== "admin") return;
        draggingCollectible = el;
        e.preventDefault();
        e.stopPropagation();
    };
    el.onclick = function(e) {
    if (mode !== "admin") return;
    if (!suppressionCollectibleMode) return;
    e.stopPropagation();

    if (!confirm("Supprimer cette position ?")) return;

    const name = el.dataset.collectibleName;
    const idx = parseInt(el.dataset.spawnIndex);

    const collectible = collectibles.find(c => c.name === name);
        if (collectible) {
            collectible.spawns.splice(idx, 1);

            // Mettre à jour les indices des marqueurs suivants
            document.querySelectorAll(".collectible-marker").forEach(m => {
                if (m.dataset.collectibleName === name) {
                    const mIdx = parseInt(m.dataset.spawnIndex);
                    if (mIdx > idx) {
                        m.dataset.spawnIndex = mIdx - 1;
                    }
                }
            });

            localStorage.setItem("collectibles", JSON.stringify(collectibles));
            afficherLegende();
        }

        el.remove();
    };

    inner.appendChild(el);
}

container.addEventListener("click", function(e) {
    if (collectiblePlacementMode) {
        const rect = container.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left - panX) / (container.offsetWidth * zoom)) * 10000) / 100;
        const y = Math.round(((e.clientY - rect.top - panY) / (container.offsetHeight * zoom)) * 10000) / 100;
        currentCollectible.spawns.push({ x, y });
        localStorage.setItem("collectibles", JSON.stringify(collectibles));
        const spawnIndex = currentCollectible.spawns.length - 1;
        createCollectibleMarker(x, y, currentCollectible.type, currentCollectible.name, spawnIndex, currentCollectible.color || "#e67e22");
        return;
    }

    if (mode !== "admin") return;
    if (e.target.classList.contains("marker")) return;

    const name = prompt("Nom du lieu ?");
    if (!name) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left - panX) / (rect.width * zoom)) * 100;
    const y = ((e.clientY - rect.top - panY) / (rect.height * zoom)) * 100;

    const levelStr = prompt("Niveau (1 ou 2) ?");
    const level = parseInt(levelStr) === 2 ? 2 : 1;

    const place = { name, x, y, level };
    places.push(place);
    savePlaces();
    createPlaceMarker(name, x, y, level);
});

// =========================
// 🧲 DRAG (ADMIN ONLY)
// =========================

document.addEventListener("mousemove", function(e) {
    const rect = container.getBoundingClientRect();

    if (draggingPlace && mode === "admin") {
        let x = ((e.clientX - rect.left - panX) / (rect.width * zoom)) * 100;
        let y = ((e.clientY - rect.top - panY) / (rect.height * zoom)) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        draggingPlace.style.left = x + "%";
        draggingPlace.style.top = y + "%";
    }

    if (draggingCollectible && mode === "admin") {
        let x = ((e.clientX - rect.left - panX) / (rect.width * zoom)) * 100;
        let y = ((e.clientY - rect.top - panY) / (rect.height * zoom)) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        draggingCollectible.style.left = x + "%";
        draggingCollectible.style.top = y + "%";
    }
});

// =========================
// 🧲 STOP DRAG + SAVE
// =========================

document.addEventListener("mouseup", function() {
    if (draggingPlace && mode === "admin") {
        const name = draggingPlace.dataset.name;
        const x = parseFloat(draggingPlace.style.left);
        const y = parseFloat(draggingPlace.style.top);
        const place = places.find(p => p.name === name);
        if (place) {
            place.x = x;
            place.y = y;
            savePlaces();
        }
        draggingPlace = null;
    }

    if (draggingCollectible && mode === "admin") {
        const name = draggingCollectible.dataset.collectibleName;
        const idx = parseInt(draggingCollectible.dataset.spawnIndex);
        const x = Math.round(parseFloat(draggingCollectible.style.left) * 100) / 100;
        const y = Math.round(parseFloat(draggingCollectible.style.top) * 100) / 100;
        const collectible = collectibles.find(c => c.name === name);
        if (collectible) {
            collectible.spawns[idx] = { x, y };
            localStorage.setItem("collectibles", JSON.stringify(collectibles));
        }
        draggingCollectible = null;
    }

    if (isPanning) {
        isPanning = false;
        inner.classList.remove("grabbing");
        repositionLabels();
        clampLabels();
    }
});

// =========================
// 📍 CREATE MARKER
// =========================

function createPlaceMarker(name, x, y, level = 1) {
    const el = document.createElement("div");
    el.className = "marker place-marker";
    el.style.background = "white";
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.dataset.name = name;
    el.dataset.level = level;

    const label = document.createElement("div");
    label.className = "place-label";
    label.textContent = formatPlaceName(Array.isArray(name) ? name[0] : name);
    el.appendChild(label);

    label.ondblclick = function(e) {
        if (mode !== "admin") return;
        e.stopPropagation();

        const newName = prompt("Nouveau nom ?", name);
        if (!newName || newName === name) return;

        label.textContent = formatPlaceName(newName);
        el.dataset.name = newName;

        const place = places.find(p => p.name === name);
        if (place) {
            place.name = newName;
            name = newName;
            savePlaces();
        }
        setTimeout(() => { repositionLabels(); clampLabels(); }, 50);
    };

    el.onclick = function(e) {
        e.stopPropagation();
        selectedPlace = name;
        const title = document.getElementById("placeTitle");
        if (title) {
            const place = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === name);
            title.textContent = place ? getNom(place) : name;
        }
        const elementsPanel = document.getElementById("elementsPanel");
        elementsPanel.classList.remove("hidden");
        afficherElementsLieu(name);
        document.getElementById("btnSpeciaux").classList.remove("hidden");
    };

    el.onmousedown = function(e) {
        if (mode === "admin") {
            draggingPlace = el;
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
    };

    el.oncontextmenu = function(e) {
        if (mode !== "admin") return;
        e.preventDefault();
        if (!confirm("Supprimer ce lieu ?")) return;
        places = places.filter(p => p.name !== name);
        savePlaces();
        el.remove();
        if (selectedPlace === name) {
            selectedPlace = null;
            const title = document.getElementById("placeTitle");
            if (title) title.textContent = "";
        }
    };

    inner.appendChild(el);
}

// =========================
// 🔄 LOAD MAP
// =========================

places.forEach(p => {
    const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
    const exists = [...document.querySelectorAll(".place-marker")]
        .some(el => el.dataset.name === nameFr);
    if (!exists) {
        createPlaceMarker(nameFr, p.x, p.y, p.level || 1);
    }
});
collectibles.forEach(c => {
    c.spawns.forEach((s, i) => {
        createCollectibleMarker(s.x, s.y, c.type, c.name, i, c.color || "#e67e22");
    });
});
setTimeout(() => { 
    applyTransform(); 
    updateMarkerVisibility(); 
    repositionLabels(); 
    clampLabels(); 
    afficherLegende();
    mettreAJourUI();
}, 100);

// =========================
// 📤 EXPORT LIEUX
// =========================

function exportPlacesToJSON() {
    if (mode !== "admin") return;
    const cleaned = places.map(p => ({
        name: p.name,
        x: Math.round(p.x),
        y: Math.round(p.y),
        level: p.level || 1
    }));
    const blob = new Blob([JSON.stringify(cleaned, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lieux.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// =========================
// 📥 IMPORT LIEUX
// =========================

function importPlacesFromJSON(event) {
    if (mode !== "admin") return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        places = JSON.parse(e.target.result);
        savePlaces();
        document.querySelectorAll(".place-marker").forEach(el => el.remove());
        places.forEach(p => {
            const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
            createPlaceMarker(nameFr, p.x, p.y, p.level || 1);
        });
    };
    reader.readAsText(file);
}

function triggerImport() {
    if (mode !== "admin") return;
    document.getElementById("importFile").click();
}

// =========================
// 🔤 FORMAT
// =========================

function formatPlaceName(name) {
    if (Array.isArray(name)) name = name[0];
    const max = 19;
    const words = name.split(" ");
    let lines = [];
    let line = "";
    for (let w of words) {
        const test = line ? line + " " + w : w;
        if (test.length > max) {
            lines.push(line);
            line = w;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines.join("\n");
}

// =========================
// 🏷️ LABELS
// =========================

function repositionLabels() {
    const labels = [...document.querySelectorAll(".place-label")];
    labels.forEach(l => {
        l.style.transform = "translateX(-50%)";
        l.style.left = "50%";
    });
    labels.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    for (let i = 1; i < labels.length; i++) {
        const prev = labels[i - 1].getBoundingClientRect();
        const curr = labels[i].getBoundingClientRect();
        const overlap =
            prev.left < curr.right &&
            prev.right > curr.left &&
            prev.bottom > curr.top;
        if (overlap) {
            const shift = prev.bottom - curr.top + 8;
            const current = parseFloat(labels[i].style.transform.match(/translateY\((.+)px\)/)?.[1]) || 0;
            labels[i].style.transform = `translateX(-50%) translateY(${current - shift}px)`;
        }
    }
}

function clampLabels() {
    const containerRect = inner.getBoundingClientRect();
    const labels = [...document.querySelectorAll(".place-label")];
    labels.forEach(l => {
        const rect = l.getBoundingClientRect();
        if (rect.left < containerRect.left) {
            const overflow = containerRect.left - rect.left;
            l.style.left = `calc(50% + ${overflow}px)`;
        }
        if (rect.right > containerRect.right) {
            const overflow = rect.right - containerRect.right;
            l.style.left = `calc(50% - ${overflow}px)`;
        }
    });
}

// =========================
// 🔍 ZOOM + PAN
// =========================

function applyTransform() {
    const minPanX = -(900 * zoom - 900);
    const minPanY = -(908 * zoom - 908);
    panX = Math.min(0, Math.max(panX, minPanX));
    panY = Math.min(0, Math.max(panY, minPanY));
    inner.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;

    const fontSize = 22 / zoom;
    const markerSize = Math.max(6, 16 / zoom);
    const borderSize = Math.max(1, 2 / zoom);

    document.querySelectorAll(".place-label").forEach(l => {
        l.style.fontSize = fontSize + "px";
    });
    document.querySelectorAll(".place-marker").forEach(el => {
        el.style.width = markerSize + "px";
        el.style.height = markerSize + "px";
        el.style.borderRadius = "50%";
        el.style.border = `${borderSize}px solid black`;
        el.style.boxShadow = "none";
    });

    const collectibleSize = Math.max(4, 8 / zoom);
    const collectibleBorder = Math.max(0.5, 1 / zoom);

    document.querySelectorAll(".collectible-marker").forEach(el => {
        el.style.width = collectibleSize + "px";
        el.style.height = collectibleSize + "px";
        el.style.borderRadius = "50%";
        el.style.border = `${collectibleBorder}px solid black`;
    });
}

container.addEventListener("wheel", function(e) {
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 1), 5);
    panX = mouseX - (mouseX - panX) * (newZoom / zoom);
    panY = mouseY - (mouseY - panY) * (newZoom / zoom);
    zoom = newZoom;
    applyTransform();
    updateMarkerVisibility();
    setTimeout(() => { repositionLabels(); clampLabels(); }, 50);
}, { passive: false });

container.addEventListener("mousedown", function(e) {
    if (e.button !== 2) return;
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    inner.classList.add("grabbing");
    e.preventDefault();
});

container.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    if (collectiblePlacementMode) {
        collectiblePlacementMode = false;
        currentCollectible = null;
        container.style.cursor = "default";
    }
});

document.addEventListener("mousemove", function(e) {
    if (!isPanning) return;
    panX = e.clientX - panStartX;
    panY = e.clientY - panStartY;
    applyTransform();
});

function updateMarkerVisibility() {
    document.querySelectorAll(".place-marker").forEach(el => {
        const level = parseInt(el.dataset.level) || 1;
        if (level === 2 && zoom < 2) {
            el.style.display = "none";
        } else if (level === 1 && zoom >= 2) {
            el.style.display = "none";
        } else {
            el.style.display = "block";
        }
    });
}

function openPanel(panelId) {
    ["panelPoisson", "panelInsecte", "panelOiseau", "panelCollectible"].forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });
    const panelEl = document.getElementById(panelId);
    const select = panelEl.querySelector("select");
    if (select) {
        select.innerHTML = "";
        let generiques = [...lieuxGeneriques];

        if (panelId === "panelPoisson") {
            generiques = generiques.filter(l => ["Lacs", "Rivières", "Mers"].includes(l));
        } else if (panelId === "panelInsecte") {
            generiques = generiques.filter(l => !["Mers", "Au sommet de la tête de Blanc"].includes(l));
        }

        generiques.forEach(l => {
            const opt = document.createElement("option");
            opt.value = l;
            opt.textContent = "🌍 " + l;
            select.appendChild(opt);
        });
        const sep = document.createElement("option");
        sep.disabled = true;
        sep.textContent = "──────────";
        select.appendChild(sep);

        let lieux = [...places].sort((a, b) => {
            const nameA = Array.isArray(a.name) ? a.name[0] : a.name;
            const nameB = Array.isArray(b.name) ? b.name[0] : b.name;
            return nameA.localeCompare(nameB, "fr");
        });

        // Filtre pour les poissons
        if (panelId === "panelPoisson") {
            const mots = ["lac", "mer", "rivière", "fleuve"];
            lieux = lieux.filter(p => {
                const n = Array.isArray(p.name) ? p.name[0] : p.name;
                return mots.some(mot => new RegExp(`\\b${mot}`, "i").test(n));
            });
        } else if (panelId === "panelOiseau") {
            const motsExclus = ["insectes", "Événement : pêche"];
            lieux = lieux.filter(p => {
                const n = Array.isArray(p.name) ? p.name[0] : p.name;
                return !motsExclus.some(mot => n.includes(mot));
            });
        } else if (panelId === "panelInsecte") {
            const motsExclus = ["mer", "oiseaux"];
            lieux = lieux.filter(p => {
                const n = Array.isArray(p.name) ? p.name[0] : p.name;
                return !motsExclus.some(mot => new RegExp(`\\b${mot}`, "i").test(n));
            });
        }

        lieux.forEach(p => {
            const opt = document.createElement("option");
            const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
            opt.value = nameFr;
            opt.textContent = nameFr;
            select.appendChild(opt);
        });
    }
    panelEl.classList.remove("hidden");
    panelEl.querySelectorAll(".checkbox-group input[type='checkbox']").forEach(cb => {
        cb.checked = true;
    });
}

function closePanel(panelId) {
    document.getElementById(panelId).classList.add("hidden");
    collectiblePlacementMode = false;
    container.style.cursor = "crosshair";
}

function saveElement(type) {
    const panelId = type === "poisson" ? "panelPoisson" : type === "insecte" ? "panelInsecte" : "panelOiseau";
    const panel = document.getElementById(panelId);
    const prefix = type === "oiseau" ? "oisseau" : type;

    const nomFr = panel.querySelector(`#${prefix}Nom`).value.trim();
    const nomEn = panel.querySelector(`#${prefix}NomEn`).value.trim();
    if (!nomFr) { alert("Nom FR manquant"); return; }

    const lieuVal = panel.querySelector(`#${prefix}Lieu`).value;
    // Trouver le lieu dans places pour récupérer le nom EN si disponible
    const lieuPlace = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === lieuVal);
    const lieu = lieuPlace && Array.isArray(lieuPlace.name)
        ? [lieuPlace.name[0], lieuPlace.name[1]]
        : lieuVal;

    const niveau = parseInt(panel.querySelector(`#${prefix}Niveau`).value) || 1;

    const allGroups = panel.querySelectorAll(".checkbox-group");
    const heures = [...allGroups[0].querySelectorAll("input[type='checkbox']")]
        .filter(cb => cb.checked).map(cb => cb.value);
    const meteos = [...allGroups[1].querySelectorAll("input[type='checkbox']")]
        .filter(cb => cb.checked).map(cb => cb.value);

    const name = nomEn ? [nomFr, nomEn] : nomFr;
    const element = { name, lieu, heures, meteos, niveau_hobby: niveau };

    if (type === "poisson") {
        poissons.push(element);
        localStorage.setItem("poissons", JSON.stringify(poissons));
    } else if (type === "insecte") {
        insectes.push(element);
        localStorage.setItem("insectes", JSON.stringify(insectes));
    } else {
        oiseaux.push(element);
        localStorage.setItem("oiseaux", JSON.stringify(oiseaux));
    }

    panel.querySelector(`#${prefix}Nom`).value = "";
    panel.querySelector(`#${prefix}NomEn`).value = "";
    alert(`${nomFr} sauvegardé !`);
}

// =========================
// 🍄 COLLECTIBLES PLACEMENT
// =========================

function creerCollectible() {
    const nomFr = document.getElementById("collectibleNom").value.trim();
    const nomEn = document.getElementById("collectibleNomEn").value.trim();
    const categorieSelect = document.getElementById("collectibleCategorieSelect").value;
    const typeFr = categorieSelect === "__new__"
        ? document.getElementById("collectibleType").value.trim()
        : categorieSelect;
    const color = document.getElementById("collectibleColor").value;

    if (!nomFr) { alert("Nom FR manquant"); return; }
    if (!typeFr) { alert("Type/catégorie manquant"); return; }

    const nomExistant = collectibles.find(c => {
        const n = Array.isArray(c.name) ? c.name[0] : c.name;
        return n === nomFr;
    });
    if (nomExistant) {
        alert("Un collectible avec ce nom existe déjà.");
        return;
    }

    const name = nomEn ? [nomFr, nomEn] : nomFr;
    const type = typeFr;

    currentCollectible = { name, type, color, spawns: [] };
    collectibles.push(currentCollectible);
    localStorage.setItem("collectibles", JSON.stringify(collectibles));

    collectiblePlacementMode = true;
    container.style.cursor = "crosshair";
    document.getElementById("panelCollectible").classList.add("hidden");
}


function placerCollectibleExistant() {
    const nom = document.getElementById("collectibleExistantSelect").value;
    if (!nom) { alert("Aucun élément sélectionné"); return; }

    currentCollectible = collectibles.find(c => c.name === nom);
    if (!currentCollectible) { alert("Élément introuvable"); return; }

    collectiblePlacementMode = true;
    container.style.cursor = "crosshair";
    document.getElementById("panelCollectible").classList.add("hidden");
}

// =========================
// 📤 EXPORT TOUT
// =========================

function exportTout() {
    if (mode !== "admin") return;
    [
        {
            data: places.map(p => ({
                name: p.name,
                x: Math.round(p.x),
                y: Math.round(p.y),
                level: p.level || 1
            })),
            filename: "lieux.json"
        },
        { data: poissons, filename: "poissons.json" },
        { data: insectes, filename: "insectes.json" },
        { data: oiseaux, filename: "oiseaux.json" },
        {
            data: collectibles.map(c => ({
                name: c.name,
                type: c.type,
                color: c.color || "#e67e22",
                spawns: c.spawns.map(s => ({
                    x: Math.round(s.x * 100) / 100,
                    y: Math.round(s.y * 100) / 100
                }))
            })),
            filename: "collectibles.json"
        }
    ].forEach(({ data, filename }) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// =========================
// 📥 IMPORT ELEMENTS
// =========================

function triggerImportElements() {
    if (mode !== "admin") return;
    document.getElementById("importElementsFile").click();
}

function importElements(event) {
    if (mode !== "admin") return;
    const files = [...event.target.files];
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            if (file.name === "lieux.json") {
                places = data;
                savePlaces();
                document.querySelectorAll(".place-marker").forEach(el => el.remove());
                places.forEach(p => {
                    const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
                    createPlaceMarker(nameFr, p.x, p.y, p.level || 1);
                });
            } else if (file.name === "poissons.json") {
                poissons = data;
                localStorage.setItem("poissons", JSON.stringify(poissons));
            } else if (file.name === "insectes.json") {
                insectes = data;
                localStorage.setItem("insectes", JSON.stringify(insectes));
            } else if (file.name === "oiseaux.json") {
                oiseaux = data;
                localStorage.setItem("oiseaux", JSON.stringify(oiseaux));
            } else if (file.name === "collectibles.json") {
                collectibles = data;
                localStorage.setItem("collectibles", JSON.stringify(collectibles));
                afficherLegende();
            } else {
                alert(`Fichier non reconnu : ${file.name}`);
            }
        };
        reader.readAsText(file);
    });
    alert("Import terminé !");
    afficherLegende();
}

function onCategorieSelect() {
    const val = document.getElementById("collectibleCategorieSelect").value;
    const label = document.getElementById("collectibleTypeLabel");
    if (val === "__new__") {
        label.classList.remove("hidden");
    } else {
        label.classList.add("hidden");
    }
}

function openCollectiblePanel() {
    openPanel("panelCollectible");

    // Remplir catégories
    const selectCat = document.getElementById("collectibleCategorieSelect");
    selectCat.innerHTML = '<option value="__new__">➕ Nouvelle catégorie</option>';
    const types = [...new Set(collectibles.map(c => c.type))].sort();
    types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        selectCat.appendChild(opt);
    });
    document.getElementById("collectibleTypeLabel").classList.add("hidden");

    // Remplir éléments existants
    const selectEx = document.getElementById("collectibleExistantSelect");
    selectEx.innerHTML = "";
    [...collectibles].sort((a, b) => a.name.localeCompare(b.name, "fr")).forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.name;
        opt.textContent = c.name;
        selectEx.appendChild(opt);
    });

    // Reset champs
    document.getElementById("collectibleNom").value = "";
    document.getElementById("collectibleColor").value = "#e67e22";
}

// =========================
// 📋 AFFICHAGE ELEMENTS
// =========================

function toggleElementsPanel() {
    if (!selectedPlace) return;
    const panel = document.getElementById("elementsPanel");
    panel.classList.toggle("hidden");
}

function getEmojiType(element) {
    if (poissons.includes(element)) return "🐟";
    if (oiseaux.includes(element)) return "🪶";
    if (insectes.includes(element)) return "🐛";
    return "";
}

function afficherGroupeElements(elements, container) {
    const filtres = {};
    document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
        filtres[cb.value] = cb.checked;
    });

    const hobbyPoisson = parseInt(document.getElementById("hobbyPoisson").value) || null;
    const hobbyOiseau = parseInt(document.getElementById("hobbyOiseau").value) || null;
    const hobbyInsecte = parseInt(document.getElementById("hobbyInsecte").value) || null;
    const afficherNonDebloques = document.getElementById("afficherNonDebloques").checked;

    const ul = document.createElement("ul");
    ul.className = "elements-lieu-liste";

    const tousElements = [
        ...(filtres["poisson"] ? poissons.filter(p => elements.includes(Array.isArray(p.name) ? p.name[0] : p.name)).map(p => ({
            name: getNom(p),
            emoji: "🐟",
            niveau: p.niveau_hobby,
            hobbyUser: hobbyPoisson
        })) : []),
        ...(filtres["oiseau"] ? oiseaux.filter(o => elements.includes(Array.isArray(o.name) ? o.name[0] : o.name)).map(o => ({
            name: getNom(o),
            emoji: "🪶",
            niveau: o.niveau_hobby,
            hobbyUser: hobbyOiseau
        })) : []),
        ...(filtres["insecte"] ? insectes.filter(i => elements.includes(Array.isArray(i.name) ? i.name[0] : i.name)).map(i => ({
            name: getNom(i),
            emoji: "🐛",
            niveau: i.niveau_hobby,
            hobbyUser: hobbyInsecte
        })) : [])
    ];

    if (tousElements.length === 0) return;

    let auMoinsUn = false;
    tousElements.forEach(({ name, emoji, niveau, hobbyUser }) => {
        const debloque = hobbyUser === null || niveau <= hobbyUser;

        if (!debloque && !afficherNonDebloques) return;

        auMoinsUn = true;
        const li = document.createElement("li");
        li.textContent = `${emoji} ${name}`;
        if (!debloque) {
            li.style.color = "#555";
        }
        ul.appendChild(li);
    });

    if (auMoinsUn) container.appendChild(ul);
}

function afficherElementsLieu(nomLieu) {
    const { estZoneNiv1, sousZones, resultats } = getElementsPourLieu(nomLieu);
    const list = document.getElementById("elementsList");
    list.innerHTML = "";

    if (Object.keys(resultats).length === 0) {
        list.innerHTML = `<div style='color:#666;font-size:14px'>${langue === "fr" ? "Aucun élément répertorié" : "No elements found"}</div>`;
        return;
    }

    const lieuxPropres = getLieuxPourRecherche(nomLieu);
    let premierLieu = true;
    lieuxPropres.forEach(lieu => {
        if (resultats[lieu]) {
            const div = document.createElement("div");
            div.className = "elements-lieu";
            if (!premierLieu) {
                div.innerHTML = `<div class="elements-lieu-titre">${getNomLieu(lieu)} :</div>`;
            }
            premierLieu = false;
            afficherGroupeElements(resultats[lieu], div);
            list.appendChild(div);
        }
    });

    if (estZoneNiv1) {
        sousZones.forEach(sz => {
            if (resultats[sz]) {
                const div = document.createElement("div");
                div.className = "elements-lieu";
                div.innerHTML = `<div class="elements-lieu-titre">${getNomLieu(sz)} :</div>`;
                afficherGroupeElements(resultats[sz], div);
                list.appendChild(div);
            }
            const lieuxSZ = getLieuxPourRecherche(sz);
            lieuxSZ.forEach(lieu => {
                if (lieu !== sz && resultats[lieu]) {
                    const div = document.createElement("div");
                    div.className = "elements-lieu";
                    div.innerHTML = `<div class="elements-lieu-titre">${getNomLieu(sz)} (${getNomLieu(lieu)}) :</div>`;
                    afficherGroupeElements(resultats[lieu], div);
                    list.appendChild(div);
                }
            });
        });
    }
}

function toggleSpeciaux() {
    const panel = document.getElementById("panelSpeciaux");
    panel.classList.toggle("hidden");

    if (!panel.classList.contains("hidden")) {
        const list = document.getElementById("speciauxList");
        list.innerHTML = "";

        lieuxSpeciaux.forEach(lieu => {
            const elements = [
                ...poissons.filter(p => {
                    const lieuFr = Array.isArray(p.lieu) ? p.lieu[0] : p.lieu;
                    return lieuFr === lieu;
                }).map(p => Array.isArray(p.name) ? p.name[0] : p.name),
                ...oiseaux.filter(o => {
                    const lieuFr = Array.isArray(o.lieu) ? o.lieu[0] : o.lieu;
                    return lieuFr === lieu;
                }).map(o => Array.isArray(o.name) ? o.name[0] : o.name),
                ...insectes.filter(i => {
                    const lieuFr = Array.isArray(i.lieu) ? i.lieu[0] : i.lieu;
                    return lieuFr === lieu;
                }).map(i => Array.isArray(i.name) ? i.name[0] : i.name)
            ];

            if (elements.length > 0) {
                const div = document.createElement("div");
                div.className = "elements-lieu";
                div.innerHTML = `<div class="elements-lieu-titre">${getNomLieu(lieu)} :</div>`;
                afficherGroupeElements(elements, div);
                list.appendChild(div);
            }
        });
    }
}

function afficherLegende() {
    const list = document.getElementById("legendeList");
    list.innerHTML = "";

    const collectiblesAvecSpawns = collectibles.filter(c => c.spawns && c.spawns.length > 0);

    if (collectiblesAvecSpawns.length === 0) {
        document.getElementById("legendeCollectibles").classList.add("hidden");
        return;
    }

    document.getElementById("legendeCollectibles").classList.remove("hidden");

    collectiblesAvecSpawns.forEach(c => {
        const div = document.createElement("div");
        div.className = "legende-item";
        div.innerHTML = `
            <div class="legende-pastille" style="background: ${c.color || "#e67e22"}"></div>
            <span>${getNom(c)}</span>
        `;
        list.appendChild(div);
    });
}

// =========================
// 🔲 FILTRES
// =========================

document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", function() {
        if (mode !== "user") return;
        appliquerFiltres();
    });
});

function appliquerFiltres() {
    const filtres = {};
    document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
        filtres[cb.value] = cb.checked;
    });

    document.querySelectorAll(".collectible-marker").forEach(el => {
        el.style.display = filtres["collectible"] ? "block" : "none";
    });

    document.getElementById("legendeCollectibles").style.display = filtres["collectible"] ? "" : "none";

    if (selectedPlace) {
        afficherElementsLieu(selectedPlace);
    }

    // Rafraîchir les spéciaux si ouverts
    const panelSpeciaux = document.getElementById("panelSpeciaux");
    if (!panelSpeciaux.classList.contains("hidden")) {
        toggleSpeciaux();
        toggleSpeciaux();
    }
}

function toggleSuppressionCollectible() {
    suppressionCollectibleMode = !suppressionCollectibleMode;
    const btn = document.getElementById("btnSuppressionCollectible");
    if (suppressionCollectibleMode) {
        btn.style.background = "#c0392b";
        btn.textContent = "🗑️ Mode suppression actif";
        container.style.cursor = "crosshair";
    } else {
        btn.style.background = "";
        btn.textContent = "🗑️ Supprimer position";
        container.style.cursor = "crosshair";
    }
}

function openSuppressionPanel() {
    ["panelPoisson", "panelInsecte", "panelOiseau", "panelCollectible", "panelSuppression"].forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });
    document.getElementById("panelSuppression").classList.remove("hidden");
    updateSuppressionList();
}

function updateSuppressionList() {
    const type = document.getElementById("suppressionType").value;
    const select = document.getElementById("suppressionElement");
    select.innerHTML = "";

    let data = type === "poisson" ? poissons
        : type === "insecte" ? insectes
        : type === "oiseau" ? oiseaux
        : collectibles;

    [...data].sort((a, b) => {
        const nameA = Array.isArray(a.name) ? a.name[0] : a.name;
        const nameB = Array.isArray(b.name) ? b.name[0] : b.name;
        return nameA.localeCompare(nameB, "fr");
    }).forEach(el => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
        opt.value = nameFr;
        opt.textContent = nameFr;
        select.appendChild(opt);
    });
}

function supprimerElement() {
    const type = document.getElementById("suppressionType").value;
    const nom = document.getElementById("suppressionElement").value;
    if (!nom) return;

    if (!confirm(`Supprimer "${nom}" ?`)) return;

    if (type === "poisson") {
        poissons = poissons.filter(p => p.name !== nom);
        localStorage.setItem("poissons", JSON.stringify(poissons));
    } else if (type === "insecte") {
        insectes = insectes.filter(i => i.name !== nom);
        localStorage.setItem("insectes", JSON.stringify(insectes));
    } else if (type === "oiseau") {
        oiseaux = oiseaux.filter(o => o.name !== nom);
        localStorage.setItem("oiseaux", JSON.stringify(oiseaux));
    } else if (type === "collectible") {
        // Supprimer aussi les marqueurs sur la carte
        document.querySelectorAll(".collectible-marker").forEach(el => {
            if (el.dataset.collectibleName === nom) el.remove();
        });
        collectibles = collectibles.filter(c => c.name !== nom);
        localStorage.setItem("collectibles", JSON.stringify(collectibles));
        afficherLegende();
    }

    updateSuppressionList();
    alert(`"${nom}" supprimé !`);
}

["hobbyPoisson", "hobbyOiseau", "hobbyInsecte", "afficherNonDebloques"].forEach(id => {
    document.getElementById(id).addEventListener("change", function() {
        appliquerFiltres();
    });
});