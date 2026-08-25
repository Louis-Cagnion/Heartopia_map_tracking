/* =========================
   🔢 RECETTES — HELPERS DE CALCUL
   Fonctions pures (aucun accès DOM) : prix, noms, regroupement, ingrédients de base.
   Utilisées par recipes-tabs.js et recipes-profit-calc.js.
   ========================= */

/**
 * Formate un entier avec séparateur de milliers selon la langue courante
 * (espace en FR, virgule en EN).
 * @param {number} n - Nombre entier à formater.
 * @returns {string} Nombre formaté.
 */
function formatNumber(n) {
    if (language === "fr") return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Retourne le prix unitaire d'un item de slot identifié par sa valeur `type:nomFr`.
 * Pour les sous-recettes (`rec:`), calcule récursivement le coût total de leurs ingrédients.
 * Pour les poissons (`poi:`) et collectibles (`col:`), retourne 0 (pas de prix d'achat).
 * @param {string} valeurSlot - Valeur du slot au format `"type:nomFr"` (ex. `"ing:Lait"`, `"rec:Sauce tomate"`).
 * @returns {number} Prix unitaire en monnaie du jeu (0 si introuvable ou non acheté).
 */
function getIngredientPrice(valeurSlot) {
    const [type, ...rest] = valeurSlot.split(":");
    const nomFr = rest.join(":");
    if (type === "ing") {
        const ing = ingredients.find(i => (Array.isArray(i.name) ? i.name[0] : i.name) === nomFr);
        return ing ? (ing.price || 0) : 0;
    }
    if (type === "poi") return 0;
    if (type === "col") return 0;
    if (type === "rec") {
        const r = recipes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
        if (!r) return 0;
        return totalIngredientsCost(r);
    }
    return 0;
}

/**
 * Retourne le nom affiché (dans la langue courante) d'un item de slot.
 * @param {string} valeurSlot - Valeur du slot au format `"type:nomFr"`.
 * @returns {string} Nom traduit, ou `nomFr` si l'item est introuvable.
 */
function getSlotItemName(valeurSlot) {
    const [type, ...rest] = valeurSlot.split(":");
    const nomFr = rest.join(":");
    const idx = langIndex[language];
    if (type === "ing") {
        const ing = ingredients.find(i => (Array.isArray(i.name) ? i.name[0] : i.name) === nomFr);
        return ing ? (Array.isArray(ing.name) ? ing.name[idx] || ing.name[0] : ing.name) : nomFr;
    }
    if (type === "poi") {
        const p = fish.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === nomFr);
        return p ? (Array.isArray(p.name) ? p.name[idx] || p.name[0] : p.name) : nomFr;
    }
    if (type === "col") {
        const co = collectibles.find(c => (Array.isArray(c.name) ? c.name[0] : c.name) === nomFr);
        return co ? (Array.isArray(co.name) ? co.name[idx] || co.name[0] : co.name) : nomFr;
    }
    if (type === "rec") {
        const r = recipes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
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
function getSlotItemCategory(valeurSlot) {
    const [type, ...rest] = valeurSlot.split(":");
    const nomFr = rest.join(":");
    const idx = langIndex[language];
    if (type === "ing") {
        const ing = ingredients.find(i => (Array.isArray(i.name) ? i.name[0] : i.name) === nomFr);
        if (!ing) return null;
        const cat = Array.isArray(ing.category) ? ing.category[idx] || ing.category[0] : ing.category;
        if (cat === "Magasin de chance de Doris") return "Sucres du magasin de chance de Doris";
        if (cat === "Doris's lucky shop") return "Sugars from Doris's lucky shop";
        return cat;
    }
    if (type === "poi") return language === "fr" ? "Poissons" : "Fish";
    if (type === "col") {
        const co = collectibles.find(c => (Array.isArray(c.name) ? c.name[0] : c.name) === nomFr);
        if (!co) return null;
        return Array.isArray(co.type) ? co.type[idx] || co.type[0] : co.type;
    }
    if (type === "rec") return language === "fr" ? "Recettes" : "Recipes";
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
    if (slotItems.length === 1) return getSlotItemName(slotItems[0]);
    const parCat = {};
    slotItems.forEach(val => {
        const cat = getSlotItemCategory(val) || "?";
        if (!parCat[cat]) parCat[cat] = [];
        parCat[cat].push(val);
    });
    const parts = [];
    Object.entries(parCat).forEach(([cat, items]) => {
        if (items.length >= 3 && slotItems.length >= 3) {
            parts.push(cat);
        } else {
            items.forEach(v => parts.push(getSlotItemName(v)));
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
function sellPriceByStar(base, etoile) {
    const mult = [1, 1.5, 2, 4, 8];
    return Math.round(base * mult[etoile - 1]);
}

/**
 * Calcule le coût total minimum des ingrédients d'une recette
 * en prenant le prix le plus bas de chaque slot.
 * @param {{ ingredients: string[][] }} recette - Objet recette avec son tableau de slots.
 * @returns {number} Coût total en monnaie du jeu.
 */
function totalIngredientsCost(recette) {
    if (!recette.ingredients) return 0;
    return recette.ingredients.reduce((total, slot) => {
        if (!slot || slot.length === 0) return total;
        const prixMin = Math.min(...slot.map(v => getIngredientPrice(v)));
        return total + (prixMin === Infinity ? 0 : prixMin);
    }, 0);
}

/**
 * Retourne le nom d'une recette dans la langue courante.
 * @param {{ name: string | [string, string] }} r - Objet recette.
 * @returns {string} Nom traduit.
 */
function getRecipeName(r) {
    const idx = langIndex[language];
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
function groupByPrefix(noms) {
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
function getBaseIngredients(recette, multiplicateur) {
    const totaux = {};
    (recette.ingredients || []).forEach(slot => {
        if (!slot || slot.length === 0) return;
        let bestVal = null;
        let bestPrix = Infinity;
        slot.forEach(v => {
            const p = getIngredientPrice(v);
            if (p < bestPrix) { bestPrix = p; bestVal = v; }
        });
        if (!bestVal) return;

        const [type, ...rest] = bestVal.split(":");
        const nomFr = rest.join(":");

        if (type === "rec") {
            const sousRecette = recipes.find(r => (Array.isArray(r.name) ? r.name[0] : r.name) === nomFr);
            if (sousRecette) {
                const sub = getBaseIngredients(sousRecette, multiplicateur);
                Object.entries(sub).forEach(([k, v]) => {
                    if (!totaux[k]) totaux[k] = { nom: v.nom, prix: v.prix, quantite: 0 };
                    totaux[k].quantite += v.quantite;
                });
                return;
            }
        }

        const nomAff = getSlotItemName(bestVal);
        const prix = getIngredientPrice(bestVal);
        if (!totaux[nomFr]) totaux[nomFr] = { nom: nomAff, prix, quantite: 0 };
        totaux[nomFr].quantite += multiplicateur;
    });
    return totaux;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { formatNumber, sellPriceByStar, groupByPrefix, getIngredientPrice, totalIngredientsCost };
}
