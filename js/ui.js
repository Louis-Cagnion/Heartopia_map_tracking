// =========================
// ☀️ THEME
// =========================

let themeMode = localStorage.getItem("themeMode") || "dark";

function applyTheme() {
    if (themeMode === "light") {
        document.body.classList.add("light-mode");
        document.getElementById("btnTheme").textContent = langue === "fr" ? "🌙 Mode sombre" : "🌙 Dark mode";
    } else {
        document.body.classList.remove("light-mode");
        document.getElementById("btnTheme").textContent = langue === "fr" ? "☀️ Mode clair" : "☀️ Light mode";
    }
}

function toggleTheme() {
    themeMode = themeMode === "dark" ? "light" : "dark";
    localStorage.setItem("themeMode", themeMode);
    applyTheme();
}

// Appliquer au chargement
document.addEventListener("DOMContentLoaded", () => { applyTheme(); });

// =========================
// 🌍 UI STRINGS
// =========================

const UI = {
    fr: {
        titreWebsite: "Wiki Heartopia",
        mapTitle: "Wiki Heartopia",
        modeUser: "👀 Mode utilisateur",
        modeAdmin: "🔐 Mode admin",
        niveauPassion: "💗 Niveau de passion",
        peche: "🐟 Pêche",
        observation: "🪶 Observation des oiseaux",
        attrapage: "🐛 Attrapage d'insectes",
        afficherNonDebloques: "Afficher non débloqués",
        cacherObtenus: "Cacher les obtenus",
        aucunLieu: "Aucun lieu sélectionné",
        speciaux: "⭐ Localisations spéciales",
        aucunElement: "Aucun élément répertorié",
        filtrePoissons: "Poissons",
        filtreOiseaux: "Oiseaux",
        filtreInsectes: "Insectes",
        filtreCollectibles: "Collectibles",
        suppressionCollectible: "🗑️ Mode suppression actif",
        legendeTitre: "🍄 Collectibles ▶",
        meteoActuelle: "☁️ Météo actuelle",
        langue: "🌐 Langue",
        serveur: "🌍 Serveur",
        meteoSoleil: "Soleil",
        meteoPluie: "Pluie",
        meteoArc: "Arc-en-ciel",
        horaires: "🕐 Horaires",
        matin: "🌅 Matin",
        apresMidi: "☀️ Après-midi",
        soir: "🌆 Soir",
        nuit: "🌙 Nuit",
        meteoModeOu: "Au moins une",
        meteoModeEt: "Exactement",
        heureModeOu: "Au moins une",
        heureModeEt: "Exactement",
        adminAjouterPoisson: "🐟 Poisson",
        adminAjouterInsecte: "🐛 Insecte",
        adminAjouterOiseau: "🪶 Oiseau",
        adminAjouterCollectible: "🍄 Collectible",
        adminSupprimerPosition: "🗑️ Supprimer position collectible",
        adminSupprimerElement: "🗑️ Supprimer élément",
        adminExporter: "📤 Tout exporter",
        adminImporter: "📥 Importer éléments",
        adminExporterLieux: "📤 Exporter lieux",
        adminImporterLieux: "📥 Importer lieux",
        adminTitrePoisson: "🐟 Ajouter un poisson",
        adminTitreInsecte: "🐛 Ajouter un insecte",
        adminTitreOiseau: "🪶 Ajouter un oiseau",
        adminHeures: "Heures",
        adminMeteo: "Météo",
        adminNiveauHobby: "Niveau hobby",
        adminSauvegarder: "💾 Sauvegarder",
        adminFermer: "✖ Fermer",
        adminCreerPlacer: "✅ Créer et placer",
        adminNouvelElement: "➕ Nouvel élément",
        adminAjouterPositions: "📍 Ajouter des positions",
        adminPlacerCarte: "📍 Placer sur la carte",
        adminNomFr: "Nom FR",
        adminNomEn: "Nom EN",
        adminLieu: "Lieu",
        adminCategorie: "Catégorie",
        adminNouvelleCategorie: "Nouvelle catégorie",
        adminCouleur: "Couleur",
        detailsHeures: "🕐 Horaires",
        detailsMeteo: "☁️ Météo",
        detailsHobby: "💗 Niveau",
        filtres: "Filtres",
        ongletCarte: "🗺️ Carte interactive",
        ongletTab2: "📋 Faune obtenue",
        ongletRecettes: "🍳 Recettes",
        wildlifePoisson: "🐟 Poissons",
        wildlifeOiseau: "🪶 Oiseaux",
        wildlifeInsecte: "🐛 Insectes",
        niveauLabel: "Niveau",
        // === ADMIN REFONTE ===
        adminSectionAjouter: "➕ Ajouter un élément",
        adminSectionModifier: "✏️ Modifier un élément",
        adminSectionSupprimer: "🗑️ Supprimer un élément",
        adminSectionImportExport: "📦 Import / Export",
        adminAjouterIngredient: "🥕 Ingrédient",
        adminAjouterRecette: "📖 Recette",
        adminNomFrLabel: "Nom FR",
        adminNomEnLabel: "Nom EN",
        adminPrix: "Prix",
        adminCategorieLabel: "Catégorie",
        adminEnergy: "Énergie",
        adminSellPrice: "Prix de vente",
        adminPalier1: "Palier 1 (nombre de plats)",
        adminPalier2: "Palier 2 (nombre de plats)",
        adminPalier3: "Palier 3 (nombre de plats)",
        adminPaliersLabel: "Niveaux de cuisine",
        adminIngredients: "Ingrédients",
        adminNbSlots: "Nombre de slots",
        adminSlot: "Slot",
        adminChoixIngredients: "Ingrédients autorisés",
        adminAjouterSlot: "➕ Ajouter un slot",
        adminRetirerSlot: "➖ Retirer un slot",
        adminSelectionnerElement: "— Sélectionner —",
        adminElementAModifier: "Élément à modifier",
        adminElementASupprimer: "Élément à supprimer",
        adminImporter: "📥 Importer des fichiers",
        adminExporterTout: "📤 Exporter tout",
        adminExporterChoix: "Choisir les fichiers à exporter",
        adminFermerCarte: "✖ Fermer la carte",
        adminPositionsCarte: "Positions sur la carte",
        adminAjouterPosition: "📍 Ajouter une position",
        adminSupprimerPositionMode: "🗑️ Mode suppression actif",
        adminNombreSlots: "2 slots",
        adminCategories: "Catégories",
        adminPoissonsDisponibles: "Poissons disponibles",
        adminCollectiblesDisponibles: "Collectibles disponibles",
        adminIngredientsDisponibles: "Ingrédients disponibles",
    },
    en: {
        titreWebsite: "Heartopia Wiki",
        mapTitle: "Heartopia Wiki",
        modeUser: "👀 User mode",
        modeAdmin: "🔐 Admin mode",
        niveauPassion: "💗 Hobby level",
        peche: "🐟 Fishing",
        observation: "🪶 Birdwatching",
        attrapage: "🐛 Insect catching",
        afficherNonDebloques: "Show locked",
        cacherObtenus: "Hide obtained",
        aucunLieu: "No location selected",
        speciaux: "⭐ Special locations",
        aucunElement: "No elements found",
        filtrePoissons: "Fish",
        filtreOiseaux: "Birds",
        filtreInsectes: "Insects",
        filtreCollectibles: "Collectibles",
        suppressionCollectible: "🗑️ Delete mode active",
        legendeTitre: "🍄 Collectibles ▶",
        meteoActuelle: "☁️ Current weather",
        langue: "🌐 Language",
        serveur: "🌍 Server",
        meteoSoleil: "Sunny",
        meteoPluie: "Rainy",
        meteoArc: "Rainbow",
        horaires: "🕐 Schedule",
        matin: "🌅 Dawn",
        apresMidi: "☀️ Day",
        soir: "🌆 Dusk",
        nuit: "🌙 Night",
        meteoModeOu: "At least one",
        meteoModeEt: "Exactly",
        heureModeOu: "At least one",
        heureModeEt: "Exactly",
        adminAjouterPoisson: "🐟 Fish",
        adminAjouterInsecte: "🐛 Insect",
        adminAjouterOiseau: "🪶 Bird",
        adminAjouterCollectible: "🍄 Collectible",
        adminSupprimerPosition: "🗑️ Delete collectible position",
        adminSupprimerElement: "🗑️ Delete element",
        adminExporter: "📤 Export all",
        adminImporter: "📥 Import elements",
        adminExporterLieux: "📤 Export locations",
        adminImporterLieux: "📥 Import locations",
        adminTitrePoisson: "🐟 Add a fish",
        adminTitreInsecte: "🐛 Add an insect",
        adminTitreOiseau: "🪶 Add a bird",
        adminHeures: "Schedule",
        adminMeteo: "Weather",
        adminNiveauHobby: "Hobby level",
        adminSauvegarder: "💾 Save",
        adminFermer: "✖ Close",
        adminCreerPlacer: "✅ Create and place",
        adminNouvelElement: "➕ New element",
        adminAjouterPositions: "📍 Add positions",
        adminPlacerCarte: "📍 Place on map",
        adminNomFr: "FR name",
        adminNomEn: "EN name",
        adminLieu: "Location",
        adminCategorie: "Category",
        adminNouvelleCategorie: "New category",
        adminCouleur: "Color",
        detailsHeures: "🕐 Schedule",
        detailsMeteo: "☁️ Weather",
        detailsHobby: "💗 Level",
        filtres: "Filters",
        ongletCarte: "🗺️ Interactive Map",
        ongletTab2: "📋 Wildlife obtained",
        ongletRecettes: "🍳 Recipes",
        wildlifePoisson: "🐟 Fish",
        wildlifeOiseau: "🪶 Birds",
        wildlifeInsecte: "🐛 Insects",
        niveauLabel: "Level",
        // === ADMIN REFONTE ===
        adminSectionAjouter: "➕ Add an element",
        adminSectionModifier: "✏️ Modify an element",
        adminSectionSupprimer: "🗑️ Delete an element",
        adminSectionImportExport: "📦 Import / Export",
        adminAjouterIngredient: "🥕 Ingredient",
        adminAjouterRecette: "📖 Recipe",
        adminNomFrLabel: "FR name",
        adminNomEnLabel: "EN name",
        adminPrix: "Price",
        adminCategorieLabel: "Category",
        adminEnergy: "Energy",
        adminSellPrice: "Sell price",
        adminPalier1: "Tier 1 (number of dishes)",
        adminPalier2: "Tier 2 (number of dishes)",
        adminPalier3: "Tier 3 (number of dishes)",
        adminPaliersLabel: "Cooking levels",
        adminIngredients: "Ingredients",
        adminNbSlots: "Number of slots",
        adminSlot: "Slot",
        adminChoixIngredients: "Allowed ingredients",
        adminAjouterSlot: "➕ Add a slot",
        adminRetirerSlot: "➖ Remove a slot",
        adminSelectionnerElement: "— Select —",
        adminElementAModifier: "Element to modify",
        adminElementASupprimer: "Element to delete",
        adminImporter: "📥 Import files",
        adminExporterTout: "📤 Export all",
        adminExporterChoix: "Choose files to export",
        adminFermerCarte: "✖ Close map",
        adminPositionsCarte: "Map positions",
        adminAjouterPosition: "📍 Add a position",
        adminSupprimerPositionMode: "🗑️ Delete mode active",
        adminNombreSlots: "2 slots",
        adminCategories: "Categories",
        adminPoissonsDisponibles: "Available fish",
        adminCollectiblesDisponibles: "Available collectibles",
        adminIngredientsDisponibles: "Available ingredients",
    }
};

