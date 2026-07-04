import { Tile, Arrangement, OkeyMeta } from '../types';
import { IRuleValidator } from '../rules/rule-validator.interface';
export declare class SolverEngine {
    private meldGenerator;
    private backtrackingSolver;
    private pairFinder;
    constructor(validator?: IRuleValidator);
    /**
     * Karışık bir eli alır ve en optimum per/seri dizilimini döndürür.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın "Okey" (Joker/Wildcard) olduğunu belirtir
     */
    findBestArrangement(tiles: Tile[], okeyMeta?: OkeyMeta): Arrangement;
    /**
     * Çifte Gitme: Eldeki taşlardan en fazla "özdeş çift (identical pair)" bulur.
     * 101 ve Okey'de 7 çift yaparak çıkılabilir.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın Okey olduğunu belirtir
     * @returns Bulunan çiftler ve kalan taşlar
     */
    findBestPairs(tiles: Tile[], okeyMeta?: OkeyMeta): {
        pairs: [Tile, Tile][];
        remainingTiles: Tile[];
        totalPairs: number;
    };
    private resolveFalseOkeys;
    private static defaultEngine;
    static findBestArrangement(tiles: Tile[], okeyMeta?: OkeyMeta): Arrangement;
    static findBestPairs(tiles: Tile[], okeyMeta?: OkeyMeta): {
        pairs: [Tile, Tile][];
        remainingTiles: Tile[];
        totalPairs: number;
    };
}
