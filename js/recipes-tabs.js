/* =========================
   🍳 RECETTES — ONGLET, LISTE ET ÉNERGIE
   Navigation entre sous-onglets et rendu des sous-onglets "Infos" et "Énergie".
   Les sous-onglets "Profit" et "Calculateur" vivent dans recipes-profit-calc.js.
   ========================= */

/** @type {string} Clé du sous-onglet recettes actif ("liste" | "profit" | "energie" | "calc"). */
let currentRecipeSubTab = "liste";

/**
 * Bascule vers le sous-onglet recettes spécifié et le rend.
 * @param {"liste" | "profit" | "energie" | "calc"} subTab - Identifiant du sous-onglet cible.
 * @returns {void}
 */
function switchRecipeTab(subTab) {
    document.querySelectorAll(".recettes-sub-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn-recettes").forEach(b => b.classList.remove("active"));
    document.getElementById("recipes-sub-" + subTab).classList.add("active");
    document.querySelector(`.tab-btn-recettes[data-sub="${subTab}"]`).classList.add("active");
    currentRecipeSubTab = subTab;
    renderRecipeSubTab(subTab);
}

/**
 * Délègue le rendu du sous-onglet actif à la fonction d'affichage correspondante.
 * @param {"liste" | "profit" | "energie" | "calc"} subTab - Sous-onglet à rendre.
 * @returns {void}
 */
function renderRecipeSubTab(subTab) {
    if (subTab === "liste")        renderRecipeListTab();
    else if (subTab === "profit")  renderProfitTab();
    else if (subTab === "energie") renderEnergyTab();
    else if (subTab === "calc")    renderMasteryCalculator();
}

/**
 * Initialise (ou réinitialise) le DOM de l'onglet recettes :
 * crée la barre de sous-onglets et les zones de contenu, puis rend le sous-onglet actif.
 * @returns {void}
 */
function initRecipeTab() {
    const container = document.getElementById("tab-recipes");
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
        btn.className = "tab-btn-recettes" + (key === currentRecipeSubTab ? " active" : "");
        btn.dataset.sub = key;
        btn.textContent = language === "fr" ? labelFr : labelEn;
        btn.onclick = () => switchRecipeTab(key);
        bar.appendChild(btn);
    });
    container.appendChild(bar);

    subTabs.forEach(({ key }) => {
        const div = document.createElement("div");
        div.className = "recettes-sub-content" + (key === currentRecipeSubTab ? " active" : "");
        div.id = "recipes-sub-" + key;
        container.appendChild(div);
    });

    renderRecipeSubTab(currentRecipeSubTab);
}

/**
 * Rend le sous-onglet "Infos" : liste triée alphabétiquement de toutes les recettes
 * avec leurs détails (énergie, paliers, ingrédients, prix par étoile) en accordéon.
 * Restaure les cartes ouvertes avant le rendu précédent.
 * @returns {void}
 */
function renderRecipeListTab() {
    const zone = document.getElementById("recipes-sub-liste");
    if (!zone) return;
    const openedListe = new Set([...zone.querySelectorAll(".recette-card.opened")].map(c => c.dataset.namefr));
    zone.innerHTML = "";

    if (recipes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${language === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

    const sorted = [...recipes].sort((a, b) => getRecipeName(a).localeCompare(getRecipeName(b), "fr"));
    const listContent = document.createElement("div");

    const barre = createSearchBar(
        language === "fr" ? "Rechercher une recette..." : "Search a recipe...",
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
        nom.textContent = getRecipeName(r);

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
            renderRecipeDetails(r, details);
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
                renderRecipeDetails(r, details);
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
function renderRecipeDetails(r, zone) {
    zone.innerHTML = "";

    const cols = document.createElement("div");
    cols.className = "recette-details-4cols";

    // COL 1 : Énergie
    const colEnergie = document.createElement("div");
    colEnergie.className = "recette-details-col recette-details-col-center";
    const titreEnergie = document.createElement("div");
    titreEnergie.className = "recette-detail-titre";
    titreEnergie.textContent = language === "fr" ? "⚡ Énergie" : "⚡ Energy";
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
    titrePaliers.textContent = language === "fr" ? "Niveaux de cuisine" : "Cooking levels";
    colPaliers.appendChild(titrePaliers);
    if (paliers.some(p => p != null)) {
        paliers.forEach((p, i) => {
            if (p == null) return;
            const row = document.createElement("div");
            row.className = "recette-detail-row";
            row.textContent = `${language === "fr" ? "Palier" : "Tier"} ${i + 1} : ${p} ${language === "fr" ? "plats" : "dishes"}`;
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
    titreIng.textContent = language === "fr" ? "Ingrédients" : "Ingredients";
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
    titrePrix.textContent = language === "fr" ? "Prix de vente" : "Sell price";
    colPrix.appendChild(titrePrix);
    if (r.sellPrice) {
        for (let e = 1; e <= 5; e++) {
            const row = document.createElement("div");
            row.className = "recette-detail-row";
            const prix = sellPriceByStar(r.sellPrice, e);
            row.textContent = `${"⭐".repeat(e)} : ${formatNumber(prix)} 🪙`;
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

/**
 * Rend le sous-onglet "Énergie" : recettes triées par valeur d'énergie décroissante,
 * regroupées par valeur identique avec condensation des noms par préfixe/suffixe.
 * @returns {void}
 */
function renderEnergyTab() {
    const zone = document.getElementById("recipes-sub-energie");
    if (!zone) return;
    zone.innerHTML = "";

    if (recipes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${language === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

    const withEnergy = [...recipes].filter(r => r.energy && r.energy > 0);
    if (withEnergy.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${language === "fr" ? "Aucune recette avec une valeur d'énergie." : "No recipes with an energy value."}</div>`;
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
    const barreEnergie = createSearchBar(
        language === "fr" ? "Rechercher une recette..." : "Search a recipe...",
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
        const recettesGroupe = groups[energie].slice().sort((a, b) => getRecipeName(a).localeCompare(getRecipeName(b), "fr"));
        const noms = recettesGroupe.map(r => getRecipeName(r));
        const groupesNoms = groupByPrefix(noms);
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
