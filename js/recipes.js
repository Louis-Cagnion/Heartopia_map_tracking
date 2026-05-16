// =========================
// 🍳 ONGLET RECETTES
// =========================

let currentRecettesSubTab = "liste"; // mémorise le sous-onglet actif
// 3 sous-onglets :
//  1. recettes   — liste + détails + prix par étoile
//  2. profit     — classement décroissant profit
//  3. calculateur — nb ingrédients pour paliers

// ---- Helpers ----

function getPrixIngredient(valeurSlot) {
    // valeurSlot = "ing:NomFR" | "poi:NomFR" | "col:NomFR" | "rec:NomFR"
    const [type, ...rest] = valeurSlot.split(":");
    const nomFr = rest.join(":");
    if (type === "ing") {
        const ing = ingredients.find(i => (Array.isArray(i.name) ? i.name[0] : i.name) === nomFr);
        return ing ? (ing.price || 0) : 0;
    }
    if (type === "poi") {
        return 0; // poissons gratuits (pêchés)
    }
    if (type === "col") {
        return 0; // collectibles gratuits
    }
    if (type === "rec") {
        const r = recettes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
        return r ? (r.sellPrice || 0) : 0;
    }
    return 0;
}

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

function getCategorieSlotItem(valeurSlot) {
    const [type, ...rest] = valeurSlot.split(":");
    const nomFr = rest.join(":");
    const idx = langIndex[langue];
    if (type === "ing") {
        const ing = ingredients.find(i => (Array.isArray(i.name) ? i.name[0] : i.name) === nomFr);
        if (!ing) return null;
        return Array.isArray(ing.category) ? ing.category[idx] || ing.category[0] : ing.category;
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

// Affichage condensé d'un slot : catégorie si ≥3 items d'une même catégorie, sinon noms exacts
function labelSlot(slotItems) {
    if (!slotItems || slotItems.length === 0) return "—";

    // Compter par catégorie
    const parCat = {};
    slotItems.forEach(val => {
        const cat = getCategorieSlotItem(val) || "?";
        if (!parCat[cat]) parCat[cat] = [];
        parCat[cat].push(val);
    });

    const parts = [];
    Object.entries(parCat).forEach(([cat, items]) => {
        if (items.length >= 3) {
            parts.push(cat);
        } else {
            items.forEach(v => parts.push(getNomSlotItem(v)));
        }
    });

    return parts.join(" / ");
}

function prixVenteEtoile(base, etoile) {
    const mult = [1, 1.5, 2, 4, 8];
    return Math.round(base * mult[etoile - 1]);
}

function prixTotalIngredients(recette) {
    if (!recette.ingredients) return 0;
    return recette.ingredients.reduce((total, slot) => {
        if (!slot || slot.length === 0) return total;
        // On prend le prix minimum du slot (l'ingrédient le moins cher disponible)
        const prixMin = Math.min(...slot.map(v => getPrixIngredient(v)));
        return total + (prixMin === Infinity ? 0 : prixMin);
    }, 0);
}

function getNomRecette(r) {
    const idx = langIndex[langue];
    return Array.isArray(r.name) ? r.name[idx] || r.name[0] : r.name;
}

// =========================
// 🔀 SWITCH SOUS-ONGLET
// =========================

function switchTabRecettes(subTab) {
    document.querySelectorAll(".recettes-sub-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn-recettes").forEach(b => b.classList.remove("active"));
    document.getElementById("recettes-sub-" + subTab).classList.add("active");
    document.querySelector(`.tab-btn-recettes[data-sub="${subTab}"]`).classList.add("active");
    currentRecettesSubTab = subTab;
    renderRecettesSubTab(subTab);
}

function renderRecettesSubTab(subTab) {
    if (subTab === "liste")        renderRecettesListe();
    else if (subTab === "profit")  renderRecettesProfit();
    else if (subTab === "energie") renderRecettesEnergie();
    else if (subTab === "calc")    renderRecettesCalc();
}

// =========================
// 🏗️ INIT ONGLET RECETTES
// =========================

function initOngletRecettes() {
    const container = document.getElementById("tab-recettes");
    if (!container) return;
    container.innerHTML = "";

    // Barre sous-onglets
    const bar = document.createElement("div");
    bar.id = "tabBarRecettes";
    bar.className = "tabbar-recettes";

    const subTabs = [
        { key: "liste",   labelFr: "📖 Infos",                                labelEn: "📖 Infos" },
        { key: "profit",  labelFr: "💰 Classement de profit",                 labelEn: "💰 Profit ranking" },
        { key: "energie", labelFr: "⚡ Classement d'énergie",                labelEn: "⚡ Energy ranking" },
        { key: "calc",    labelFr: "🧮 Calculateur de maîtrise de cuisine",   labelEn: "🧮 Cooking mastery calculator" }
    ];

    subTabs.forEach(({ key, labelFr, labelEn }, idx) => {
        const btn = document.createElement("button");
        btn.className = "tab-btn-recettes" + (key === currentRecettesSubTab ? " active" : "");
        btn.dataset.sub = key;
        btn.textContent = langue === "fr" ? labelFr : labelEn;
        btn.onclick = () => switchTabRecettes(key);
        bar.appendChild(btn);
    });
    container.appendChild(bar);

    // Zones de contenu
    subTabs.forEach(({ key }) => {
        const div = document.createElement("div");
        div.className = "recettes-sub-content" + (key === currentRecettesSubTab ? " active" : "");
        div.id = "recettes-sub-" + key;
        container.appendChild(div);
    });

    // Restaurer le sous-onglet actif
    renderRecettesSubTab(currentRecettesSubTab);
}

// =========================
// 📖 SOUS-ONGLET 1 : LISTE
// =========================

function renderRecettesListe() {
    const zone = document.getElementById("recettes-sub-liste");
    if (!zone) return;
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
        const card = document.createElement("div");
        card.className = "recette-card";

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

        header.addEventListener("click", () => {
            const isOpen = !details.classList.contains("hidden");
            // Fermer tous les détails ouverts
            zone.querySelectorAll(".recette-card-details").forEach(d => d.classList.add("hidden"));
            zone.querySelectorAll(".recette-card-arrow").forEach(a => { a.textContent = "▶"; });
            if (!isOpen) {
                details.classList.remove("hidden");
                arrow.textContent = "▼";
                renderDetailsRecette(r, details);
            }
        });

        card.appendChild(details);
        listContent.appendChild(card);
    });
}

