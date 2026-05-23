// =========================
// 🌍 VARIABLES GLOBALES
// =========================

let selectedPlace = null;
let draggingPlace = null;
let selectedElement = null;
let isPanning = false;
let mode = "user";
let langue = "fr";
let zoom = 1;
let panX = 0;
let panY = 0;
let panStartX = 0;
let panStartY = 0;

// =========================
// 🐟 DONNÉES
// =========================

let poissons = [];
let insectes = [];
let oiseaux = [];
let collectibles = [];
let places = [];
let ingredients = [];
let recettes = [];

// =========================
// ✅ FAUNE OBTENUE
// =========================

const checkedFaune = JSON.parse(localStorage.getItem("checkedFaune") || "{}");

/**
 * Persiste l'objet `checkedFaune` dans le localStorage.
 * @returns {void}
 */
function saveCheckedFaune() {
    localStorage.setItem("checkedFaune", JSON.stringify(checkedFaune));
}

// =========================
// 🗺️ ZONES ET SOUS-ZONES
// =========================

const zoneParent = {
    "Village de pêcheurs": ["Phare", "Quai", "Événement : pêche en mer", "Événement : retour des oiseaux au nid", "Place du village de pêcheurs", "Quai oriental du village de pêcheurs"],
    "Forêt": ["Tour faon", "Île de la forêt", "Lac de la forêt", "Forêt de chênes spirituels", "Tremplin"],
    "Champ de fleurs": ["Montagne de baleine", "Lac de la prairie", "Champs de fleurs des moulins à vent", "Plage violette"],
    "Montagne thermale": ["Ruines", "Lac de la montagne thermale", "Lac volcanique", "Événement : attirer les insectes hors de leur trou", "Source thermale", "Falaise rocheuse"],
    "Banlieue": ["Lac de banlieue"]
};

const lieuxGeneriques = ["Lacs", "Rivières", "Mers", "Foyer", "Bord de l'eau", "Au sommet de la tête de Blanc", "Attracteur d'insectes"];
const lieuxSpeciaux = ["Foyer", "Au sommet de la tête de Blanc", "Attracteur d'insectes"];

const traductionsHeures = {
    "matin": "dawn",
    "après-midi": "day",
    "soir": "dusk",
    "nuit": "night"
};

const traductionsMeteos = {
    "soleil": "sunny",
    "pluie": "rainy",
    "arc-en-ciel": "rainbow"
};

const generiquesEN = {
    "Lacs": "Lakes",
    "Rivières": "Rivers",
    "Mers": "Seas",
    "Foyer": "Home",
    "Bord de l'eau": "Waterside",
    "Au sommet de la tête de Blanc": "At the Top of Blanc's Head",
    "Attracteur d'insectes": "Insect Lure"
};

const langIndex = {
    fr: 0,
    en: 1
};

// =========================
// 💾 CHARGEMENT BDD
// =========================

/**
 * Charge les données depuis le localStorage (prioritaire) ou les fichiers JSON du dossier `database/`.
 * Peuple les tableaux globaux `poissons`, `insectes`, `oiseaux`, `collectibles`, `places`,
 * `ingredients`, `recettes` et synchronise le localStorage.
 * @async
 * @returns {Promise<void>}
 */
async function loadDatabaseAuto() {
    const keys = [
        { key: "poissons",    file: "poissons.json" },
        { key: "insectes",    file: "insectes.json" },
        { key: "oiseaux",     file: "oiseaux.json" },
        { key: "collectibles",file: "collectibles.json" },
        { key: "places",      file: "lieux.json" },
        { key: "ingredients", file: "ingredients.json" },
        { key: "recettes",    file: "recettes.json" }
    ];

    const promises = keys.map(async ({ key, file }) => {
        const local = localStorage.getItem(key);
        if (local) {
            return { key, data: JSON.parse(local) };
        }
        try {
            const res = await fetch(`database/${file}`);
            const data = await res.json();
            return { key, data };
        } catch (e) {
            console.warn(`Erreur chargement ${file}`, e);
            return { key, data: [] };
        }
    });

    const results = await Promise.all(promises);

    results.forEach(({ key, data }) => {
        if (key === "poissons")     poissons    = data;
        if (key === "insectes")     insectes    = data;
        if (key === "oiseaux")      oiseaux     = data;
        if (key === "collectibles") collectibles = data;
        if (key === "places")       places      = data;
        if (key === "ingredients") ingredients = data;
        if (key === "recettes")    recettes    = data;
        localStorage.setItem(key, JSON.stringify(data));
    });
}

