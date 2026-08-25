import { describe, it, expect, beforeEach } from "vitest";
import { formatNumber, sellPriceByStar, groupByPrefix, getIngredientPrice, totalIngredientsCost } from "../js/recipes-helpers.js";

describe("sellPriceByStar", () => {
    it("applique les multiplicateurs ×1 à ×8 selon le nombre d'étoiles", () => {
        expect(sellPriceByStar(100, 1)).toBe(100);
        expect(sellPriceByStar(100, 2)).toBe(150);
        expect(sellPriceByStar(100, 3)).toBe(200);
        expect(sellPriceByStar(100, 4)).toBe(400);
        expect(sellPriceByStar(100, 5)).toBe(800);
    });
});

describe("formatNumber", () => {
    beforeEach(() => { global.language = "fr"; });

    it("sépare les milliers par un espace en FR", () => {
        expect(formatNumber(12345)).toBe("12 345");
    });

    it("sépare les milliers par une virgule en EN", () => {
        global.language = "en";
        expect(formatNumber(12345)).toBe("12,345");
    });
});

describe("groupByPrefix", () => {
    it("regroupe des noms partageant un préfixe de mots entiers", () => {
        const groupes = groupByPrefix(["Gâteau roulé rouge", "Gâteau roulé bleu"]);
        expect(groupes).toHaveLength(1);
        expect(groupes[0].membres).toEqual(["Gâteau roulé rouge", "Gâteau roulé bleu"]);
    });

    it("ne fusionne pas un nom qui n'a pas de mot après le préfixe commun", () => {
        const groupes = groupByPrefix(["Café", "Café latte"]);
        expect(groupes).toHaveLength(2);
    });
});

describe("getIngredientPrice / totalIngredientsCost", () => {
    beforeEach(() => {
        global.language = "fr";
        global.ingredients = [{ name: ["Lait", "Milk"], price: 10 }];
        global.fish = [];
        global.collectibles = [];
        global.recipes = [{ name: ["Sauce", "Sauce"], ingredients: [["ing:Lait"]] }];
    });

    it("retourne le prix d'un ingrédient direct", () => {
        expect(getIngredientPrice("ing:Lait")).toBe(10);
    });

    it("calcule récursivement le prix d'une sous-recette", () => {
        expect(getIngredientPrice("rec:Sauce")).toBe(10);
    });

    it("prend le prix minimum de chaque slot pour le total d'une recette", () => {
        const recette = { ingredients: [["ing:Lait"]] };
        expect(totalIngredientsCost(recette)).toBe(10);
    });
});
