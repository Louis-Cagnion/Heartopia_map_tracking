// =========================
// 🍳 ONGLET RECETTES
// =========================

/** @type {string} Clé du sous-onglet recettes actif ("liste" | "profit" | "energie" | "calc"). */
let currentRecettesSubTab = "liste";
/** @type {string} Nom FR de la recette sélectionnée dans le calculateur. */
let calcSelectedRecette = "";
/** @type {string} Valeur brute du champ "déjà cuisiné" dans le calculateur. */
let calcDejaCooked = "0";

// =========================
// 🔢 HELPERS
// =========================

/**
 * Formate un entier avec séparateur de milliers selon la langue courante
 * (espace en FR, virgule en EN).
 * @param {number} n - Nombre entier à formater.
 * @returns {string} Nombre formaté.
 */
function formatNombre(n) {
    if (langue === "fr") return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Retourne le prix unitaire d'un item de slot identifié par sa valeur `type:nomFr`.
 * Pour les sous-recettes (`rec:`), calcule récursivement le coût total de leurs ingrédients.
 * Pour les poissons (`poi:`) et collectibles (`col:`), retourne 0 (pas de prix d'achat).
 * @param {string} valeurSlot - Valeur du slot au format `"type:nomFr"` (ex. `"ing:Lait"`, `"rec:Sauce tomate"`).
 * @returns {number} Prix unitaire en monnaie du jeu (0 si introuvable ou non acheté).
 */
function getPrixIngredient(valeurSlot) {
    const [type, ...rest] = valeurSlot.split(":");
    const nomFr = rest.join(":");
    if (type === "ing") {
        const ing = ingredients.find(i => (Array.isArray(i.name) ? i.name[0] : i.name) === nomFr);
        return ing ? (ing.price || 0) : 0;
    }
    if (type === "poi") return 0;
    if (type === "col") return 0;
    if (type === "rec") {
        const r = recettes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
        if (!r) return 0;
        return prixTotalIngredients(r);
    }
    return 0;
}

/**
 * Retourne le nom affiché (dans la langue courante) d'un item de slot.
 * @param {string} valeurSlot - Valeur du slot au format `"type:nomFr"`.
 * @returns {string} Nom traduit, ou `nomFr` si l'item est introuvable.
 */
function getNomSlotItem(valeurSlot) {
    const [type, ...rest] = valeurSlot.split(":");
    const nomFr = rest.join(":");
    const idx = langIndex[langue];
    if (type === "ing") {
        const ing = ingredients.find(i => (Array.isArray(i.name) ? i.name[0] : i.name) === nomFr);
        return ing ? (Array.isArray(ing.name) ? ing.name[idx] || ing.name[0] : ing.name) : nomFr;
    }
    if (type === "poi") {
        const p = poissons.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === nomFr);
        return p ? (Array.isArray(p.name) ? p.name[idx] || p.name[0] : p.name) : nomFr;
    }
    if (type === "col") {
        const co = collectibles.find(c => (Array.isArray(c.name) ? c.name[0] : c.name) === nomFr);
        return co ? (Array.isArray(co.name) ? co.name[idx] || co.name[0] : co.name) : nomFr;
    }
    if (type === "rec") {
        const r = recettes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
        return r ? (Array.isArray(r.name) ? r.name[idx] || r.name[0] : r.name) : nomFr;
    }
    return nomFr;
}

/**
 * Retourne la catégorie affichée (dans la langue courante) d'un item de slot.
 * Gère un cas particulier pour le magasin de chance de Doris (reformule le libellé).
 * @param {string} valeurSlot - Valeur du slot au format `"type:nomFr"`.
 * @returns {string|null} Catégorie traduite, ou `null` si l'item est introuvable.
 */
function getCategorieSlotItem(valeurSlot) {
    const [type, ...rest] = valeurSlot.split(":");
    const nomFr = rest.join(":");
    const idx = langIndex[langue];
    if (type === "ing") {
        const ing = ingredients.find(i => (Array.isArray(i.name) ? i.name[0] : i.name) === nomFr);
        if (!ing) return null;
        const cat = Array.isArray(ing.category) ? ing.category[idx] || ing.category[0] : ing.category;
        if (cat === "Magasin de chance de Doris") return "Sucres du magasin de chance de Doris";
        if (cat === "Doris's lucky shop") return "Sugars from Doris's lucky shop";
        return cat;
    }
    if (type === "poi") return langue === "fr" ? "Poissons" : "Fish";
    if (type === "col") {
        const co = collectibles.find(c => (Array.isArray(c.name) ? c.name[0] : c.name) === nomFr);
        if (!co) return null;
        return Array.isArray(co.type) ? co.type[idx] || co.type[0] : co.type;
    }
    if (type === "rec") return langue === "fr" ? "Recettes" : "Recipes";
    return null;
}

/**
 * Génère le label d'un slot d'ingrédients :
 * - 1 item → nom exact.
 * - Plusieurs items → regroupement par catégorie : affiche le nom de la catégorie
 *   si ≥ 3 items dans la catégorie ET ≥ 3 items dans le slot, sinon les noms individuels.
 *   Les catégories/noms sont séparés par ` | `.
 * @param {string[]} slotItems - Tableau de valeurs de slot au format `"type:nomFr"`.
 * @returns {string} Label affiché pour le slot.
 */
function labelSlot(slotItems) {
    if (!slotItems || slotItems.length === 0) return "—";
    if (slotItems.length === 1) return getNomSlotItem(slotItems[0]);
    const parCat = {};
    slotItems.forEach(val => {
        const cat = getCategorieSlotItem(val) || "?";
        if (!parCat[cat]) parCat[cat] = [];
        parCat[cat].push(val);
    });
    const parts = [];
    Object.entries(parCat).forEach(([cat, items]) => {
        if (items.length >= 3 && slotItems.length >= 3) {
            parts.push(cat);
        } else {
            items.forEach(v => parts.push(getNomSlotItem(v)));
        }
    });
    return parts.join(" | ");
}

/**
 * Calcule le prix de vente d'un plat selon son nombre d'étoiles.
 * Multiplicateurs : ×1, ×1.5, ×2, ×4, ×8 (étoiles 1 à 5). Résultat arrondi.
 * @param {number} base - Prix de vente à 1 étoile.
 * @param {number} etoile - Nombre d'étoiles (1 à 5).
 * @returns {number} Prix de vente arrondi à l'entier.
 */
function prixVenteEtoile(base, etoile) {
    const mult = [1, 1.5, 2, 4, 8];
    return Math.round(base * mult[etoile - 1]);
}

/**
 * Calcule le coût total minimum des ingrédients d'une recette
 * en prenant le prix le plus bas de chaque slot.
 * @param {{ ingredients: string[][] }} recette - Objet recette avec son tableau de slots.
 * @returns {number} Coût total en monnaie du jeu.
 */
function prixTotalIngredients(recette) {
    if (!recette.ingredients) return 0;
    return recette.ingredients.reduce((total, slot) => {
        if (!slot || slot.length === 0) return total;
        const prixMin = Math.min(...slot.map(v => getPrixIngredient(v)));
        return total + (prixMin === Infinity ? 0 : prixMin);
    }, 0);
}

/**
 * Retourne le nom d'une recette dans la langue courante.
 * @param {{ name: string | [string, string] }} r - Objet recette.
 * @returns {string} Nom traduit.
 */
function getNomRecette(r) {
    const idx = langIndex[langue];
    return Array.isArray(r.name) ? r.name[idx] || r.name[0] : r.name;
}

/**
 * Regroupe une liste de noms par préfixe commun (mots entiers) ou suffixe commun.
 * Exemples :
 * - `["Gâteau roulé rouge", "Gâteau roulé bleu"]` → `[{ label: "Gâteau roulé rouge - bleu", membres: [...] }]`
 * - `["Café", "Café latte"]` → deux groupes séparés (car "Café" n'a pas de mot après lui)
 * @param {string[]} noms - Tableau de noms à regrouper.
 * @returns {Array<{ label: string, membres: string[] }>} Tableau de groupes, chacun avec
 *   un label condensé et la liste des membres originaux.
 */
function grouperParPrefixe(noms) {
    function prefixCommun(a, b) {
        const wa = a.split(" ");
        const wb = b.split(" ");
        let i = 0;
        while (i < wa.length && i < wb.length && wa[i].toLowerCase() === wb[i].toLowerCase()) i++;
        return wa.slice(0, i).join(" ");
    }

    function suffixCommun(a, b) {
        const wa = a.split(" ");
        const wb = b.split(" ");
        let i = 0;
        while (i < wa.length && i < wb.length && wa[wa.length-1-i].toLowerCase() === wb[wb.length-1-i].toLowerCase()) i++;
        if (i === 0) return "";
        return wa.slice(wa.length - i).join(" ");
    }

    function prefixCommuns(liste) {
        if (liste.length === 0) return "";
        let pf = liste[0];
        for (let k = 1; k < liste.length; k++) pf = prefixCommun(pf, liste[k]);
        return pf;
    }

    function suffixCommuns(liste) {
        if (liste.length === 0) return "";
        let sf = liste[0];
        for (let k = 1; k < liste.length; k++) sf = suffixCommun(sf, liste[k]);
        return sf;
    }

    const groupes = [];
    const used = new Array(noms.length).fill(false);

    for (let i = 0; i < noms.length; i++) {
        if (used[i]) continue;
        const membres = [noms[i]];
        const indices = [i];

        // Tenter regroupement par préfixe
        for (let j = i + 1; j < noms.length; j++) {
            if (used[j]) continue;
            const candidats = [...membres, noms[j]];
            const pf = prefixCommuns(candidats);
            if (pf.length === 0) continue;
            const wpf = pf.split(" ").length;
            if (candidats.every(s => s.split(" ").length > wpf)) {
                membres.push(noms[j]);
                indices.push(j);
            }
        }

        // Si rien trouvé par préfixe, tenter par suffixe
        if (membres.length === 1) {
            for (let j = i + 1; j < noms.length; j++) {
                if (used[j]) continue;
                const candidats = [...membres, noms[j]];
                const sf = suffixCommuns(candidats);
                if (sf.length === 0) continue;
                const wsf = sf.split(" ").length;
                if (candidats.every(s => s.split(" ").length > wsf)) {
                    membres.push(noms[j]);
                    indices.push(j);
                }
            }
        }

        indices.forEach(idx => { used[idx] = true; });

        if (membres.length === 1) {
            groupes.push({ label: membres[0], membres });
        } else {
            const pf = prefixCommuns(membres);
            const wpf = pf.length > 0 ? pf.split(" ").length : 0;
            const pfOk = pf.length > 0 && membres.every(s => s.split(" ").length > wpf);

            if (pfOk) {
                const parties = membres.map(s => s.split(" ").slice(wpf).join(" "));
                groupes.push({ label: pf + " " + parties.join(" - "), membres });
            } else {
                const sf = suffixCommuns(membres);
                const wsf = sf.split(" ").length;
                const parties = membres.map(s => s.split(" ").slice(0, s.split(" ").length - wsf).join(" "));
                groupes.push({ label: parties.join(" - ") + " " + sf, membres });
            }
        }
    }
    return groupes;
}

// =========================
// 🔀 SWITCH SOUS-ONGLET
// =========================

/**
 * Bascule vers le sous-onglet recettes spécifié et le rend.
 * @param {"liste" | "profit" | "energie" | "calc"} subTab - Identifiant du sous-onglet cible.
 * @returns {void}
 */
function switchTabRecettes(subTab) {
    document.querySelectorAll(".recettes-sub-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn-recettes").forEach(b => b.classList.remove("active"));
    document.getElementById("recettes-sub-" + subTab).classList.add("active");
    document.querySelector(`.tab-btn-recettes[data-sub="${subTab}"]`).classList.add("active");
    currentRecettesSubTab = subTab;
    renderRecettesSubTab(subTab);
}

/**
 * Délègue le rendu du sous-onglet actif à la fonction d'affichage correspondante.
 * @param {"liste" | "profit" | "energie" | "calc"} subTab - Sous-onglet à rendre.
 * @returns {void}
 */
function renderRecettesSubTab(subTab) {
    if (subTab === "liste")        renderRecettesListe();
    else if (subTab === "profit")  renderRecettesProfit();
    else if (subTab === "energie") renderRecettesEnergie();
    else if (subTab === "calc")    renderRecettesCalc();
}

// =========================
// 🏗️ INIT ONGLET RECETTES
// =========================

/**
 * Initialise (ou réinitialise) le DOM de l'onglet recettes :
 * crée la barre de sous-onglets et les zones de contenu, puis rend le sous-onglet actif.
 * @returns {void}
 */
function initOngletRecettes() {
    const container = document.getElementById("tab-recettes");
    if (!container) return;
    container.innerHTML = "";

    const bar = document.createElement("div");
    bar.id = "tabBarRecettes";
    bar.className = "tabbar-recettes";

    const subTabs = [
        { key: "liste",   labelFr: "📖 Infos",                               labelEn: "📖 Infos" },
        { key: "profit",  labelFr: "💰 Classement de profit",                labelEn: "💰 Profit ranking" },
        { key: "energie", labelFr: "⚡ Classement d'énergie",               labelEn: "⚡ Energy ranking" },
        { key: "calc",    labelFr: "🧮 Calculateur de maîtrise de cuisine",  labelEn: "🧮 Cooking mastery calculator" }
    ];

    subTabs.forEach(({ key, labelFr, labelEn }) => {
        const btn = document.createElement("button");
        btn.className = "tab-btn-recettes" + (key === currentRecettesSubTab ? " active" : "");
        btn.dataset.sub = key;
        btn.textContent = langue === "fr" ? labelFr : labelEn;
        btn.onclick = () => switchTabRecettes(key);
        bar.appendChild(btn);
    });
    container.appendChild(bar);

    subTabs.forEach(({ key }) => {
        const div = document.createElement("div");
        div.className = "recettes-sub-content" + (key === currentRecettesSubTab ? " active" : "");
        div.id = "recettes-sub-" + key;
        container.appendChild(div);
    });

    renderRecettesSubTab(currentRecettesSubTab);
}

// =========================
// 📖 SOUS-ONGLET 1 : LISTE
// =========================

/**
 * Rend le sous-onglet "Infos" : liste triée alphabétiquement de toutes les recettes
 * avec leurs détails (énergie, paliers, ingrédients, prix par étoile) en accordéon.
 * Restaure les cartes ouvertes avant le rendu précédent.
 * @returns {void}
 */
function renderRecettesListe() {
    const zone = document.getElementById("recettes-sub-liste");
    if (!zone) return;
    const openedListe = new Set([...zone.querySelectorAll(".recette-card.opened")].map(c => c.dataset.namefr));
    zone.innerHTML = "";

    if (recettes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${langue === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

    const sorted = [...recettes].sort((a, b) => getNomRecette(a).localeCompare(getNomRecette(b), "fr"));
    const listContent = document.createElement("div");

    const barre = creerBarreRecherche(
        langue === "fr" ? "Rechercher une recette..." : "Search a recipe...",
        (q) => {
            listContent.querySelectorAll(".recette-card").forEach(card => {
                const nom = card.querySelector(".recette-card-nom");
                card.style.display = (nom && matchSearch(nom.textContent, q)) ? "" : "none";
            });
        }
    );
    zone.appendChild(barre);
    zone.appendChild(listContent);

    sorted.forEach(r => {
        const nameFr = Array.isArray(r.name) ? r.name[0] : r.name;

        const card = document.createElement("div");
        card.className = "recette-card";
        card.dataset.namefr = nameFr;

        const header = document.createElement("div");
        header.className = "recette-card-header";

        const nom = document.createElement("span");
        nom.className = "recette-card-nom";
        nom.textContent = getNomRecette(r);

        const arrow = document.createElement("span");
        arrow.className = "recette-card-arrow";
        arrow.textContent = "▶";

        header.appendChild(nom);
        header.appendChild(arrow);
        card.appendChild(header);

        const details = document.createElement("div");
        details.className = "recette-card-details hidden";

        if (openedListe.has(nameFr)) {
            card.classList.add("opened");
            details.classList.remove("hidden");
            arrow.textContent = "▼";
            renderDetailsRecette(r, details);
        }

        header.addEventListener("click", () => {
            const isOpen = !details.classList.contains("hidden");
            zone.querySelectorAll(".recette-card-details").forEach(d => d.classList.add("hidden"));
            zone.querySelectorAll(".recette-card-arrow").forEach(a => { a.textContent = "▶"; });
            zone.querySelectorAll(".recette-card").forEach(c => c.classList.remove("opened"));
            if (!isOpen) {
                details.classList.remove("hidden");
                arrow.textContent = "▼";
                card.classList.add("opened");
                renderDetailsRecette(r, details);
            }
        });

        card.appendChild(details);
        listContent.appendChild(card);
    });
}

/**
 * Injecte dans `zone` les détails d'une recette en 4 colonnes :
 * énergie | paliers de cuisine | ingrédients par slot | prix de vente par étoile.
 * @param {{ name: [string,string], energy: number, paliers: (number|null)[], ingredients: string[][], sellPrice: number }} r - Objet recette.
 * @param {HTMLElement} zone - Conteneur DOM dans lequel injecter le rendu.
 * @returns {void}
 */
function renderDetailsRecette(r, zone) {
    zone.innerHTML = "";

    const cols = document.createElement("div");
    cols.className = "recette-details-4cols";

    // COL 1 : Énergie
    const colEnergie = document.createElement("div");
    colEnergie.className = "recette-details-col recette-details-col-center";
    const titreEnergie = document.createElement("div");
    titreEnergie.className = "recette-detail-titre";
    titreEnergie.textContent = langue === "fr" ? "⚡ Énergie" : "⚡ Energy";
    colEnergie.appendChild(titreEnergie);
    const valEnergie = document.createElement("div");
    valEnergie.className = "recette-detail-row";
    valEnergie.textContent = r.energy || "—";
    colEnergie.appendChild(valEnergie);

    // COL 2 : Paliers
    const colPaliers = document.createElement("div");
    colPaliers.className = "recette-details-col recette-details-col-center";
    const paliers = r.paliers || [];
    const titrePaliers = document.createElement("div");
    titrePaliers.className = "recette-detail-titre";
    titrePaliers.textContent = langue === "fr" ? "Niveaux de cuisine" : "Cooking levels";
    colPaliers.appendChild(titrePaliers);
    if (paliers.some(p => p != null)) {
        paliers.forEach((p, i) => {
            if (p == null) return;
            const row = document.createElement("div");
            row.className = "recette-detail-row";
            row.textContent = `${langue === "fr" ? "Palier" : "Tier"} ${i + 1} : ${p} ${langue === "fr" ? "plats" : "dishes"}`;
            colPaliers.appendChild(row);
        });
    } else {
        const row = document.createElement("div");
        row.className = "recette-detail-row";
        row.textContent = "—";
        colPaliers.appendChild(row);
    }

    // COL 3 : Ingrédients
    const colIng = document.createElement("div");
    colIng.className = "recette-details-col recette-details-col-center";
    const titreIng = document.createElement("div");
    titreIng.className = "recette-detail-titre";
    titreIng.textContent = langue === "fr" ? "Ingrédients" : "Ingredients";
    colIng.appendChild(titreIng);
    if (r.ingredients && r.ingredients.length > 0) {
        r.ingredients.forEach((slot, i) => {
            const row = document.createElement("div");
            row.className = "recette-detail-row";
            row.textContent = `Slot ${i + 1} : ${labelSlot(slot)}`;
            colIng.appendChild(row);
        });
    } else {
        const row = document.createElement("div");
        row.className = "recette-detail-row";
        row.textContent = "—";
        colIng.appendChild(row);
    }

    // COL 4 : Prix par étoile
    const colPrix = document.createElement("div");
    colPrix.className = "recette-details-col recette-details-col-center";
    const titrePrix = document.createElement("div");
    titrePrix.className = "recette-detail-titre";
    titrePrix.textContent = langue === "fr" ? "Prix de vente" : "Sell price";
    colPrix.appendChild(titrePrix);
    if (r.sellPrice) {
        for (let e = 1; e <= 5; e++) {
            const row = document.createElement("div");
            row.className = "recette-detail-row";
            const prix = prixVenteEtoile(r.sellPrice, e);
            row.textContent = `${"⭐".repeat(e)} : ${formatNombre(prix)} 🪙`;
            colPrix.appendChild(row);
        }
    } else {
        const row = document.createElement("div");
        row.className = "recette-detail-row";
        row.textContent = "—";
        colPrix.appendChild(row);
    }

    cols.appendChild(colEnergie);
    cols.appendChild(colPaliers);
    cols.appendChild(colIng);
    cols.appendChild(colPrix);
    zone.appendChild(cols);
}

// =========================
// 💰 SOUS-ONGLET 2 : PROFIT
// =========================

/**
 * Rend le sous-onglet "Profit" : recettes triées par profit décroissant (étoile 1),
 * regroupées quand elles ont le même profit et les mêmes coûts de slots,
 * avec badge profit ×1→×5 étoiles et détail des coûts en accordéon.
 * Restaure les cartes ouvertes avant le rendu précédent.
 * @returns {void}
 */
function renderRecettesProfit() {
    const zone = document.getElementById("recettes-sub-profit");
    if (!zone) return;
    const openedProfit = new Set([...zone.querySelectorAll(".recette-card.opened")].map(c => c.dataset.namefr));
    zone.innerHTML = "";

    if (recettes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${langue === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

    /**
     * @typedef {{
     *   r: Object,
     *   vente: number,
     *   couts: Array<{label: string, prix: number}>,
     *   totalCout: number,
     *   profit: number,
     *   profit1: number,
     *   profit5: number
     * }} RecetteAvecProfit
     */
    /** @type {RecetteAvecProfit[]} */
    const withProfit = recettes.map(r => {
        const vente = r.sellPrice || 0;
        const couts = (r.ingredients || []).map(slot => {
            if (!slot || slot.length === 0) return { label: "—", prix: 0 };
            const prixMin = Math.min(...slot.map(v => getPrixIngredient(v)));
            return { label: labelSlot(slot), prix: prixMin === Infinity ? 0 : prixMin };
        });
        const totalCout = couts.reduce((s, c) => s + c.prix, 0);
        const profit1 = vente - totalCout;
        const profit5 = prixVenteEtoile(vente, 5) - totalCout;
        return { r, vente, couts, totalCout, profit: profit1, profit1, profit5 };
    });

    withProfit.sort((a, b) => b.profit - a.profit);

    // Clé de regroupement : profit | coût total | coûts par slot
    const cle = (item) => item.profit + "|" + item.totalCout + "|" + item.couts.map(c => c.prix).join(",");

    /** @type {Array<{cle: string, items: RecetteAvecProfit[]}>} */
    const profitGroups = [];
    const cleMap = {};
    withProfit.forEach(item => {
        const k = cle(item);
        if (!cleMap[k]) { cleMap[k] = []; profitGroups.push({ cle: k, items: cleMap[k] }); }
        cleMap[k].push(item);
    });

    const profitContent = document.createElement("div");
    const barreProfit = creerBarreRecherche(
        langue === "fr" ? "Rechercher une recette..." : "Search a recipe...",
        (q) => {
            profitContent.querySelectorAll(".recette-card").forEach(card => {
                const nom = card.querySelector(".recette-card-nom");
                card.style.display = (nom && matchSearch(nom.textContent, q)) ? "" : "none";
            });
        }
    );
    zone.appendChild(barreProfit);
    zone.appendChild(profitContent);

    let rankCourant = 1;
    profitGroups.forEach(({ items }) => {
        const noms = items.map(item => getNomRecette(item.r));
        const groupesNoms = grouperParPrefixe(noms);

        groupesNoms.forEach(gn => {
            const membresItems = gn.membres.map(nom => items.find(it => getNomRecette(it.r) === nom)).filter(Boolean);
            const item = membresItems[0];
            const { vente, totalCout, profit1, profit5 } = item;
            // Fusion des labels de slots pour les recettes groupées
            const nbSlots = item.couts.length;
            const couts = [];
            for (let si = 0; si < nbSlots; si++) {
                const labelsSlot = membresItems.map(it => it.couts[si]?.label || "—");
                const prixSlot = item.couts[si]?.prix || 0;
                const groupesLabel = grouperParPrefixe(labelsSlot);
                const labelFinal = groupesLabel.map(g => g.label).join(" | ");
                couts.push({ label: labelFinal, prix: prixSlot });
            }

            const card = document.createElement("div");
            card.className = "recette-card";

            const header = document.createElement("div");
            header.className = "recette-card-header";

            const rang = document.createElement("span");
            rang.className = "recette-rang";
            rang.textContent = "#" + rankCourant;

            const gauche = document.createElement("span");
            gauche.className = "recette-card-nom";
            gauche.textContent = gn.label;

            const p1str = (profit1 >= 0 ? "+" : "") + formatNombre(profit1);
            const p5str = (profit5 >= 0 ? "+" : "") + formatNombre(profit5);
            const droite = document.createElement("span");
            droite.className = "recette-profit-badge" + (profit1 >= 0 ? " profit-positif" : " profit-negatif");
            droite.textContent = `${p1str} → ${p5str} 🪙`;

            const arrow = document.createElement("span");
            arrow.className = "recette-card-arrow";
            arrow.textContent = "▶";

            header.appendChild(rang);
            header.appendChild(gauche);
            header.appendChild(droite);
            header.appendChild(arrow);
            card.appendChild(header);

            const details = document.createElement("div");
            details.className = "recette-card-details hidden";

            const nameFrProfit = membresItems.map(it => Array.isArray(it.r.name) ? it.r.name[0] : it.r.name).sort().join("|");
            card.dataset.namefr = nameFrProfit;

            function renderContenuProfit() {
                details.innerHTML = "";
                const cols = document.createElement("div");
                cols.className = "recette-profit-cols";

                // Colonne vente : prix et profit par étoile
                const colVente = document.createElement("div");
                colVente.className = "recette-profit-col";
                const colHeader = document.createElement("div");
                colHeader.className = "recette-profit-ing-row recette-profit-col-header";
                colHeader.innerHTML = `<span style="text-align:left">${langue === "fr" ? "Étoiles" : "Stars"}</span><span style="text-align:center">${langue === "fr" ? "Prix de vente" : "Sell price"}</span><span style="text-align:right">${langue === "fr" ? "Profit" : "Profit"}</span>`;
                colVente.appendChild(colHeader);
                for (let e = 1; e <= 5; e++) {
                    const prix = prixVenteEtoile(vente, e);
                    const pv = document.createElement("div");
                    pv.className = "recette-profit-ing-row";
                    const profitE = prix - totalCout;
                    const profitStr = (profitE >= 0 ? "+" : "") + formatNombre(profitE);
                    pv.innerHTML = `<span style="text-align:left">${"⭐".repeat(e)}</span><span class="recette-profit-vente" style="text-align:center">${formatNombre(prix)} 🪙</span><span class="${profitE >= 0 ? "profit-positif" : "profit-negatif"}" style="text-align:right;padding:1px 6px;border-radius:8px;font-size:calc(var(--ui-font-size) - 2px)">${profitStr} 🪙</span>`;
                    colVente.appendChild(pv);
                }

                const separateur = document.createElement("div");
                separateur.className = "recette-profit-sep";

                // Colonne coûts
                const colCout = document.createElement("div");
                colCout.className = "recette-profit-col";
                colCout.innerHTML = `<div class="recette-detail-titre">${langue === "fr" ? "Coût des ingrédients" : "Ingredient cost"}</div>`;

                const labelsSlots = couts.map((c, i) => ({ label: `Slot ${i + 1} : ${c.label}`, prix: c.prix }));
                labelsSlots.forEach(({ label, prix }) => {
                    const row = document.createElement("div");
                    row.className = "recette-profit-ing-row";
                    row.innerHTML = `<span>${label}</span><span class="recette-profit-prix-ing">${formatNombre(prix)} 🪙</span>`;
                    colCout.appendChild(row);
                });

                const totalRow = document.createElement("div");
                totalRow.className = "recette-profit-total-row";
                totalRow.innerHTML = `<span>${langue === "fr" ? "Total" : "Total"}</span><span>${formatNombre(totalCout)} 🪙</span>`;
                colCout.appendChild(totalRow);

                cols.appendChild(colVente);
                cols.appendChild(separateur);
                cols.appendChild(colCout);
                details.appendChild(cols);
            }

            if (openedProfit.has(nameFrProfit)) {
                card.classList.add("opened");
                details.classList.remove("hidden");
                arrow.textContent = "▼";
                renderContenuProfit();
            }

            header.addEventListener("click", () => {
                const isOpen = !details.classList.contains("hidden");
                zone.querySelectorAll(".recette-card-details").forEach(d => d.classList.add("hidden"));
                zone.querySelectorAll(".recette-card-arrow").forEach(a => { a.textContent = "▶"; });
                zone.querySelectorAll(".recette-card").forEach(c => c.classList.remove("opened"));
                if (!isOpen) {
                    details.classList.remove("hidden");
                    arrow.textContent = "▼";
                    card.classList.add("opened");
                    renderContenuProfit();
                }
            });

            card.appendChild(details);
            profitContent.appendChild(card);
            rankCourant++;
        });
    });
}

// =========================
// ⚡ SOUS-ONGLET 3 : ÉNERGIE
// =========================

/**
 * Rend le sous-onglet "Énergie" : recettes triées par valeur d'énergie décroissante,
 * regroupées par valeur identique avec condensation des noms par préfixe/suffixe.
 * @returns {void}
 */
function renderRecettesEnergie() {
    const zone = document.getElementById("recettes-sub-energie");
    if (!zone) return;
    zone.innerHTML = "";

    if (recettes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${langue === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

    const withEnergy = [...recettes].filter(r => r.energy && r.energy > 0);
    if (withEnergy.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${langue === "fr" ? "Aucune recette avec une valeur d'énergie." : "No recipes with an energy value."}</div>`;
        return;
    }

    /**
     * Regroupement des recettes par valeur d'énergie.
     * @type {Object.<number, Object[]>}
     */
    const groups = {};
    withEnergy.forEach(r => {
        const e = r.energy;
        if (!groups[e]) groups[e] = [];
        groups[e].push(r);
    });

    const sortedKeys = Object.keys(groups).map(Number).sort((a, b) => b - a);

    const energieContent = document.createElement("div");
    const barreEnergie = creerBarreRecherche(
        langue === "fr" ? "Rechercher une recette..." : "Search a recipe...",
        (q) => {
            energieContent.querySelectorAll(".recette-energie-group").forEach(card => {
                const nom = card.querySelector(".recette-energie-noms");
                card.style.display = (nom && matchSearch(nom.textContent, q)) ? "" : "none";
            });
        }
    );
    zone.appendChild(barreEnergie);
    zone.appendChild(energieContent);

    let rank = 1;
    sortedKeys.forEach(energie => {
        const recettesGroupe = groups[energie].slice().sort((a, b) => getNomRecette(a).localeCompare(getNomRecette(b), "fr"));
        const noms = recettesGroupe.map(r => getNomRecette(r));
        const groupesNoms = grouperParPrefixe(noms);
        const labelFinal = groupesNoms.map(gn => gn.label).join(" | ");

        const card = document.createElement("div");
        card.className = "recette-card recette-energie-group";

        const header = document.createElement("div");
        header.className = "recette-card-header";

        const rang = document.createElement("span");
        rang.className = "recette-rang";
        rang.textContent = "#" + rank;

        const nomSpan = document.createElement("span");
        nomSpan.className = "recette-card-nom recette-energie-noms";
        nomSpan.textContent = labelFinal;

        const badge = document.createElement("span");
        badge.className = "recette-energie-badge";
        badge.textContent = "⚡ " + energie;

        header.appendChild(rang);
        header.appendChild(nomSpan);
        header.appendChild(badge);
        card.appendChild(header);
        energieContent.appendChild(card);

        rank++;
    });
}

// =========================
// 🧮 SOUS-ONGLET 4 : CALCULATEUR DE MAÎTRISE
// =========================

/**
 * Calcule récursivement les ingrédients de base (non-recette) nécessaires
 * pour préparer `multiplicateur` fois une recette donnée.
 * Les sous-recettes sont développées en leurs propres ingrédients de base.
 * Pour chaque slot, choisit l'item avec le prix minimum.
 * @param {{ ingredients: string[][] }} recette - Objet recette à analyser.
 * @param {number} multiplicateur - Nombre de fois qu'on prépare la recette.
 * @returns {Object.<string, { nom: string, prix: number, quantite: number }>}
 *   Dictionnaire `{ nomFr: { nom: string, prix: number, quantite: number } }`
 *   des ingrédients de base agrégés.
 */
function getIngredientsBase(recette, multiplicateur) {
    const totaux = {};
    (recette.ingredients || []).forEach(slot => {
        if (!slot || slot.length === 0) return;
        let bestVal = null;
        let bestPrix = Infinity;
        slot.forEach(v => {
            const p = getPrixIngredient(v);
            if (p < bestPrix) { bestPrix = p; bestVal = v; }
        });
        if (!bestVal) return;

        const [type, ...rest] = bestVal.split(":");
        const nomFr = rest.join(":");

        if (type === "rec") {
            const sousRecette = recettes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
            if (sousRecette) {
                const sub = getIngredientsBase(sousRecette, multiplicateur);
                Object.entries(sub).forEach(([k, v]) => {
                    if (!totaux[k]) totaux[k] = { nom: v.nom, prix: v.prix, quantite: 0 };
                    totaux[k].quantite += v.quantite;
                });
                return;
            }
        }

        const nomAff = getNomSlotItem(bestVal);
        const prix = getPrixIngredient(bestVal);
        if (!totaux[nomFr]) totaux[nomFr] = { nom: nomAff, prix, quantite: 0 };
        totaux[nomFr].quantite += multiplicateur;
    });
    return totaux;
}

/**
 * Rend le sous-onglet "Calculateur de maîtrise" :
 * sélection d'une recette + nombre de plats déjà cuisinés,
 * affichage des 3 paliers en colonnes avec les ingrédients et coûts nécessaires.
 * Restaure la sélection précédente.
 * @returns {void}
 */
function renderRecettesCalc() {
    const zone = document.getElementById("recettes-sub-calc");
    if (!zone) return;
    zone.innerHTML = "";

    if (recettes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${langue === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

    const selWrapper = document.createElement("div");
    selWrapper.className = "recette-calc-sel-wrapper";

    const selLabel = document.createElement("label");
    selLabel.className = "recette-calc-label";
    selLabel.textContent = langue === "fr" ? "Recette :" : "Recipe:";

    const sel = document.createElement("select");
    sel.className = "recette-calc-select";
    const optVide = document.createElement("option");
    optVide.value = "";
    optVide.textContent = langue === "fr" ? "— Choisir une recette —" : "— Choose a recipe —";
    sel.appendChild(optVide);
    [...recettes].sort((a, b) => getNomRecette(a).localeCompare(getNomRecette(b), "fr")).forEach(r => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(r.name) ? r.name[0] : r.name;
        opt.value = nameFr;
        opt.textContent = getNomRecette(r);
        sel.appendChild(opt);
    });
    if (calcSelectedRecette) sel.value = calcSelectedRecette;

    const dejaCuisinéLabel = document.createElement("label");
    dejaCuisinéLabel.className = "recette-calc-label";
    dejaCuisinéLabel.textContent = langue === "fr" ? "Déjà cuisiné :" : "Already cooked:";

    const dejaCuisiné = document.createElement("input");
    dejaCuisiné.type = "text";
    dejaCuisiné.inputMode = "numeric";
    dejaCuisiné.className = "recette-calc-input";
    dejaCuisiné.value = calcDejaCooked;
    dejaCuisiné.addEventListener("keydown", e => { e.stopPropagation(); });
    dejaCuisiné.addEventListener("input", () => {
        dejaCuisiné.value = dejaCuisiné.value.replace(/[^0-9]/g, "");
        calcDejaCooked = dejaCuisiné.value;
        afficherCalcResultat();
    });

    selWrapper.appendChild(selLabel);
    selWrapper.appendChild(sel);
    selWrapper.appendChild(dejaCuisinéLabel);
    selWrapper.appendChild(dejaCuisiné);
    zone.appendChild(selWrapper);

    const resultZone = document.createElement("div");
    resultZone.id = "recette-calc-result";
    zone.appendChild(resultZone);

    if (calcSelectedRecette) afficherCalcResultat();

    sel.addEventListener("change", () => {
        calcSelectedRecette = sel.value;
        afficherCalcResultat();
    });

    /**
     * (Closure) Calcule et affiche dans `#recette-calc-result` les paliers de maîtrise
     * pour la recette sélectionnée, en tenant compte du nombre de plats déjà cuisinés.
     * @returns {void}
     */
    function afficherCalcResultat() {
        const nomFr = sel.value;
        const deja = parseInt(dejaCuisiné.value) || 0;
        const result = document.getElementById("recette-calc-result");
        result.innerHTML = "";

        if (!nomFr) return;

        const r = recettes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
        if (!r) return;

        const paliers = Array.isArray(r.paliers) ? r.paliers : [null, null, null];
        const slots = r.ingredients || [];

        if (!paliers.some(p => p != null)) {
            const msg = document.createElement("div");
            msg.className = "recettes-empty";
            msg.textContent = langue === "fr" ? "Aucun palier défini pour cette recette." : "No cooking levels defined for this recipe.";
            result.appendChild(msg);
            return;
        }

        const paliersGrid = document.createElement("div");
        paliersGrid.className = "recette-calc-paliers-grid";

        paliers.forEach((palier, i) => {
            const bloc = document.createElement("div");

            if (palier == null) {
                bloc.className = "recette-calc-palier-bloc palier-vide";
                paliersGrid.appendChild(bloc);
                return;
            }

            const atteint = deja >= palier;
            const manque = Math.max(0, palier - deja);
            bloc.className = "recette-calc-palier-bloc" + (atteint ? " palier-atteint" : " palier-manquant");

            const titreP = document.createElement("div");
            titreP.className = "recette-calc-palier-titre";
            titreP.innerHTML = `${atteint ? "✅" : "⬜"} ${langue === "fr" ? "Palier" : "Tier"} ${i + 1} — ${palier} ${langue === "fr" ? "plats" : "dishes"}`;
            bloc.appendChild(titreP);

            if (!atteint) {
                const manqueDiv = document.createElement("div");
                manqueDiv.className = "recette-calc-manque";
                manqueDiv.textContent = (langue === "fr" ? "Encore " : "Still ") + manque + (langue === "fr" ? " à cuisiner" : " to cook");
                bloc.appendChild(manqueDiv);
            }

            const palierPrecedent = i === 0 ? 0 : (paliers[i - 1] || 0);
            const nbAPreparer = atteint ? (palier - palierPrecedent) : manque;

            if (slots.length > 0 && nbAPreparer > 0) {
                const ingDiv = document.createElement("div");
                ingDiv.className = "recette-calc-ing-grid";

                let prixTotalPalier = 0;

                slots.forEach((slot, si) => {
                    if (!slot || slot.length === 0) return;
                    const prixMin = Math.min(...slot.map(v => getPrixIngredient(v)));
                    const prixSlot = (prixMin === Infinity ? 0 : prixMin) * nbAPreparer;
                    prixTotalPalier += prixSlot;

                    const row = document.createElement("div");
                    row.className = "recette-calc-ing-row";

                    const nomSlot = document.createElement("span");
                    nomSlot.textContent = `${langue === "fr" ? `Slot ${si + 1}` : `Slot ${si + 1}`}: ${labelSlot(slot)} ×${nbAPreparer}`;

                    const prixSpan = document.createElement("span");
                    prixSpan.className = "recette-calc-ing-prix";
                    prixSpan.textContent = formatNombre(prixSlot) + " 🪙";

                    row.appendChild(nomSlot);
                    row.appendChild(prixSpan);
                    ingDiv.appendChild(row);
                });

                const totaux = getIngredientsBase(r, nbAPreparer);
                const totalIngredients = Object.values(totaux);
                const aDesDoublons = totalIngredients.some(v => v.quantite > nbAPreparer);

                if (aDesDoublons) {
                    const sepDiv = document.createElement("div");
                    sepDiv.className = "recette-calc-ing-sep";
                    sepDiv.textContent = langue === "fr" ? "— Ingrédients totaux —" : "— Total ingredients —";
                    ingDiv.appendChild(sepDiv);

                    totalIngredients.forEach(({ nom, prix, quantite }) => {
                        const row = document.createElement("div");
                        row.className = "recette-calc-ing-row";
                        const nomSpan = document.createElement("span");
                        nomSpan.textContent = `${nom} ×${quantite}`;
                        const prixSpan = document.createElement("span");
                        prixSpan.className = "recette-calc-ing-prix";
                        prixSpan.textContent = formatNombre(prix * quantite) + " 🪙";
                        row.appendChild(nomSpan);
                        row.appendChild(prixSpan);
                        ingDiv.appendChild(row);
                    });
                }

                const totalRow = document.createElement("div");
                totalRow.className = "recette-calc-total-row";
                totalRow.innerHTML = `<span>${langue === "fr" ? "Total coût" : "Total cost"}</span><span>${formatNombre(prixTotalPalier)} 🪙</span>`;
                ingDiv.appendChild(totalRow);

                bloc.appendChild(ingDiv);
            }

            paliersGrid.appendChild(bloc);
        });

        result.appendChild(paliersGrid);
    }
}