function renderDetailsRecette(r, zone) {
    zone.innerHTML = "";
    const idx = langIndex[langue];

    // Énergie
    if (r.energy) {
        const row = document.createElement("div");
        row.className = "recette-detail-row";
        row.textContent = (langue === "fr" ? "⚡ Énergie : " : "⚡ Energy: ") + r.energy;
        zone.appendChild(row);
    }

    // Ingrédients par slot
    if (r.ingredients && r.ingredients.length > 0) {
        const titreIng = document.createElement("div");
        titreIng.className = "recette-detail-titre";
        titreIng.textContent = langue === "fr" ? "Ingrédients :" : "Ingredients:";
        zone.appendChild(titreIng);

        r.ingredients.forEach((slot, i) => {
            const row = document.createElement("div");
            row.className = "recette-detail-row";
            row.textContent = `  Slot ${i + 1} : ${labelSlot(slot)}`;
            zone.appendChild(row);
        });
    }

    // Paliers
    if (r.paliers && r.paliers.some(p => p != null)) {
        const titrePaliers = document.createElement("div");
        titrePaliers.className = "recette-detail-titre";
        titrePaliers.textContent = langue === "fr" ? "Niveaux de cuisine :" : "Cooking levels:";
        zone.appendChild(titrePaliers);

        r.paliers.forEach((p, i) => {
            if (p == null) return;
            const row = document.createElement("div");
            row.className = "recette-detail-row";
            row.textContent = `  ${langue === "fr" ? "Palier" : "Tier"} ${i + 1} : ${p} ${langue === "fr" ? "plats" : "dishes"}`;
            zone.appendChild(row);
        });
    }

    // Prix par étoile
    if (r.sellPrice) {
        const titrePrix = document.createElement("div");
        titrePrix.className = "recette-detail-titre";
        titrePrix.textContent = langue === "fr" ? "Prix de vente :" : "Sell price:";
        zone.appendChild(titrePrix);

        const etoilesGrid = document.createElement("div");
        etoilesGrid.className = "recette-etoiles-grid";

        for (let e = 1; e <= 5; e++) {
            const cell = document.createElement("div");
            cell.className = "recette-etoile-cell";
            const stars = "⭐".repeat(e);
            const prix = prixVenteEtoile(r.sellPrice, e);
            cell.innerHTML = `<span class="recette-etoile-stars">${stars}</span><span class="recette-etoile-prix">${prix} 🪙</span>`;
            etoilesGrid.appendChild(cell);
        }

        zone.appendChild(etoilesGrid);
    }
}

