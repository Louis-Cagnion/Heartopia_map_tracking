// =========================
// 🗺️ RÉFÉRENCES DOM MAP
// =========================

const inner = document.getElementById("map-inner");
const container = document.getElementById("map-container");
container.classList.add("add-mode");

// =========================
// 🖱️ DRAG COLLECTIBLES
// =========================

/** @type {HTMLElement|null} Marqueur collectible en cours de déplacement. */
let draggingCollectible = null;
/** @type {boolean} Vrai si le mode placement de collectible est actif. */
let collectiblePlacementMode = false;
/**
 * Collectible courant sélectionné pour placement ou suppression.
 * @type {{ name: string|[string,string], type: string|[string,string], color: string, spawns: Array<{x:number, y:number}> }|null}
 */
let currentCollectible = null;
/** @type {boolean} Vrai si le mode suppression de position de collectible est actif. */
let suppressionCollectibleMode = false;

// =========================
// 📍 CREATE PLACE MARKER
// =========================

/**
 * Crée et ajoute dans `#map-inner` un marqueur de lieu avec son label.
 * En mode utilisateur, un clic sélectionne/désélectionne le lieu et affiche sa faune.
 * En mode admin, double-clic sur le label permet de renommer le lieu.
 * @param {string} name - Nom français du lieu (utilisé comme identifiant `data-name`).
 * @param {number} x - Position horizontale en pourcentage (0–100).
 * @param {number} y - Position verticale en pourcentage (0–100).
 * @param {number} [level=1] - Niveau d'affichage : 1 = visible au zoom normal, 2 = visible au zoom ≥ 2.
 * @returns {void}
 */
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

    // Zone de tap agrandie (mobile)
    const hitArea = document.createElement("div");
    hitArea.style.cssText = `
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 40px; height: 40px;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
    `;

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

    const handleClick = function(e) {
        e.stopPropagation();
        if (mode === "admin") return;
        if (selectedPlace === name) {
            selectedPlace = null;
            selectedElement = null;
            document.querySelectorAll(".element-details").forEach(d => d.remove());
            document.querySelectorAll(".elements-lieu-liste li.selected").forEach(l => l.classList.remove("selected"));
            document.getElementById("placeTitle").textContent = t("aucunLieu");
            document.getElementById("elementsPanel").classList.add("hidden");
            return;
        }
        selectedElement = null;
        document.querySelectorAll(".element-details").forEach(d => d.remove());
        document.querySelectorAll(".elements-lieu-liste li.selected").forEach(l => l.classList.remove("selected"));
        selectedPlace = name;
        const title = document.getElementById("placeTitle");
        if (title) {
            const place = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === name);
            title.textContent = place ? getNom(place) : name;
        }
        document.getElementById("elementsPanel").classList.remove("hidden");
        afficherElementsLieu(name);
    };

    el.onclick = handleClick;
    hitArea.onclick = handleClick;

    const handleMousedown = function(e) {
        e.stopPropagation();
    };
    el.onmousedown = handleMousedown;
    hitArea.onmousedown = handleMousedown;

    el.oncontextmenu = function(e) {
        // Suppression désactivée en admin
    };

    el.appendChild(hitArea);
    inner.appendChild(el);
}

// =========================
// 🍄 CREATE COLLECTIBLE MARKER
// =========================

/**
 * Crée et ajoute dans `#map-inner` un marqueur de position de collectible.
 * En mode admin avec `draggingCollectible`, peut être déplacé à la souris.
 * En mode admin avec `suppressionCollectibleMode`, un clic supprime la position
 * du tableau `collectibles[].spawns` (mutation en place) et du DOM.
 * @param {number} x - Position horizontale en pourcentage (0–100).
 * @param {number} y - Position verticale en pourcentage (0–100).
 * @param {string|[string,string]} type - Type du collectible (utilisé comme `data-type`).
 * @param {string|[string,string]} collectibleName - Nom du collectible ; seul l'index 0 est utilisé.
 * @param {number} spawnIndex - Index du spawn dans `collectible.spawns` (utilisé pour la suppression).
 * @param {string} [color="#e67e22"] - Couleur CSS de fond du marqueur.
 * @returns {void}
 */
