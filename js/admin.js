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
        document.getElementById("adminPanel").classList.remove("hidden");
        document.getElementById("hobbyPanel").classList.add("hidden");
        document.getElementById("btnLangue").style.marginBottom = "0";
        container.classList.add("editor-mode");
        container.style.cursor = "crosshair";
        selectedPlace = null;
        document.getElementById("placeTitle").textContent = t("aucunLieu");
        document.getElementById("elementsPanel").classList.add("hidden");
        updateModeButtons();
        setFilterToggleText();
        return;
    }
    mode = "user";
    document.getElementById("adminPanel").classList.add("hidden");
    document.getElementById("hobbyPanel").classList.remove("hidden");
    document.getElementById("btnLangue").style.marginBottom = "";
    container.classList.remove("editor-mode");
    container.style.cursor = "default";
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
// 📂 OPEN / CLOSE PANELS
// =========================

function openPanel(panelId) {
    ["panelPoisson", "panelInsecte", "panelOiseau", "panelCollectible"].forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });
    const panelEl = document.getElementById(panelId);
    const select = panelEl.querySelector("select");
    if (select) {
        select.innerHTML = "";
        let generiques = [...lieuxGeneriques];
        if (panelId === "panelPoisson") {
            generiques = generiques.filter(l => ["Lacs", "Rivières", "Mers"].includes(l));
        } else if (panelId === "panelInsecte") {
            generiques = generiques.filter(l => !["Mers", "Au sommet de la tête de Blanc"].includes(l));
        }
        generiques.forEach(l => {
            const opt = document.createElement("option");
            opt.value = l;
            opt.textContent = "🌍 " + l;
            select.appendChild(opt);
        });
        const sep = document.createElement("option");
        sep.disabled = true;
        sep.textContent = "──────────";
        select.appendChild(sep);

        let lieux = [...places].sort((a, b) => {
            const nameA = Array.isArray(a.name) ? a.name[0] : a.name;
            const nameB = Array.isArray(b.name) ? b.name[0] : b.name;
            return nameA.localeCompare(nameB, "fr");
        });
        if (panelId === "panelPoisson") {
            const mots = ["lac", "mer", "rivière", "fleuve"];
            lieux = lieux.filter(p => {
                const n = Array.isArray(p.name) ? p.name[0] : p.name;
                return mots.some(mot => new RegExp(`\\b${mot}`, "i").test(n));
            });
        } else if (panelId === "panelOiseau") {
            const motsExclus = ["insectes", "Événement : pêche"];
            lieux = lieux.filter(p => {
                const n = Array.isArray(p.name) ? p.name[0] : p.name;
                return !motsExclus.some(mot => n.includes(mot));
            });
        } else if (panelId === "panelInsecte") {
            const motsExclus = ["mer", "oiseaux"];
            lieux = lieux.filter(p => {
                const n = Array.isArray(p.name) ? p.name[0] : p.name;
                return !motsExclus.some(mot => new RegExp(`\\b${mot}`, "i").test(n));
            });
        }
        lieux.forEach(p => {
            const opt = document.createElement("option");
            const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
            opt.value = nameFr;
            opt.textContent = nameFr;
            select.appendChild(opt);
        });
    }
    panelEl.classList.remove("hidden");
    panelEl.querySelectorAll(".checkbox-group input[type='checkbox']").forEach(cb => {
        cb.checked = true;
    });
}

function closePanel(panelId) {
    document.getElementById(panelId).classList.add("hidden");
    collectiblePlacementMode = false;
    container.style.cursor = "crosshair";
}

// =========================
// 💾 SAVE ELEMENT
// =========================

function saveElement(type) {
    const panelId = type === "poisson" ? "panelPoisson" : type === "insecte" ? "panelInsecte" : "panelOiseau";
    const panel = document.getElementById(panelId);
    const prefix = type === "oiseau" ? "oiseau" : type;

    const nomFr = panel.querySelector(`#${prefix}Nom`).value.trim();
    const nomEn = panel.querySelector(`#${prefix}NomEn`).value.trim();
    if (!nomFr) { alert("Nom FR manquant"); return; }

    const lieuVal = panel.querySelector(`#${prefix}Lieu`).value;
    const lieuPlace = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === lieuVal);
    const lieu = lieuPlace && Array.isArray(lieuPlace.name)
        ? [lieuPlace.name[0], lieuPlace.name[1]]
        : lieuVal;

    const niveau = parseInt(panel.querySelector(`#${prefix}Niveau`).value) || 1;
    const allGroups = panel.querySelectorAll(".checkbox-group");
    const heures = [...allGroups[0].querySelectorAll("input[type='checkbox']")]
        .filter(cb => cb.checked).map(cb => cb.value);
    const meteos = [...allGroups[1].querySelectorAll("input[type='checkbox']")]
        .filter(cb => cb.checked).map(cb => cb.value);

    const name = nomEn ? [nomFr, nomEn] : nomFr;
    const element = { name, lieu, heures, meteos, niveau_hobby: niveau };

    if (type === "poisson") {
        poissons.push(element);
        localStorage.setItem("poissons", JSON.stringify(poissons));
    } else if (type === "insecte") {
        insectes.push(element);
        localStorage.setItem("insectes", JSON.stringify(insectes));
    } else {
        oiseaux.push(element);
        localStorage.setItem("oiseaux", JSON.stringify(oiseaux));
    }

    panel.querySelector(`#${prefix}Nom`).value = "";
    panel.querySelector(`#${prefix}NomEn`).value = "";
    alert(`${nomFr} sauvegardé !`);
}