/**
 * Persiste le tableau global `places` dans le localStorage.
 * @returns {void}
 */
function savePlaces() {
    localStorage.setItem("places", JSON.stringify(places));
}

// =========================
// 🔤 HELPERS NOMS
// =========================

/**
 * Retourne l'index de langue courant (0 = FR, 1 = EN).
 * @returns {number} 0 ou 1
 */
function li() {
    return langIndex[langue];
}

/**
 * Retourne le nom affiché d'un élément de faune/recette/ingrédient selon la langue courante.
 * @param {{ name: string | [string, string] }} element - Objet possédant une propriété `name`.
 * @returns {string} Nom dans la langue courante, ou chaîne vide si absent.
 */
function getNom(element) {
    if (!element || !element.name) return "";
    if (Array.isArray(element.name)) return element.name[li()];
    return element.name;
}

/**
 * Retourne le lieu affiché d'un élément de faune selon la langue courante.
 * @param {{ lieu: string | [string, string] }} element - Objet possédant une propriété `lieu`.
 * @returns {string} Lieu dans la langue courante, ou chaîne vide si absent.
 */
function getLieu(element) {
    if (!element || !element.lieu) return "";
    if (Array.isArray(element.lieu)) return element.lieu[li()];
    return element.lieu;
}

/**
 * Traduit un nom de lieu du français vers la langue courante.
 * Cherche d'abord dans le tableau `places`, puis dans les noms génériques.
 * @param {string} nomFr - Nom français du lieu.
 * @returns {string} Nom traduit, ou `nomFr` si aucune traduction trouvée.
 */
function getNomLieu(nomFr) {
    if (langue === "fr") return nomFr;
    const place = places.find(p => (Array.isArray(p.name) ? p.name[0] : p.name) === nomFr);
    if (place && Array.isArray(place.name)) return place.name[1];
    return generiquesEN[nomFr] || nomFr;
}

/**
 * Traduit une tranche horaire du français vers l'anglais.
 * @param {string} h - Tranche horaire en français (ex. "matin").
 * @returns {string} Traduction anglaise ou valeur originale si langue courante est FR.
 */
function traduireHeure(h) {
    return langue === "fr" ? h : (traductionsHeures[h] || h);
}

/**
 * Traduit une météo du français vers l'anglais.
 * @param {string} m - Météo en français (ex. "soleil").
 * @returns {string} Traduction anglaise ou valeur originale si langue courante est FR.
 */
function traduireMeteo(m) {
    return langue === "fr" ? m : (traductionsMeteos[m] || m);
}

/**
 * Formate un nom de lieu pour l'affichage sur le marqueur de carte,
 * en découpant sur plusieurs lignes si le nom dépasse 19 caractères.
 * @param {string | [string, string]} name - Nom du lieu (chaîne ou tableau bilingue ; utilise l'index 0).
 * @returns {string} Nom formaté avec retours à la ligne `\n`.
 */
