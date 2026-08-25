/* =========================
   💰🧮 RECETTES — PROFIT ET CALCULATEUR DE MAÎTRISE
   Sous-onglets les plus lourds : classement de profit et calculateur de paliers.
   ========================= */

/** @type {string} Nom FR de la recette sélectionnée dans le calculateur. */
let calcSelectedRecipe = "";
/** @type {string} Valeur brute du champ "déjà cuisiné" dans le calculateur. */
let calcAlreadyCooked = "0";

/**
 * Rend le sous-onglet "Profit" : recettes triées par profit décroissant (étoile 1),
 * regroupées quand elles ont le même profit et les mêmes coûts de slots,
 * avec badge profit ×1→×5 étoiles et détail des coûts en accordéon.
 * Restaure les cartes ouvertes avant le rendu précédent.
 * @returns {void}
 */
function renderProfitTab() {
    const zone = document.getElementById("recipes-sub-profit");
    if (!zone) return;
    const openedProfit = new Set([...zone.querySelectorAll(".recette-card.opened")].map(c => c.dataset.namefr));
    zone.innerHTML = "";

    if (recipes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${language === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
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
    const withProfit = recipes.map(r => {
        const vente = r.sellPrice || 0;
        const couts = (r.ingredients || []).map(slot => {
            if (!slot || slot.length === 0) return { label: "—", prix: 0 };
            const prixMin = Math.min(...slot.map(v => getIngredientPrice(v)));
            return { label: labelSlot(slot), prix: prixMin === Infinity ? 0 : prixMin };
        });
        const totalCout = couts.reduce((s, c) => s + c.prix, 0);
        const profit1 = vente - totalCout;
        const profit5 = sellPriceByStar(vente, 5) - totalCout;
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
    const barreProfit = createSearchBar(
        language === "fr" ? "Rechercher une recette..." : "Search a recipe...",
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
        const noms = items.map(item => getRecipeName(item.r));
        const groupesNoms = groupByPrefix(noms);

        groupesNoms.forEach(gn => {
            const membresItems = gn.membres.map(nom => items.find(it => getRecipeName(it.r) === nom)).filter(Boolean);
            const item = membresItems[0];
            const { vente, totalCout, profit1, profit5 } = item;
            // Fusion des labels de slots pour les recettes groupées
            const nbSlots = item.couts.length;
            const couts = [];
            for (let si = 0; si < nbSlots; si++) {
                const labelsSlot = membresItems.map(it => it.couts[si]?.label || "—");
                const prixSlot = item.couts[si]?.prix || 0;
                const groupesLabel = groupByPrefix(labelsSlot);
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

            const p1str = (profit1 >= 0 ? "+" : "") + formatNumber(profit1);
            const p5str = (profit5 >= 0 ? "+" : "") + formatNumber(profit5);
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
                colHeader.innerHTML = `<span style="text-align:left">${language === "fr" ? "Étoiles" : "Stars"}</span><span style="text-align:center">${language === "fr" ? "Prix de vente" : "Sell price"}</span><span style="text-align:right">${language === "fr" ? "Profit" : "Profit"}</span>`;
                colVente.appendChild(colHeader);
                for (let e = 1; e <= 5; e++) {
                    const prix = sellPriceByStar(vente, e);
                    const pv = document.createElement("div");
                    pv.className = "recette-profit-ing-row";
                    const profitE = prix - totalCout;
                    const profitStr = (profitE >= 0 ? "+" : "") + formatNumber(profitE);
                    pv.innerHTML = `<span style="text-align:left">${"⭐".repeat(e)}</span><span class="recette-profit-vente" style="text-align:center">${formatNumber(prix)} 🪙</span><span class="${profitE >= 0 ? "profit-positif" : "profit-negatif"}" style="text-align:right;padding:1px 6px;border-radius:8px;font-size:calc(var(--ui-font-size) - 2px)">${profitStr} 🪙</span>`;
                    colVente.appendChild(pv);
                }

                const separateur = document.createElement("div");
                separateur.className = "recette-profit-sep";

                // Colonne coûts
                const colCout = document.createElement("div");
                colCout.className = "recette-profit-col";
                colCout.innerHTML = `<div class="recette-detail-titre">${language === "fr" ? "Coût des ingrédients" : "Ingredient cost"}</div>`;

                const labelsSlots = couts.map((c, i) => ({ label: `Slot ${i + 1} : ${c.label}`, prix: c.prix }));
                labelsSlots.forEach(({ label, prix }) => {
                    const row = document.createElement("div");
                    row.className = "recette-profit-ing-row";
                    const labelSpan = document.createElement("span");
                    labelSpan.textContent = label;
                    const prixSpan = document.createElement("span");
                    prixSpan.className = "recette-profit-prix-ing";
                    prixSpan.textContent = formatNumber(prix) + " 🪙";
                    row.appendChild(labelSpan);
                    row.appendChild(prixSpan);
                    colCout.appendChild(row);
                });

                const totalRow = document.createElement("div");
                totalRow.className = "recette-profit-total-row";
                totalRow.innerHTML = `<span>${language === "fr" ? "Total" : "Total"}</span><span>${formatNumber(totalCout)} 🪙</span>`;
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

/**
 * Rend le sous-onglet "Calculateur de maîtrise" :
 * sélection d'une recette + nombre de plats déjà cuisinés,
 * affichage des 3 paliers en colonnes avec les ingrédients et coûts nécessaires.
 * Restaure la sélection précédente.
 * @returns {void}
 */
function renderMasteryCalculator() {
    const zone = document.getElementById("recipes-sub-calc");
    if (!zone) return;
    zone.innerHTML = "";

    if (recipes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${language === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

    const selWrapper = document.createElement("div");
    selWrapper.className = "recette-calc-sel-wrapper";

    const selLabel = document.createElement("label");
    selLabel.className = "recette-calc-label";
    selLabel.textContent = language === "fr" ? "Recette :" : "Recipe:";

    const sel = document.createElement("select");
    sel.className = "recette-calc-select";
    const optVide = document.createElement("option");
    optVide.value = "";
    optVide.textContent = language === "fr" ? "— Choisir une recette —" : "— Choose a recipe —";
    sel.appendChild(optVide);
    [...recipes].sort((a, b) => getRecipeName(a).localeCompare(getRecipeName(b), "fr")).forEach(r => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(r.name) ? r.name[0] : r.name;
        opt.value = nameFr;
        opt.textContent = getRecipeName(r);
        sel.appendChild(opt);
    });
    if (calcSelectedRecipe) sel.value = calcSelectedRecipe;

    const dejaCuisinéLabel = document.createElement("label");
    dejaCuisinéLabel.className = "recette-calc-label";
    dejaCuisinéLabel.textContent = language === "fr" ? "Déjà cuisiné :" : "Already cooked:";

    const dejaCuisiné = document.createElement("input");
    dejaCuisiné.type = "text";
    dejaCuisiné.inputMode = "numeric";
    dejaCuisiné.className = "recette-calc-input";
    dejaCuisiné.value = calcAlreadyCooked;
    dejaCuisiné.addEventListener("keydown", e => { e.stopPropagation(); });
    dejaCuisiné.addEventListener("input", () => {
        dejaCuisiné.value = dejaCuisiné.value.replace(/[^0-9]/g, "");
        calcAlreadyCooked = dejaCuisiné.value;
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

    if (calcSelectedRecipe) afficherCalcResultat();

    sel.addEventListener("change", () => {
        calcSelectedRecipe = sel.value;
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

        const r = recipes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
        if (!r) return;

        const paliers = Array.isArray(r.paliers) ? r.paliers : [null, null, null];
        const slots = r.ingredients || [];

        if (!paliers.some(p => p != null)) {
            const msg = document.createElement("div");
            msg.className = "recettes-empty";
            msg.textContent = language === "fr" ? "Aucun palier défini pour cette recette." : "No cooking levels defined for this recipe.";
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
            titreP.innerHTML = `${atteint ? "✅" : "⬜"} ${language === "fr" ? "Palier" : "Tier"} ${i + 1} — ${palier} ${language === "fr" ? "plats" : "dishes"}`;
            bloc.appendChild(titreP);

            if (!atteint) {
                const manqueDiv = document.createElement("div");
                manqueDiv.className = "recette-calc-manque";
                manqueDiv.textContent = (language === "fr" ? "Encore " : "Still ") + manque + (language === "fr" ? " à cuisiner" : " to cook");
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
                    const prixMin = Math.min(...slot.map(v => getIngredientPrice(v)));
                    const prixSlot = (prixMin === Infinity ? 0 : prixMin) * nbAPreparer;
                    prixTotalPalier += prixSlot;

                    const row = document.createElement("div");
                    row.className = "recette-calc-ing-row";

                    const nomSlot = document.createElement("span");
                    nomSlot.textContent = `${language === "fr" ? `Slot ${si + 1}` : `Slot ${si + 1}`}: ${labelSlot(slot)} ×${nbAPreparer}`;

                    const prixSpan = document.createElement("span");
                    prixSpan.className = "recette-calc-ing-prix";
                    prixSpan.textContent = formatNumber(prixSlot) + " 🪙";

                    row.appendChild(nomSlot);
                    row.appendChild(prixSpan);
                    ingDiv.appendChild(row);
                });

                const totaux = getBaseIngredients(r, nbAPreparer);
                const totalIngredients = Object.values(totaux);
                const aDesDoublons = totalIngredients.some(v => v.quantite > nbAPreparer);

                if (aDesDoublons) {
                    const sepDiv = document.createElement("div");
                    sepDiv.className = "recette-calc-ing-sep";
                    sepDiv.textContent = language === "fr" ? "— Ingrédients totaux —" : "— Total ingredients —";
                    ingDiv.appendChild(sepDiv);

                    totalIngredients.forEach(({ nom, prix, quantite }) => {
                        const row = document.createElement("div");
                        row.className = "recette-calc-ing-row";
                        const nomSpan = document.createElement("span");
                        nomSpan.textContent = `${nom} ×${quantite}`;
                        const prixSpan = document.createElement("span");
                        prixSpan.className = "recette-calc-ing-prix";
                        prixSpan.textContent = formatNumber(prix * quantite) + " 🪙";
                        row.appendChild(nomSpan);
                        row.appendChild(prixSpan);
                        ingDiv.appendChild(row);
                    });
                }

                const totalRow = document.createElement("div");
                totalRow.className = "recette-calc-total-row";
                totalRow.innerHTML = `<span>${language === "fr" ? "Total coût" : "Total cost"}</span><span>${formatNumber(prixTotalPalier)} 🪙</span>`;
                ingDiv.appendChild(totalRow);

                bloc.appendChild(ingDiv);
            }

            paliersGrid.appendChild(bloc);
        });

        result.appendChild(paliersGrid);
    }
}