// =========================
// 🍄 COLLECTIBLES PANEL
// =========================

function openCollectiblePanel() {
    openPanel("panelCollectible");
    const selectCat = document.getElementById("collectibleCategorieSelect");
    selectCat.innerHTML = '<option value="__new__">➕ Nouvelle catégorie</option>';
    const types = [...new Set(collectibles.map(c => c.type))].sort();
    types.forEach(tp => {
        const opt = document.createElement("option");
        opt.value = tp;
        opt.textContent = tp;
        selectCat.appendChild(opt);
    });
    document.getElementById("collectibleTypeLabel").classList.add("hidden");
    const selectEx = document.getElementById("collectibleExistantSelect");
    selectEx.innerHTML = "";
    [...collectibles].sort((a, b) => {
        const na = Array.isArray(a.name) ? a.name[0] : a.name;
        const nb = Array.isArray(b.name) ? b.name[0] : b.name;
        return na.localeCompare(nb, "fr");
    }).forEach(c => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(c.name) ? c.name[0] : c.name;
        opt.value = nameFr;
        opt.textContent = nameFr;
        selectEx.appendChild(opt);
    });
    document.getElementById("collectibleNom").value = "";
    document.getElementById("collectibleColor").value = "#e67e22";
}

function onCategorieSelect() {
    const val = document.getElementById("collectibleCategorieSelect").value;
    const label = document.getElementById("collectibleTypeLabel");
    if (val === "__new__") label.classList.remove("hidden");
    else label.classList.add("hidden");
}

function creerCollectible() {
    const nomFr = document.getElementById("collectibleNom").value.trim();
    const nomEn = document.getElementById("collectibleNomEn").value.trim();
    const categorieSelect = document.getElementById("collectibleCategorieSelect").value;
    const typeFr = categorieSelect === "__new__"
        ? document.getElementById("collectibleType").value.trim()
        : categorieSelect;
    const color = document.getElementById("collectibleColor").value;

    if (!nomFr) { alert("Nom FR manquant"); return; }
    if (!typeFr) { alert("Type/catégorie manquant"); return; }

    const nomExistant = collectibles.find(c => {
        const n = Array.isArray(c.name) ? c.name[0] : c.name;
        return n === nomFr;
    });
    if (nomExistant) { alert("Un collectible avec ce nom existe déjà."); return; }

    const name = nomEn ? [nomFr, nomEn] : nomFr;
    currentCollectible = { name, type: typeFr, color, spawns: [] };
    collectibles.push(currentCollectible);
    localStorage.setItem("collectibles", JSON.stringify(collectibles));
    collectiblePlacementMode = true;
    container.style.cursor = "crosshair";
    document.getElementById("panelCollectible").classList.add("hidden");
}

function placerCollectibleExistant() {
    const nom = document.getElementById("collectibleExistantSelect").value;
    if (!nom) { alert("Aucun élément sélectionné"); return; }
    currentCollectible = collectibles.find(c => {
        const n = Array.isArray(c.name) ? c.name[0] : c.name;
        return n === nom;
    });
    if (!currentCollectible) { alert("Élément introuvable"); return; }
    collectiblePlacementMode = true;
    container.style.cursor = "crosshair";
    document.getElementById("panelCollectible").classList.add("hidden");
}

function toggleSuppressionCollectible() {
    suppressionCollectibleMode = !suppressionCollectibleMode;
    const btn = document.getElementById("btnSuppressionCollectible");
    if (suppressionCollectibleMode) {
        btn.style.background = "#c0392b";
        btn.textContent = t("suppressionCollectible");
    } else {
        btn.style.background = "";
        btn.textContent = t("adminSupprimerPosition");
    }
    container.style.cursor = "crosshair";
}

