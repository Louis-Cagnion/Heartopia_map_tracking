// =========================
// 🗂️ TABS
// =========================

let currentTab = "map";
const tabs = ["map", "tab2"];

function switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tab-" + tabName).classList.add("active");
    document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`).classList.add("active");
    currentTab = tabName;
}

// Flèches clavier + A/D
document.addEventListener("keydown", (e) => {
    const idx = tabs.indexOf(currentTab);
    if ((e.key === "ArrowRight" || e.key === "d") && idx < tabs.length - 1) switchTab(tabs[idx + 1]);
    if ((e.key === "ArrowLeft"  || e.key === "a") && idx > 0)               switchTab(tabs[idx - 1]);
});
