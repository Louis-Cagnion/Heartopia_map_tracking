// =========================
// 🐟 SWITCH TAB WILDLIFE
// =========================

// Mémorise les niveaux réduits par type (ex: { poisson: new Set([2,3]) })
const niveauxReduits = { poisson: new Set(), oiseau: new Set(), insecte: new Set() };

function switchTabWildlife(type) {
    document.querySelectorAll(".FenetreObtenu").forEach(f => f.classList.remove("active"));
    document.querySelectorAll(".tab-btn-wildlife").forEach(b => b.classList.remove("active"));
    document.getElementById("Obtenu" + type.charAt(0).toUpperCase() + type.slice(1)).classList.add("active");
    document.querySelector(`.tab-btn-wildlife[onclick="switchTabWildlife('${type}')"]`).classList.add("active");
}

// =========================
// 🐟 CONSTRUIRE FENETRE
// =========================

function construireFenetreObtenu(type, containerId) {
    const containerEl = document.getElementById(containerId);
    containerEl.innerHTML = "";

    const data = type === "poisson" ? poissons : type === "oiseau" ? oiseaux : insectes;

    // Barre de recherche
    const barre = creerBarreRecherche(
        langue === "fr" ? "Rechercher..." : "Search...",
        (q) => {
            containerEl.querySelectorAll(".faune-item").forEach(item => {
                item.style.display = matchSearch(item.textContent, q) ? "" : "none";
            });
            // Masquer les niveaux vides
            containerEl.querySelectorAll(".niveau-bloc").forEach(bloc => {
                const visible = [...bloc.querySelectorAll(".faune-item")].some(i => i.style.display !== "none");
                bloc.style.display = visible ? "" : "none";
            });
        }
    );
    containerEl.appendChild(barre);

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

        const cbNiveau = document.createElement("input");
        cbNiveau.type = "checkbox";
        cbNiveau.className = "cb-niveau";

        const allChecked = elements.every(el => {
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            return checkedFaune[nameFr];
        });
        cbNiveau.checked = allChecked;

        cbNiveau.addEventListener("change", (e) => {
            e.stopPropagation();
            if (cbNiveau.checked) {
                elements.forEach(el => {
                    const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
                    checkedFaune[nameFr] = true;
                });
            } else {
                elements.forEach(el => {
                    const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
                    delete checkedFaune[nameFr];
                });
            }
            saveCheckedFaune();
            construireFenetreObtenu(type, containerId);
        });

        cbNiveau.addEventListener("click", (e) => { e.stopPropagation(); });
        cbNiveau.addEventListener("pointerdown", (e) => { e.stopPropagation(); });

        const toggleBtn = document.createElement("span");
        toggleBtn.className = "niveau-toggle";
        toggleBtn.textContent = (niveauxReduits[type] && niveauxReduits[type].has(parseInt(niv))) ? "▶" : "▼";

        const labelNiv = document.createElement("span");
        labelNiv.className = "niveau-label";
        labelNiv.textContent = `${t("niveauLabel")} ${niv}`;

        header.appendChild(cbNiveau);
        header.appendChild(toggleBtn);
        header.appendChild(labelNiv);
        nivDiv.appendChild(header);

        const content = document.createElement("div");
        content.className = "niveau-content";
        // Restaurer l'état réduit
        if (niveauxReduits[type] && niveauxReduits[type].has(parseInt(niv))) {
            content.classList.add("hidden");
        }

        const grid = document.createElement("div");
        grid.className = "faune-grid";

        elements.forEach(el => {
            const nameFr = Array.isArray(el.name) ? el.name[0] : el.name;
            const nameAff = getNom(el);

            const label = document.createElement("label");
            label.className = "faune-item";

            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = !!checkedFaune[nameFr];

            cb.addEventListener("change", () => {
                if (cb.checked) {
                    checkedFaune[nameFr] = true;
                } else {
                    delete checkedFaune[nameFr];
                }
                saveCheckedFaune();
                const allNowChecked = elements.every(e => {
                    const n = Array.isArray(e.name) ? e.name[0] : e.name;
                    return checkedFaune[n];
                });
                cbNiveau.checked = allNowChecked;
            });

            label.appendChild(cb);
            label.appendChild(document.createTextNode(" " + nameAff));
            grid.appendChild(label);
        });

        content.appendChild(grid);
        nivDiv.appendChild(content);

        header.addEventListener("click", (e) => {
            if (e.target.type === "checkbox" || e.target.closest("input[type='checkbox']")) return;
            content.classList.toggle("hidden");
            const isHidden = content.classList.contains("hidden");
            toggleBtn.textContent = isHidden ? "▶" : "▼";
            if (isHidden) niveauxReduits[type].add(parseInt(niv));
            else niveauxReduits[type].delete(parseInt(niv));
        });

        containerEl.appendChild(nivDiv);
    });
}
