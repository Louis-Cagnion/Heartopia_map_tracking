/* =========================
   🔧 ADMIN — FORMULAIRES CRUD
   Rendu des formulaires ajouter/modifier/supprimer par type, sauvegarde et
   helpers de champs. Les slots d'ingrédients/paliers de recette vivent dans
   admin-recipe-slots.js.
   ========================= */

/**
 * Rend le formulaire de création ou modification pour un type d'élément.
 * Les champs varient selon le type :
 * - faune (poisson/insecte/oiseau) : nom FR/EN, lieu, heures, météo, niveau hobby.
 * - collectible : nom FR/EN, catégorie, couleur, bouton d'ajout de positions sur la carte.
 * - ingrédient : nom FR/EN, catégorie FR/EN, prix.
 * - recette : nom FR/EN, énergie, prix de vente, paliers, slots d'ingrédients.
 * @param {string} type - Type d'élément.
 * @param {HTMLElement} zone - Conteneur DOM dans lequel injecter le formulaire.
 * @param {Object|null} [elementExistant=null] - Élément à pré-remplir en modification
 *   (référence partagée avec `editedAdminElement`), `null` en création.
 * @returns {void}
 */
function renderElementForm(type, zone, elementExistant = null) {
    zone.innerHTML = "";
    const form = document.createElement("div");
    form.className = "admin-form";
    const estModification = elementExistant !== null;
    const nameFr = estModification ? (Array.isArray(elementExistant.name) ? elementExistant.name[0] : elementExistant.name) : "";
    const nameEn = estModification ? (Array.isArray(elementExistant.name) ? elementExistant.name[1] || "" : "") : "";

    if (type === "poisson" || type === "insecte" || type === "oiseau") {
        const lieuFr = estModification ? (Array.isArray(elementExistant.lieu) ? elementExistant.lieu[0] : elementExistant.lieu) : "";
        form.appendChild(textField("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(textField("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(selectField("lieu", t("adminLieu"), getPlacesForType(type), lieuFr));
        form.appendChild(checkboxesField("heures", t("adminHeures"), [
            { val: "matin", label: t("matin") }, { val: "après-midi", label: t("apresMidi") },
            { val: "soir", label: t("soir") }, { val: "nuit", label: t("nuit") }
        ], !estModification, elementExistant ? (elementExistant.heures || []) : []));
        form.appendChild(checkboxesField("meteos", t("adminMeteo"), [
            { val: "soleil", label: "☀️ " + t("meteoSoleil") },
            { val: "pluie", label: "🌧️ " + t("meteoPluie") },
            { val: "arc-en-ciel", label: "🌈 " + t("meteoArc") }
        ], !estModification, elementExistant ? (elementExistant.meteos || []) : []));
        form.appendChild(numberField("niveau", t("adminNiveauHobby"), 1, 10, elementExistant ? (elementExistant.niveau_hobby || 1) : 1));

    } else if (type === "collectible") {
        form.appendChild(textField("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(textField("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(categorySelectField("categorie", t("adminCategorieLabel"), estModification ? (Array.isArray(elementExistant.type) ? elementExistant.type[0] : elementExistant.type) : ""));
        form.appendChild(colorField("couleur", t("adminCouleur"), estModification ? (elementExistant.color || "#e67e22") : "#e67e22"));
        const btnCarte = document.createElement("button");
        btnCarte.className = "admin-btn-secondary";
        if (estModification) {
            btnCarte.textContent = t("adminPositionsCarte") + " (" + (elementExistant.spawns || []).length + ")";
            btnCarte.onclick = () => openAdminMap("modifier", elementExistant, "modifier");
        } else {
            btnCarte.textContent = t("adminAjouterPosition");
            btnCarte.onclick = () => {
                const champ = (id) => form.querySelector("[data-field=\"" + id + "\"]");
                const nomFrVal = champ("nomFr") ? champ("nomFr").value.trim() : "";
                if (!nomFrVal) { alert(t("adminNomFrLabel") + " manquant"); return; }
                const typeVal = champ("categorie") ? champ("categorie").value : "";
                const color = champ("couleur") ? champ("couleur").value : "#e67e22";
                const nomEnVal = champ("nomEn") ? champ("nomEn").value.trim() : "";
                const name = nomEnVal ? [nomFrVal, nomEnVal] : nomFrVal;
                let col = collectibles.find(c => (Array.isArray(c.name) ? c.name[0] : c.name) === nomFrVal);
                if (!col) {
                    col = { name, type: typeVal, color, spawns: [] };
                    TYPE_REGISTRY.collectible.get().push(col);
                    localStorage.setItem(TYPE_REGISTRY.collectible.jsonKey, JSON.stringify(TYPE_REGISTRY.collectible.get()));
                    showLegend();
                }
                openAdminMap("ajouter", col, "ajouter");
            };
        }
        form.appendChild(btnCarte);

    } else if (type === "ingredient") {
        const catFr = estModification ? (Array.isArray(elementExistant.category) ? elementExistant.category[0] : elementExistant.category) : "";
        const catEn = estModification ? (Array.isArray(elementExistant.category) ? elementExistant.category[1] || "" : "") : "";
        form.appendChild(textField("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(textField("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(textField("categorieFr", t("adminCategorieLabel") + " (FR)", catFr));
        form.appendChild(textField("categorieEn", t("adminCategorieLabel") + " (EN)", catEn));
        form.appendChild(numberField("prix", t("adminPrix"), 0, 99999, estModification ? (elementExistant.price || 0) : 0));

    } else if (type === "recette") {
        form.appendChild(textField("nomFr", t("adminNomFrLabel"), nameFr));
        form.appendChild(textField("nomEn", t("adminNomEnLabel"), nameEn));
        form.appendChild(recipeRow3Cols(
            numericTextField("energy", t("adminEnergy"), estModification ? (elementExistant.energy || 0) : 0),
            numericTextField("sellPrice", t("adminSellPrice"), estModification ? (elementExistant.sellPrice || 0) : 0),
            renderTiers(estModification ? (elementExistant.paliers || []) : [])
        ));
        form.appendChild(renderIngredientSlots(estModification ? (elementExistant.ingredients || []) : []));
    }

    const btnSave = document.createElement("button");
    btnSave.className = "admin-btn-primary";
    btnSave.textContent = t("adminSauvegarder");
    btnSave.onclick = () => saveElement(type, form, estModification);
    form.appendChild(btnSave);
    zone.appendChild(form);
}

/**
 * Rend le formulaire de sélection + modification pour un type d'élément.
 * Affiche un `<select>` de tous les éléments existants du type ;
 * au changement, injecte le formulaire pré-rempli via `renderElementForm`.
 * @param {string} type - Type d'élément à modifier.
 * @param {HTMLElement} zone - Conteneur DOM dans lequel injecter le formulaire.
 * @returns {void}
 */
function renderEditForm(type, zone) {
    zone.innerHTML = "";
    const data = getDataForType(type);
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
        editedAdminElement = el;
        renderElementForm(type, formZone, el);
    });
}

/**
 * Rend le formulaire de suppression pour un type d'élément.
 * Pour les collectibles, propose aussi la suppression d'une position individuelle via la carte.
 * @param {string} type - Type d'élément à supprimer.
 * @param {HTMLElement} zone - Conteneur DOM dans lequel injecter le formulaire.
 * @returns {void}
 */
function renderDeleteForm(type, zone) {
    zone.innerHTML = "";
    const data = getDataForType(type);
    if (data.length === 0) { zone.innerHTML = "<div class=\"admin-empty\">" + t("aucunElement") + "</div>"; return; }

    const form = document.createElement("div");
    form.className = "admin-form";

    const labelEl = document.createElement("div");
    labelEl.className = "admin-label";
    labelEl.textContent = t("adminElementASupprimer");
    form.appendChild(labelEl);

    if (type === "collectible") {
        const sel = document.createElement("select");
        sel.className = "admin-select";
        const optVide = document.createElement("option");
        optVide.value = ""; optVide.textContent = t("adminSelectionnerElement");
        sel.appendChild(optVide);
        [...collectibles].sort((a,b)=>{
            const na=Array.isArray(a.name)?a.name[0]:a.name;
            const nb=Array.isArray(b.name)?b.name[0]:b.name;
            return na.localeCompare(nb,"fr");
        }).forEach(el => {
            const opt = document.createElement("option");
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            opt.value = nameFr;
            opt.textContent = nameFr + " (" + (el.spawns||[]).length + " pos.)";
            sel.appendChild(opt);
        });
        form.appendChild(sel);

        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display:flex;gap:8px;";

        const btnSuppC = document.createElement("button");
        btnSuppC.className = "admin-btn-danger";
        btnSuppC.textContent = language === "fr" ? "Supprimer le collectible" : "Delete collectible";
        btnSuppC.onclick = () => {
            const nom = sel.value;
            if (!nom) return;
            if (!confirm((language === "fr" ? "Supprimer" : "Delete") + " \"" + nom + "\" ?")) return;
            deleteAdminElement(type, nom);
            closeAdminMap("supprimer");
            renderDeleteForm(type, zone);
        };

        const btnSuppPos = document.createElement("button");
        btnSuppPos.className = "admin-btn-secondary";
        btnSuppPos.textContent = language === "fr" ? "Supprimer une position" : "Delete a position";
        btnSuppPos.onclick = () => {
            const nom = sel.value;
            if (!nom) return;
            const col = collectibles.find(c => (Array.isArray(c.name)?c.name[0]:c.name) === nom);
            if (!col) return;
            openAdminMap("supprimer", col, "supprimer");
        };

        btnRow.appendChild(btnSuppC);
        btnRow.appendChild(btnSuppPos);
        form.appendChild(btnRow);

    } else {
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
        btnSupp.textContent = t("adminSupprimerElement");
        btnSupp.onclick = () => {
            const nom = sel.value;
            if (!nom) return;
            if (!confirm(t("adminElementASupprimer") + " \"" + nom + "\" ?")) return;
            deleteAdminElement(type, nom);
            closeAdminMap("supprimer");
            renderDeleteForm(type, zone);
        };
        form.appendChild(btnSupp);
    }

    zone.appendChild(form);
}

/**
 * Lit les valeurs du formulaire et sauvegarde l'élément (création ou modification)
 * dans le tableau global correspondant et dans le localStorage.
 * Affiche une alerte de confirmation. En mode création, réinitialise le formulaire.
 * En mode modification, actualise le `<select>` si le nom a changé.
 * @param {string} type - Type d'élément présent dans `TYPE_REGISTRY`.
 * @param {HTMLElement} form - Formulaire DOM dont on lit les champs `[data-field]` et `[data-group]`.
 * @param {boolean} estModification - `true` si on modifie un élément existant, `false` si création.
 *   En modification, `editedAdminElement` est muté en place (⚠️ référence partagée).
 * @returns {void}
 */
function saveElement(type, form, estModification) {
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
        const entry = TYPE_REGISTRY[type];
        if (estModification) updateInArray(type, editedAdminElement, element);
        else entry.get().push(element);
        localStorage.setItem(entry.jsonKey, JSON.stringify(entry.get()));
        localStorage.setItem("collectibles", JSON.stringify(collectibles));
        showLegend();

    } else if (type === "ingredient") {
        const catFr = get("categorieFr"); const catEn = get("categorieEn");
        const element = { name, category: catEn ? [catFr, catEn] : catFr, price: parseInt(get("prix")) || 0 };
        const entry = TYPE_REGISTRY.ingredient;
        if (estModification && editedAdminElement) Object.assign(editedAdminElement, element);
        else entry.get().push(element);
        localStorage.setItem(entry.jsonKey, JSON.stringify(entry.get()));

    } else if (type === "recette") {
        const paliers = readTiers(form);
        const element = { name, ingredients: readSlots(form), energy: parseInt(get("energy")) || 0, sellPrice: parseInt(get("sellPrice")) || 0, paliers };
        const entry = TYPE_REGISTRY.recette;
        if (estModification && editedAdminElement) Object.assign(editedAdminElement, element);
        else entry.get().push(element);
        localStorage.setItem(entry.jsonKey, JSON.stringify(entry.get()));
    }

    const msgFr = estModification ? "modifié" : "sauvegardé";
    const msgEn = estModification ? "modified" : "saved";
    alert("✅ " + nomFr + " " + (language === "fr" ? msgFr : msgEn) + " !");

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
            const nouvNomFr = Array.isArray(editedAdminElement.name) ? editedAdminElement.name[0] : editedAdminElement.name;
            const optExist = [...selMod.options].find(o => o.value === nouvNomFr);
            if (!optExist) {
                const data = getDataForType(type);
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
            renderElementForm(type, zoneForm, editedAdminElement);
        }
    }
}

/**
 * Remplace les propriétés d'un élément existant dans le tableau de faune correspondant.
 * ⚠️ Mute le tableau global en place (`poissons`, `insectes` ou `oiseaux`).
 * @param {"poisson"|"insecte"|"oiseau"} type - Type de faune.
 * @param {Object} original - Référence à l'objet original dans le tableau (trouvé par `indexOf`).
 * @param {Object} nouveau - Nouvelles propriétés à fusionner sur l'original.
 * @returns {void}
 */
function updateInArray(type, original, nouveau) {
    const tableau = TYPE_REGISTRY[type].get();
    const idx = tableau.indexOf(original);
    if (idx !== -1) tableau[idx] = { ...original, ...nouveau };
}

/**
 * Supprime un élément par son nom FR du tableau global correspondant et du localStorage.
 * ⚠️ Mute le tableau global en place.
 * @param {string} type - Type d'élément présent dans `TYPE_REGISTRY`.
 * @param {string} nom - Nom français de l'élément à supprimer.
 * @returns {void}
 */
function deleteAdminElement(type, nom) {
    const entry = TYPE_REGISTRY[type];
    if (!entry) return;
    const filtre = arr => arr.filter(x => (Array.isArray(x.name) ? x.name[0] : x.name) !== nom);
    entry.set(filtre(entry.get()));
    localStorage.setItem(entry.jsonKey, JSON.stringify(entry.get()));
}

/**
 * Retourne le tableau de données global correspondant à un type d'élément.
 * @param {"poisson"|"insecte"|"oiseau"|"collectible"|"ingredient"|"recette"} type
 * @returns {Object[]} Référence directe au tableau global (⚠️ non copié).
 */
function getDataForType(type) {
    const entry = TYPE_REGISTRY[type];
    return entry ? entry.get() : [];
}

/**
 * Retourne la liste des options de lieux disponibles pour un type de faune donné.
 * Filtre les lieux génériques et les lieux spécifiques selon le type (poisson/oiseau/insecte).
 * @param {"poisson"|"insecte"|"oiseau"} type - Type de faune.
 * @returns {Array<{value: string, text: string, disabled?: boolean}>} Options pour un `<select>`.
 */
function getPlacesForType(type) {
    const options = [];
    let generiques = [...genericPlaces];
    if (type === "poisson") generiques = generiques.filter(l => ["Lacs","Rivières","Mers"].includes(l));
    else if (type === "insecte") generiques = generiques.filter(l => !["Mers","Au sommet de la tête de Blanc"].includes(l));
    generiques.forEach(l => options.push({ value: l, text: "🌍 " + l }));
    options.push({ value: "", text: "──────────", disabled: true });
    let lieux = [...places].sort((a,b) => { const na=Array.isArray(a.name)?a.name[0]:a.name; const nb=Array.isArray(b.name)?b.name[0]:b.name; return na.localeCompare(nb,"fr"); });
    if (type === "poisson") lieux = lieux.filter(p => { const n=Array.isArray(p.name)?p.name[0]:p.name; return ["lac","mer","rivière","fleuve"].some(m => new RegExp("\\b"+m,"i").test(n)); });
    else if (type === "oiseau") lieux = lieux.filter(p => { const n=Array.isArray(p.name)?p.name[0]:p.name; return !["insectes","Événement : pêche"].some(m => n.includes(m)); });
    else if (type === "insecte") lieux = lieux.filter(p => { const n=Array.isArray(p.name)?p.name[0]:p.name; return !["mer","oiseaux"].some(m => new RegExp("\\b"+m,"i").test(n)); });
    lieux.forEach(p => { const nameFr=Array.isArray(p.name)?p.name[0]:p.name; options.push({ value: nameFr, text: nameFr }); });
    return options;
}

/* =========================
   🧱 HELPERS CHAMPS FORMULAIRE
   ========================= */

/**
 * Crée un champ texte labelisé pour un formulaire admin.
 * @param {string} field - Valeur de `data-field` sur l'input.
 * @param {string} label - Texte du label.
 * @param {string} [valeur=""] - Valeur initiale.
 * @returns {HTMLDivElement} Conteneur `.admin-champ`.
 */
function textField(field, label, valeur = "") {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const input = document.createElement("input"); input.type = "text"; input.className = "admin-input"; input.value = valeur; input.dataset.field = field;
    div.appendChild(lbl); div.appendChild(input); return div;
}

/**
 * Crée un champ numérique (`<input type="number">`) labelisé.
 * @param {string} field - Valeur de `data-field`.
 * @param {string} label - Texte du label.
 * @param {number} min - Valeur minimale.
 * @param {number} max - Valeur maximale.
 * @param {number} valeur - Valeur initiale.
 * @returns {HTMLDivElement} Conteneur `.admin-champ`.
 */
function numberField(field, label, min, max, valeur) {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const input = document.createElement("input"); input.type = "number"; input.className = "admin-input admin-input-number"; input.min = min; input.max = max; input.value = valeur; input.dataset.field = field;
    div.appendChild(lbl); div.appendChild(input); return div;
}

/**
 * Crée un champ numérique saisie texte (filtre les caractères non numériques à la saisie).
 * Utilisé pour les champs énergie et prix de vente des recettes.
 * @param {string} field - Valeur de `data-field`.
 * @param {string} label - Texte du label.
 * @param {number} [valeur=0] - Valeur initiale.
 * @returns {HTMLDivElement} Conteneur `.admin-champ`.
 */
function numericTextField(field, label, valeur = 0) {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const input = document.createElement("input"); input.type = "text"; input.inputMode = "numeric"; input.pattern = "[0-9]*"; input.className = "admin-input admin-input-number"; input.value = valeur; input.dataset.field = field;
    input.addEventListener("input", () => { input.value = input.value.replace(/[^0-9]/g, ""); });
    div.appendChild(lbl); div.appendChild(input); return div;
}

/**
 * Crée un champ de sélection de couleur (`<input type="color">`).
 * @param {string} field - Valeur de `data-field`.
 * @param {string} label - Texte du label.
 * @param {string} [valeur="#e67e22"] - Couleur initiale en hexadécimal.
 * @returns {HTMLDivElement} Conteneur `.admin-champ`.
 */
function colorField(field, label, valeur = "#e67e22") {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const input = document.createElement("input"); input.type = "color"; input.className = "admin-input admin-input-color"; input.value = valeur; input.dataset.field = field;
    div.appendChild(lbl); div.appendChild(input); return div;
}

/**
 * Crée un `<select>` avec des options prédéfinies.
 * @param {string} field - Valeur de `data-field`.
 * @param {string} label - Texte du label.
 * @param {Array<{value: string, text: string, disabled?: boolean}>} options - Options du select.
 * @param {string} [valeurSelectionnee=""] - Valeur à pré-sélectionner.
 * @returns {HTMLDivElement} Conteneur `.admin-champ`.
 */
function selectField(field, label, options, valeurSelectionnee = "") {
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

/**
 * Crée un select de catégorie pour les collectibles, avec option "Nouvelle catégorie"
 * déclenchant l'affichage d'un champ texte libre. Un `<input type="hidden">` porte la valeur finale.
 * @param {string} field - Valeur de `data-field` sur l'input caché.
 * @param {string} label - Texte du label.
 * @param {string} [valeurSelectionnee=""] - Valeur FR pré-sélectionnée dans le select.
 * @returns {HTMLDivElement} Conteneur `.admin-champ`.
 */
function categorySelectField(field, label, valeurSelectionnee = "") {
    const div = document.createElement("div"); div.className = "admin-champ";
    const lbl = document.createElement("label"); lbl.className = "admin-label"; lbl.textContent = label;
    const row = document.createElement("div"); row.style.cssText = "display:flex;gap:8px;align-items:center;";
    const sel = document.createElement("select"); sel.className = "admin-select";
    const optNew = document.createElement("option"); optNew.value = "__new__"; optNew.textContent = "➕ " + t("adminNouvelleCategorie"); sel.appendChild(optNew);
    const typesMap = {};
    collectibles.forEach(c => {
        const fr = Array.isArray(c.type) ? c.type[0] : c.type;
        const label = Array.isArray(c.type) ? (c.type[li()] || c.type[0]) : c.type;
        typesMap[fr] = label;
    });
    const typesRaw = Object.keys(typesMap).sort();
    typesRaw.forEach(tp => { const opt = document.createElement("option"); opt.value = tp; opt.textContent = typesMap[tp]; if (tp === valeurSelectionnee) opt.selected = true; sel.appendChild(opt); });
    const inputNew = document.createElement("input"); inputNew.type = "text"; inputNew.className = "admin-input"; inputNew.placeholder = t("adminNouvelleCategorie") + "..."; inputNew.style.display = sel.value === "__new__" ? "" : "none";
    const hiddenField = document.createElement("input"); hiddenField.type = "hidden"; hiddenField.dataset.field = field; hiddenField.value = valeurSelectionnee || "";
    sel.addEventListener("change", () => { const isNew = sel.value === "__new__"; inputNew.style.display = isNew ? "" : "none"; hiddenField.value = isNew ? inputNew.value : sel.value; });
    inputNew.addEventListener("input", () => { hiddenField.value = inputNew.value; });
    row.appendChild(sel); row.appendChild(inputNew);
    div.appendChild(lbl); div.appendChild(row); div.appendChild(hiddenField); return div;
}

/**
 * Crée un groupe de cases à cocher labelisées.
 * @param {string} field - Valeur de `data-group` sur le conteneur (utilisé par `getChecked`).
 * @param {string} label - Texte du label du groupe.
 * @param {Array<{val: string, label: string}>} options - Options avec valeur et libellé.
 * @param {boolean} [toutCoche=false] - Si `true`, toutes les cases sont cochées par défaut.
 * @param {string[]} [cochesInitiales=[]] - Valeurs à cocher initialement (prioritaire sur `toutCoche` si non vide).
 * @returns {HTMLDivElement} Conteneur `.admin-champ`.
 */
function checkboxesField(field, label, options, toutCoche = false, cochesInitiales = []) {
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