// =========================
// 💰 SOUS-ONGLET 2 : PROFIT
// =========================

function renderRecettesProfit() {
    const zone = document.getElementById("recettes-sub-profit");
    if (!zone) return;
    zone.innerHTML = "";

    if (recettes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${langue === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

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

    // Calculer profit pour chaque recette (étoile 1)
    const withProfit = recettes.map(r => {
        const vente = r.sellPrice || 0;
        const couts = (r.ingredients || []).map(slot => {
            if (!slot || slot.length === 0) return { label: "—", prix: 0 };
            const prixMin = Math.min(...slot.map(v => getPrixIngredient(v)));
            return { label: labelSlot(slot), prix: prixMin === Infinity ? 0 : prixMin };
        });
        const totalCout = couts.reduce((s, c) => s + c.prix, 0);
        return { r, vente, couts, totalCout, profit: vente - totalCout };
    });

    withProfit.sort((a, b) => b.profit - a.profit);

    withProfit.forEach(({ r, vente, couts, totalCout, profit }, rankIdx) => {
        const card = document.createElement("div");
        card.className = "recette-card";

        const header = document.createElement("div");
        header.className = "recette-card-header";

        const gauche = document.createElement("span");
        gauche.className = "recette-card-nom";
        gauche.textContent = getNomRecette(r);

        const droite = document.createElement("span");
        droite.className = "recette-profit-badge" + (profit >= 0 ? " profit-positif" : " profit-negatif");
        droite.textContent = (profit >= 0 ? "+" : "") + profit + " 🪙";

        const arrow = document.createElement("span");
        arrow.className = "recette-card-arrow";
        arrow.textContent = "▶";

                const rang = document.createElement("span");
        rang.className = "recette-rang";
        rang.textContent = "#" + (rankIdx + 1);

        header.insertBefore(rang, gauche);
        header.appendChild(droite);
        header.appendChild(arrow); card.appendChild(header);

        const details = document.createElement("div");
        details.className = "recette-card-details hidden";

        header.addEventListener("click", () => {
            const isOpen = !details.classList.contains("hidden");
            zone.querySelectorAll(".recette-card-details").forEach(d => d.classList.add("hidden"));
            zone.querySelectorAll(".recette-card-arrow").forEach(a => { a.textContent = "▶"; });
            if (!isOpen) {
                details.classList.remove("hidden");
                arrow.textContent = "▼";

                details.innerHTML = "";

                // Colonne vente / coûts
                const cols = document.createElement("div");
                cols.className = "recette-profit-cols";

                const colVente = document.createElement("div");
                colVente.className = "recette-profit-col";
                colVente.innerHTML = `<div class="recette-detail-titre">${langue === "fr" ? "Prix de vente (⭐)" : "Sell price (⭐)"}</div>`;
                const venteVal = document.createElement("div");
                venteVal.className = "recette-profit-val recette-profit-vente";
                venteVal.textContent = vente + " 🪙";
                colVente.appendChild(venteVal);

                const separateur = document.createElement("div");
                separateur.className = "recette-profit-sep";

                const colCout = document.createElement("div");
                colCout.className = "recette-profit-col";
                colCout.innerHTML = `<div class="recette-detail-titre">${langue === "fr" ? "Coût des ingrédients" : "Ingredient cost"}</div>`;

                couts.forEach((c, i) => {
                    const row = document.createElement("div");
                    row.className = "recette-profit-ing-row";
                    row.innerHTML = `<span>Slot ${i + 1} : ${c.label}</span><span class="recette-profit-prix-ing">${c.prix} 🪙</span>`;
                    colCout.appendChild(row);
                });

                const totalRow = document.createElement("div");
                totalRow.className = "recette-profit-total-row";
                totalRow.innerHTML = `<span>${langue === "fr" ? "Total" : "Total"}</span><span>${totalCout} 🪙</span>`;
                colCout.appendChild(totalRow);

                cols.appendChild(colVente);
                cols.appendChild(separateur);
                cols.appendChild(colCout);
                details.appendChild(cols);
            }
        });

        card.appendChild(details);
        profitContent.appendChild(card);
    });
}

// =========================
// ⚡ SOUS-ONGLET 3 : ÉNERGIE
// =========================

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

    // Grouper par valeur d'énergie
    const groups = {};
    withEnergy.forEach(r => {
        const e = r.energy;
        if (!groups[e]) groups[e] = [];
        groups[e].push(r);
    });

    // Trier les groupes par énergie décroissante
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
        const noms = groups[energie].map(r => getNomRecette(r)).sort((a, b) => a.localeCompare(b, "fr"));
        const card = document.createElement("div");
        card.className = "recette-card recette-energie-group";

        const header = document.createElement("div");
        header.className = "recette-card-header";

        const rang = document.createElement("span");
        rang.className = "recette-rang";
        rang.textContent = "#" + rank;

        const nomSpan = document.createElement("span");
        nomSpan.className = "recette-card-nom recette-energie-noms";
        nomSpan.textContent = noms.join(" / ");

        const badge = document.createElement("span");
        badge.className = "recette-energie-badge";
        badge.textContent = "⚡ " + energie;

        header.appendChild(rang);
        header.appendChild(nomSpan);
        header.appendChild(badge);
        card.appendChild(header);
        energieContent.appendChild(card);

        rank += groups[energie].length;
    });
}

