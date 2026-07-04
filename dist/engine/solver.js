"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolverEngine = void 0;
const validator_1 = require("../rules/validator");
const meld_generator_1 = require("./meld-generator");
const backtracking_solver_1 = require("./backtracking-solver");
const pair_finder_1 = require("./pair-finder");
class SolverEngine {
    constructor(validator = new validator_1.OkeyRuleValidator()) {
        this.meldGenerator = new meld_generator_1.MeldGenerator(validator);
        this.backtrackingSolver = new backtracking_solver_1.BacktrackingSolver();
        this.pairFinder = new pair_finder_1.PairFinder();
    }
    /**
     * Karışık bir eli alır ve en optimum per/seri dizilimini döndürür.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın "Okey" (Joker/Wildcard) olduğunu belirtir
     */
    findBestArrangement(tiles, okeyMeta) {
        // Sahte Okey taşlarını gerçek okey değerine dönüştür
        const resolvedTiles = okeyMeta ? this.resolveFalseOkeys(tiles, okeyMeta) : tiles;
        // Okey (Wildcard) taşlarını bul
        const wildcards = okeyMeta
            ? resolvedTiles.filter((t) => t.color === okeyMeta.color && t.value === okeyMeta.value)
            : [];
        const normalTiles = okeyMeta
            ? resolvedTiles.filter((t) => !(t.color === okeyMeta.color && t.value === okeyMeta.value))
            : resolvedTiles;
        // 1. Adım: Eldeki taşlardan çıkabilecek tüm geçerli per ve serileri bul (Aday Havuzu)
        const allPossibleMelds = this.meldGenerator.generateAllPossibleMelds(normalTiles, wildcards, okeyMeta);
        // 2. Adım: Backtracking ile en iyi kombinasyonu ara
        return this.backtrackingSolver.solve(resolvedTiles, allPossibleMelds);
    }
    /**
     * Çifte Gitme: Eldeki taşlardan en fazla "özdeş çift (identical pair)" bulur.
     * 101 ve Okey'de 7 çift yaparak çıkılabilir.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın Okey olduğunu belirtir
     * @returns Bulunan çiftler ve kalan taşlar
     */
    findBestPairs(tiles, okeyMeta) {
        return this.pairFinder.findBestPairs(tiles, okeyMeta);
    }
    resolveFalseOkeys(tiles, okeyMeta) {
        return tiles.map((t) => {
            if (t.color === 'JOKER') {
                return Object.assign(Object.assign({}, t), { color: okeyMeta.color, value: okeyMeta.value });
            }
            return t;
        });
    }
    static findBestArrangement(tiles, okeyMeta) {
        return this.defaultEngine.findBestArrangement(tiles, okeyMeta);
    }
    static findBestPairs(tiles, okeyMeta) {
        return this.defaultEngine.findBestPairs(tiles, okeyMeta);
    }
}
exports.SolverEngine = SolverEngine;
// ─────────────────────────────────────────────────────────────────────────
//  STATIC WRAPPERS (Backward Compatibility)
// ─────────────────────────────────────────────────────────────────────────
SolverEngine.defaultEngine = new SolverEngine();
