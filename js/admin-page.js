/* =========================
   🔧 ADMIN — PAGE ET NAVIGATION
   Structure de la page admin (sections accordéon, carte inline, import/export).
   Le rendu des formulaires par type vit dans admin-forms.js.
   ========================= */

// ---- État local ----
/** @type {string|null} Clé de la section admin actuellement ouverte ("ajouter"|"modifier"|"supprimer"|"importexport"). */
let adminSectionActive = null;
/** @type {string|null} Type de l'élément actuellement sélectionné dans un panneau admin. */
let activeAdminPanel = null;
/**
 * Référence à l'élément de faune/collectible/recette en cours de modification.
 * Partagé avec les formulaires de sauvegarde.
 * @type {Object|null}
 */
let editedAdminElement = null;

/**
 * Initialise la page admin en construisant son DOM depuis zéro.
 * @returns {void}
 */
function initAdminUI() {
    const page = document.getElementById("adminPage");
    if (!page) return;
    renderAdminPage();
}

/**
 * Crée et retourne l'élément DOM de carte inline pour une section admin donnée.
 * La carte inline contient un header avec titre/fermeture et un wrapper pour `#map-container`.
 * @param {string} sectionKey - Clé de la section parente ("ajouter"|"modifier"|"supprimer").
 * @returns {HTMLDivElement} Élément `.admin-carte-inline` prêt à être inséré dans le DOM.
 */
function createInlineMap(sectionKey) {
    const carteInline = document.createElement("div");
    carteInline.id = "adminCarteInline-" + sectionKey;
    carteInline.className = "admin-carte-inline hidden";

    const carteHeader = document.createElement("div");
    carteHeader.className = "admin-carte-header";
    const titre = document.createElement("span");
    titre.id = "adminCarteTitre-" + sectionKey;
    titre.textContent = t("adminPositionsCarte");
    const btnFermer = document.createElement("button");
    btnFermer.textContent = "✖";
    btnFermer.onclick = () => closeAdminMap(sectionKey);
    carteHeader.appendChild(titre);
    carteHeader.appendChild(btnFermer);

    const wrapper = document.createElement("div");
    wrapper.id = "admin-map-wrapper-" + sectionKey;
    wrapper.className = "admin-map-container-wrapper";

    carteInline.appendChild(carteHeader);
    carteInline.appendChild(wrapper);
    return carteInline;
}

/**
 * Reconstruit entièrement le DOM de la page admin :
 * 4 sections accordéon (ajouter, modifier, supprimer, import/export)
 * avec leur carte inline respective pour les 3 premières.
 * Remet `#map-container` dans `#mapColumn` s'il avait été déplacé.
 * @returns {void}
 */
function renderAdminPage() {
    const page = document.getElementById("adminPage");
    const mapContainer = document.getElementById("map-container");
    const mapColumn = document.getElementById("mapColumn");
    if (mapContainer && mapColumn && !mapColumn.contains(mapContainer)) {
        mapColumn.appendChild(mapContainer);
    }
    page.innerHTML = "";

    const sections = [
        { key: "ajouter",      labelKey: "adminSectionAjouter",     avecCarte: true },
        { key: "modifier",     labelKey: "adminSectionModifier",     avecCarte: true },
        { key: "supprimer",    labelKey: "adminSectionSupprimer",    avecCarte: true },
        { key: "importexport", labelKey: "adminSectionImportExport", avecCarte: false }
    ];

    sections.forEach(({ key, labelKey, avecCarte }) => {
        const section = document.createElement("div");
        section.className = "admin-section";
        section.id = "adminSection-" + key;

        const header = document.createElement("div");
        header.className = "admin-section-header";
        header.innerHTML = "<span>" + t(labelKey) + "</span><span class=\"admin-section-arrow\">►</span>";
        header.addEventListener("click", () => toggleAdminSection(key));

        const body = document.createElement("div");
        body.className = "admin-section-body hidden";
        body.id = "adminSectionBody-" + key;

        section.appendChild(header);
        section.appendChild(body);
        page.appendChild(section);

        if (avecCarte) page.appendChild(createInlineMap(key));
    });
}

/**
 * Bascule l'ouverture/fermeture d'une section accordéon admin.
 * Ferme toutes les autres sections et leurs cartes inline.
 * Déclenche le rendu du contenu si la section s'ouvre.
 * @param {"ajouter"|"modifier"|"supprimer"|"importexport"} key - Clé de la section à toggler.
 * @returns {void}
 */
