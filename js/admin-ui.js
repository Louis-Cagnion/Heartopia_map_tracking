// =========================
// 🔧 ADMIN UI — NOUVELLE INTERFACE
// =========================
// Ce fichier gère toute la logique de la page admin :
// sections Ajouter / Modifier / Supprimer / Import-Export
// + carte inline pour les collectibles
// =========================

// ---- État local ----
let adminSectionActive = null;       // "ajouter" | "modifier" | "supprimer" | "importexport"
let adminPanneauActif = null;        // "poisson" | "insecte" | "oiseau" | "collectible" | "ingredient" | "recette"
let adminCarteVisible = false;
let adminModeEdition = false;        // true = on est en train de modifier (vs ajouter)
let adminElementEdite = null;        // référence à l'objet en cours d'édition

// ---- Types disponibles ----
const adminTypes = ["poisson", "insecte", "oiseau", "collectible", "ingredient", "recette"];

// =========================
// 🏗️ INIT — construit la page admin
// =========================

function initAdminUI() {
    const page = document.getElementById("adminPage");
    if (!page) return;
    renderAdminPage();
}

function renderAdminPage() {
    const page = document.getElementById("adminPage");

    // Sauvegarder map-container dans mapColumn avant de vider la page admin
    const mapContainer = document.getElementById("map-container");
    const mapColumn = document.getElementById("mapColumn");
    if (mapContainer && mapColumn && !mapColumn.contains(mapContainer)) {
        mapColumn.appendChild(mapContainer);
    }

    page.innerHTML = "";

    // 4 sections
    const sections = [
        { key: "ajouter",      labelKey: "adminSectionAjouter" },
        { key: "modifier",     labelKey: "adminSectionModifier" },
        { key: "supprimer",    labelKey: "adminSectionSupprimer" },
        { key: "importexport", labelKey: "adminSectionImportExport" }
    ];

    sections.forEach(({ key, labelKey }) => {
        const section = document.createElement("div");
        section.className = "admin-section";
        section.id = "adminSection-" + key;

        const header = document.createElement("div");
        header.className = "admin-section-header";
        header.innerHTML = `<span>${t(labelKey)}</span><span class="admin-section-arrow">▶</span>`;
        header.addEventListener("click", () => toggleAdminSection(key));

        const body = document.createElement("div");
        body.className = "admin-section-body hidden";
        body.id = "adminSectionBody-" + key;

        section.appendChild(header);
        section.appendChild(body);
        page.appendChild(section);
    });

    // Carte inline pour collectibles — on crée uniquement le shell,
    // le vrai #map-container y sera déplacé par ouvrirCarteAdmin()
    const carteInline = document.createElement("div");
    carteInline.id = "adminCarteInline";
    carteInline.className = "hidden";

    const carteHeader = document.createElement("div");
    carteHeader.className = "admin-carte-header";
    carteHeader.innerHTML = `<span id="adminCarteTitre">${t("adminPositionsCarte")}</span>`;
    const btnFermerCarte = document.createElement("button");
    btnFermerCarte.textContent = "✖";
    btnFermerCarte.onclick = fermerCarteAdmin;
    carteHeader.appendChild(btnFermerCarte);

    const wrapper = document.createElement("div");
    wrapper.id = "admin-map-container-wrapper";

    carteInline.appendChild(carteHeader);
    carteInline.appendChild(wrapper);
    page.appendChild(carteInline);
}

// =========================
// 🔄 TOGGLE SECTION
// =========================

function toggleAdminSection(key) {
    const body = document.getElementById("adminSectionBody-" + key);
    const arrow = document.querySelector(`#adminSection-${key} .admin-section-arrow`);
    const isOpen = !body.classList.contains("hidden");

    // Fermer toutes les sections
    adminTypes.forEach(type => {
        // ferme les panneaux ouverts
    });
    document.querySelectorAll(".admin-section-body").forEach(b => {
        b.classList.add("hidden");
    });
    document.querySelectorAll(".admin-section-arrow").forEach(a => {
        a.textContent = "▶";
    });

    if (!isOpen) {
        body.classList.remove("hidden");
        arrow.textContent = "▼";
        adminSectionActive = key;
        renderAdminSectionBody(key, body);
    } else {
        adminSectionActive = null;
        adminPanneauActif = null;
    }
}

// =========================
// 🖊️ RENDER SECTION BODY
// =========================

function renderAdminSectionBody(key, body) {
    body.innerHTML = "";

    if (key === "ajouter") {
        renderGrilleTypes(body, "ajouter");
    } else if (key === "modifier") {
        renderGrilleTypes(body, "modifier");
    } else if (key === "supprimer") {
        renderGrilleTypes(body, "supprimer");
    } else if (key === "importexport") {
        renderImportExport(body);
    }
}

// =========================
// 🔲 GRILLE 2×3 DE TYPES
// =========================