function createCollectibleMarker(x, y, type, collectibleName, spawnIndex, color = "#e67e22") {
    const el = document.createElement("div");
    el.className = "marker collectible-marker";
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.background = color;
    el.dataset.type = type;
    el.dataset.collectibleName = Array.isArray(collectibleName) ? collectibleName[0] : collectibleName;
    el.dataset.spawnIndex = spawnIndex;

    el.onmousedown = function(e) {
        if (mode !== "admin") return;
        draggingCollectible = el;
        e.preventDefault();
        e.stopPropagation();
    };

    el.onclick = function(e) {
        if (mode !== "admin" || !suppressionCollectibleMode) return;
        e.stopPropagation();
        const currentName = currentCollectible ? (Array.isArray(currentCollectible.name) ? currentCollectible.name[0] : currentCollectible.name) : null;
        if (!currentName || el.dataset.collectibleName !== currentName) return;
        if (!confirm("Supprimer cette position ?")) return;
        const name = el.dataset.collectibleName;
        const idx = parseInt(el.dataset.spawnIndex);
        const collectible = collectibles.find(c => (Array.isArray(c.name) ? c.name[0] : c.name) === name);
        if (collectible) {
            // ⚠️ Mutation du tableau collectible.spawns en place
            collectible.spawns.splice(idx, 1);
            // Mettre à jour les indices des marqueurs suivants
            document.querySelectorAll(".collectible-marker").forEach(m => {
                if (m.dataset.collectibleName === name) {
                    const mIdx = parseInt(m.dataset.spawnIndex);
                    if (mIdx > idx) m.dataset.spawnIndex = mIdx - 1;
                }
            });
            localStorage.setItem("collectibles", JSON.stringify(collectibles));
            afficherLegende();
        }
        el.remove();
    };

    inner.appendChild(el);
}

// =========================
// 🏷️ LABELS
// =========================

/**
 * Repositionne verticalement les labels de lieux pour éviter les chevauchements.
 * Trie les labels par position verticale et décale vers le haut ceux qui se superposent.
 * @returns {void}
 */
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
        const overlap = prev.left < curr.right && prev.right > curr.left && prev.bottom > curr.top;
        if (overlap) {
            const shift = prev.bottom - curr.top + 8;
            const current = parseFloat(labels[i].style.transform.match(/translateY\((.+)px\)/)?.[1]) || 0;
            labels[i].style.transform = `translateX(-50%) translateY(${current - shift}px)`;
        }
    }
}

/**
 * Recadre horizontalement les labels qui débordent du conteneur `#map-inner`.
 * @returns {void}
 */
function clampLabels() {
    const containerRect = inner.getBoundingClientRect();
    document.querySelectorAll(".place-label").forEach(l => {
        const rect = l.getBoundingClientRect();
        if (rect.left < containerRect.left) {
            l.style.left = `calc(50% + ${containerRect.left - rect.left}px)`;
        }
        if (rect.right > containerRect.right) {
            l.style.left = `calc(50% - ${rect.right - containerRect.right}px)`;
        }
    });
}

// =========================
// 🔍 ZOOM + PAN
// =========================

/**
 * Applique la transformation CSS courante (`zoom`, `panX`, `panY`) à `#map-inner`,
 * recadre le pan pour éviter de sortir des limites, et ajuste la taille des marqueurs
 * et labels en fonction du zoom.
 * @returns {void}
 */