function toggleAdminSection(key) {
    const body = document.getElementById("adminSectionBody-" + key);
    const arrow = document.querySelector("#adminSection-" + key + " .admin-section-arrow");
    const isOpen = !body.classList.contains("hidden");

    document.querySelectorAll(".admin-section-body").forEach(b => b.classList.add("hidden"));
    document.querySelectorAll(".admin-section-arrow").forEach(a => { a.textContent = "►"; });
    closeAdminMap();

    if (!isOpen) {
        body.classList.remove("hidden");
        arrow.textContent = "▼";
        adminSectionActive = key;
        renderAdminSectionBody(key, body);
    } else {
        adminSectionActive = null;
        activeAdminPanel = null;
    }
}

/**
 * Délègue le rendu du corps d'une section admin à la fonction appropriée.
 * @param {"ajouter"|"modifier"|"supprimer"|"importexport"} key - Clé de la section.
 * @param {HTMLElement} body - Conteneur DOM du corps de la section.
 * @returns {void}
 */
function renderAdminSectionBody(key, body) {
    body.innerHTML = "";
    if (key === "ajouter")       renderTypeGrid(body, "ajouter");
    else if (key === "modifier")  renderTypeGrid(body, "modifier");
    else if (key === "supprimer") renderTypeGrid(body, "supprimer");
    else if (key === "importexport") renderImportExport(body);
}

/**
 * Crée la grille de boutons de type (poisson, insecte, oiseau, collectible,
 * ingrédient, recette) et la zone de panneau dynamique pour un mode donné.
 * @param {HTMLElement} body - Conteneur DOM dans lequel injecter la grille.
 * @param {"ajouter"|"modifier"|"supprimer"} mode - Mode d'action.
 * @returns {void}
 */
function renderTypeGrid(body, mode) {
    const grid = document.createElement("div");
    grid.className = "admin-type-grid";

    const types = [
        { key: "poisson",     emoji: "🐟", label: { fr: "Poisson",     en: "Fish" } },
        { key: "insecte",     emoji: "🐛", label: { fr: "Insecte",     en: "Insect" } },
        { key: "oiseau",      emoji: "🪶", label: { fr: "Oiseau",      en: "Bird" } },
        { key: "collectible", emoji: "🍄", label: { fr: "Collectible", en: "Collectible" } },
        { key: "ingredient",  emoji: "🥕", label: { fr: "Ingrédient",  en: "Ingredient" } },
        { key: "recette",     emoji: "📖", label: { fr: "Recette",     en: "Recipe" } }
    ];

    types.forEach(({ key, emoji, label }) => {
        const btn = document.createElement("div");
        btn.className = "admin-type-btn";
        btn.id = "adminTypeBtn-" + mode + "-" + key;
        const lbl = label[language] || label.fr;
        btn.innerHTML = "<span class=\"admin-type-emoji\">" + emoji + "</span><span>" + lbl + "</span>";
        btn.addEventListener("click", () => toggleAdminPanel(mode, key, btn, body));
        grid.appendChild(btn);
    });

    body.appendChild(grid);

    const panneauZone = document.createElement("div");
    panneauZone.className = "admin-panneau-zone";
    panneauZone.id = "adminPanneauZone-" + mode;
    body.appendChild(panneauZone);
}

/**
 * Bascule l'affichage du formulaire associé à un type dans un mode donné.
 * Si le panneau était déjà actif, le ferme. Sinon, l'ouvre et rend le formulaire.
 * @param {"ajouter"|"modifier"|"supprimer"} mode - Mode d'action.
 * @param {string} type - Type d'élément ("poisson"|"insecte"|"oiseau"|"collectible"|"ingredient"|"recette").
 * @param {HTMLElement} btn - Bouton cliqué (pour le style `active`).
 * @param {HTMLElement} body - Conteneur parent du panneau.
 * @returns {void}
 */