function t(key) {
    return UI[langue][key] || key;
}

// =========================
// 🌍 LANGUE
// =========================

function toggleLangue() {
    langue = langue === "fr" ? "en" : "fr";
    document.getElementById("btnLangue").textContent = langue === "fr" ? "🇫🇷 FR" : "🇬🇧 EN";
    mettreAJourUI();
    rafraichirAffichage();
    construireFenetreObtenu("poisson", "ObtenuPoisson");
    construireFenetreObtenu("oiseau", "ObtenuOiseau");
    construireFenetreObtenu("insecte", "ObtenuInsecte");
}

// =========================
// 🖊️ MISE A JOUR UI
// =========================

function mettreAJourUI() {
    document.title = t("titreWebsite");
    document.getElementById("btnUser").textContent = t("modeUser");
    document.getElementById("btnAdmin").textContent = t("modeAdmin");
    applyTheme();
    document.getElementById("labelNiveauPassion").textContent = t("niveauPassion");
    document.getElementById("labelPeche").textContent = t("peche");
    document.getElementById("labelObservation").textContent = t("observation");
    document.getElementById("labelAttrapage").textContent = t("attrapage");
    document.getElementById("labelAfficherNonDebloques").textContent = t("afficherNonDebloques");
    document.getElementById("labelCacherObtenus").textContent = t("cacherObtenus");
    document.getElementById("btnSpeciaux").textContent = t("speciaux");
    document.getElementById("panelSpeciauxTitre").textContent = t("speciaux");

    const legendeCollectibles = document.getElementById("legendeCollectibles");
    const isClosed = legendeCollectibles.classList.contains("closed");
    document.getElementById("legendeCollectiblesTitre").textContent = "🍄 Collectibles " + (isClosed ? "▶" : "▼");

    document.getElementById("labelFiltrePoissons").textContent = t("filtrePoissons");
    document.getElementById("labelFiltreOiseaux").textContent = t("filtreOiseaux");
    document.getElementById("labelFiltreInsectes").textContent = t("filtreInsectes");
    document.getElementById("labelFiltreCollectibles").textContent = t("filtreCollectibles");
    document.getElementById("titrePage").textContent = t("mapTitle");
    document.getElementById("labelMeteo").textContent = t("meteoActuelle");
    document.getElementById("labelServeur").textContent = t("serveur");
    document.getElementById("labelLangue").textContent = t("langue");

    document.querySelectorAll(".meteo-label-soleil").forEach(el => el.textContent = t("meteoSoleil"));
    document.querySelectorAll(".meteo-label-pluie").forEach(el => el.textContent = t("meteoPluie"));
    document.querySelectorAll(".meteo-label-arc").forEach(el => el.textContent = t("meteoArc"));

    document.getElementById("labelHoraires").textContent = t("horaires");
    document.getElementById("labelMatin").textContent = t("matin");
    document.getElementById("labelApresMidi").textContent = t("apresMidi");
    document.getElementById("labelSoir").textContent = t("soir");
    document.getElementById("labelNuit").textContent = t("nuit");
    document.getElementById("labelMeteoModeOu").textContent = t("meteoModeOu");
    document.getElementById("labelMeteoModeEt").textContent = t("meteoModeEt");
    document.getElementById("labelHeureModeOu").textContent = t("heureModeOu");
    document.getElementById("labelHeureModeEt").textContent = t("heureModeEt");

    // Onglets (seulement en mode user, les éléments existent dans le DOM)
    const btnTabMap = document.querySelector(".tab-btn[onclick=\"switchTab('map')\"]");
    const btnTabFaune = document.querySelector(".tab-btn[onclick=\"switchTab('tab2')\"]");
    const btnTabRecettes = document.querySelector(".tab-btn[onclick=\"switchTab('recettes')\"]");
    if (btnTabMap) btnTabMap.textContent = t("ongletCarte");
    if (btnTabFaune) btnTabFaune.textContent = t("ongletTab2");
    if (btnTabRecettes) btnTabRecettes.textContent = t("ongletRecettes");

    const bwp = document.getElementById("btnWildlifePoisson");
    const bwo = document.getElementById("btnWildlifeOiseau");
    const bwi = document.getElementById("btnWildlifeInsecte");
    if (bwp) bwp.textContent = t("wildlifePoisson");
    if (bwo) bwo.textContent = t("wildlifeOiseau");
    if (bwi) bwi.textContent = t("wildlifeInsecte");

    setFilterToggleText();

    // Mettre à jour le placeholder de la recherche faune
    const fauneInput = document.getElementById("fauneSearchInput");
    if (fauneInput) fauneInput.placeholder = langue === "fr" ? "Filtrer la faune..." : "Filter wildlife...";

    if (!selectedPlace) {
        document.getElementById("placeTitle").textContent = t("aucunLieu");
    }

    // Mettre à jour l'interface admin si active
    if (mode === "admin") {
        mettreAJourAdminUI();
    }
    // Rafraîchir l'onglet recettes si actif — sans reconstruire tout le DOM
    if (currentTab === "recettes") {
        const subZone = document.getElementById("recettes-sub-" + currentRecettesSubTab);
        if (subZone) {
            // Mettre à jour les labels des boutons sans recréer la structure
            document.querySelectorAll(".tab-btn-recettes").forEach(btn => {
                const key = btn.dataset.sub;
                const labels = {
                    liste:   { fr: "📖 Infos",                               en: "📖 Infos" },
                    profit:  { fr: "💰 Classement de profit",                en: "💰 Profit ranking" },
                    energie: { fr: "⚡ Classement d'énergie",               en: "⚡ Energy ranking" },
                    calc:    { fr: "🧮 Calculateur de maîtrise de cuisine",  en: "🧮 Cooking mastery calculator" }
                };
                if (labels[key]) btn.textContent = labels[key][langue] || labels[key].fr;
            });
            // Re-render le contenu du sous-onglet actif (textes traduits)
            renderRecettesSubTab(currentRecettesSubTab);
        } else {
            initOngletRecettes();
        }
    }
}