function renderGrilleTypes(body, mode) {
    const grid = document.createElement("div");
    grid.className = "admin-type-grid";

    const types = [
        { key: "poisson",     emoji: "🐟", labelKey: "adminAjouterPoisson",    label: { fr: "Poisson",     en: "Fish" } },
        { key: "insecte",     emoji: "🐛", labelKey: "adminAjouterInsecte",    label: { fr: "Insecte",     en: "Insect" } },
        { key: "oiseau",      emoji: "🪶", labelKey: "adminAjouterOiseau",     label: { fr: "Oiseau",      en: "Bird" } },
        { key: "collectible", emoji: "🍄", labelKey: "adminAjouterCollectible",label: { fr: "Collectible", en: "Collectible" } },
        { key: "ingredient",  emoji: "🥕", labelKey: "adminAjouterIngredient", label: { fr: "Ingrédient",  en: "Ingredient" } },
        { key: "recette",     emoji: "📖", labelKey: "adminAjouterRecette",    label: { fr: "Recette",     en: "Recipe" } }
    ];

    types.forEach(({ key, emoji, labelKey, label }) => {
        const btn = document.createElement("div");
        btn.className = "admin-type-btn";
        btn.id = `adminTypeBtn-${mode}-${key}`;
        btn.innerHTML = `<span class="admin-type-emoji">${emoji}</span><span>${label[langue] || label.fr}</span>`;
        btn.addEventListener("click", () => toggleAdminPanneau(mode, key, btn, body));
        grid.appendChild(btn);
    });

    body.appendChild(grid);

    // Zone panneau sous la grille
    const panneauZone = document.createElement("div");
    panneauZone.className = "admin-panneau-zone";
    panneauZone.id = `adminPanneauZone-${mode}`;
    body.appendChild(panneauZone);
}

// =========================
// 🔀 TOGGLE PANNEAU TYPE
// =========================

function toggleAdminPanneau(mode, type, btn, body) {
    const panneauZone = document.getElementById(`adminPanneauZone-${mode}`);
    const alreadyOpen = btn.classList.contains("active");

    // Désactiver tous les boutons de cette grille
    body.querySelectorAll(".admin-type-btn").forEach(b => b.classList.remove("active"));
    panneauZone.innerHTML = "";

    if (alreadyOpen) {
        adminPanneauActif = null;
        fermerCarteAdmin();
        return;
    }

    btn.classList.add("active");
    adminPanneauActif = type;

    if (mode === "ajouter") {
        renderFormulaireAjouter(type, panneauZone);
    } else if (mode === "modifier") {
        renderFormulaireModifier(type, panneauZone);
    } else if (mode === "supprimer") {
        renderFormulaireSupprimer(type, panneauZone);
    }
}

// =========================
// ➕ FORMULAIRES AJOUTER
// =========================

function renderFormulaireAjouter(type, zone) {
    zone.innerHTML = "";
    const form = document.createElement("div");
    form.className = "admin-form";

    if (type === "poisson" || type === "insecte" || type === "oiseau") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel")));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel")));
        form.appendChild(champSelect("lieu", t("adminLieu"), getLieuxPourType(type)));
        form.appendChild(champCheckboxes("heures", t("adminHeures"), [
            { val: "matin", label: t("matin") },
            { val: "après-midi", label: t("apresMidi") },
            { val: "soir", label: t("soir") },
            { val: "nuit", label: t("nuit") }
        ], true));
        form.appendChild(champCheckboxes("meteos", t("adminMeteo"), [
            { val: "soleil", label: "☀️ " + t("meteoSoleil") },
            { val: "pluie", label: "🌧️ " + t("meteoPluie") },
            { val: "arc-en-ciel", label: "🌈 " + t("meteoArc") }
        ], true));
        form.appendChild(champNombre("niveau", t("adminNiveauHobby"), 1, 10, 1));
    } else if (type === "collectible") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel")));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel")));
        form.appendChild(champSelectCategorie("categorie", t("adminCategorieLabel")));
        form.appendChild(champCouleur("couleur", t("adminCouleur"), "#e67e22"));
        // Bouton pour placer sur la carte
        const btnCarte = document.createElement("button");
        btnCarte.className = "admin-btn-secondary";
        btnCarte.textContent = t("adminAjouterPosition");
        btnCarte.onclick = () => ouvrirCarteAdmin("ajouter", null);
        form.appendChild(btnCarte);
    } else if (type === "ingredient") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel")));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel")));
        form.appendChild(champTexte("categorieFr", t("adminCategorieLabel") + " (FR)"));
        form.appendChild(champTexte("categorieEn", t("adminCategorieLabel") + " (EN)"));
        form.appendChild(champNombre("prix", t("adminPrix"), 0, 99999, 0));
    } else if (type === "recette") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel")));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel")));
        form.appendChild(champNombre("energy", t("adminEnergy"), 0, 9999, 0));
        form.appendChild(champNombre("sellPrice", t("adminSellPrice"), 0, 99999, 0));
        form.appendChild(renderSlotsIngredients([]));
    }

    const btnSave = document.createElement("button");
    btnSave.className = "admin-btn-primary";
    btnSave.textContent = t("adminSauvegarder");
    btnSave.onclick = () => sauvegarderElement(type, form, false);
    form.appendChild(btnSave);

    zone.appendChild(form);
}

