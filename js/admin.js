// =========================
// 🔐 MODE MANAGEMENT
// =========================

function setMode(newMode) {
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
    suppressionCollectibleMode = false;

    selectedPlace = null;
    document.getElementById("placeTitle").textContent = t("aucunLieu");
    document.getElementById("elementsPanel").classList.add("hidden");

    updateModeButtons();
    setFilterToggleText();
    mettreAJourUI();
}

function updateModeButtons() {
    document.getElementById("btnUser").disabled = mode === "user";
    document.getElementById("btnAdmin").disabled = mode === "admin";
}

// =========================
// 📥 IMPORT
// =========================

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
                    poissons = data;
                    localStorage.setItem("poissons", JSON.stringify(poissons));
                } else if (file.name === "insectes.json") {
                    insectes = data;
                    localStorage.setItem("insectes", JSON.stringify(insectes));
                } else if (file.name === "oiseaux.json") {
                    oiseaux = data;
                    localStorage.setItem("oiseaux", JSON.stringify(oiseaux));
                } else if (file.name === "collectibles.json") {
                    collectibles = data;
                    localStorage.setItem("collectibles", JSON.stringify(collectibles));
                    document.querySelectorAll(".collectible-marker").forEach(el => el.remove());
                    collectibles.forEach(c => {
                        c.spawns.forEach((s, i) => {
                            createCollectibleMarker(s.x, s.y, c.type, c.name, i, c.color || "#e67e22");
                        });
                    });
                    afficherLegende();
                } else if (file.name === "ingredients.json") {
                    ingredients = data;
                    localStorage.setItem("ingredients", JSON.stringify(ingredients));
                } else if (file.name === "recettes.json") {
                    recettes = data;
                    localStorage.setItem("recettes", JSON.stringify(recettes));
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

