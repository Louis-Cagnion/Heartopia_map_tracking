// =========================
// 🔲 APPLIQUER FILTRES
// =========================

function appliquerFiltres() {
    const filtres = {};
    document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
        filtres[cb.value] = cb.checked;
    });

    document.querySelectorAll(".collectible-marker").forEach(el => {
        el.style.display = filtres["collectible"] ? "block" : "none";
    });

    document.getElementById("legendeCollectibles").style.display = filtres["collectible"] ? "" : "none";

    if (selectedPlace) {
        afficherElementsLieu(selectedPlace);
    }

    const panelSpeciaux = document.getElementById("panelSpeciaux");
    if (!panelSpeciaux.classList.contains("hidden")) {
        toggleSpeciaux();
    }
}

// =========================
// 📋 AFFICHER ELEMENTS LIEU
// =========================

function afficherElementsLieu(nomLieu) {
    const { estZoneNiv1, sousZones, resultats } = getElementsPourLieu(nomLieu);
    const list = document.getElementById("elementsList");
    list.innerHTML = "";

    if (Object.keys(resultats).length === 0) {
        list.innerHTML = `<div style='color:#666;font-size:14px'>${t("aucunElement")}</div>`;
        return;
    }

    const lieuxPropres = getLieuxPourRecherche(nomLieu);
    let premierLieu = true;
    lieuxPropres.forEach(lieu => {
        if (resultats[lieu]) {
            const div = document.createElement("div");
            div.className = "elements-lieu";
            if (!premierLieu) {
                div.innerHTML = `<div class="elements-lieu-titre">${getNomLieu(lieu)} :</div>`;
            }
            premierLieu = false;
            if (afficherGroupeElements(resultats[lieu], div)) {
                list.appendChild(div);
            }
        }
    });

    if (estZoneNiv1) {
        sousZones.forEach(sz => {
            if (resultats[sz]) {
                const div = document.createElement("div");
                div.className = "elements-lieu";
                div.innerHTML = `<div class="elements-lieu-titre">${getNomLieu(sz)} :</div>`;
                if (afficherGroupeElements(resultats[sz], div)) list.appendChild(div);
            }
            getLieuxPourRecherche(sz).forEach(lieu => {
                if (lieu !== sz && resultats[lieu]) {
                    const div = document.createElement("div");
                    div.className = "elements-lieu";
                    div.innerHTML = `<div class="elements-lieu-titre">${getNomLieu(sz)} (${getNomLieu(lieu)}) :</div>`;
                    if (afficherGroupeElements(resultats[lieu], div)) list.appendChild(div);
                }
            });
        });
    }
}

// =========================
// 📋 AFFICHER GROUPE
// =========================

