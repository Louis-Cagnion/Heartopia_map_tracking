// =========================
// 🔧 ADMIN UI — NOUVELLE INTERFACE
// =========================

// ---- État local ----
let adminSectionActive = null;
let adminPanneauActif = null;
let adminCarteVisible = false;
let adminCarteSection = null;
let adminModeEdition = false;
let adminElementEdite = null;

const adminTypes = ["poisson", "insecte", "oiseau", "collectible", "ingredient", "recette"];

function initAdminUI() {
    const page = document.getElementById("adminPage");
    if (!page) return;
    renderAdminPage();
}

function creerCarteInline(sectionKey) {
    const carteInline = document.createElement("div");
    carteInline.id = "adminCarteInline-" + sectionKey;
    carteInline.className = "admin-carte-inline hidden";

    const carteHeader = document.createElement("div");
    carteHeader.className = "admin-carte-header";
    const titre = document.createElement("span");
    titre.id = "adminCarteTitre-" + sectionKey;
    titre.textContent = t("adminPositionsCarte");
    const btnFermer = document.createElement("button");
    btnFermer.textContent = "\u2716";
    btnFermer.onclick = () => fermerCarteAdmin(sectionKey);
    carteHeader.appendChild(titre);
    carteHeader.appendChild(btnFermer);

    const wrapper = document.createElement("div");
    wrapper.id = "admin-map-wrapper-" + sectionKey;
    wrapper.className = "admin-map-container-wrapper";

    carteInline.appendChild(carteHeader);
    carteInline.appendChild(wrapper);
    return carteInline;
}

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
        header.innerHTML = "<span>" + t(labelKey) + "</span><span class=\"admin-section-arrow\">\u25ba</span>";
        header.addEventListener("click", () => toggleAdminSection(key));

        const body = document.createElement("div");
        body.className = "admin-section-body hidden";
        body.id = "adminSectionBody-" + key;

        section.appendChild(header);
        section.appendChild(body);
        page.appendChild(section);

        if (avecCarte) page.appendChild(creerCarteInline(key));
    });
}

function toggleAdminSection(key) {
    const body = document.getElementById("adminSectionBody-" + key);
    const arrow = document.querySelector("#adminSection-" + key + " .admin-section-arrow");
    const isOpen = !body.classList.contains("hidden");

    document.querySelectorAll(".admin-section-body").forEach(b => b.classList.add("hidden"));
    document.querySelectorAll(".admin-section-arrow").forEach(a => { a.textContent = "\u25ba"; });
    fermerCarteAdmin();

    if (!isOpen) {
        body.classList.remove("hidden");
        arrow.textContent = "\u25bc";
        adminSectionActive = key;
        renderAdminSectionBody(key, body);
    } else {
        adminSectionActive = null;
        adminPanneauActif = null;
    }
}

function renderAdminSectionBody(key, body) {
    body.innerHTML = "";
    if (key === "ajouter")       renderGrilleTypes(body, "ajouter");
    else if (key === "modifier")  renderGrilleTypes(body, "modifier");
    else if (key === "supprimer") renderGrilleTypes(body, "supprimer");
    else if (key === "importexport") renderImportExport(body);
}

function renderGrilleTypes(body, mode) {
    const grid = document.createElement("div");
    grid.className = "admin-type-grid";

    const types = [
        { key: "poisson",     emoji: "\ud83d\udc1f", label: { fr: "Poisson",     en: "Fish" } },
        { key: "insecte",     emoji: "\ud83d\udc1b", label: { fr: "Insecte",     en: "Insect" } },
        { key: "oiseau",      emoji: "\ud83e\udeb6", label: { fr: "Oiseau",      en: "Bird" } },
        { key: "collectible", emoji: "\ud83c\udf44", label: { fr: "Collectible", en: "Collectible" } },
        { key: "ingredient",  emoji: "\ud83e\udd55", label: { fr: "Ingr\u00e9dient",  en: "Ingredient" } },
        { key: "recette",     emoji: "\ud83d\udcd6", label: { fr: "Recette",     en: "Recipe" } }
    ];

    types.forEach(({ key, emoji, label }) => {
        const btn = document.createElement("div");
        btn.className = "admin-type-btn";
        btn.id = "adminTypeBtn-" + mode + "-" + key;
        const lbl = label[langue] || label.fr;
        btn.innerHTML = "<span class=\"admin-type-emoji\">" + emoji + "</span><span>" + lbl + "</span>";
        btn.addEventListener("click", () => toggleAdminPanneau(mode, key, btn, body));
        grid.appendChild(btn);
    });

    body.appendChild(grid);

    const panneauZone = document.createElement("div");
    panneauZone.className = "admin-panneau-zone";
    panneauZone.id = "adminPanneauZone-" + mode;
    body.appendChild(panneauZone);
}

function toggleAdminPanneau(mode, type, btn, body) {
    const panneauZone = document.getElementById("adminPanneauZone-" + mode);
    const alreadyOpen = btn.classList.contains("active");

    body.querySelectorAll(".admin-type-btn").forEach(b => b.classList.remove("active"));
    panneauZone.innerHTML = "";
    fermerCarteAdmin(mode);

    if (alreadyOpen) { adminPanneauActif = null; return; }

    btn.classList.add("active");
    adminPanneauActif = type;

    if (mode === "ajouter")       renderFormulaireAjouter(type, panneauZone);
    else if (mode === "modifier")  renderFormulaireModifier(type, panneauZone);
    else if (mode === "supprimer") renderFormulaireSupprimer(type, panneauZone);
}

