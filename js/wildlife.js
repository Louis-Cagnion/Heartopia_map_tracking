/* =========================
   🐟 SWITCH TAB WILDLIFE
   ========================= */

/**
 * Mémorise les niveaux réduits (repliés) par type de faune.
 * @type {{ poisson: Set<number>, oiseau: Set<number>, insecte: Set<number> }}
 */
const collapsedLevels = { poisson: new Set(), oiseau: new Set(), insecte: new Set() };

/**
 * Bascule l'affichage vers le sous-onglet faune spécifié.
 * @param {"poisson" | "oiseau" | "insecte"} type - Type de faune à afficher.
 * @returns {void}
 */
function switchTabWildlife(type) {
    document.querySelectorAll(".FenetreObtenu").forEach(f => f.classList.remove("active"));
    document.querySelectorAll(".tab-btn-wildlife").forEach(b => b.classList.remove("active"));
    document.getElementById("Obtenu" + type.charAt(0).toUpperCase() + type.slice(1)).classList.add("active");
    document.querySelector(`.tab-btn-wildlife[onclick="switchTabWildlife('${type}')"]`).classList.add("active");
}

/* =========================
   🐟 CONSTRUIRE FENETRE
   ========================= */

/**
 * Construit et injecte dans le DOM le panneau "faune obtenue" pour un type donné.
 * Crée une barre de recherche, puis des blocs par niveau de hobby, chacun contenant
 * une grille de cases à cocher. L'état coché/décoché est persisté dans `checkedWildlife`.
 * L'état réduit/déplié des niveaux est restauré depuis `collapsedLevels`.
 *
 * @param {"poisson" | "oiseau" | "insecte"} type - Type de faune à afficher.
 * @param {string} containerId - Identifiant HTML du conteneur cible.
 * @returns {void}
 */
function buildObtainedPanel(type, containerId) {
    const containerEl = document.getElementById(containerId);
    containerEl.innerHTML = "";

    const data = type === "poisson" ? fish : type === "oiseau" ? birds : insects;

    // Barre de recherche
    const barre = createSearchBar(
        language === "fr" ? "Rechercher..." : "Search...",
        (q) => {
            containerEl.querySelectorAll(".faune-item").forEach(item => {
                item.style.display = matchSearch(item.textContent, q) ? "" : "none";
            });
            // Masquer les niveaux vides après filtrage
            containerEl.querySelectorAll(".niveau-bloc").forEach(bloc => {
                const visible = [...bloc.querySelectorAll(".faune-item")].some(i => i.style.display !== "none");
                bloc.style.display = visible ? "" : "none";
            });
        }
    );
    containerEl.appendChild(barre);

    /**
     * Regroupement des éléments par niveau de hobby.
     * @type {Object.<number, Array<Object>>}
     */
    const parNiveau = {};
    data.forEach(el => {
        const niv = el.niveau_hobby || 1;
        if (!parNiveau[niv]) parNiveau[niv] = [];
        parNiveau[niv].push(el);
    });

    Object.keys(parNiveau).sort((a, b) => a - b).forEach(niv => {
        const elements = parNiveau[niv];
        const nivDiv = document.createElement("div");
        nivDiv.className = "niveau-bloc";

        const header = document.createElement("div");
        header.className = "niveau-header";

        // Case à cocher "tout cocher/décocher" pour le niveau
        const cbNiveau = document.createElement("input");
        cbNiveau.type = "checkbox";
        cbNiveau.className = "cb-niveau";

        const allChecked = elements.every(el => {
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            return checkedWildlife[nameFr];
        });
        cbNiveau.checked = allChecked;

        cbNiveau.addEventListener("change", (e) => {
            e.stopPropagation();
            const nowChecked = cbNiveau.checked;
            elements.forEach(el => {
                const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
                if (nowChecked) checkedWildlife[nameFr] = true;
                else delete checkedWildlife[nameFr];
            });
            saveCheckedWildlife();
            grid.querySelectorAll("input[type='checkbox']").forEach(cb => { cb.checked = nowChecked; });
        });

        cbNiveau.addEventListener("click", (e) => { e.stopPropagation(); });
        cbNiveau.addEventListener("pointerdown", (e) => { e.stopPropagation(); });

        const toggleBtn = document.createElement("span");
        toggleBtn.className = "niveau-toggle";
        toggleBtn.textContent = (collapsedLevels[type] && collapsedLevels[type].has(parseInt(niv))) ? "▶" : "▼";

        const labelNiv = document.createElement("span");
        labelNiv.className = "niveau-label";
        labelNiv.textContent = `${t("niveauLabel")} ${niv}`;

        header.appendChild(cbNiveau);
        header.appendChild(toggleBtn);
        header.appendChild(labelNiv);
        nivDiv.appendChild(header);

        const content = document.createElement("div");
        content.className = "niveau-content";
        // Restaurer l'état réduit depuis collapsedLevels
        if (collapsedLevels[type] && collapsedLevels[type].has(parseInt(niv))) {
            content.classList.add("hidden");
        }

        const grid = document.createElement("div");
        grid.className = "faune-grid";

        elements.forEach(el => {
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            const nameAff = getName(el);

            const label = document.createElement("label");
            label.className = "faune-item";

            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = !!checkedWildlife[nameFr];

            cb.addEventListener("change", () => {
                if (cb.checked) {
                    checkedWildlife[nameFr] = true;
                } else {
                    delete checkedWildlife[nameFr];
                }
                saveCheckedWildlife();
                // Mettre à jour la case de niveau
                const allNowChecked = elements.every(e => {
                    const n = Array.isArray(e.name) ? e.name[0] : e.name;
                    return checkedWildlife[n];
                });
                cbNiveau.checked = allNowChecked;
            });

            label.appendChild(cb);
            label.appendChild(document.createTextNode(" " + nameAff));
            grid.appendChild(label);
        });

        content.appendChild(grid);
        nivDiv.appendChild(content);

        // Toggle repli/dépli au clic sur le header (hors checkbox)
        header.addEventListener("click", (e) => {
            if (e.target.type === "checkbox" || e.target.closest("input[type='checkbox']")) return;
            content.classList.toggle("hidden");
            const isHidden = content.classList.contains("hidden");
            toggleBtn.textContent = isHidden ? "▶" : "▼";
            if (isHidden) collapsedLevels[type].add(parseInt(niv));
            else collapsedLevels[type].delete(parseInt(niv));
        });

        containerEl.appendChild(nivDiv);
    });
}