function formatPlaceName(name) {
    if (Array.isArray(name)) name = name[0];
    const max = 19;
    const words = name.split(" ");
    let lines = [];
    let line = "";
    for (let w of words) {
        const test = line ? line + " " + w : w;
        if (test.length > max) {
            lines.push(line);
            line = w;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines.join("\n");
}

/**
 * Remplit des éléments `<select>` avec des options numérotées de 1 à `max`.
 * N'ajoute des options que si le select est encore vide.
 * @param {string[]} selectIds - Tableau d'identifiants HTML des `<select>` à remplir.
 * @param {number} [max=10] - Nombre maximum de niveaux à générer.
 * @returns {void}
 */
function remplirSelectNiveaux(selectIds, max = 10) {
    const valeurDefaut = max;
    const options = `
        <option value="">—</option>
        ${Array.from({ length: max }, (_, i) => `
            <option value="${i + 1}" ${i + 1 === valeurDefaut ? "selected" : ""}>
                ${i + 1}
            </option>
        `).join("")}
    `;
    selectIds.forEach(id => {
        const select = document.getElementById(id);
        if (select && select.children.length === 0) {
            select.innerHTML = options;
        }
    });
}

// =========================
// 🗺️ RECHERCHE LIEUX
// =========================

/**
 * Retourne l'ensemble des noms de lieux à interroger pour un lieu donné,
 * en ajoutant automatiquement les catégories génériques correspondantes
 * (Lacs, Rivières, Mers, Bord de l'eau).
 * @param {string} nomLieu - Nom français du lieu de départ.
 * @returns {Set<string>} Ensemble de noms de lieux (français) à utiliser pour la recherche de faune.
 */
function getLieuxPourRecherche(nomLieu) {
    const lieuxARechercher = new Set([nomLieu]);
    const nom = nomLieu.toLowerCase();
    if (nom.includes("lac")) {
        lieuxARechercher.add("Lacs");
        lieuxARechercher.add("Bord de l'eau");
    }
    if (nom.includes("rivière") || nom.includes("riviere") || nom.includes("fleuve")) {
        lieuxARechercher.add("Rivières");
        lieuxARechercher.add("Bord de l'eau");
    }
    if (new RegExp(`\\bmer\\b`, "i").test(nomLieu)) {
        lieuxARechercher.add("Mers");
    }
    return lieuxARechercher;
}

/**
 * Retourne tous les éléments de faune (poissons, insectes, oiseaux) associés à un lieu,
 * en incluant ses sous-zones si c'est une zone de niveau 1.
 * @param {string} nomLieu - Nom français du lieu.
 * @returns {{
 *   estZoneNiv1: boolean,
 *   sousZones: string[],
 *   resultats: Object.<string, string[]>
 * }} Objet contenant :
 *   - `estZoneNiv1` : vrai si le lieu est une zone parente dans `zoneParent`.
 *   - `sousZones` : liste des noms français des sous-zones (vide si pas de zone parente).
 *   - `resultats` : dictionnaire `{ nomLieu: [nomFauneA, nomFauneB, ...] }` (noms en français).
 */
function getElementsPourLieu(nomLieu) {
    const estZoneNiv1 = zoneParent.hasOwnProperty(nomLieu);
    const sousZones = estZoneNiv1 ? zoneParent[nomLieu] : [];
    const tousLesLieux = new Set(getLieuxPourRecherche(nomLieu));
    sousZones.forEach(sz => getLieuxPourRecherche(sz).forEach(l => tousLesLieux.add(l)));
    const tous = [...poissons, ...insectes, ...oiseaux];
    const resultats = {};
    tous.forEach(el => {
        const lieuFr = Array.isArray(el.lieu) ? el.lieu[0] : el.lieu;
        if (tousLesLieux.has(lieuFr)) {
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            if (!resultats[lieuFr]) resultats[lieuFr] = [];
            resultats[lieuFr].push(nameFr);
        }
    });
    return { estZoneNiv1, sousZones, resultats };
}

/**
 * Crée et retourne un élément `<hr>` avec la classe CSS `hobby-separator`.
 * @returns {HTMLHRElement}
 */
function createSeparator() {
    const hr = document.createElement("hr");
    hr.className = "hobby-separator";
    return hr;
}