// =========================
// ✏️ FORMULAIRES MODIFIER
// =========================

function renderFormulaireModifier(type, zone) {
    zone.innerHTML = "";

    const data = getDataPourType(type);
    if (data.length === 0) {
        zone.innerHTML = `<div class="admin-empty">${t("aucunElement")}</div>`;
        return;
    }

    const selectEl = document.createElement("div");
    selectEl.className = "admin-form";

    const label = document.createElement("label");
    label.className = "admin-label";
    label.textContent = t("adminElementAModifier");

    const sel = document.createElement("select");
    sel.className = "admin-select";
    sel.id = `modifierSelect-${type}`;

    const optVide = document.createElement("option");
    optVide.value = "";
    optVide.textContent = t("adminSelectionnerElement");
    sel.appendChild(optVide);

    [...data].sort((a, b) => {
        const na = Array.isArray(a.name) ? a.name[0] : a.name;
        const nb = Array.isArray(b.name) ? b.name[0] : b.name;
        return na.localeCompare(nb, "fr");
    }).forEach(el => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
        opt.value = nameFr;
        opt.textContent = nameFr;
        sel.appendChild(opt);
    });

    selectEl.appendChild(label);
    selectEl.appendChild(sel);
    zone.appendChild(selectEl);

    const formZone = document.createElement("div");
    formZone.id = `modifierFormZone-${type}`;
    zone.appendChild(formZone);

    sel.addEventListener("change", () => {
        const nameFr = sel.value;
        if (!nameFr) { formZone.innerHTML = ""; return; }
        const el = data.find(e => (Array.isArray(e.name) ? e.name[0] : e.name) === nameFr);
        if (!el) return;
        adminElementEdite = el;
        renderFormulaireModifierRempli(type, el, formZone);
    });
}

function renderFormulaireModifierRempli(type, el, zone) {
    zone.innerHTML = "";
    const form = document.createElement("div");
    form.className = "admin-form";

    const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
    const nameEn = Array.isArray(el.name) ? el.name[1] || "" : "";

    if (type === "poisson" || type === "insecte" || type === "oiseau") {
        const lieuFr = Array.isArray(el.lieu) ? el.lieu[0] : el.lieu;
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(champSelect("lieu", t("adminLieu"), getLieuxPourType(type), lieuFr));
        form.appendChild(champCheckboxes("heures", t("adminHeures"), [
            { val: "matin", label: t("matin") },
            { val: "après-midi", label: t("apresMidi") },
            { val: "soir", label: t("soir") },
            { val: "nuit", label: t("nuit") }
        ], false, el.heures || []));
        form.appendChild(champCheckboxes("meteos", t("adminMeteo"), [
            { val: "soleil", label: "☀️ " + t("meteoSoleil") },
            { val: "pluie", label: "🌧️ " + t("meteoPluie") },
            { val: "arc-en-ciel", label: "🌈 " + t("meteoArc") }
        ], false, el.meteos || []));
        form.appendChild(champNombre("niveau", t("adminNiveauHobby"), 1, 10, el.niveau_hobby || 1));
    } else if (type === "collectible") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(champSelectCategorie("categorie", t("adminCategorieLabel"), el.type));
        form.appendChild(champCouleur("couleur", t("adminCouleur"), el.color || "#e67e22"));
        const btnCarte = document.createElement("button");
        btnCarte.className = "admin-btn-secondary";
        btnCarte.textContent = t("adminPositionsCarte") + ` (${(el.spawns || []).length})`;
        btnCarte.onclick = () => ouvrirCarteAdmin("modifier", el);
        form.appendChild(btnCarte);
    } else if (type === "ingredient") {
        const catFr = Array.isArray(el.category) ? el.category[0] : el.category;
        const catEn = Array.isArray(el.category) ? el.category[1] || "" : "";
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(champTexte("categorieFr", t("adminCategorieLabel") + " (FR)", catFr));
        form.appendChild(champTexte("categorieEn", t("adminCategorieLabel") + " (EN)", catEn));
        form.appendChild(champNombre("prix", t("adminPrix"), 0, 99999, el.price || 0));
    } else if (type === "recette") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(champNombre("energy", t("adminEnergy"), 0, 9999, el.energy || 0));
        form.appendChild(champNombre("sellPrice", t("adminSellPrice"), 0, 99999, el.sellPrice || 0));
        form.appendChild(renderSlotsIngredients(el.ingredients || []));
    }

    const btnSave = document.createElement("button");
    btnSave.className = "admin-btn-primary";
    btnSave.textContent = t("adminSauvegarder");
    btnSave.onclick = () => sauvegarderElement(type, form, true);
    form.appendChild(btnSave);

    zone.appendChild(form);
}

// =========================
// 🗑️ FORMULAIRES SUPPRIMER
// =========================