function renderFormulaireAjouter(type, zone) {
    zone.innerHTML = "";
    const form = document.createElement("div");
    form.className = "admin-form";

    if (type === "poisson" || type === "insecte" || type === "oiseau") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel")));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel")));
        form.appendChild(champSelect("lieu", t("adminLieu"), getLieuxPourType(type)));
        form.appendChild(champCheckboxes("heures", t("adminHeures"), [
            { val: "matin", label: t("matin") }, { val: "apr\u00e8s-midi", label: t("apresMidi") },
            { val: "soir", label: t("soir") }, { val: "nuit", label: t("nuit") }
        ], true));
        form.appendChild(champCheckboxes("meteos", t("adminMeteo"), [
            { val: "soleil", label: "\u2600\ufe0f " + t("meteoSoleil") },
            { val: "pluie", label: "\ud83c\udf27\ufe0f " + t("meteoPluie") },
            { val: "arc-en-ciel", label: "\ud83c\udf08 " + t("meteoArc") }
        ], true));
        form.appendChild(champNombre("niveau", t("adminNiveauHobby"), 1, 10, 1));

    } else if (type === "collectible") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel")));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel")));
        form.appendChild(champSelectCategorie("categorie", t("adminCategorieLabel")));
        form.appendChild(champCouleur("couleur", t("adminCouleur"), "#e67e22"));
        const btnCarte = document.createElement("button");
        btnCarte.className = "admin-btn-secondary";
        btnCarte.textContent = t("adminAjouterPosition");
        btnCarte.onclick = () => {
            const nomFr = form.querySelector("[data-field=\"nomFr\"]") ? form.querySelector("[data-field=\"nomFr\"]").value.trim() : "";
            if (!nomFr) { alert(t("adminNomFrLabel") + " manquant"); return; }
            const typeVal = form.querySelector("[data-field=\"categorie\"]") ? form.querySelector("[data-field=\"categorie\"]").value : "";
            const color = form.querySelector("[data-field=\"couleur\"]") ? form.querySelector("[data-field=\"couleur\"]").value : "#e67e22";
            const nomEn = form.querySelector("[data-field=\"nomEn\"]") ? form.querySelector("[data-field=\"nomEn\"]").value.trim() : "";
            const name = nomEn ? [nomFr, nomEn] : nomFr;
            let col = collectibles.find(c => (Array.isArray(c.name) ? c.name[0] : c.name) === nomFr);
            if (!col) {
                col = { name, type: typeVal, color, spawns: [] };
                collectibles.push(col);
                localStorage.setItem("collectibles", JSON.stringify(collectibles));
                afficherLegende();
            }
            ouvrirCarteAdmin("ajouter", col, "ajouter");
        };
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
        form.appendChild(recetteRow3Cols(
            champTexteNombre("energy", t("adminEnergy"), 0),
            champTexteNombre("sellPrice", t("adminSellPrice"), 0),
            renderPaliers([])
        ));
        form.appendChild(renderSlotsIngredients([]));
    }

    const btnSave = document.createElement("button");
    btnSave.className = "admin-btn-primary";
    btnSave.textContent = t("adminSauvegarder");
    btnSave.onclick = () => sauvegarderElement(type, form, false);
    form.appendChild(btnSave);
    zone.appendChild(form);
}

