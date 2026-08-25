/* =========================
   🚀 INITIALISATION
   ========================= */

/**
 * Point d'entrée principal de l'application.
 * Exécuté au chargement du DOM :
 * 1. Remplit les selects de niveaux de hobby.
 * 2. Charge toutes les données (localStorage ou fichiers JSON).
 * 3. Construit les fenêtres "faune obtenue" pour chaque type.
 * 4. Crée les marqueurs de lieux et de collectibles sur la carte.
 * 5. Applique la transformation initiale et rafraîchit l'affichage.
 * @listens DOMContentLoaded
 * @returns {Promise<void>}
 */
window.addEventListener("DOMContentLoaded", async () => {
    fillLevelSelects(["hobbyPoisson", "hobbyOiseau", "hobbyInsecte"]);
    await loadDatabaseAuto();

    // Construire les fenêtres faune
    buildObtainedPanel("poisson", "ObtenuPoisson");
    buildObtainedPanel("oiseau",  "ObtenuOiseau");
    buildObtainedPanel("insecte", "ObtenuInsecte");

    // Créer les marqueurs lieux
    places.forEach(p => {
        const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
        createPlaceMarker(nameFr, p.x, p.y, p.level || 1);
    });

    // Créer les marqueurs collectibles
    collectibles.forEach(c => {
        c.spawns.forEach((s, i) => {
            createCollectibleMarker(s.x, s.y, c.type, c.name, i, c.color || "#e67e22");
        });
    });

    setTimeout(() => {
        applyTransform();
        updateMarkerVisibility();
        repositionLabels();
        clampLabels();
        showLegend();
        updateUI();
    }, 100);
});