function toggleAdminPanel(mode, type, btn, body) {
    const panneauZone = document.getElementById("adminPanneauZone-" + mode);
    const alreadyOpen = btn.classList.contains("active");

    body.querySelectorAll(".admin-type-btn").forEach(b => b.classList.remove("active"));
    panneauZone.innerHTML = "";
    closeAdminMap(mode);

    if (alreadyOpen) { activeAdminPanel = null; return; }

    btn.classList.add("active");
    activeAdminPanel = type;

    if (mode === "ajouter")       renderElementForm(type, panneauZone);
    else if (mode === "modifier")  renderEditForm(type, panneauZone);
    else if (mode === "supprimer") renderDeleteForm(type, panneauZone);
}

/**
 * Ouvre la carte inline admin pour placer ou supprimer des positions de collectible.
 * Déplace `#map-container` dans le wrapper de la carte inline.
 * Active `collectiblePlacementMode` ou `collectibleDeletionMode` selon `modeAction`.
 * ⚠️ `collectible` est stocké dans `currentCollectible` (référence partagée).
 * @param {"ajouter"|"modifier"|"supprimer"} modeAction - Action à effectuer sur la carte.
 * @param {{ name: string|[string,string], spawns: Array<{x:number,y:number}> }} collectible - Collectible cible.
 * @param {string} sectionKey - Clé de la section admin propriétaire de la carte inline.
 * @returns {void}
 */
