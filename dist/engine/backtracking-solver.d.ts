import { Tile, Meld, Arrangement } from '../types';
export declare class BacktrackingSolver {
    /**
     * Backtracking ile aday havuzundaki per/seri kombinasyonlarından en yüksek puanlı çakışmasız dizilimi bulur.
     */
    solve(resolvedTiles: Tile[], allPossibleMelds: Meld[]): Arrangement;
    private canFormMeld;
    private removeTilesFromPool;
    private calculateArrangementScore;
    private getRemainingTiles;
}