// =========================
// 🗑️ SUPPRESSION
// =========================

function openSuppressionPanel() {
    ["panelPoisson", "panelInsecte", "panelOiseau", "panelCollectible", "panelSuppression"].forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });
    document.getElementById("panelSuppression").classList.remove("hidden");
    updateSuppressionList();
}

function updateSuppressionList() {
    const type = document.getElementById("suppressionType").value;
    const select = document.getElementById("suppressionElement");
    select.innerHTML = "";
    let data = type === "poisson" ? poissons
        : type === "insecte" ? insectes
        : type === "oiseau" ? oiseaux
        : collectibles;
    [...data].sort((a, b) => {
        const nameA = Array.isArray(a.name) ? a.name[0] : a.name;
        const nameB = Array.isArray(b.name) ? b.name[0] : b.name;
        return nameA.localeCompare(nameB, "fr");
    }).forEach(el => {
        const opt = document.createElement("option");
        const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
        opt.value = nameFr;
        opt.textContent = nameFr;
        select.appendChild(opt);
    });
}

function supprimerElement() {
    const type = document.getElementById("suppressionType").value;
    const nom = document.getElementById("suppressionElement").value;
    if (!nom) return;
    if (!confirm(`Supprimer "${nom}" ?`)) return;
    if (type === "poisson") {
        poissons = poissons.filter(p => (Array.isArray(p.name) ? p.name[0] : p.name) !== nom);
        localStorage.setItem("poissons", JSON.stringify(poissons));
    } else if (type === "insecte") {
        insectes = insectes.filter(i => (Array.isArray(i.name) ? i.name[0] : i.name) !== nom);
        localStorage.setItem("insectes", JSON.stringify(insectes));
    } else if (type === "oiseau") {
        oiseaux = oiseaux.filter(o => (Array.isArray(o.name) ? o.name[0] : o.name) !== nom);
        localStorage.setItem("oiseaux", JSON.stringify(oiseaux));
    } else if (type === "collectible") {
        document.querySelectorAll(".collectible-marker").forEach(el => {
            if (el.dataset.collectibleName === nom) el.remove();
        });
        collectibles = collectibles.filter(c => (Array.isArray(c.name) ? c.name[0] : c.name) !== nom);
        localStorage.setItem("collectibles", JSON.stringify(collectibles));
        afficherLegende();
    }
    updateSuppressionList();
    alert(`"${nom}" supprimé !`);
}

// =========================
// 📤 EXPORT
// =========================

function exportTout() {
    if (mode !== "admin") return;
    [
        {
            data: places.map(p => ({ name: p.name, x: Math.round(p.x), y: Math.round(p.y), level: p.level || 1 })),
            filename: "lieux.json"
        },
        { data: poissons, filename: "poissons.json" },
        { data: insectes, filename: "insectes.json" },
        { data: oiseaux, filename: "oiseaux.json" },
        {
            data: collectibles.map(c => ({
                name: c.name, type: c.type, color: c.color || "#e67e22",
                spawns: c.spawns.map(s => ({ x: Math.round(s.x * 100) / 100, y: Math.round(s.y * 100) / 100 }))
            })),
            filename: "collectibles.json"
        }
    ].forEach(({ data, filename }) => {
        const blob = new Blob(["\uFEFF" + JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function exportPlacesToJSON() {
    if (mode !== "admin") return;
    const cleaned = places.map(p => ({ name: p.name, x: Math.round(p.x), y: Math.round(p.y), level: p.level || 1 }));
    const blob = new Blob(["\uFEFF" + JSON.stringify(cleaned, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lieux.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// =========================
// 📥 IMPORT
// =========================

function triggerImport() {
    if (mode !== "admin") return;
    document.getElementById("importFile").click();
}

function importPlacesFromJSON(event) {
    if (mode !== "admin") return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        places = JSON.parse(e.target.result);
        savePlaces();
        document.querySelectorAll(".place-marker").forEach(el => el.remove());
        places.forEach(p => {
            const nameFr = Array.isArray(p.name) ? p.name[0] : p.name;
            createPlaceMarker(nameFr, p.x, p.y, p.level || 1);
        });
    };
    reader.readAsText(file);
}

function triggerImportElements() {
    if (mode !== "admin") return;
    document.getElementById("importElementsFile").click();
}

function importElements(event) {
    if (mode !== "admin") return;
    const files = [...event.target.files];
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
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
                afficherLegende();
            } else {
                alert(`Fichier non reconnu : ${file.name}`);
            }
        };
        reader.readAsText(file);
    });
    alert("Import terminé !");
    afficherLegende();
}
