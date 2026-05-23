// =========================
// 🗂️ TABS
// =========================

let currentTab = "map";
const tabs = ["map", "tab2", "recettes"];

/**
 * Bascule vers l'onglet principal spécifié.
 * Réinitialise le zoom de la carte si on quitte l'onglet "map".
 * Initialise l'onglet recettes à la première ouverture.
 * @param {"map" | "tab2" | "recettes"} tabName - Identifiant de l'onglet cible.
 * @returns {void}
 */
function switchTab(tabName) {
    if (currentTab === "map" && tabName !== "map") {
        zoom = 1; panX = 0; panY = 0;
        applyTransform();
        updateMarkerVisibility();
    }
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tab-" + tabName).classList.add("active");
    document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`).classList.add("active");
    currentTab = tabName;
    if (tabName === "recettes") initOngletRecettes();
}

// Navigation clavier : flèches gauche/droite et touches A/D
document.addEventListener("keydown", (e) => {
    const idx = tabs.indexOf(currentTab);
    if ((e.key === "ArrowRight" || e.key === "d") && idx < tabs.length - 1) switchTab(tabs[idx + 1]);
    if ((e.key === "ArrowLeft"  || e.key === "a") && idx > 0)               switchTab(tabs[idx - 1]);
});