function renderFormulaireSupprimer(type, zone) {
    zone.innerHTML = "";
    const data = getDataPourType(type);

    if (data.length === 0) {
        zone.innerHTML = `<div class="admin-empty">${t("aucunElement")}</div>`;
        return;
    }

    const form = document.createElement("div");
    form.className = "admin-form";

    const label = document.createElement("label");
    label.className = "admin-label";
    label.textContent = t("adminElementASupprimer");

    const sel = document.createElement("select");
    sel.className = "admin-select";

    const optVide = document.createElement("option");
    optVide.value = "";
    optVide.textContent = t("adminSelectionnerElement");
    sel.appendChild(optVide);

    [...data].sort((a, b) => {
        const na = Array.isArray(a.name) ? a.name[0] : a.name;
        const nb = Array.isArray(b.name) ? b.name[0] : b.name;
        return na.localeCompare(nb, "fr");
    }).forEach(el => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
        opt.value = nameFr;
        opt.textContent = nameFr;
        sel.appendChild(opt);
    });

    const btnSupp = document.createElement("button");
    btnSupp.className = "admin-btn-danger";
    btnSupp.textContent = "🗑️ " + t("adminSupprimerElement");
    btnSupp.onclick = () => {
        const nom = sel.value;
        if (!nom) return;
        if (!confirm(`${t("adminElementASupprimer")} "${nom}" ?`)) return;
        supprimerElementAdmin(type, nom);
        renderFormulaireSupprimer(type, zone); // refresh
    };

    form.appendChild(label);
    form.appendChild(sel);
    form.appendChild(btnSupp);
    zone.appendChild(form);
}

// =========================
// 📦 IMPORT / EXPORT
// =========================

function renderImportExport(body) {
    const zone = document.createElement("div");
    zone.className = "admin-form";

    // --- Import ---
    const titreImport = document.createElement("div");
    titreImport.className = "admin-sub-title";
    titreImport.textContent = langue === "fr" ? "Importer des fichiers" : "Import files";
    zone.appendChild(titreImport);

    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.id = "adminImportFile";
    inputFile.className = "hidden";
    inputFile.multiple = true;
    inputFile.accept = ".json";
    inputFile.addEventListener("change", (e) => importElements(e));
    zone.appendChild(inputFile);

    const btnImport = document.createElement("button");
    btnImport.className = "admin-btn-ie";
    btnImport.innerHTML = `<span class="admin-ie-emoji">📂</span><span>${langue === "fr" ? "Choisissez vos fichiers" : "Choose your files"}</span>`;
    btnImport.onclick = () => document.getElementById("adminImportFile").click();
    zone.appendChild(btnImport);

    // Séparateur
    const sep = document.createElement("hr");
    sep.className = "hobby-separator";
    zone.appendChild(sep);

    // --- Export ---
    const titreExport = document.createElement("div");
    titreExport.className = "admin-sub-title";
    titreExport.textContent = langue === "fr" ? "Exporter des fichiers" : "Export files";
    zone.appendChild(titreExport);

    const fichiers = [
        { key: "lieux",        label: "lieux.json" },
        { key: "poissons",     label: "poissons.json" },
        { key: "insectes",     label: "insectes.json" },
        { key: "oiseaux",      label: "oiseaux.json" },
        { key: "collectibles", label: "collectibles.json" },
        { key: "ingredients",  label: "ingredients.json" },
        { key: "recettes",     label: "recettes.json" }
    ];

    const checkZone = document.createElement("div");
    checkZone.className = "admin-export-checks";

    fichiers.forEach(({ key, label }) => {
        const lbl = document.createElement("label");
        lbl.className = "admin-export-label";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = true;
        cb.dataset.exportKey = key;
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(" " + label));
        checkZone.appendChild(lbl);
    });

    zone.appendChild(checkZone);

    const btnExport = document.createElement("button");
    btnExport.className = "admin-btn-ie";
    btnExport.innerHTML = `<span class="admin-ie-emoji">📤</span><span>${langue === "fr" ? "Exporter les fichiers" : "Export files"}</span>`;
    btnExport.onclick = () => exportSelectionne(checkZone);
    zone.appendChild(btnExport);

    body.appendChild(zone);
}