function renderFormulaireModifier(type, zone) {
    zone.innerHTML = "";
    const data = getDataPourType(type);
    if (data.length === 0) { zone.innerHTML = "<div class=\"admin-empty\">" + t("aucunElement") + "</div>"; return; }

    const selectEl = document.createElement("div");
    selectEl.className = "admin-form";
    const label = document.createElement("label");
    label.className = "admin-label";
    label.textContent = t("adminElementAModifier");
    const sel = document.createElement("select");
    sel.className = "admin-select";
    sel.id = "modifierSelect-" + type;
    const optVide = document.createElement("option");
    optVide.value = "";
    optVide.textContent = t("adminSelectionnerElement");
    sel.appendChild(optVide);
    [...data].sort((a,b)=>{
        const na=Array.isArray(a.name)?a.name[0]:a.name;
        const nb=Array.isArray(b.name)?b.name[0]:b.name;
        return na.localeCompare(nb,"fr");
    }).forEach(el => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
        opt.value = nameFr; opt.textContent = nameFr;
        sel.appendChild(opt);
    });
    selectEl.appendChild(label); selectEl.appendChild(sel);
    zone.appendChild(selectEl);

    const formZone = document.createElement("div");
    formZone.id = "modifierFormZone-" + type;
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
            { val: "matin", label: t("matin") }, { val: "apr\u00e8s-midi", label: t("apresMidi") },
            { val: "soir", label: t("soir") }, { val: "nuit", label: t("nuit") }
        ], false, el.heures || []));
        form.appendChild(champCheckboxes("meteos", t("adminMeteo"), [
            { val: "soleil", label: "\u2600\ufe0f " + t("meteoSoleil") },
            { val: "pluie", label: "\ud83c\udf27\ufe0f " + t("meteoPluie") },
            { val: "arc-en-ciel", label: "\ud83c\udf08 " + t("meteoArc") }
        ], false, el.meteos || []));
        form.appendChild(champNombre("niveau", t("adminNiveauHobby"), 1, 10, el.niveau_hobby || 1));

    } else if (type === "collectible") {
        form.appendChild(champTexte("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(champTexte("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(champSelectCategorie("categorie", t("adminCategorieLabel"), el.type));
        form.appendChild(champCouleur("couleur", t("adminCouleur"), el.color || "#e67e22"));
        const btnCarte = document.createElement("button");
        btnCarte.className = "admin-btn-secondary";
        btnCarte.textContent = t("adminPositionsCarte") + " (" + (el.spawns || []).length + ")";
        btnCarte.onclick = () => ouvrirCarteAdmin("modifier", el, "modifier");
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
        form.appendChild(recetteRow3Cols(
            champTexteNombre("energy", t("adminEnergy"), el.energy || 0),
            champTexteNombre("sellPrice", t("adminSellPrice"), el.sellPrice || 0),
            renderPaliers(el.paliers || [])
        ));
        form.appendChild(renderSlotsIngredients(el.ingredients || []));
    }

    const btnSave = document.createElement("button");
    btnSave.className = "admin-btn-primary";
    btnSave.textContent = t("adminSauvegarder");
    btnSave.onclick = () => sauvegarderElement(type, form, true);
    form.appendChild(btnSave);
    zone.appendChild(form);
}

function renderFormulaireSupprimer(type, zone) {
    zone.innerHTML = "";
    const data = getDataPourType(type);
    if (data.length === 0) { zone.innerHTML = "<div class=\"admin-empty\">" + t("aucunElement") + "</div>"; return; }

    const form = document.createElement("div");
    form.className = "admin-form";

    const labelEl = document.createElement("div");
    labelEl.className = "admin-label";
    labelEl.textContent = t("adminElementASupprimer");
    form.appendChild(labelEl);

    const sel = document.createElement("select");
    sel.className = "admin-select";
    const optVide = document.createElement("option");
    optVide.value = "";
    optVide.textContent = t("adminSelectionnerElement");
    sel.appendChild(optVide);
    [...data].sort((a,b)=>{
        const na=Array.isArray(a.name)?a.name[0]:a.name;
        const nb=Array.isArray(b.name)?b.name[0]:b.name;
        return na.localeCompare(nb,"fr");
    }).forEach(el => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
        opt.value = nameFr; opt.textContent = nameFr;
        sel.appendChild(opt);
    });
    form.appendChild(sel);

    const btnSupp = document.createElement("button");
    btnSupp.className = "admin-btn-danger";
    btnSupp.textContent = "\ud83d\uddd1\ufe0f " + t("adminSupprimerElement");
    btnSupp.onclick = () => {
        const nom = sel.value;
        if (!nom) return;
        if (!confirm(t("adminElementASupprimer") + " \"" + nom + "\" ?")) return;
        supprimerElementAdmin(type, nom);
        fermerCarteAdmin("supprimer");
        renderFormulaireSupprimer(type, zone);
    };
    form.appendChild(btnSupp);

    if (type === "collectible") {
        const sep = document.createElement("hr");
        sep.className = "hobby-separator";
        form.appendChild(sep);

        const labelPos = document.createElement("div");
        labelPos.className = "admin-label";
        labelPos.textContent = langue === "fr" ? "G\u00e9rer les positions d'un collectible" : "Manage collectible positions";
        form.appendChild(labelPos);

        const selPos = document.createElement("select");
        selPos.className = "admin-select";
        const optVidePos = document.createElement("option");
        optVidePos.value = "";
        optVidePos.textContent = t("adminSelectionnerElement");
        selPos.appendChild(optVidePos);
        [...collectibles].sort((a,b)=>{
            const na=Array.isArray(a.name)?a.name[0]:a.name;
            const nb=Array.isArray(b.name)?b.name[0]:b.name;
            return na.localeCompare(nb,"fr");
        }).forEach(el => {
            const opt = document.createElement("option");
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            opt.value = nameFr;
            opt.textContent = nameFr + " (" + (el.spawns||[]).length + " pos.)";
            selPos.appendChild(opt);
        });
        form.appendChild(selPos);

        const btnSuppPos = document.createElement("button");
        btnSuppPos.className = "admin-btn-danger";
        btnSuppPos.textContent = "\ud83d\uddfa\ufe0f " + (langue === "fr" ? "Supprimer des positions sur la carte" : "Delete positions on map");
        btnSuppPos.onclick = () => {
            const nom = selPos.value;
            if (!nom) return;
            const col = collectibles.find(c => (Array.isArray(c.name)?c.name[0]:c.name) === nom);
            if (!col) return;
            ouvrirCarteAdmin("supprimer", col, "supprimer");
        };
        form.appendChild(btnSuppPos);
    }

    zone.appendChild(form);
}

