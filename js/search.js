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
