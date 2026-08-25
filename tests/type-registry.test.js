import { describe, it, expect } from "vitest";
import { TYPE_REGISTRY } from "../js/data.js";

describe("TYPE_REGISTRY", () => {
    it("expose les 6 types administrables avec get/set/jsonKey/file cohérents", () => {
        const attendus = ["poisson", "insecte", "oiseau", "collectible", "ingredient", "recette"];
        expect(Object.keys(TYPE_REGISTRY).sort()).toEqual(attendus.sort());
        for (const type of attendus) {
            const entry = TYPE_REGISTRY[type];
            expect(typeof entry.get).toBe("function");
            expect(typeof entry.set).toBe("function");
            expect(typeof entry.jsonKey).toBe("string");
            expect(entry.file.endsWith(".json")).toBe(true);
        }
    });

    it("get/set reflètent bien le même tableau (round-trip)", () => {
        const entry = TYPE_REGISTRY.ingredient;
        const nouveau = [{ name: "Test", price: 1 }];
        entry.set(nouveau);
        expect(entry.get()).toEqual(nouveau);
        entry.set([]);
    });
});