function afficherGroupeElements(elements, container) {
    const filtres = {};
    document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
        filtres[cb.value] = cb.checked;
    });

    const hobbyPoisson = parseInt(document.getElementById("hobbyPoisson").value) || null;
    const hobbyOiseau  = parseInt(document.getElementById("hobbyOiseau").value)  || null;
    const hobbyInsecte = parseInt(document.getElementById("hobbyInsecte").value) || null;
    const afficherNonDebloques = document.getElementById("afficherNonDebloques").checked;
    const cacherObtenus = document.getElementById("cacherObtenus").checked;
    const decalage = parseInt(document.getElementById("selectServeur").value) || 0;

    const meteosCochees = new Set(
        [...document.querySelectorAll(".meteo-cb")].filter(cb => cb.checked).map(cb => cb.value)
    );
    const heuresCochees = new Set(
        [...document.querySelectorAll(".heure-cb")].filter(cb => cb.checked).map(cb => cb.value)
    );
    const tranchesOrdre = ["matin", "après-midi", "soir", "nuit"];

    function decalerHeure(h) {
        const idx = tranchesOrdre.indexOf(h);
        if (idx === -1) return h;
        return tranchesOrdre[(idx + decalage / 6) % 4];
    }

    const ul = document.createElement("ul");
    ul.className = "elements-lieu-liste";

    const tousElements = [
        ...(filtres["poisson"] ? poissons.filter(p => elements.includes(Array.isArray(p.name) ? p.name[0] : p.name)).map(p => ({
            name: getNom(p), emoji: "🐟", niveau: p.niveau_hobby, hobbyUser: hobbyPoisson,
            heures: p.heures || [], meteos: p.meteos || [], element: p
        })) : []),
        ...(filtres["oiseau"] ? oiseaux.filter(o => elements.includes(Array.isArray(o.name) ? o.name[0] : o.name)).map(o => ({
            name: getNom(o), emoji: "🪶", niveau: o.niveau_hobby, hobbyUser: hobbyOiseau,
            heures: o.heures || [], meteos: o.meteos || [], element: o
        })) : []),
        ...(filtres["insecte"] ? insectes.filter(i => elements.includes(Array.isArray(i.name) ? i.name[0] : i.name)).map(i => ({
            name: getNom(i), emoji: "🐛", niveau: i.niveau_hobby, hobbyUser: hobbyInsecte,
            heures: i.heures || [], meteos: i.meteos || [], element: i
        })) : [])
    ];

    if (tousElements.length === 0) return;

    let auMoinsUn = false;

    tousElements.forEach(({ name, emoji, niveau, hobbyUser, heures, meteos, element }) => {
        const nameFr = Array.isArray(element.name) ? element.name[0] : element.name;
        const debloque = hobbyUser === null || niveau <= hobbyUser;
        const heuresDecalees = heures.map(decalerHeure);
        const meteoMode = document.querySelector("input[name='meteoMode']:checked").value;
        const meteoOk = meteoMode === "ou"
            ? meteos.some(m => meteosCochees.has(m))
            : meteos.length === meteosCochees.size && meteos.every(m => meteosCochees.has(m));
        const heureMode = document.querySelector("input[name='heureMode']:checked").value;
        const heureOk = heureMode === "ou"
            ? heuresDecalees.some(h => heuresCochees.has(h))
            : heuresDecalees.length === heuresCochees.size && heuresDecalees.every(h => heuresCochees.has(h));
        const visible = debloque && meteoOk && heureOk;
        const obtenu = !!checkedFaune[nameFr];

        if (!visible && !afficherNonDebloques) return;
        if (obtenu && cacherObtenus && !afficherNonDebloques) return;

        auMoinsUn = true;
        const li = document.createElement("li");
        li.dataset.nameFr = nameFr;
        li.textContent = `${emoji} ${name}`;

        if (!visible || (obtenu && cacherObtenus)) {
            li.style.color = "#555";
        }

        li.onclick = function(e) {
            e.stopPropagation();
            document.querySelectorAll(".element-details").forEach(d => d.remove());
            document.querySelectorAll(".elements-lieu-liste li.selected").forEach(l => l.classList.remove("selected"));
            if (selectedElement === nameFr) {
                selectedElement = null;
                return;
            }
            selectedElement = nameFr;
            li.classList.add("selected");
            const details = document.createElement("div");
            details.className = "element-details";
            const heuresAffichees = heuresDecalees.map(h => traduireHeure(h)).join(", ");
            const meteosAffichees = meteos.map(m => traduireMeteo(m)).join(", ");
            details.innerHTML = `
                <div class="element-details-row">${t("detailsHeures")} : ${heuresAffichees}</div>
                <div class="element-details-row">${t("detailsMeteo")} : ${meteosAffichees}</div>
                <div class="element-details-row">${t("detailsHobby")} : ${niveau || "?"}</div>
            `;
            li.insertAdjacentElement("afterend", details);
        };

        ul.appendChild(li);
    });

    if (auMoinsUn) container.appendChild(ul);
    return auMoinsUn;
}

// =========================
// ⭐ PANEL SPECIAUX
// =========================

function toggleSpeciaux() {
    const panel = document.getElementById("panelSpeciaux");
    const btn = document.getElementById("btnSpeciaux");
    panel.classList.toggle("hidden");
    btn.style.display = panel.classList.contains("hidden") ? "" : "none";

    if (!panel.classList.contains("hidden")) {
        const list = document.getElementById("speciauxList");
        list.innerHTML = "";
        lieuxSpeciaux.forEach(lieu => {
            const elements = [
                ...poissons.filter(p => (Array.isArray(p.lieu) ? p.lieu[0] : p.lieu) === lieu).map(p => Array.isArray(p.name) ? p.name[0] : p.name),
                ...oiseaux.filter(o => (Array.isArray(o.lieu) ? o.lieu[0] : o.lieu) === lieu).map(o => Array.isArray(o.name) ? o.name[0] : o.name),
                ...insectes.filter(i => (Array.isArray(i.lieu) ? i.lieu[0] : i.lieu) === lieu).map(i => Array.isArray(i.name) ? i.name[0] : i.name)
            ];
            if (elements.length > 0) {
                const div = document.createElement("div");
                div.className = "elements-lieu";
                div.innerHTML = `<div class="elements-lieu-titre">${getNomLieu(lieu)} :</div>`;
                afficherGroupeElements(elements, div);
                list.appendChild(div);
            }
        });
    }
}

function toggleElementsPanel() {
    if (!selectedPlace) return;
    document.getElementById("elementsPanel").classList.toggle("hidden");
}

