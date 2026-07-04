// src/engine/solver.ts
import { Tile, Arrangement, OkeyMeta } from '../types';
import { OkeyRuleValidator } from '../rules/validator';
import { IRuleValidator } from '../rules/rule-validator.interface';
import { MeldGenerator } from './meld-generator';
import { BacktrackingSolver } from './backtracking-solver';
import { PairFinder } from './pair-finder';

export class SolverEngine {
    private meldGenerator: MeldGenerator;
    private backtrackingSolver: BacktrackingSolver;
    private pairFinder: PairFinder;

    constructor(validator: IRuleValidator = new OkeyRuleValidator()) {
        this.meldGenerator = new MeldGenerator(validator);
        this.backtrackingSolver = new BacktrackingSolver();
        this.pairFinder = new PairFinder();
    }

    /**
     * Karışık bir eli alır ve en optimum per/seri dizilimini döndürür.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın "Okey" (Joker/Wildcard) olduğunu belirtir
     */
    public findBestArrangement(tiles: Tile[], okeyMeta?: OkeyMeta): Arrangement {
        // Sahte Okey taşlarını gerçek okey değerine dönüştür
        const resolvedTiles = okeyMeta ? this.resolveFalseOkeys(tiles, okeyMeta) : tiles;

        // Okey (Wildcard) taşlarını bul
        const wildcards = okeyMeta
            ? resolvedTiles.filter((t) => t.color === okeyMeta.color && t.value === okeyMeta.value)
            : [];
        const normalTiles = okeyMeta
            ? resolvedTiles.filter(
                  (t) => !(t.color === okeyMeta.color && t.value === okeyMeta.value),
              )
            : resolvedTiles;

        // 1. Adım: Eldeki taşlardan çıkabilecek tüm geçerli per ve serileri bul (Aday Havuzu)
        const allPossibleMelds = this.meldGenerator.generateAllPossibleMelds(
            normalTiles,
            wildcards,
            okeyMeta,
        );

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
    public findBestPairs(
        tiles: Tile[],
        okeyMeta?: OkeyMeta,
    ): { pairs: [Tile, Tile][]; remainingTiles: Tile[]; totalPairs: number } {
        return this.pairFinder.findBestPairs(tiles, okeyMeta);
    }

    private resolveFalseOkeys(tiles: Tile[], okeyMeta: OkeyMeta): Tile[] {
        return tiles.map((t) => {
            if (t.color === 'JOKER') {
                return { ...t, color: okeyMeta.color, value: okeyMeta.value };
            }
            return t;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  STATIC WRAPPERS (Backward Compatibility)
    // ─────────────────────────────────────────────────────────────────────────

    private static defaultEngine = new SolverEngine();

    public static findBestArrangement(tiles: Tile[], okeyMeta?: OkeyMeta): Arrangement {
        return this.defaultEngine.findBestArrangement(tiles, okeyMeta);
    }

    public static findBestPairs(
        tiles: Tile[],
        okeyMeta?: OkeyMeta,
    ): { pairs: [Tile, Tile][]; remainingTiles: Tile[]; totalPairs: number } {
        return this.defaultEngine.findBestPairs(tiles, okeyMeta);
    }
}
