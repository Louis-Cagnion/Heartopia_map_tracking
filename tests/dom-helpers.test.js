import { describe, it, expect } from "vitest";
import { createPlaceTitleDiv, createDetailRow, createLegendItem } from "../js/dom-helpers.js";

describe("createPlaceTitleDiv", () => {
    it("affiche le texte du lieu sans interpréter le HTML", () => {
        const div = createPlaceTitleDiv('<img src=x onerror="window.__xss = true">');
        expect(div.querySelector("img")).toBeNull();
        expect(div.textContent).toBe('<img src=x onerror="window.__xss = true"> :');
    });
});

describe("createDetailRow", () => {
    it("affiche la valeur sans interpréter le HTML", () => {
        const row = createDetailRow("Météo", "<script>window.__xss = true<" + "/script>");
        expect(row.querySelector("script")).toBeNull();
        expect(row.textContent).toContain("<script>");
    });
});

describe("createLegendItem", () => {
    it("échappe le nom même s'il contient du HTML", () => {
        const item = createLegendItem('<img src=x onerror="window.__xss = true">', "#e67e22");
        expect(item.querySelector("img")).toBeNull();
    });

    it("n'exécute pas de HTML injecté via la couleur", () => {
        const item = createLegendItem("Champignon", '"></div><img src=x onerror="window.__xss = true">');
        expect(item.querySelector("img")).toBeNull();
        expect(item.querySelectorAll(".legende-pastille").length).toBe(1);
    });
});