function exportSelectionne(checkZone) {
    const checks = checkZone.querySelectorAll("input[type='checkbox']");
    checks.forEach(cb => {
        if (!cb.checked) return;
        const key = cb.dataset.exportKey;
        let data;
        if (key === "lieux")        data = places.map(p => ({ name: p.name, x: Math.round(p.x), y: Math.round(p.y), level: p.level || 1 }));
        else if (key === "poissons") data = poissons;
        else if (key === "insectes") data = insectes;
        else if (key === "oiseaux")  data = oiseaux;
        else if (key === "collectibles") data = collectibles.map(c => ({ name: c.name, type: c.type, color: c.color || "#e67e22", spawns: c.spawns.map(s => ({ x: Math.round(s.x * 100) / 100, y: Math.round(s.y * 100) / 100 })) }));
        else if (key === "ingredients") data = ingredients;
        else if (key === "recettes") data = recettes;
        if (!data) return;
        const blob = new Blob(["\uFEFF" + JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = key === "lieux" ? "lieux.json" : key + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// =========================
// 💾 SAUVEGARDE
// =========================

function sauvegarderElement(type, form, estModification) {
    const get = (id) => {
        const el = form.querySelector(`[data-field="${id}"]`);
        return el ? el.value.trim() : "";
    };
    const getChecked = (name) => {
        return [...form.querySelectorAll(`[data-group="${name}"] input:checked`)].map(cb => cb.value);
    };

    const nomFr = get("nomFr");
    const nomEn = get("nomEn");
    if (!nomFr) { alert(t("adminNomFrLabel") + " manquant"); return; }

    const name = nomEn ? [nomFr, nomEn] : nomFr;

    if (type === "poisson" || type === "insecte" || type === "oiseau") {
        const lieuVal = get("lieu");
        const lieuPlace = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === lieuVal);
        const lieu = lieuPlace && Array.isArray(lieuPlace.name) ? [lieuPlace.name[0], lieuPlace.name[1]] : lieuVal;
        const heures = getChecked("heures");
        const meteos = getChecked("meteos");
        const niveau = parseInt(get("niveau")) || 1;
        const element = { name, lieu, heures, meteos, niveau_hobby: niveau };

        if (estModification) {
            modifierDansTableau(type, adminElementEdite, element);
        } else {
            if (type === "poisson") poissons.push(element);
            else if (type === "insecte") insectes.push(element);
            else oiseaux.push(element);
        }
        localStorage.setItem(type === "poisson" ? "poissons" : type === "insecte" ? "insectes" : "oiseaux",
            JSON.stringify(type === "poisson" ? poissons : type === "insecte" ? insectes : oiseaux));

    } else if (type === "collectible") {
        const typeVal = get("categorie");
        const color = get("couleur");
        if (!typeVal) { alert(t("adminCategorieLabel") + " manquant"); return; }
        if (estModification && adminElementEdite) {
            adminElementEdite.name = name;
            adminElementEdite.type = typeVal;
            adminElementEdite.color = color;
        } else {
            const element = { name, type: typeVal, color, spawns: [] };
            collectibles.push(element);
            // Ouvrir la carte pour placer
            ouvrirCarteAdmin("ajouter", element);
        }
        localStorage.setItem("collectibles", JSON.stringify(collectibles));
        afficherLegende();

    } else if (type === "ingredient") {
        const catFr = get("categorieFr");
        const catEn = get("categorieEn");
        const price = parseInt(get("prix")) || 0;
        const category = catEn ? [catFr, catEn] : catFr;
        const element = { name, category, price };
        if (estModification && adminElementEdite) {
            Object.assign(adminElementEdite, element);
        } else {
            ingredients.push(element);
        }
        localStorage.setItem("ingredients", JSON.stringify(ingredients));

    } else if (type === "recette") {
        const energy = parseInt(get("energy")) || 0;
        const sellPrice = parseInt(get("sellPrice")) || 0;
        const ingredientsSlots = lireSlots(form);
        const element = { name, ingredients: ingredientsSlots, energy, sellPrice };
        if (estModification && adminElementEdite) {
            Object.assign(adminElementEdite, element);
        } else {
            recettes.push(element);
        }
        localStorage.setItem("recettes", JSON.stringify(recettes));
    }

    alert(`✅ ${nomFr} ${estModification ? "modifié" : "sauvegardé"} !`);

    // Refresh si modification
    if (estModification) {
        const sel = document.getElementById(`modifierSelect-${type}`);
        if (sel) {
            const zone = document.getElementById(`modifierFormZone-${type}`);
            if (zone) renderFormulaireModifierRempli(type, adminElementEdite, zone);
        }
    }
}

function modifierDansTableau(type, original, nouveau) {
    const tableau = type === "poisson" ? poissons : type === "insecte" ? insectes : oiseaux;
    const idx = tableau.indexOf(original);
    if (idx !== -1) tableau[idx] = { ...original, ...nouveau };
}

// =========================
// 🗑️ SUPPRIMER
// =========================

function supprimerElementAdmin(type, nom) {
    if (type === "poisson") {
        poissons = poissons.filter(p => (Array.isArray(p.name) ? p.name[0] : p.name) !== nom);
        localStorage.setItem("poissons", JSON.stringify(poissons));
    } else if (type === "insecte") {
        insectes = insectes.filter(i => (Array.isArray(i.name) ? i.name[0] : i.name) !== nom);
        localStorage.setItem("insectes", JSON.stringify(insectes));
    } else if (type === "oiseau") {
        oiseaux = oiseaux.filter(o => (Array.isArray(o.name) ? o.name[0] : o.name) !== nom);
        localStorage.setItem("oiseaux", JSON.stringify(oiseaux));
    } else if (type === "collectible") {
        document.querySelectorAll(".collectible-marker").forEach(el => {
            if (el.dataset.collectibleName === nom) el.remove();
        });
        collectibles = collectibles.filter(c => (Array.isArray(c.name) ? c.name[0] : c.name) !== nom);
        localStorage.setItem("collectibles", JSON.stringify(collectibles));
        afficherLegende();
    } else if (type === "ingredient") {
        ingredients = ingredients.filter(i => (Array.isArray(i.name) ? i.name[0] : i.name) !== nom);
        localStorage.setItem("ingredients", JSON.stringify(ingredients));
    } else if (type === "recette") {
        recettes = recettes.filter(r => (Array.isArray(r.name) ? r.name[0] : r.name) !== nom);
        localStorage.setItem("recettes", JSON.stringify(recettes));
    }
}

// =========================
// 🗺️ CARTE INLINE
// =========================

function ouvrirCarteAdmin(modeAction, collectible) {
    const carteInline = document.getElementById("adminCarteInline");
    if (!carteInline) return;

    currentCollectible = collectible;
    collectiblePlacementMode = modeAction === "ajouter";
    suppressionCollectibleMode = modeAction === "supprimer";

    carteInline.classList.remove("hidden");
    adminCarteVisible = true;

    // Déplacer le map-container dans la carte inline admin
    const wrapper = document.getElementById("admin-map-container-wrapper");
    const mapContainer = document.getElementById("map-container");
    if (mapContainer && wrapper && !wrapper.contains(mapContainer)) {
        wrapper.appendChild(mapContainer);
    }

    // Titre
    const titre = document.getElementById("adminCarteTitre");
    const nom = collectible ? (Array.isArray(collectible.name) ? collectible.name[0] : collectible.name) : "";
    if (titre) titre.textContent = t("adminPositionsCarte") + (nom ? ` — ${nom}` : "");

    // Curseur
    if (mapContainer) mapContainer.style.cursor = "crosshair";

    setTimeout(() => {
        applyTransform();
        updateMarkerVisibility();
        repositionLabels();
        clampLabels();
    }, 50);
}

function fermerCarteAdmin() {
    const carteInline = document.getElementById("adminCarteInline");
    if (carteInline) carteInline.classList.add("hidden");
    collectiblePlacementMode = false;
    suppressionCollectibleMode = false;
    adminCarteVisible = false;

    // Remettre map-container dans mapColumn
    const mapContainer = document.getElementById("map-container");
    const mapColumn = document.getElementById("mapColumn");
    if (mapContainer && mapColumn && !mapColumn.contains(mapContainer)) {
        mapColumn.appendChild(mapContainer);
    }
    if (mapContainer) mapContainer.style.cursor = "crosshair";
}

// =========================
// 🧩 SLOTS INGRÉDIENTS (RECETTES)
// =========================

function renderSlotsIngredients(existingSlots) {
    const wrapper = document.createElement("div");
    wrapper.className = "admin-slots-wrapper";
    wrapper.dataset.field = "slots";

    const titre = document.createElement("div");
    titre.className = "admin-label";
    titre.textContent = t("adminIngredients");
    wrapper.appendChild(titre);

    const slotsContainer = document.createElement("div");
    slotsContainer.className = "admin-slots-container";
    slotsContainer.id = "adminSlotsContainer";
    wrapper.appendChild(slotsContainer);

    const btnRow = document.createElement("div");
    btnRow.className = "admin-slots-btns";

    const btnAdd = document.createElement("button");
    btnAdd.type = "button";
    btnAdd.className = "admin-btn-secondary admin-btn-small";
    btnAdd.textContent = t("adminAjouterSlot");
    btnAdd.onclick = () => ajouterSlot(slotsContainer, []);

    const btnRemove = document.createElement("button");
    btnRemove.type = "button";
    btnRemove.className = "admin-btn-danger admin-btn-small";
    btnRemove.textContent = t("adminRetirerSlot");
    btnRemove.onclick = () => {
        const slots = slotsContainer.querySelectorAll(".admin-slot");
        if (slots.length > 0) slots[slots.length - 1].remove();
    };

    btnRow.appendChild(btnAdd);
    btnRow.appendChild(btnRemove);
    wrapper.appendChild(btnRow);

    // Pré-remplir les slots existants
    if (existingSlots && existingSlots.length > 0) {
        existingSlots.forEach(slot => ajouterSlot(slotsContainer, slot));
    } else {
        // 2 slots par défaut
        ajouterSlot(slotsContainer, []);
        ajouterSlot(slotsContainer, []);
    }

    return wrapper;
}

function ajouterSlot(container, selectedItems) {
    const slotIdx = container.querySelectorAll(".admin-slot").length + 1;
    const slot = document.createElement("div");
    slot.className = "admin-slot";

    const slotLabel = document.createElement("div");
    slotLabel.className = "admin-slot-label";
    slotLabel.textContent = `${t("adminSlot")} ${slotIdx}`;
    slot.appendChild(slotLabel);

    // Multi-select des ingrédients autorisés
    const selectWrapper = document.createElement("div");
    selectWrapper.className = "admin-slot-select-wrapper";

    // Groupes : Ingrédients, Poissons, Collectibles
    const select = document.createElement("select");
    select.className = "admin-slot-select";
    select.multiple = true;
    select.size = 6;

    // Groupe Ingrédients
    buildOptgroup(select, t("adminIngredientsDisponibles"), ingredients.map(i => ({
        value: "ing:" + (Array.isArray(i.name) ? i.name[0] : i.name),
        label: Array.isArray(i.name) ? i.name[li()] : i.name,
        category: Array.isArray(i.category) ? i.category[li()] : i.category
    })), selectedItems);

    // Groupe Poissons
    buildOptgroup(select, t("adminPoissonsDisponibles"), poissons.map(p => ({
        value: "poi:" + (Array.isArray(p.name) ? p.name[0] : p.name),
        label: Array.isArray(p.name) ? p.name[li()] : p.name,
        category: null
    })), selectedItems);

    // Groupe Collectibles
    buildOptgroup(select, t("adminCollectiblesDisponibles"), collectibles.map(c => ({
        value: "col:" + (Array.isArray(c.name) ? c.name[0] : c.name),
        label: Array.isArray(c.name) ? c.name[li()] : c.name,
        category: c.type
    })), selectedItems);

    selectWrapper.appendChild(select);
    slot.appendChild(selectWrapper);

    const hint = document.createElement("div");
    hint.className = "admin-slot-hint";
    hint.textContent = "Ctrl+clic pour sélectionner plusieurs";
    slot.appendChild(hint);

    container.appendChild(slot);
}

function buildOptgroup(select, label, items, selectedItems) {
    // Grouper par catégorie
    const grouped = {};
    items.forEach(item => {
        const cat = item.category || label;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    Object.entries(grouped).forEach(([cat, catItems]) => {
        const og = document.createElement("optgroup");
        og.label = `${label} — ${cat}`;
        catItems.forEach(({ value, label: itemLabel }) => {
            const opt = document.createElement("option");
            opt.value = value;
            opt.textContent = itemLabel;
            if (selectedItems.includes(value)) opt.selected = true;
            og.appendChild(opt);
        });
        select.appendChild(og);
    });
}

function lireSlots(form) {
    const slots = form.querySelectorAll(".admin-slot");
    return [...slots].map(slot => {
        const sel = slot.querySelector(".admin-slot-select");
        if (!sel) return [];
        return [...sel.selectedOptions].map(opt => opt.value);
    });
}

// =========================
// 🧱 HELPERS FORMULAIRE
// =========================

function champTexte(field, label, valeur = "") {
    const div = document.createElement("div");
    div.className = "admin-champ";
    const lbl = document.createElement("label");
    lbl.className = "admin-label";
    lbl.textContent = label;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "admin-input";
    input.value = valeur;
    input.dataset.field = field;
    div.appendChild(lbl);
    div.appendChild(input);
    return div;
}

function champNombre(field, label, min, max, valeur) {
    const div = document.createElement("div");
    div.className = "admin-champ";
    const lbl = document.createElement("label");
    lbl.className = "admin-label";
    lbl.textContent = label;
    const input = document.createElement("input");
    input.type = "number";
    input.className = "admin-input admin-input-number";
    input.min = min;
    input.max = max;
    input.value = valeur;
    input.dataset.field = field;
    div.appendChild(lbl);
    div.appendChild(input);
    return div;
}

function champCouleur(field, label, valeur = "#e67e22") {
    const div = document.createElement("div");
    div.className = "admin-champ";
    const lbl = document.createElement("label");
    lbl.className = "admin-label";
    lbl.textContent = label;
    const input = document.createElement("input");
    input.type = "color";
    input.className = "admin-input admin-input-color";
    input.value = valeur;
    input.dataset.field = field;
    div.appendChild(lbl);
    div.appendChild(input);
    return div;
}

function champSelect(field, label, options, valeurSelectionnee = "") {
    const div = document.createElement("div");
    div.className = "admin-champ";
    const lbl = document.createElement("label");
    lbl.className = "admin-label";
    lbl.textContent = label;
    const sel = document.createElement("select");
    sel.className = "admin-select";
    sel.dataset.field = field;
    options.forEach(({ value, text, disabled }) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = text;
        if (disabled) opt.disabled = true;
        if (value === valeurSelectionnee) opt.selected = true;
        sel.appendChild(opt);
    });
    div.appendChild(lbl);
    div.appendChild(sel);
    return div;
}

function champSelectCategorie(field, label, valeurSelectionnee = "") {
    const div = document.createElement("div");
    div.className = "admin-champ";
    const lbl = document.createElement("label");
    lbl.className = "admin-label";
    lbl.textContent = label;

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.alignItems = "center";

    const sel = document.createElement("select");
    sel.className = "admin-select";
    sel.dataset.field = field;

    // Option nouvelle catégorie
    const optNew = document.createElement("option");
    optNew.value = "__new__";
    optNew.textContent = "➕ " + t("adminNouvelleCategorie");
    sel.appendChild(optNew);

    // Catégories existantes
    const types = [...new Set(collectibles.map(c => c.type))].sort();
    types.forEach(tp => {
        const opt = document.createElement("option");
        opt.value = tp;
        opt.textContent = tp;
        if (tp === valeurSelectionnee) opt.selected = true;
        sel.appendChild(opt);
    });

    const inputNew = document.createElement("input");
    inputNew.type = "text";
    inputNew.className = "admin-input";
    inputNew.placeholder = t("adminNouvelleCategorie") + "...";
    inputNew.dataset.field = field + "_new";
    inputNew.style.display = sel.value === "__new__" ? "" : "none";

    sel.addEventListener("change", () => {
        inputNew.style.display = sel.value === "__new__" ? "" : "none";
        if (sel.value !== "__new__") inputNew.dataset.field = "";
        else inputNew.dataset.field = field + "_new";
    });

    // Surcharge du get pour retourner la bonne valeur
    // On va utiliser un champ hidden
    const hiddenField = document.createElement("input");
    hiddenField.type = "hidden";
    hiddenField.dataset.field = field;
    hiddenField.value = valeurSelectionnee || "";

    sel.addEventListener("change", () => {
        hiddenField.value = sel.value === "__new__" ? inputNew.value : sel.value;
    });
    inputNew.addEventListener("input", () => {
        hiddenField.value = inputNew.value;
    });

    row.appendChild(sel);
    row.appendChild(inputNew);
    div.appendChild(lbl);
    div.appendChild(row);
    div.appendChild(hiddenField);
    return div;
}

function champCheckboxes(field, label, options, toutCoche = false, cochesInitiales = []) {
    const div = document.createElement("div");
    div.className = "admin-champ";
    const lbl = document.createElement("label");
    lbl.className = "admin-label";
    lbl.textContent = label;
    div.appendChild(lbl);
    const group = document.createElement("div");
    group.className = "admin-checkbox-group";
    group.dataset.group = field;
    options.forEach(({ val, label: optLabel }) => {
        const lbEl = document.createElement("label");
        lbEl.className = "admin-checkbox-label";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = val;
        cb.checked = toutCoche || cochesInitiales.includes(val);
        lbEl.appendChild(cb);
        lbEl.appendChild(document.createTextNode(" " + optLabel));
        group.appendChild(lbEl);
    });
    div.appendChild(group);
    return div;
}

// =========================
// 🔧 HELPERS DONNÉES
// =========================

function getDataPourType(type) {
    if (type === "poisson") return poissons;
    if (type === "insecte") return insectes;
    if (type === "oiseau") return oiseaux;
    if (type === "collectible") return collectibles;
    if (type === "ingredient") return ingredients;
    if (type === "recette") return recettes;
    return [];
}

function getLieuxPourType(type) {
    const options = [];

    let generiques = [...lieuxGeneriques];
    if (type === "poisson") generiques = generiques.filter(l => ["Lacs", "Rivières", "Mers"].includes(l));
    else if (type === "insecte") generiques = generiques.filter(l => !["Mers", "Au sommet de la tête de Blanc"].includes(l));

    generiques.forEach(l => options.push({ value: l, text: "🌍 " + l }));
    options.push({ value: "", text: "──────────", disabled: true });

    let lieux = [...places].sort((a, b) => {
        const na = Array.isArray(a.name) ? a.name[0] : a.name;
        const nb = Array.isArray(b.name) ? b.name[0] : b.name;
        return na.localeCompare(nb, "fr");
    });

    if (type === "poisson") {
        const mots = ["lac", "mer", "rivière", "fleuve"];
        lieux = lieux.filter(p => {
            const n = Array.isArray(p.name) ? p.name[0] : p.name;
            return mots.some(mot => new RegExp(`\\b${mot}`, "i").test(n));
        });
    } else if (type === "oiseau") {
        lieux = lieux.filter(p => {
            const n = Array.isArray(p.name) ? p.name[0] : p.name;
            return !["insectes", "Événement : pêche"].some(m => n.includes(m));
        });
    } else if (type === "insecte") {
        lieux = lieux.filter(p => {
            const n = Array.isArray(p.name) ? p.name[0] : p.name;
            return !["mer", "oiseaux"].some(mot => new RegExp(`\\b${mot}`, "i").test(n));
        });
    }

    lieux.forEach(p => {
        const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
        options.push({ value: nameFr, text: nameFr });
    });

    return options;
}

// =========================
// 🔄 MISE À JOUR UI ADMIN
// =========================

function mettreAJourAdminUI() {
    // Re-render les sections ouvertes si admin actif
    if (mode !== "admin") return;
    if (adminSectionActive) {
        const body = document.getElementById(`adminSectionBody-${adminSectionActive}`);
        if (body && !body.classList.contains("hidden")) {
            renderAdminSectionBody(adminSectionActive, body);
        }
    }
    // Mettre à jour les labels des sections
    const sectionLabels = [
        { key: "ajouter", labelKey: "adminSectionAjouter" },
        { key: "modifier", labelKey: "adminSectionModifier" },
        { key: "supprimer", labelKey: "adminSectionSupprimer" },
        { key: "importexport", labelKey: "adminSectionImportExport" }
    ];
    sectionLabels.forEach(({ key, labelKey }) => {
        const header = document.querySelector(`#adminSection-${key} .admin-section-header span`);
        if (header) header.textContent = t(labelKey);
    });
}
