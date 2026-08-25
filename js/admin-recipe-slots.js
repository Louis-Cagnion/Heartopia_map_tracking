/* =========================
   🍳 ADMIN — SLOTS D'INGRÉDIENTS ET PALIERS DE CUISINE
   Composants spécifiques au formulaire recette (admin-forms.js).
   ========================= */

/**
 * Crée le composant de gestion des slots d'ingrédients pour le formulaire recette.
 * Contient N slots (2 par défaut ou selon `existingSlots`), chaque slot ayant :
 * un filtre de catégorie, un `<select multiple>` d'items groupés par catégorie,
 * un bouton de duplication et un handle de drag-and-drop pour réordonner les slots.
 * @param {string[][]} existingSlots - Tableau de slots existants (chaque slot = tableau de valeurs `"type:nomFr"`).
 *   Initialise les sélections si fourni ; 4 slots vides sinon.
 * @returns {HTMLDivElement} Wrapper `.admin-slots-wrapper` prêt à être inséré.
 */
function renderIngredientSlots(existingSlots) {
    const wrapper = document.createElement("div");
    wrapper.className = "admin-slots-wrapper";
    wrapper.dataset.field = "slots";

    const titre = document.createElement("div");
    titre.className = "admin-label";
    titre.textContent = t("adminIngredients");
    wrapper.appendChild(titre);

    const hint = document.createElement("div");
    hint.className = "admin-slot-hint-global";
    hint.textContent = language === "fr" ? "Ctrl+clic pour sélectionner plusieurs ingrédients dans les slots" : "Ctrl+click to select multiple ingredients in the slots";
    wrapper.appendChild(hint);

    const slotsContainer = document.createElement("div");
    slotsContainer.className = "admin-slots-container";
    wrapper.appendChild(slotsContainer);

    const btnRow = document.createElement("div");
    btnRow.className = "admin-slots-btns";
    const btnAdd = document.createElement("button");
    btnAdd.type = "button"; btnAdd.className = "admin-btn-secondary admin-btn-small";
    btnAdd.textContent = t("adminAjouterSlot");
    btnAdd.onclick = () => { if (slotsContainer.querySelectorAll(".admin-slot").length >= 4) return; addSlot(slotsContainer, []); updateSlotNumbers(slotsContainer); };
    const btnRemove = document.createElement("button");
    btnRemove.type = "button"; btnRemove.className = "admin-btn-danger admin-btn-small";
    btnRemove.textContent = t("adminRetirerSlot");
    btnRemove.onclick = () => { const slots = slotsContainer.querySelectorAll(".admin-slot"); if (slots.length <= 2) return; slots[slots.length-1].remove(); updateSlotNumbers(slotsContainer); };
    btnRow.appendChild(btnAdd); btnRow.appendChild(btnRemove);
    wrapper.appendChild(btnRow);

    if (existingSlots && existingSlots.length > 0) existingSlots.forEach(s => addSlot(slotsContainer, s));
    else { for (let i=0;i<4;i++) addSlot(slotsContainer, []); }

    return wrapper;
}

/**
 * Met à jour les numéros affichés dans les labels de slot après ajout, suppression ou réordonnancement.
 * @param {HTMLElement} container - Conteneur `.admin-slots-container` contenant les `.admin-slot`.
 * @returns {void}
 */
function updateSlotNumbers(container) {
    container.querySelectorAll(".admin-slot-label").forEach((lbl, i) => { lbl.textContent = t("adminSlot") + " " + (i+1); });
}

/**
 * Crée et ajoute un slot d'ingrédients dans un conteneur de slots.
 * Le slot contient un filtre de catégorie, un `<select multiple>` avec optgroups,
 * un bouton de duplication et un handle de drag-and-drop.
 * @param {HTMLElement} container - Conteneur `.admin-slots-container` dans lequel ajouter le slot.
 * @param {string[]} selectedItems - Valeurs pré-sélectionnées au format `"type:nomFr"`.
 * @returns {void}
 */
