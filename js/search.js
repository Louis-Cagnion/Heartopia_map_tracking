// =========================
// 🔍 BARRE DE RECHERCHE GLOBALE
// =========================
// Utilisée dans : faune obtenue, recettes, panneaux modifier admin

function creerBarreRecherche(placeholder, onSearch) {
    const wrapper = document.createElement("div");
    wrapper.className = "search-wrapper";

    const icon = document.createElement("span");
    icon.className = "search-icon";
    icon.textContent = "🔍";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "search-input";
    input.placeholder = placeholder || (langue === "fr" ? "Rechercher..." : "Search...");

    const btnClear = document.createElement("button");
    btnClear.className = "search-clear hidden";
    btnClear.textContent = "✕";
    btnClear.onclick = () => {
        input.value = "";
        btnClear.classList.add("hidden");
        onSearch("");
        input.focus();
    };

    input.addEventListener("input", () => {
        const val = input.value.trim();
        btnClear.classList.toggle("hidden", val.length === 0);
        onSearch(val.toLowerCase());
    });

    // Empêcher Ctrl+A et les touches de navigation de remonter à la page
    input.addEventListener("keydown", (e) => {
        e.stopPropagation();
    });

    wrapper.appendChild(icon);
    wrapper.appendChild(input);
    wrapper.appendChild(btnClear);
    return wrapper;
}

// Filtre un texte selon la recherche
function matchSearch(texte, recherche) {
    if (!recherche) return true;
    return texte.toLowerCase().includes(recherche);
}

// =========================
// 🔍 RECHERCHE FAUNE CARTE
// =========================

let fauneSearchQuery = "";

function initFauneSearch() {
    const input = document.getElementById("fauneSearchInput");
    const btnClear = document.getElementById("fauneSearchClear");
    if (!input) return;

    input.placeholder = langue === "fr" ? "Filtrer la faune..." : "Filter wildlife...";

    input.addEventListener("keydown", e => e.stopPropagation());

    input.addEventListener("input", () => {
        fauneSearchQuery = input.value.trim().toLowerCase();
        btnClear.classList.toggle("hidden", fauneSearchQuery.length === 0);
        if (fauneSearchQuery.length === 0) {
            // Vider le panneau si aucun lieu sélectionné
            if (!selectedPlace) {
                document.getElementById("placeTitle").textContent = t("aucunLieu");
                document.getElementById("elementsPanel").classList.add("hidden");
            } else {
                afficherElementsLieu(selectedPlace);
            }
        } else {
            afficherFauneRecherche(fauneSearchQuery);
        }
    });

    btnClear.addEventListener("click", () => {
        input.value = "";
        fauneSearchQuery = "";
        btnClear.classList.add("hidden");
        if (!selectedPlace) {
            document.getElementById("placeTitle").textContent = t("aucunLieu");
            document.getElementById("elementsPanel").classList.add("hidden");
        } else {
            afficherElementsLieu(selectedPlace);
        }
        input.focus();
    });
}

// Affiche dans le panneau de droite tous les éléments correspondant à la recherche, groupés par lieu
function afficherFauneRecherche(q) {
    const filtres = {};
    document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
        filtres[cb.value] = cb.checked;
    });

    const tous = [
        ...(filtres["poisson"] ? poissons.map(p => ({ el: p, emoji: "🐟" })) : []),
        ...(filtres["oiseau"]  ? oiseaux.map(o  => ({ el: o, emoji: "🪶" })) : []),
        ...(filtres["insecte"] ? insectes.map(i  => ({ el: i, emoji: "🐛" })) : [])
    ];

    const trouves = tous.filter(({ el }) => matchSearch(getNom(el), q));

    const title = document.getElementById("placeTitle");
    const panel = document.getElementById("elementsPanel");
    const list  = document.getElementById("elementsList");

    if (trouves.length === 0) {
        title.textContent = langue === "fr" ? "Aucun résultat" : "No results";
        list.innerHTML = `<div style="color:#666;font-size:14px">${langue === "fr" ? "Aucune faune trouvée." : "No wildlife found."}</div>`;
        panel.classList.remove("hidden");
        return;
    }

    // Grouper par lieu (FR)
    const parLieu = {};
    trouves.forEach(({ el, emoji }) => {
        const lieuFr = Array.isArray(el.lieu) ? el.lieu[0] : el.lieu;
        if (!parLieu[lieuFr]) parLieu[lieuFr] = [];
        parLieu[lieuFr].push({ el, emoji });
    });

    title.textContent = langue === "fr" ? "Résultats de recherche" : "Search results";
    list.innerHTML = "";

    Object.entries(parLieu).forEach(([lieuFr, items]) => {
        const div = document.createElement("div");
        div.className = "elements-lieu";

        const titreLieu = document.createElement("div");
        titreLieu.className = "elements-lieu-titre";
        titreLieu.textContent = getNomLieu(lieuFr);
        div.appendChild(titreLieu);

        const ul = document.createElement("ul");
        ul.className = "elements-lieu-liste";

        items.forEach(({ el, emoji }) => {
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            const li = document.createElement("li");
            li.textContent = emoji + " " + getNom(el);
            li.dataset.nameFr = nameFr;
            li.onclick = function(e) {
                e.stopPropagation();
                document.querySelectorAll(".element-details").forEach(d => d.remove());
                document.querySelectorAll(".elements-lieu-liste li.selected").forEach(l => l.classList.remove("selected"));
                if (selectedElement === nameFr) { selectedElement = null; return; }
                selectedElement = nameFr;
                li.classList.add("selected");
                const heuresDecalees = (el.heures || []).map(h => {
                    const decalage = parseInt(document.getElementById("selectServeur").value) || 0;
                    const ordre = ["matin","après-midi","soir","nuit"];
                    const idx = ordre.indexOf(h);
                    return idx === -1 ? h : ordre[(idx + decalage / 6) % 4];
                });
                const details = document.createElement("div");
                details.className = "element-details";
                details.innerHTML = `
                    <div class="element-details-row">${t("detailsHeures")} : ${heuresDecalees.map(h => traduireHeure(h)).join(", ")}</div>
                    <div class="element-details-row">${t("detailsMeteo")} : ${(el.meteos || []).map(m => traduireMeteo(m)).join(", ")}</div>
                    <div class="element-details-row">${t("detailsHobby")} : ${el.niveau_hobby || "?"}</div>
                `;
                li.insertAdjacentElement("afterend", details);
            };
            ul.appendChild(li);
        });

        div.appendChild(ul);
        list.appendChild(div);
    });

    panel.classList.remove("hidden");
}

// Appeler à l'init et au changement de langue
document.addEventListener("DOMContentLoaded", () => { initFauneSearch(); });