function traduirePanneauFaune(prefix, type) {
    const suffixes = { poisson: "Poisson", insecte: "Insecte", oiseau: "Oiseau" };
    const s = suffixes[type] || type;
    const el = id => document.getElementById(id + s);
    const safe = (id, key) => { const e = el(id); if (e) e.textContent = t(key); };
    safe("adminTitre", "adminTitre" + s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
    safe("adminNomFr", "adminNomFr");
    safe("adminNomEn", "adminNomEn");
    safe("adminLieu", "adminLieu");
    safe("adminHeures", "adminHeures");
    safe("adminMatin", "matin");
    safe("adminApresMidi", "apresMidi");
    safe("adminSoir", "soir");
    safe("adminNuit", "nuit");
    safe("adminMeteo", "adminMeteo");
    safe("adminSoleil", "meteoSoleil");
    safe("adminPluie", "meteoPluie");
    safe("adminArc", "meteoArc");
    safe("adminNiveau", "adminNiveauHobby");
    safe("adminSauvegarder", "adminSauvegarder");
    safe("adminFermer", "adminFermer");
}

// =========================
// 🔲 FILTER TOGGLE
// =========================

function setFilterToggleText() {
    const hobbyPanel = document.getElementById("hobbyPanel");
    const filterToggle = document.getElementById("filterToggle");
    const isOpen = !hobbyPanel.classList.contains("hidden");
    filterToggle.textContent = "";
    const span = document.createElement("span");
    span.id = "labelFiltres";
    span.textContent = t("filtres");
    filterToggle.appendChild(span);
    filterToggle.appendChild(document.createTextNode(isOpen ? " ▼" : " ▶"));
}