// =========================
// 🧮 SOUS-ONGLET 4 : CALCULATEUR DE MAÎTRISE
// =========================

function renderRecettesCalc() {
    const zone = document.getElementById("recettes-sub-calc");
    if (!zone) return;
    zone.innerHTML = "";

    if (recettes.length === 0) {
        zone.innerHTML = `<div class="recettes-empty">${langue === "fr" ? "Aucune recette enregistrée." : "No recipes recorded."}</div>`;
        return;
    }

    // Sélecteur de recette
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

    // Champ "déjà cuisiné"
    const dejaCuisinéLabel = document.createElement("label");
    dejaCuisinéLabel.className = "recette-calc-label";
    dejaCuisinéLabel.textContent = langue === "fr" ? "Déjà cuisiné :" : "Already cooked:";

    const dejaCuisiné = document.createElement("input");
    dejaCuisiné.type = "text";
    dejaCuisiné.inputMode = "numeric";
    dejaCuisiné.className = "recette-calc-input";
    dejaCuisiné.value = "0";
    dejaCuisiné.addEventListener("input", () => {
        dejaCuisiné.value = dejaCuisiné.value.replace(/[^0-9]/g, "");
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

    sel.addEventListener("change", afficherCalcResultat);

    function afficherCalcResultat() {
        const nomFr = sel.value;
        const deja = parseInt(dejaCuisiné.value) || 0;
        const result = document.getElementById("recette-calc-result");
        result.innerHTML = "";

        if (!nomFr) return;

        const r = recettes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
        if (!r) return;

        const paliers = (r.paliers || [null, null, null]);
        const slots = r.ingredients || [];

        // Paliers
        const paliersDiv = document.createElement("div");
        paliersDiv.className = "recette-calc-paliers";

        paliers.forEach((palier, i) => {
            if (palier == null) return;
            const atteint = deja >= palier;
            const manque = Math.max(0, palier - deja);

            const bloc = document.createElement("div");
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

            // Ingrédients nécessaires pour CE palier (total depuis 0 jusqu'au palier)
            // On affiche les ingrédients pour atteindre CE palier depuis la progression actuelle
            // Si atteint, depuis le palier précédent
            const palierPrecedent = i === 0 ? 0 : (paliers[i - 1] || 0);
            const cuisinonsDepuis = atteint ? palierPrecedent : deja;
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
                    nomSlot.textContent = `Slot ${si + 1} : ${labelSlot(slot)} ×${nbAPreparer}`;

                    const prixSpan = document.createElement("span");
                    prixSpan.className = "recette-calc-ing-prix";
                    prixSpan.textContent = prixSlot + " 🪙";

                    row.appendChild(nomSlot);
                    row.appendChild(prixSpan);
                    ingDiv.appendChild(row);
                });

                const totalRow = document.createElement("div");
                totalRow.className = "recette-calc-total-row";
                totalRow.innerHTML = `<span>${langue === "fr" ? "Total ingrédients" : "Total ingredients"}</span><span>${prixTotalPalier} 🪙</span>`;
                ingDiv.appendChild(totalRow);

                bloc.appendChild(ingDiv);
            }

            paliersDiv.appendChild(bloc);
        });

        result.appendChild(paliersDiv);

        // Si aucun palier défini
        if (!paliers.some(p => p != null)) {
            const msg = document.createElement("div");
            msg.className = "recettes-empty";
            msg.textContent = langue === "fr" ? "Aucun palier défini pour cette recette." : "No cooking levels defined for this recipe.";
            result.appendChild(msg);
        }
    }
}
