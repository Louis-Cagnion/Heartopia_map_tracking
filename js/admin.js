/* =========================
   🔐 MODE MANAGEMENT
   ========================= */

/**
 * Bascule entre le mode utilisateur et le mode administrateur.
 * En mode admin, demande un mot de passe, masque les onglets utilisateur
 * et affiche la page admin. En mode utilisateur, effectue l'inverse.
 * Réinitialise toujours le zoom et la sélection de lieu.
 * @param {"user" | "admin"} newMode - Mode cible.
 * @returns {void}
 */
function setMode(newMode) {
    zoom = 1; panX = 0; panY = 0;
    applyTransform();
    updateMarkerVisibility();
    if (newMode === "admin") {
        const pass = prompt("Mot de passe admin ?");
        if (pass !== "admin") {
            alert("Mot de passe incorrect");
            return;
        }
        mode = "admin";

        document.getElementById("tabBar").classList.add("hidden");
        document.getElementById("tabContainer").classList.add("hidden");
        document.getElementById("adminPage").classList.add("active");

        container.classList.add("editor-mode");
        selectedPlace = null;
        document.getElementById("placeTitle").textContent = t("aucunLieu");
        document.getElementById("elementsPanel").classList.add("hidden");

        updateModeButtons();
        initAdminUI();
        return;
    }

    mode = "user";

    document.getElementById("tabBar").classList.remove("hidden");
    document.getElementById("tabContainer").classList.remove("hidden");
    document.getElementById("adminPage").classList.remove("active");

    // Remettre la carte dans mapColumn si elle avait été déplacée
    const mapColumn = document.getElementById("mapColumn");
    const mapContainer = document.getElementById("map-container");
    if (mapColumn && mapContainer && !mapColumn.contains(mapContainer)) {
        mapColumn.appendChild(mapContainer);
    }

    container.classList.remove("editor-mode");
    container.style.cursor = "default";
    collectiblePlacementMode = false;
    collectibleDeletionMode = false;

    selectedPlace = null;
    document.getElementById("placeTitle").textContent = t("aucunLieu");
    document.getElementById("elementsPanel").classList.add("hidden");

    updateModeButtons();
    setFilterToggleText();
    updateUI();
}

/**
 * Met à jour l'état désactivé/activé des boutons de sélection de mode
 * selon le mode courant.
 * @returns {void}
 */
function updateModeButtons() {
    document.getElementById("btnUser").disabled = mode === "user";
    document.getElementById("btnAdmin").disabled = mode === "admin";
}

/* =========================
   📥 IMPORT
   ========================= */

/**
 * Importe un ou plusieurs fichiers JSON sélectionnés par l'utilisateur
 * et met à jour les données globales correspondantes ainsi que le localStorage.
 * Fichiers reconnus : `lieux.json`, `poissons.json`, `insectes.json`,
 * `oiseaux.json`, `collectibles.json`, `ingredients.json`, `recettes.json`.
 * Affiche une alerte d'erreur pour tout fichier non reconnu ou malformé.
 * @param {Event} event - Événement `change` d'un `<input type="file" multiple>`.
 *   `event.target.files` est un `FileList` d'objets `File`.
 * @returns {void}
 */
function importElements(event) {
    const files = [...event.target.files];
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (file.name === "lieux.json") {
                    places = data;
                    savePlaces();
                    document.querySelectorAll(".place-marker").forEach(el => el.remove());
                    places.forEach(p => {
                        const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
                        createPlaceMarker(nameFr, p.x, p.y, p.level || 1);
                    });
                } else if (file.name === "poissons.json") {
                    fish = data;
                    localStorage.setItem("poissons", JSON.stringify(fish));
                } else if (file.name === "insectes.json") {
                    insects = data;
                    localStorage.setItem("insectes", JSON.stringify(insects));
                } else if (file.name === "oiseaux.json") {
                    birds = data;
                    localStorage.setItem("oiseaux", JSON.stringify(birds));
                } else if (file.name === "collectibles.json") {
                    collectibles = data;
                    localStorage.setItem("collectibles", JSON.stringify(collectibles));
                    document.querySelectorAll(".collectible-marker").forEach(el => el.remove());
                    collectibles.forEach(c => {
                        c.spawns.forEach((s, i) => {
                            createCollectibleMarker(s.x, s.y, c.type, c.name, i, c.color || "#e67e22");
                        });
                    });
                    showLegend();
                } else if (file.name === "ingredients.json") {
                    ingredients = data;
                    localStorage.setItem("ingredients", JSON.stringify(ingredients));
                } else if (file.name === "recettes.json") {
                    recipes = data;
                    localStorage.setItem("recettes", JSON.stringify(recipes));
                } else {
                    alert("Fichier non reconnu : " + file.name);
                }
            } catch (err) {
                alert("Erreur import " + file.name + " : " + err.message);
            }
        };
        reader.readAsText(file);
    });
    event.target.value = "";
    setTimeout(() => alert("Import termine !"), 200);
}