function addSlot(container, selectedItems) {
    const slotIdx = container.querySelectorAll(".admin-slot").length + 1;
    const slot = document.createElement("div");
    slot.className = "admin-slot";

    const slotHeader = document.createElement("div");
    slotHeader.className = "admin-slot-header";
    const slotLabel = document.createElement("div");
    slotLabel.className = "admin-slot-label";
    slotLabel.textContent = t("adminSlot") + " " + slotIdx;
    slotLabel.title = language === "fr" ? "Maintenir pour déplacer" : "Hold to drag";
    slotLabel.style.cursor = "grab";

    const btnDup = document.createElement("button");
    btnDup.type = "button"; btnDup.className = "admin-btn-dup";
    btnDup.title = language === "fr" ? "Dupliquer ce slot" : "Duplicate this slot";
    btnDup.textContent = "⧉";
    btnDup.onclick = () => {
        if (container.querySelectorAll(".admin-slot").length >= 4) return;
        const sel = slot.querySelector(".admin-slot-select");
        const selected = sel ? [...sel.selectedOptions].map(o => o.value) : [];
        addSlot(container, selected); updateSlotNumbers(container);
    };

    slotHeader.appendChild(slotLabel); slotHeader.appendChild(btnDup);
    slot.appendChild(slotHeader);

    const filterRow = document.createElement("div");
    filterRow.className = "admin-slot-filter-row";
    const filterSel = document.createElement("select");
    filterSel.className = "admin-slot-filter-select";
    const allCats = [...new Set([
        ...ingredients.map(i => Array.isArray(i.category) ? i.category[li()] : i.category),
        ...( fish.length ? [t("adminPoissonsDisponibles")] : [] ),
        ...collectibles.map(co => Array.isArray(co.type) ? co.type[li()] : co.type),
        ...( recipes.length ? [language === "fr" ? "Recettes" : "Recipes"] : [] )
    ])].sort();
    const optAll = document.createElement("option");
    optAll.value = ""; optAll.textContent = language === "fr" ? "— Toutes catégories" : "— All categories";
    filterSel.appendChild(optAll);
    allCats.forEach(cat => { const opt = document.createElement("option"); opt.value = cat; opt.textContent = cat; filterSel.appendChild(opt); });
    filterRow.appendChild(filterSel);
    slot.appendChild(filterRow);

    const select = document.createElement("select");
    select.className = "admin-slot-select";
    select.multiple = true; select.size = 7;

    /**
     * (Closure) Reconstruit les options du `<select>` multiple selon le filtre de catégorie actif.
     * @param {string} filter - Catégorie à filtrer (chaîne vide = toutes catégories).
     * @returns {void}
     */
    const buildAll = (filter) => {
        select.innerHTML = "";
        const allItems = [
            ...ingredients.map(i => ({ value: "ing:" + (Array.isArray(i.name)?i.name[0]:i.name), label: Array.isArray(i.name)?i.name[li()]:i.name, category: Array.isArray(i.category)?i.category[li()]:i.category })),
            ...fish.map(p => ({ value: "poi:" + (Array.isArray(p.name)?p.name[0]:p.name), label: Array.isArray(p.name)?p.name[li()]:p.name, category: t("adminPoissonsDisponibles") })),
            ...collectibles.map(co => ({ value: "col:" + (Array.isArray(co.name)?co.name[0]:co.name), label: Array.isArray(co.name)?co.name[li()]:co.name, category: Array.isArray(co.type)?co.type[li()]:co.type })),
            ...recipes.map(r => ({ value: "rec:" + (Array.isArray(r.name)?r.name[0]:r.name), label: Array.isArray(r.name)?r.name[li()]:r.name, category: language === "fr" ? "Recettes" : "Recipes" }))
        ];
        const filtered = filter ? allItems.filter(it => it.category === filter) : allItems;
        buildOptgroup(select, filtered, selectedItems);
    };
    buildAll("");
    filterSel.addEventListener("change", () => buildAll(filterSel.value));
    slot.appendChild(select);

    // Drag-and-drop de réordonnancement entre slots
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
            updateSlotNumbers(container);
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    });

    container.appendChild(slot);
}

/**
 * Peuple un `<select>` avec des `<optgroup>` groupés par catégorie,
 * en pré-sélectionnant les items dont la valeur est dans `selectedItems`.
 * @param {HTMLSelectElement} select - Élément `<select>` à remplir.
 * @param {Array<{value: string, label: string, category: string}>} items - Liste d'items à afficher.
 * @param {string[]} selectedItems - Valeurs à pré-sélectionner.
 * @returns {void}
 */
function buildOptgroup(select, items, selectedItems) {
    const grouped = {};
    items.forEach(item => { const cat = item.category || "—"; if (!grouped[cat]) grouped[cat]=[]; grouped[cat].push(item); });
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

/**
 * Lit les sélections de tous les slots d'ingrédients dans un formulaire.
 * @param {HTMLElement} form - Formulaire contenant des éléments `.admin-slot`.
 * @returns {string[][]} Tableau de slots, chaque slot étant un tableau de valeurs `"type:nomFr"`.
 */
function readSlots(form) {
    return [...form.querySelectorAll(".admin-slot")].map(slot => {
        const sel = slot.querySelector(".admin-slot-select");
        return sel ? [...sel.selectedOptions].map(opt => opt.value) : [];
    });
}

/**
 * Crée un conteneur flex 3 colonnes pour les champs énergie, prix de vente et paliers d'une recette.
 * @param {HTMLElement} el1 - Premier élément (énergie).
 * @param {HTMLElement} el2 - Deuxième élément (prix de vente).
 * @param {HTMLElement} el3 - Troisième élément (paliers).
 * @returns {HTMLDivElement} Conteneur `.admin-recette-row3`.
 */
function recipeRow3Cols(el1, el2, el3) {
    const row = document.createElement("div");
    row.className = "admin-recette-row3";
    row.appendChild(el1);
    row.appendChild(el2);
    row.appendChild(el3);
    return row;
}

/**
 * Crée le champ de saisie du palier 1 avec prévisualisation automatique des paliers 2 et 3
 * (×3 et ×6 du palier 1). Initialise la valeur si des paliers existants sont fournis.
 * @param {(number|null)[]} existingPaliers - Tableau de 3 valeurs `[p1, p2, p3]` (peut contenir `null`).
 * @returns {HTMLDivElement} Conteneur `.admin-champ` avec le champ et la prévisualisation.
 */
function renderTiers(existingPaliers) {
    const wrapper = document.createElement("div");
    wrapper.className = "admin-champ";
    wrapper.dataset.field = "paliers";

    const titre = document.createElement("div");
    titre.className = "admin-label";
    titre.textContent = t("adminPaliersLabel");
    wrapper.appendChild(titre);

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
        preview.textContent = language === "fr"
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

/**
 * Lit la valeur du palier 1 dans un formulaire et calcule les 3 paliers.
 * @param {HTMLElement} form - Formulaire contenant `[data-field="palier1"]`.
 * @returns {[number|null, number|null, number|null]} Tableau `[p1, p2=p1*3, p3=p1*6]`,
 *   ou `[null, null, null]` si la valeur est absente ou invalide.
 */
function readTiers(form) {
    const input = form.querySelector('[data-field="palier1"]');
    const p1 = input ? parseInt(input.value) : NaN;
    if (isNaN(p1) || p1 <= 0) return [null, null, null];
    return [p1, p1 * 3, p1 * 6];
}