// =========================
// 🍄 LEGENDE COLLECTIBLES
// =========================

function afficherLegende() {
    const list = document.getElementById("legendeList");
    list.innerHTML = "";
    const panel = document.getElementById("legendeCollectibles");
    const visibles = collectibles.filter(c => c.spawns && c.spawns.length > 0);
    if (visibles.length === 0) {
        panel.classList.add("hidden");
        return;
    }
    panel.classList.remove("hidden");
    const i = langIndex[langue];
    const grouped = {};
    visibles.forEach(c => {
        const typeKey = c.type[i] || c.type[0];
        if (!grouped[typeKey]) grouped[typeKey] = [];
        grouped[typeKey].push(c);
    });
    Object.keys(grouped).forEach(type => {
        const idx = langIndex[langue];
        list.appendChild(createSeparator());
        const title = document.createElement("div");
        title.className = "legende-type-title";
        title.textContent = type + "s";
        list.appendChild(title);
        list.appendChild(createSeparator());
        grouped[type]
            .sort((a, b) => (a.name[idx] || a.name[0]).localeCompare(b.name[idx] || b.name[0], 'fr', { sensitivity: 'base' }))
            .forEach(c => {
                const div = document.createElement("div");
                div.className = "legende-item";
                div.innerHTML = `
                    <div class="legende-pastille" style="background:${c.color || "#e67e22"}"></div>
                    <span>${c.name[idx] || c.name[0]}</span>
                `;
                list.appendChild(div);
            });
    });
}

// =========================
// 🔄 RAFRAICHIR AFFICHAGE
// =========================

function rafraichirAffichage() {
    const elementOuvert = selectedElement;
    document.querySelectorAll(".place-marker").forEach(el => {
        const name = el.dataset.name;
        const place = places.find(p => Array.isArray(p.name) ? p.name[0] === name : p.name === name);
        if (place) {
            const label = el.querySelector(".place-label");
            if (label) label.textContent = formatPlaceName(getNom(place));
        }
    });
    afficherLegende();
    if (selectedPlace) {
        const place = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === selectedPlace);
        const title = document.getElementById("placeTitle");
        if (title && place) title.textContent = getNom(place);
        afficherElementsLieu(selectedPlace);
        if (elementOuvert) {
            setTimeout(() => {
                const liEl = [...document.querySelectorAll(".elements-lieu-liste li")]
                    .find(liEl => liEl.dataset.nameFr === elementOuvert);
                if (liEl) {
                    selectedElement = null;
                    liEl.click();
                }
            }, 50);
        }
    }
    const panelSpeciaux = document.getElementById("panelSpeciaux");
    if (!panelSpeciaux.classList.contains("hidden")) {
        toggleSpeciaux();
    }
}

// =========================
// 🎛️ LISTENERS FILTRES
// =========================

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
        cb.addEventListener("change", function() {
            if (mode !== "user") return;
            appliquerFiltres();
        });
    });
    document.querySelectorAll(".meteo-cb").forEach(cb => cb.addEventListener("change", appliquerFiltres));
    document.querySelectorAll(".heure-cb").forEach(cb => cb.addEventListener("change", appliquerFiltres));
    document.querySelectorAll("input[name='meteoMode']").forEach(r => r.addEventListener("change", appliquerFiltres));
    document.querySelectorAll("input[name='heureMode']").forEach(r => r.addEventListener("change", appliquerFiltres));

    ["hobbyPoisson", "hobbyOiseau", "hobbyInsecte", "afficherNonDebloques", "cacherObtenus"].forEach(id => {
        document.getElementById(id).addEventListener("change", appliquerFiltres);
    });

    // Légende collectibles toggle
    const panel = document.getElementById("legendeCollectibles");
    const titre = document.getElementById("legendeCollectiblesTitre");
    panel.classList.add("closed");
    titre.textContent = "🍄 Collectibles ▶";
    titre.addEventListener("click", () => {
        panel.classList.toggle("closed");
        titre.textContent = "🍄 Collectibles " + (panel.classList.contains("closed") ? "▶" : "▼");
    });

    // Filter toggle
    const filterToggle = document.getElementById("filterToggle");
    const hobbyPanel = document.getElementById("hobbyPanel");
    hobbyPanel.classList.remove("hidden");
    filterToggle.addEventListener("click", () => {
        if (hobbyPanel.classList.contains("hidden")) {
            hobbyPanel.classList.remove("hidden");
        } else {
            hobbyPanel.classList.add("hidden");
        }
        setFilterToggleText();
    });
    setFilterToggleText();
});