function renderImportExport(body) {
    const zone = document.createElement("div");
    zone.className = "admin-form";

    const titreImport = document.createElement("div");
    titreImport.className = "admin-sub-title";
    titreImport.textContent = langue === "fr" ? "Importer des fichiers" : "Import files";
    zone.appendChild(titreImport);

    const inputFile = document.createElement("input");
    inputFile.type = "file"; inputFile.id = "adminImportFile";
    inputFile.className = "hidden"; inputFile.multiple = true; inputFile.accept = ".json";
    inputFile.addEventListener("change", (e) => importElements(e));
    zone.appendChild(inputFile);

    const btnImport = document.createElement("button");
    btnImport.className = "admin-btn-ie";
    btnImport.innerHTML = "<span class=\"admin-ie-emoji\">\ud83d\udcc2</span><span>" + (langue === "fr" ? "Choisissez vos fichiers" : "Choose your files") + "</span>";
    btnImport.onclick = () => document.getElementById("adminImportFile").click();
    zone.appendChild(btnImport);

    const sep = document.createElement("hr");
    sep.className = "hobby-separator";
    zone.appendChild(sep);

    const titreExport = document.createElement("div");
    titreExport.className = "admin-sub-title";
    titreExport.textContent = langue === "fr" ? "Exporter des fichiers" : "Export files";
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
    btnExport.innerHTML = "<span class=\"admin-ie-emoji\">\ud83d\udce4</span><span>" + (langue === "fr" ? "Exporter les fichiers" : "Export files") + "</span>";
    btnExport.onclick = () => exportSelectionne(checkZone);
    zone.appendChild(btnExport);

    body.appendChild(zone);
}

