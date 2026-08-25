/* =========================
   🔍 BARRE DE RECHERCHE GLOBALE
   ========================= */
// Utilisée dans : faune obtenue, recettes, panneaux modifier admin

/**
 * Crée et retourne un composant barre de recherche (wrapper div contenant
 * une icône, un input texte et un bouton d'effacement).
 * @param {string} placeholder - Texte affiché dans le champ vide.
 * @param {function(string): void} onSearch - Callback appelé à chaque saisie
 *   avec la valeur en minuscules et sans espaces superflus.
 *   Appelé avec `""` lors d'un effacement.
 * @returns {HTMLDivElement} Élément wrapper prêt à être inséré dans le DOM.
 */
function createSearchBar(placeholder, onSearch) {
    const wrapper = document.createElement("div");
    wrapper.className = "search-wrapper";

    const icon = document.createElement("span");
    icon.className = "search-icon";
    icon.textContent = "🔍";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "search-input";
    input.placeholder = placeholder || (language === "fr" ? "Rechercher..." : "Search...");

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

/**
 * Teste si un texte contient la chaîne de recherche (insensible à la casse).
 * @param {string} texte - Texte dans lequel chercher.
 * @param {string} recherche - Terme à rechercher (déjà en minuscules).
 * @returns {boolean} `true` si `texte` contient `recherche`, ou si `recherche` est vide.
 */
function matchSearch(texte, recherche) {
    if (!recherche) return true;
    return texte.toLowerCase().includes(recherche);
}

/* =========================
   🔍 RECHERCHE FAUNE CARTE
   ========================= */

/** @type {string} Requête de recherche courante pour le filtre de faune sur la carte. */
let wildlifeSearchQuery = "";

/**
 * Initialise la barre de recherche de faune sur la carte (`#fauneSearchInput`).
 * Branche les événements `input` et clic sur le bouton d'effacement.
 * En cas de saisie, affiche les résultats groupés par lieu dans le panneau de droite ;
 * en cas d'effacement, restaure l'affichage du lieu sélectionné ou vide le panneau.
 * @returns {void}
 */
function initWildlifeSearch() {
    const input = document.getElementById("fauneSearchInput");
    const btnClear = document.getElementById("fauneSearchClear");
    if (!input) return;

    input.placeholder = language === "fr" ? "Filtrer la faune..." : "Filter wildlife...";

    input.addEventListener("keydown", e => e.stopPropagation());

    input.addEventListener("input", () => {
        wildlifeSearchQuery = input.value.trim().toLowerCase();
        btnClear.classList.toggle("hidden", wildlifeSearchQuery.length === 0);
        if (wildlifeSearchQuery.length === 0) {
            if (!selectedPlace) {
                document.getElementById("placeTitle").textContent = t("aucunLieu");
                document.getElementById("elementsPanel").classList.add("hidden");
            } else {
                showPlaceElements(selectedPlace);
            }
        } else {
            showWildlifeSearchResults(wildlifeSearchQuery);
        }
    });

    btnClear.addEventListener("click", () => {
        input.value = "";
        wildlifeSearchQuery = "";
        btnClear.classList.add("hidden");
        if (!selectedPlace) {
            document.getElementById("placeTitle").textContent = t("aucunLieu");
            document.getElementById("elementsPanel").classList.add("hidden");
        } else {
            showPlaceElements(selectedPlace);
        }
        input.focus();
    });
}

/**
 * Affiche dans le panneau de droite (`#elementsList`) tous les éléments de faune
 * correspondant à la requête `q`, groupés par lieu.
 * Respecte les filtres de catégorie (poissons/oiseaux/insectes) actifs dans `.filters`.
 * @param {string} q - Terme de recherche (en minuscules).
 * @returns {void}
 */
function showWildlifeSearchResults(q) {
    const filtres = {};
    document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
        filtres[cb.value] = cb.checked;
    });

    const tous = [
        ...(filtres["poisson"] ? fish.map(p => ({ el: p, emoji: "🐟" })) : []),
        ...(filtres["oiseau"]  ? birds.map(o  => ({ el: o, emoji: "🪶" })) : []),
        ...(filtres["insecte"] ? insects.map(i  => ({ el: i, emoji: "🐛" })) : [])
    ];

    const trouves = tous.filter(({ el }) => matchSearch(getName(el), q));

    const title = document.getElementById("placeTitle");
    const panel = document.getElementById("elementsPanel");
    const list  = document.getElementById("elementsList");

    if (trouves.length === 0) {
        title.textContent = language === "fr" ? "Aucun résultat" : "No results";
        list.innerHTML = `<div style="color:#666;font-size:14px">${language === "fr" ? "Aucune faune trouvée." : "No wildlife found."}</div>`;
        panel.classList.remove("hidden");
        return;
    }

    // Grouper par lieu (FR)
    /** @type {Object.<string, Array<{el: Object, emoji: string}>>} */
    const parLieu = {};
    trouves.forEach(({ el, emoji }) => {
        const lieuFr = Array.isArray(el.lieu) ? el.lieu[0] : el.lieu;
        if (!parLieu[lieuFr]) parLieu[lieuFr] = [];
        parLieu[lieuFr].push({ el, emoji });
    });

    title.textContent = language === "fr" ? "Résultats de recherche" : "Search results";
    list.innerHTML = "";

    Object.entries(parLieu).forEach(([lieuFr, items]) => {
        const div = document.createElement("div");
        div.className = "elements-lieu";

        const titreLieu = document.createElement("div");
        titreLieu.className = "elements-lieu-titre";
        titreLieu.textContent = getPlaceName(lieuFr);
        div.appendChild(titreLieu);

        const ul = document.createElement("ul");
        ul.className = "elements-lieu-liste";

        items.forEach(({ el, emoji }) => {
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            const li = document.createElement("li");
            li.textContent = emoji + " " + getName(el);
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
                details.appendChild(createDetailRow(t("detailsHeures"), heuresDecalees.map(h => translateTime(h)).join(", ")));
                details.appendChild(createDetailRow(t("detailsMeteo"), (el.meteos || []).map(m => translateWeather(m)).join(", ")));
                details.appendChild(createDetailRow(t("detailsHobby"), el.niveau_hobby || "?"));
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
document.addEventListener("DOMContentLoaded", () => { initWildlifeSearch(); });
