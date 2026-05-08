// =========================
// 🚀 INITIALISATION
// =========================

window.addEventListener("DOMContentLoaded", async () => {
    remplirSelectNiveaux(["hobbyPoisson", "hobbyOiseau", "hobbyInsecte"]);
    await loadDatabaseAuto();

    // Construire les fenêtres faune
    construireFenetreObtenu("poisson", "ObtenuPoisson");
    construireFenetreObtenu("oiseau",  "ObtenuOiseau");
    construireFenetreObtenu("insecte", "ObtenuInsecte");

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
        afficherLegende();
        mettreAJourUI();
    }, 100);
});
