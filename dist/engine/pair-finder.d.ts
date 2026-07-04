import { Tile, OkeyMeta } from '../types';
export declare class PairFinder {
    /**
     * Çifte Gitme: Eldeki taşlardan en fazla "özdeş çift" bulur.
     */
    findBestPairs(tiles: Tile[], okeyMeta?: OkeyMeta): {
        pairs: [Tile, Tile][];
        remainingTiles: Tile[];
        totalPairs: number;
    };
    private resolveFalseOkeys;
}