function exportSelectionne(checkZone) {
    checkZone.querySelectorAll("input[type='checkbox']").forEach(cb => {
        if (!cb.checked) return;
        const key = cb.dataset.exportKey;
        let data;
        if (key === "lieux") data = places.map(p => ({ name: p.name, x: Math.round(p.x), y: Math.round(p.y), level: p.level || 1 }));
        else if (key === "poissons") data = poissons;
        else if (key === "insectes") data = insectes;
        else if (key === "oiseaux") data = oiseaux;
        else if (key === "collectibles") data = collectibles.map(c => ({ name: c.name, type: c.type, color: c.color || "#e67e22", spawns: c.spawns.map(s => ({ x: Math.round(s.x*100)/100, y: Math.round(s.y*100)/100 })) }));
        else if (key === "ingredients") data = ingredients;
        else if (key === "recettes") data = recettes;
        if (!data) return;
        const blob = new Blob(["\ufeff" + JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = key + ".json";
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    });
}

function sauvegarderElement(type, form, estModification) {
    const get = (id) => { const el = form.querySelector("[data-field=\"" + id + "\"]"); return el ? el.value.trim() : ""; };
    const getChecked = (name) => [...form.querySelectorAll("[data-group=\"" + name + "\"] input:checked")].map(cb => cb.value);

    const nomFr = get("nomFr");
    const nomEn = get("nomEn");
    if (!nomFr) { alert(t("adminNomFrLabel") + " manquant"); return; }
    const name = nomEn ? [nomFr, nomEn] : nomFr;

    if (type === "poisson" || type === "insecte" || type === "oiseau") {
        const lieuVal = get("lieu");
        const lieuPlace = places.find(p => (Array.isArray(p.name)?p.name[0]:p.name) === lieuVal);
        const lieu = lieuPlace && Array.isArray(lieuPlace.name) ? [lieuPlace.name[0], lieuPlace.name[1]] : lieuVal;
        const element = { name, lieu, heures: getChecked("heures"), meteos: getChecked("meteos"), niveau_hobby: parseInt(get("niveau")) || 1 };
        if (estModification) modifierDansTableau(type, adminElementEdite, element);
        else {
            if (type === "poisson") poissons.push(element);
            else if (type === "insecte") insectes.push(element);
            else oiseaux.push(element);
        }
        const clef = type === "poisson" ? "poissons" : type === "insecte" ? "insectes" : "oiseaux";
        localStorage.setItem(clef, JSON.stringify(type === "poisson" ? poissons : type === "insecte" ? insectes : oiseaux));

    } else if (type === "collectible") {
        const typeVal = get("categorie");
        const color = get("couleur");
        if (!typeVal) { alert(t("adminCategorieLabel") + " manquant"); return; }
        if (estModification && adminElementEdite) {
            adminElementEdite.name = name; adminElementEdite.type = typeVal; adminElementEdite.color = color;
        } else {
            const existing = collectibles.find(c => (Array.isArray(c.name)?c.name[0]:c.name) === nomFr);
            if (!existing) collectibles.push({ name, type: typeVal, color, spawns: [] });
            else { existing.name = name; existing.type = typeVal; existing.color = color; }
        }
        localStorage.setItem("collectibles", JSON.stringify(collectibles));
        afficherLegende();

    } else if (type === "ingredient") {
        const catFr = get("categorieFr"); const catEn = get("categorieEn");
        const element = { name, category: catEn ? [catFr, catEn] : catFr, price: parseInt(get("prix")) || 0 };
        if (estModification && adminElementEdite) Object.assign(adminElementEdite, element);
        else ingredients.push(element);
        localStorage.setItem("ingredients", JSON.stringify(ingredients));

    } else if (type === "recette") {
        const paliers = lirePaliers(form);
        const element = { name, ingredients: lireSlots(form), energy: parseInt(get("energy")) || 0, sellPrice: parseInt(get("sellPrice")) || 0, paliers };
        if (estModification && adminElementEdite) Object.assign(adminElementEdite, element);
        else recettes.push(element);
        localStorage.setItem("recettes", JSON.stringify(recettes));
    }

    const msgFr = estModification ? "modifi\u00e9" : "sauvegard\u00e9";
    const msgEn = estModification ? "modified" : "saved";
    alert("\u2705 " + nomFr + " " + (langue === "fr" ? msgFr : msgEn) + " !");

    if (!estModification) {
        form.querySelectorAll("input[type='text']").forEach(inp => { inp.value = ""; });
        form.querySelectorAll("input[type='number']").forEach(inp => { inp.value = inp.min || 0; });
        form.querySelectorAll("input[type='color']").forEach(inp => { inp.value = "#e67e22"; });
        form.querySelectorAll("input[type='checkbox']").forEach(cb => { cb.checked = true; });
        form.querySelectorAll("select:not([multiple])").forEach(s => { s.selectedIndex = 0; });
        form.querySelectorAll("select[multiple] option").forEach(opt => { opt.selected = false; });
    }
    if (estModification) {
        const selMod = document.getElementById("modifierSelect-" + type);
        const zoneForm = document.getElementById("modifierFormZone-" + type);
        if (selMod && zoneForm) {
            // Actualiser la liste déroulante si le nom a changé
            const nouvNomFr = Array.isArray(adminElementEdite.name) ? adminElementEdite.name[0] : adminElementEdite.name;
            const optExist = [...selMod.options].find(o => o.value === nouvNomFr);
            if (!optExist) {
                // Reconstruire toutes les options
                const data = getDataPourType(type);
                const valeurPrecedente = selMod.value;
                while (selMod.options.length > 1) selMod.remove(1);
                [...data].sort((a, b) => {
                    const na = Array.isArray(a.name) ? a.name[0] : a.name;
                    const nb = Array.isArray(b.name) ? b.name[0] : b.name;
                    return na.localeCompare(nb, "fr");
                }).forEach(el => {
                    const opt = document.createElement("option");
                    const nFr = Array.isArray(el.name) ? el.name[0] : el.name;
                    opt.value = nFr;
                    opt.textContent = nFr;
                    selMod.appendChild(opt);
                });
                selMod.value = nouvNomFr;
            }
            renderFormulaireModifierRempli(type, adminElementEdite, zoneForm);
        }
    }
}

function modifierDansTableau(type, original, nouveau) {
    const tableau = type === "poisson" ? poissons : type === "insecte" ? insectes : oiseaux;
    const idx = tableau.indexOf(original);
    if (idx !== -1) tableau[idx] = { ...original, ...nouveau };
}

function supprimerElementAdmin(type, nom) {
    const filtre = arr => arr.filter(x => (Array.isArray(x.name)?x.name[0]:x.name) !== nom);
    if (type === "poisson") { poissons = filtre(poissons); localStorage.setItem("poissons", JSON.stringify(poissons)); }
    else if (type === "insecte") { insectes = filtre(insectes); localStorage.setItem("insectes", JSON.stringify(insectes)); }
    else if (type === "oiseau") { oiseaux = filtre(oiseaux); localStorage.setItem("oiseaux", JSON.stringify(oiseaux)); }
    else if (type === "collectible") {
        document.querySelectorAll(".collectible-marker").forEach(el => { if (el.dataset.collectibleName === nom) el.remove(); });
        collectibles = filtre(collectibles); localStorage.setItem("collectibles", JSON.stringify(collectibles)); afficherLegende();
    }
    else if (type === "ingredient") { ingredients = filtre(ingredients); localStorage.setItem("ingredients", JSON.stringify(ingredients)); }
    else if (type === "recette") { recettes = filtre(recettes); localStorage.setItem("recettes", JSON.stringify(recettes)); }
}

function ouvrirCarteAdmin(modeAction, collectible, sectionKey) {
    document.querySelectorAll(".admin-carte-inline").forEach(el => el.classList.add("hidden"));
    const carteInline = document.getElementById("adminCarteInline-" + sectionKey);
    if (!carteInline) return;

    currentCollectible = collectible;
    collectiblePlacementMode = (modeAction === "ajouter" || modeAction === "modifier");
    suppressionCollectibleMode = (modeAction === "supprimer");

    carteInline.classList.remove("hidden");
    adminCarteVisible = true; adminCarteSection = sectionKey;

    const wrapper = document.getElementById("admin-map-wrapper-" + sectionKey);
    const mapContainer = document.getElementById("map-container");
    if (mapContainer && wrapper && !wrapper.contains(mapContainer)) wrapper.appendChild(mapContainer);

    const titre = document.getElementById("adminCarteTitre-" + sectionKey);
    const nom = collectible ? (Array.isArray(collectible.name) ? collectible.name[0] : collectible.name) : "";
    if (titre) titre.textContent = t("adminPositionsCarte") + (nom ? " \u2014 " + nom : "");
    if (mapContainer) mapContainer.style.cursor = "crosshair";

    setTimeout(() => {
        applyTransform(); updateMarkerVisibility(); repositionLabels(); clampLabels();
        carteInline.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
}

function fermerCarteAdmin(sectionKey) {
    if (sectionKey) {
        const ci = document.getElementById("adminCarteInline-" + sectionKey);
        if (ci) ci.classList.add("hidden");
    } else {
        document.querySelectorAll(".admin-carte-inline").forEach(el => el.classList.add("hidden"));
    }
    collectiblePlacementMode = false; suppressionCollectibleMode = false; adminCarteVisible = false;
    const mapContainer = document.getElementById("map-container");
    const mapColumn = document.getElementById("mapColumn");
    if (mapContainer && mapColumn && !mapColumn.contains(mapContainer)) mapColumn.appendChild(mapContainer);
    if (mapContainer) mapContainer.style.cursor = "crosshair";
}

function renderSlotsIngredients(existingSlots) {
    const wrapper = document.createElement("div");
    wrapper.className = "admin-slots-wrapper";
    wrapper.dataset.field = "slots";

    const titre = document.createElement("div");
    titre.className = "admin-label";
    titre.textContent = t("adminIngredients");
    wrapper.appendChild(titre);

    const hint = document.createElement("div");
    hint.className = "admin-slot-hint-global";
    hint.textContent = langue === "fr" ? "Ctrl+clic pour s\u00e9lectionner plusieurs ingr\u00e9dients dans les slots" : "Ctrl+click to select multiple ingredients in the slots";
    wrapper.appendChild(hint);

    const slotsContainer = document.createElement("div");
    slotsContainer.className = "admin-slots-container";
    wrapper.appendChild(slotsContainer);

    const btnRow = document.createElement("div");
    btnRow.className = "admin-slots-btns";
    const btnAdd = document.createElement("button");
    btnAdd.type = "button"; btnAdd.className = "admin-btn-secondary admin-btn-small";
    btnAdd.textContent = t("adminAjouterSlot");
    btnAdd.onclick = () => { if (slotsContainer.querySelectorAll(".admin-slot").length >= 4) return; ajouterSlot(slotsContainer, []); mettreAJourNumeroSlots(slotsContainer); };
    const btnRemove = document.createElement("button");
    btnRemove.type = "button"; btnRemove.className = "admin-btn-danger admin-btn-small";
    btnRemove.textContent = t("adminRetirerSlot");
    btnRemove.onclick = () => { const slots = slotsContainer.querySelectorAll(".admin-slot"); if (slots.length <= 2) return; slots[slots.length-1].remove(); mettreAJourNumeroSlots(slotsContainer); };
    btnRow.appendChild(btnAdd); btnRow.appendChild(btnRemove);
    wrapper.appendChild(btnRow);

    if (existingSlots && existingSlots.length > 0) existingSlots.forEach(s => ajouterSlot(slotsContainer, s));
    else { for (let i=0;i<4;i++) ajouterSlot(slotsContainer, []); }

    return wrapper;
}

function mettreAJourNumeroSlots(container) {
    container.querySelectorAll(".admin-slot-label").forEach((lbl, i) => { lbl.textContent = t("adminSlot") + " " + (i+1); });
}

function ajouterSlot(container, selectedItems) {
    const slotIdx = container.querySelectorAll(".admin-slot").length + 1;
    const slot = document.createElement("div");
    slot.className = "admin-slot";

    const slotHeader = document.createElement("div");
    slotHeader.className = "admin-slot-header";
    const slotLabel = document.createElement("div");
    slotLabel.className = "admin-slot-label";
    slotLabel.textContent = t("adminSlot") + " " + slotIdx;
    slotLabel.title = langue === "fr" ? "Maintenir pour d\u00e9placer" : "Hold to drag";
    slotLabel.style.cursor = "grab";

    const btnDup = document.createElement("button");
    btnDup.type = "button"; btnDup.className = "admin-btn-dup";
    btnDup.title = langue === "fr" ? "Dupliquer ce slot" : "Duplicate this slot";
    btnDup.textContent = "\u29c9";
    btnDup.onclick = () => {
        if (container.querySelectorAll(".admin-slot").length >= 4) return;
        const sel = slot.querySelector(".admin-slot-select");
        const selected = sel ? [...sel.selectedOptions].map(o => o.value) : [];
        ajouterSlot(container, selected); mettreAJourNumeroSlots(container);
    };

    slotHeader.appendChild(slotLabel); slotHeader.appendChild(btnDup);
    slot.appendChild(slotHeader);

    const filterRow = document.createElement("div");
    filterRow.className = "admin-slot-filter-row";
    const filterSel = document.createElement("select");
    filterSel.className = "admin-slot-filter-select";
    const allCats = [...new Set([
        ...ingredients.map(i => Array.isArray(i.category) ? i.category[li()] : i.category),
        ...( poissons.length ? [t("adminPoissonsDisponibles")] : [] ),
        ...collectibles.map(co => Array.isArray(co.type) ? co.type[li()] : co.type),
        ...( recettes.length ? [langue === "fr" ? "Recettes" : "Recipes"] : [] )
    ])].sort();
    const optAll = document.createElement("option");
    optAll.value = ""; optAll.textContent = langue === "fr" ? "\u2014 Toutes cat\u00e9gories" : "\u2014 All categories";
    filterSel.appendChild(optAll);
    allCats.forEach(cat => { const opt = document.createElement("option"); opt.value = cat; opt.textContent = cat; filterSel.appendChild(opt); });
    filterRow.appendChild(filterSel);
    slot.appendChild(filterRow);

    const select = document.createElement("select");
    select.className = "admin-slot-select";
    select.multiple = true; select.size = 7;

    const buildAll = (filter) => {
        select.innerHTML = "";
        const allItems = [
            ...ingredients.map(i => ({ value: "ing:" + (Array.isArray(i.name)?i.name[0]:i.name), label: Array.isArray(i.name)?i.name[li()]:i.name, category: Array.isArray(i.category)?i.category[li()]:i.category })),
            ...poissons.map(p => ({ value: "poi:" + (Array.isArray(p.name)?p.name[0]:p.name), label: Array.isArray(p.name)?p.name[li()]:p.name, category: t("adminPoissonsDisponibles") })),
            ...collectibles.map(co => ({ value: "col:" + (Array.isArray(co.name)?co.name[0]:co.name), label: Array.isArray(co.name)?co.name[li()]:co.name, category: Array.isArray(co.type)?co.type[li()]:co.type })),
            ...recettes.map(r => ({ value: "rec:" + (Array.isArray(r.name)?r.name[0]:r.name), label: Array.isArray(r.name)?r.name[li()]:r.name, category: langue === "fr" ? "Recettes" : "Recipes" }))
        ];
        const filtered = filter ? allItems.filter(it => it.category === filter) : allItems;
        buildOptgroup(select, filtered, selectedItems);
    };
    buildAll("");
    filterSel.addEventListener("change", () => buildAll(filterSel.value));
    slot.appendChild(select);

    slotLabel.addEventListener("mousedown", (e) => {
        e.preventDefault();
        slotLabel.style.cursor = "grabbing";
        slot.style.opacity = "0.6";
        const onMove = (ev) => {
            const els = document.elementsFromPoint(ev.clientX, ev.clientY);
            const target = els.find(el => el.classList.contains("admin-slot") && el !== slot);
            if (target) {
                const slots = [...container.querySelectorAll(".admin-slot")];
                if (slots.indexOf(target) > slots.indexOf(slot)) container.insertBefore(slot, target.nextSibling);
                else container.insertBefore(slot, target);
            }
        };
        const onUp = () => {
            slot.style.opacity = "1"; slotLabel.style.cursor = "grab";
            mettreAJourNumeroSlots(container);
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    });

    container.appendChild(slot);
}

function buildOptgroup(select, items, selectedItems) {
    const grouped = {};
    items.forEach(item => { const cat = item.category || "\u2014"; if (!grouped[cat]) grouped[cat]=[]; grouped[cat].push(item); });
    Object.entries(grouped).forEach(([cat, catItems]) => {
        const og = document.createElement("optgroup");
        og.label = cat;
        catItems.forEach(({ value, label }) => {
            const opt = document.createElement("option");
            opt.value = value; opt.textContent = label;
            if (selectedItems && selectedItems.includes(value)) opt.selected = true;
            og.appendChild(opt);
        });
        select.appendChild(og);
    });
}

function lireSlots(form) {
    return [...form.querySelectorAll(".admin-slot")].map(slot => {
        const sel = slot.querySelector(".admin-slot-select");
        return sel ? [...sel.selectedOptions].map(opt => opt.value) : [];
    });
}

// =========================
// 🍳 PALIERS DE CUISINE
// =========================

function recetteRow3Cols(el1, el2, el3) {
    const row = document.createElement("div");
    row.className = "admin-recette-row3";
    row.appendChild(el1);
    row.appendChild(el2);
    row.appendChild(el3);
    return row;
}

function renderPaliers(existingPaliers) {
    // existingPaliers = [p1, p2, p3] — on n'affiche que palier1, les 2 autres sont calculés
    const wrapper = document.createElement("div");
    wrapper.className = "admin-champ";
    wrapper.dataset.field = "paliers";

    const titre = document.createElement("div");
    titre.className = "admin-label";
    titre.textContent = t("adminPaliersLabel");
    wrapper.appendChild(titre);

    // Un seul champ : palier 1 (les paliers 2 et 3 = ×3 et ×6)
    const row = document.createElement("div");
    row.className = "admin-paliers-single-row";

    const lbl = document.createElement("label");
    lbl.className = "admin-label";
    lbl.textContent = t("adminPalier1");

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    input.className = "admin-input admin-input-number";
    input.dataset.field = "palier1";
    const p1val = (existingPaliers && existingPaliers[0] != null) ? existingPaliers[0] : "";
    input.value = p1val;
    input.placeholder = "—";

    const preview = document.createElement("div");
    preview.className = "admin-paliers-preview";

    const updatePreview = () => {
        const p1 = parseInt(input.value);
        if (isNaN(p1) || p1 <= 0) {
            preview.textContent = "";
            return;
        }
        const p2 = p1 * 3;
        const p3 = p1 * 6;
        preview.textContent = langue === "fr"
            ? `→ Palier 2 : ${p2} plats  |  Palier 3 : ${p3} plats`
            : `→ Tier 2: ${p2} dishes  |  Tier 3: ${p3} dishes`;
    };

    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9]/g, "");
        updatePreview();
    });
    updatePreview();

    row.appendChild(lbl);
    row.appendChild(input);
    wrapper.appendChild(row);
    wrapper.appendChild(preview);
    return wrapper;
}

function lirePaliers(form) {
    const input = form.querySelector('[data-field="palier1"]');
    const p1 = input ? parseInt(input.value) : NaN;
    if (isNaN(p1) || p1 <= 0) return [null, null, null];
    return [p1, p1 * 3, p1 * 6];
}

function champTexte(field, label, valeur = "") {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const input = document.createElement("input"); input.type = "text"; input.className = "admin-input"; input.value = valeur; input.dataset.field = field;
    div.appendChild(lbl); div.appendChild(input); return div;
}

function champNombre(field, label, min, max, valeur) {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const input = document.createElement("input"); input.type = "number"; input.className = "admin-input admin-input-number"; input.min = min; input.max = max; input.value = valeur; input.dataset.field = field;
    div.appendChild(lbl); div.appendChild(input); return div;
}

function champTexteNombre(field, label, valeur = 0) {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const input = document.createElement("input"); input.type = "text"; input.inputMode = "numeric"; input.pattern = "[0-9]*"; input.className = "admin-input admin-input-number"; input.value = valeur; input.dataset.field = field;
    input.addEventListener("input", () => { input.value = input.value.replace(/[^0-9]/g, ""); });
    div.appendChild(lbl); div.appendChild(input); return div;
}

function champCouleur(field, label, valeur = "#e67e22") {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const input = document.createElement("input"); input.type = "color"; input.className = "admin-input admin-input-color"; input.value = valeur; input.dataset.field = field;
    div.appendChild(lbl); div.appendChild(input); return div;
}

function champSelect(field, label, options, valeurSelectionnee = "") {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const sel = document.createElement("select"); sel.className = "admin-select"; sel.dataset.field = field;
    options.forEach(({ value, text, disabled }) => {
        const opt = document.createElement("option"); opt.value = value; opt.textContent = text;
        if (disabled) opt.disabled = true; if (value === valeurSelectionnee) opt.selected = true;
        sel.appendChild(opt);
    });
    div.appendChild(lbl); div.appendChild(sel); return div;
}

function champSelectCategorie(field, label, valeurSelectionnee = "") {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const row = document.createElement("div"); row.style.cssText = "display:flex;gap:8px;align-items:center;";
    const sel = document.createElement("select"); sel.className = "admin-select";
    const optNew = document.createElement("option"); optNew.value = "__new__"; optNew.textContent = "\u2795 " + t("adminNouvelleCategorie"); sel.appendChild(optNew);
    const typesRaw = [...new Set(collectibles.map(c => Array.isArray(c.type)?c.type[0]:c.type))].sort();
    typesRaw.forEach(tp => { const opt = document.createElement("option"); opt.value = tp; opt.textContent = tp; if (tp === valeurSelectionnee) opt.selected = true; sel.appendChild(opt); });
    const inputNew = document.createElement("input"); inputNew.type = "text"; inputNew.className = "admin-input"; inputNew.placeholder = t("adminNouvelleCategorie") + "..."; inputNew.style.display = sel.value === "__new__" ? "" : "none";
    const hiddenField = document.createElement("input"); hiddenField.type = "hidden"; hiddenField.dataset.field = field; hiddenField.value = valeurSelectionnee || "";
    sel.addEventListener("change", () => { const isNew = sel.value === "__new__"; inputNew.style.display = isNew ? "" : "none"; hiddenField.value = isNew ? inputNew.value : sel.value; });
    inputNew.addEventListener("input", () => { hiddenField.value = inputNew.value; });
    row.appendChild(sel); row.appendChild(inputNew);
    div.appendChild(lbl); div.appendChild(row); div.appendChild(hiddenField); return div;
}

function champCheckboxes(field, label, options, toutCoche = false, cochesInitiales = []) {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label; div.appendChild(lbl);
    const group = document.createElement("div"); group.className = "admin-checkbox-group"; group.dataset.group = field;
    options.forEach(({ val, label: optLabel }) => {
        const lbEl = document.createElement("label"); lbEl.className = "admin-checkbox-label";
        const cb = document.createElement("input"); cb.type = "checkbox"; cb.value = val; cb.checked = toutCoche || cochesInitiales.includes(val);
        lbEl.appendChild(cb); lbEl.appendChild(document.createTextNode(" " + optLabel)); group.appendChild(lbEl);
    });
    div.appendChild(group); return div;
}

function getDataPourType(type) {
    if (type === "poisson") return poissons; if (type === "insecte") return insectes;
    if (type === "oiseau") return oiseaux; if (type === "collectible") return collectibles;
    if (type === "ingredient") return ingredients; if (type === "recette") return recettes;
    return [];
}

function getLieuxPourType(type) {
    const options = [];
    let generiques = [...lieuxGeneriques];
    if (type === "poisson") generiques = generiques.filter(l => ["Lacs","Rivi\u00e8res","Mers"].includes(l));
    else if (type === "insecte") generiques = generiques.filter(l => !["Mers","Au sommet de la t\u00eate de Blanc"].includes(l));
    generiques.forEach(l => options.push({ value: l, text: "\ud83c\udf0d " + l }));
    options.push({ value: "", text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", disabled: true });
    let lieux = [...places].sort((a,b) => { const na=Array.isArray(a.name)?a.name[0]:a.name; const nb=Array.isArray(b.name)?b.name[0]:b.name; return na.localeCompare(nb,"fr"); });
    if (type === "poisson") lieux = lieux.filter(p => { const n=Array.isArray(p.name)?p.name[0]:p.name; return ["lac","mer","rivi\u00e8re","fleuve"].some(m => new RegExp("\\b"+m,"i").test(n)); });
    else if (type === "oiseau") lieux = lieux.filter(p => { const n=Array.isArray(p.name)?p.name[0]:p.name; return !["insectes","\u00c9v\u00e9nement : p\u00eache"].some(m => n.includes(m)); });
    else if (type === "insecte") lieux = lieux.filter(p => { const n=Array.isArray(p.name)?p.name[0]:p.name; return !["mer","oiseaux"].some(m => new RegExp("\\b"+m,"i").test(n)); });
    lieux.forEach(p => { const nameFr=Array.isArray(p.name)?p.name[0]:p.name; options.push({ value: nameFr, text: nameFr }); });
    return options;
}

function mettreAJourAdminUI() {
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