function applyTransform() {
    const mapW = 675;
    const mapH = 674;
    const minPanX = -(mapW * zoom - mapW);
    const minPanY = -(mapH * zoom - mapH);
    panX = Math.min(0, Math.max(panX, minPanX));
    panY = Math.min(0, Math.max(panY, minPanY));
    inner.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom * 0.75})`;
    inner.style.transformOrigin = "top left";

    const fontSize = 20 / zoom;
    const markerSize = Math.max(6, 16 / zoom);
    const borderSize = Math.max(1, 2 / zoom);
    document.querySelectorAll(".place-label").forEach(l => { l.style.fontSize = fontSize + "px"; });
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

/**
 * Affiche ou masque les marqueurs de lieux selon le niveau de zoom courant.
 * Les marqueurs de niveau 1 sont visibles en dessous de zoom 2,
 * les marqueurs de niveau 2 au-dessus.
 * @returns {void}
 */
function updateMarkerVisibility() {
    document.querySelectorAll(".place-marker").forEach(el => {
        const level = parseInt(el.dataset.level) || 1;
        if (level === 2 && zoom < 2)       el.style.display = "none";
        else if (level === 1 && zoom >= 2) el.style.display = "none";
        else                               el.style.display = "block";
    });
}

// =========================
// 🖱️ MOUSE EVENTS
// =========================

// Zoom à la molette centré sur la position du curseur
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

// Pan au clic droit maintenu
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
});

// Placement de collectible au clic gauche (si mode actif)
container.addEventListener("click", function(e) {
    if (collectiblePlacementMode) {
        const rect = container.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left - panX) / (container.offsetWidth * zoom)) * 10000) / 100;
        const y = Math.round(((e.clientY - rect.top - panY) / (container.offsetHeight * zoom)) * 10000) / 100;
        // ⚠️ Mutation en place de currentCollectible.spawns
        currentCollectible.spawns.push({ x, y });
        localStorage.setItem("collectibles", JSON.stringify(collectibles));
        const spawnIndex = currentCollectible.spawns.length - 1;
        createCollectibleMarker(x, y, currentCollectible.type, currentCollectible.name, spawnIndex, currentCollectible.color || "#e67e22");
        return;
    }
});

document.addEventListener("mousemove", function(e) {
    const rect = container.getBoundingClientRect();
    // Déplacement d'un marqueur collectible en mode admin
    if (draggingCollectible && mode === "admin") {
        let x = ((e.clientX - rect.left - panX) / (rect.width * zoom)) * 100;
        let y = ((e.clientY - rect.top - panY) / (rect.height * zoom)) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        draggingCollectible.style.left = x + "%";
        draggingCollectible.style.top = y + "%";
    }
    if (isPanning) {
        panX = e.clientX - panStartX;
        panY = e.clientY - panStartY;
        applyTransform();
    }
});

document.addEventListener("mouseup", function() {
    if (draggingCollectible && mode === "admin") {
        const name = draggingCollectible.dataset.collectibleName;
        const idx = parseInt(draggingCollectible.dataset.spawnIndex);
        const x = Math.round(parseFloat(draggingCollectible.style.left) * 100) / 100;
        const y = Math.round(parseFloat(draggingCollectible.style.top) * 100) / 100;
        const collectible = collectibles.find(c => (Array.isArray(c.name) ? c.name[0] : c.name) === name);
        if (collectible) {
            // ⚠️ Mutation en place de collectible.spawns[idx]
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
// 📱 TOUCH EVENTS
// =========================

let lastTouchDist = null;
let touchStartTime = 0;
let touchStartPos = { x: 0, y: 0 };
let touchMoved = false;

// Pinch-to-zoom et pan tactile
container.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        e.preventDefault();
        return;
    }
    if (e.touches.length === 1) {
        touchStartTime = Date.now();
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchMoved = false;
    }
}, { passive: false });

container.addEventListener("touchmove", e => {
    if (e.touches.length === 2 && lastTouchDist !== null) {
        e.preventDefault();
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = dist / lastTouchDist;
        const rect = container.getBoundingClientRect();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        const newZoom = Math.min(Math.max(zoom * delta, 1), 5);
        panX = midX - (midX - panX) * (newZoom / zoom);
        panY = midY - (midY - panY) * (newZoom / zoom);
        zoom = newZoom;
        lastTouchDist = dist;
        applyTransform();
        updateMarkerVisibility();
        return;
    }
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPos.x;
        const dy = touch.clientY - touchStartPos.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            touchMoved = true;
            e.preventDefault();
            panX += dx;
            panY += dy;
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            applyTransform();
        }
    }
}, { passive: false });

container.addEventListener("touchend", e => {
    if (e.touches.length < 2) {
        lastTouchDist = null;
        setTimeout(() => { repositionLabels(); clampLabels(); }, 50);
    }
    if (e.touches.length === 0 && !touchMoved) {
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target) {
            const marker = target.closest(".place-marker");
            if (marker) marker.click();
        }
    }
});