function openAdminMap(modeAction, collectible, sectionKey) {
    document.querySelectorAll(".admin-carte-inline").forEach(el => el.classList.add("hidden"));
    const carteInline = document.getElementById("adminCarteInline-" + sectionKey);
    if (!carteInline) return;

    currentCollectible = collectible;
    collectiblePlacementMode = (modeAction === "ajouter" || modeAction === "modifier");
    collectibleDeletionMode = (modeAction === "supprimer");

    carteInline.classList.remove("hidden");

    const wrapper = document.getElementById("admin-map-wrapper-" + sectionKey);
    const mapContainer = document.getElementById("map-container");
    if (mapContainer && wrapper && !wrapper.contains(mapContainer)) wrapper.appendChild(mapContainer);

    const titre = document.getElementById("adminCarteTitre-" + sectionKey);
    const nom = collectible ? (Array.isArray(collectible.name) ? collectible.name[0] : collectible.name) : "";
    if (titre) titre.textContent = t("adminPositionsCarte") + (nom ? " — " + nom : "");
    if (mapContainer) mapContainer.style.cursor = "crosshair";

    setTimeout(() => {
        applyTransform(); updateMarkerVisibility(); repositionLabels(); clampLabels();
        carteInline.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
}

/**
 * Ferme une ou toutes les cartes inline admin.
 * Remet `#map-container` dans `#mapColumn`, désactive les modes de placement/suppression.
 * @param {string} [sectionKey] - Clé de la section à fermer. Si absent, ferme toutes les cartes.
 * @returns {void}
 */
function closeAdminMap(sectionKey) {
    if (sectionKey) {
        const ci = document.getElementById("adminCarteInline-" + sectionKey);
        if (ci) ci.classList.add("hidden");
    } else {
        document.querySelectorAll(".admin-carte-inline").forEach(el => el.classList.add("hidden"));
    }
    collectiblePlacementMode = false; collectibleDeletionMode = false;
    const mapContainer = document.getElementById("map-container");
    const mapColumn = document.getElementById("mapColumn");
    if (mapContainer && mapColumn && !mapColumn.contains(mapContainer)) mapColumn.appendChild(mapContainer);
    if (mapContainer) mapContainer.style.cursor = "crosshair";
}

/**
 * Rend l'interface d'import/export dans le corps d'une section admin.
 * Import : champ fichier multiple JSON → appelle `importElements`.
 * Export : cases à cocher par fichier + bouton d'export sélectif.
 * @param {HTMLElement} body - Conteneur DOM dans lequel injecter l'interface.
 * @returns {void}
 */
function renderImportExport(body) {
    const zone = document.createElement("div");
    zone.className = "admin-form";

    const titreImport = document.createElement("div");
    titreImport.className = "admin-sub-title";
    titreImport.textContent = language === "fr" ? "Importer des fichiers" : "Import files";
    zone.appendChild(titreImport);

    const inputFile = document.createElement("input");
    inputFile.type = "file"; inputFile.id = "adminImportFile";
    inputFile.className = "hidden"; inputFile.multiple = true; inputFile.accept = ".json";
    inputFile.addEventListener("change", (e) => importElements(e));
    zone.appendChild(inputFile);

    const btnImport = document.createElement("button");
    btnImport.className = "admin-btn-ie";
    btnImport.innerHTML = "<span class=\"admin-ie-emoji\">📂</span><span>" + (language === "fr" ? "Choisissez vos fichiers" : "Choose your files") + "</span>";
    btnImport.onclick = () => document.getElementById("adminImportFile").click();
    zone.appendChild(btnImport);

    const sep = document.createElement("hr");
    sep.className = "hobby-separator";
    zone.appendChild(sep);

    const titreExport = document.createElement("div");
    titreExport.className = "admin-sub-title";
    titreExport.textContent = language === "fr" ? "Exporter des fichiers" : "Export files";
    zone.appendChild(titreExport);

    const fichiers = [
        { key: "lieux", label: "lieux.json" }, { key: "poissons", label: "poissons.json" },
        { key: "insectes", label: "insectes.json" }, { key: "oiseaux", label: "oiseaux.json" },
        { key: "collectibles", label: "collectibles.json" }, { key: "ingredients", label: "ingredients.json" },
        { key: "recettes", label: "recettes.json" }
    ];

    const checkZone = document.createElement("div");
    checkZone.className = "admin-export-checks";
    fichiers.forEach(({ key, label }) => {
        const lbl = document.createElement("label");
        lbl.className = "admin-export-label";
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = true; cb.dataset.exportKey = key;
        lbl.appendChild(cb); lbl.appendChild(document.createTextNode(" " + label));
        checkZone.appendChild(lbl);
    });
    zone.appendChild(checkZone);

    const btnExport = document.createElement("button");
    btnExport.className = "admin-btn-ie";
    btnExport.innerHTML = "<span class=\"admin-ie-emoji\">📤</span><span>" + (language === "fr" ? "Exporter les fichiers" : "Export files") + "</span>";
    btnExport.onclick = () => exportSelected(checkZone);
    zone.appendChild(btnExport);

    body.appendChild(zone);
}

/**
 * Exporte les fichiers JSON cochés dans `checkZone` sous forme de téléchargements.
 * Chaque fichier coché génère un `Blob` JSON avec BOM UTF-8 et déclenche un téléchargement.
 * Les coordonnées de lieux et spawns sont arrondies.
 * @param {HTMLElement} checkZone - Conteneur contenant les `<input type="checkbox" data-export-key="...">`.
 * @returns {void}
 */
function exportSelected(checkZone) {
    checkZone.querySelectorAll("input[type='checkbox']").forEach(cb => {
        if (!cb.checked) return;
        const key = cb.dataset.exportKey;
        let data;
        if (key === "lieux") data = places.map(p => ({ name: p.name, x: Math.round(p.x), y: Math.round(p.y), level: p.level || 1 }));
        else if (key === "poissons") data = fish;
        else if (key === "insectes") data = insects;
        else if (key === "oiseaux") data = birds;
        else if (key === "collectibles") data = collectibles.map(c => ({ name: c.name, type: c.type, color: c.color || "#e67e22", spawns: c.spawns.map(s => ({ x: Math.round(s.x*100)/100, y: Math.round(s.y*100)/100 })) }));
        else if (key === "ingredients") data = ingredients;
        else if (key === "recettes") data = recipes;
        if (!data) return;
        const blob = new Blob(["﻿" + JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = key + ".json";
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    });
}

/**
 * Met à jour les textes de l'interface admin (headers de sections, boutons de types)
 * dans la langue courante, et redessine le corps de la section active si elle est ouverte.
 * @returns {void}
 */
function updateAdminUI() {
    if (mode !== "admin") return;
    if (adminSectionActive) {
        const body = document.getElementById("adminSectionBody-" + adminSectionActive);
        if (body && !body.classList.contains("hidden")) renderAdminSectionBody(adminSectionActive, body);
    }
    [{ key:"ajouter",labelKey:"adminSectionAjouter" },{ key:"modifier",labelKey:"adminSectionModifier" },{ key:"supprimer",labelKey:"adminSectionSupprimer" },{ key:"importexport",labelKey:"adminSectionImportExport" }].forEach(({ key, labelKey }) => {
        const header = document.querySelector("#adminSection-" + key + " .admin-section-header span");
        if (header) header.textContent = t(labelKey);
    });
}
