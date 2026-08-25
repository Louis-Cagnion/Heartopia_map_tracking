import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadDatabaseAuto } from "../js/data.js";

describe("loadDatabaseAuto — robustesse du cache", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("n'écrit rien dans le localStorage si le fetch échoue (pas de cache empoisonné)", async () => {
        vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));
        await loadDatabaseAuto();
        expect(localStorage.getItem("poissons")).toBeNull();
        expect(localStorage.getItem("collectibles")).toBeNull();
    });

    it("écrit bien les données dans le localStorage si le fetch réussit", async () => {
        vi.spyOn(global, "fetch").mockResolvedValue({ json: async () => [{ name: "Test" }] });
        await loadDatabaseAuto();
        expect(JSON.parse(localStorage.getItem("poissons"))).toEqual([{ name: "Test" }]);
    });
});
