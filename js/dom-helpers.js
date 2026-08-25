/* =========================
   🛡️ HELPERS DOM SÉCURISÉS
   Construisent des éléments DOM à partir de données potentiellement fournies
   par l'admin (formulaire ou import JSON), sans jamais passer par innerHTML.
   ========================= */

/**
 * Crée un titre de lieu échappé pour le panneau d'éléments.
 * @param {string} texteLieu - Nom de lieu déjà traduit (peut provenir de données admin/import).
 * @returns {HTMLDivElement} Élément `.elements-lieu-titre`.
 */
function createPlaceTitleDiv(texteLieu) {
    const div = document.createElement("div");
    div.className = "elements-lieu-titre";
    div.textContent = texteLieu + " :";
    return div;
}

/**
 * Crée une ligne de détail label/valeur échappée.
 * @param {string} label - Libellé (chaîne UI fixe, ex. via `t()`).
 * @param {string} valeur - Valeur affichée (peut provenir de données admin/import).
 * @returns {HTMLDivElement} Élément `.element-details-row`.
 */
function createDetailRow(label, valeur) {
    const row = document.createElement("div");
    row.className = "element-details-row";
    row.textContent = `${label} : ${valeur}`;
    return row;
}

/**
 * Crée un item de légende (pastille de couleur + nom) sans injection possible.
 * @param {string} nom - Nom du collectible (potentiellement fourni par l'admin/import).
 * @param {string} couleur - Couleur CSS (potentiellement fournie par l'admin/import).
 * @returns {HTMLDivElement} Élément `.legende-item`.
 */
function createLegendItem(nom, couleur) {
    const div = document.createElement("div");
    div.className = "legende-item";
    const pastille = document.createElement("div");
    pastille.className = "legende-pastille";
    pastille.style.background = couleur || "#e67e22";
    const span = document.createElement("span");
    span.textContent = nom;
    div.appendChild(pastille);
    div.appendChild(span);
    return div;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { createPlaceTitleDiv, createDetailRow, createLegendItem };
}
