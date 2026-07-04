// src/engine/backtracking-solver.ts
import { Tile, Meld, Arrangement } from '../types';

export class BacktrackingSolver {
    /**
     * Backtracking ile aday havuzundaki per/seri kombinasyonlarından en yüksek puanlı çakışmasız dizilimi bulur.
     */
    public solve(resolvedTiles: Tile[], allPossibleMelds: Meld[]): Arrangement {
        let bestArrangement: Meld[] = [];
        let maxScore = 0;

        const search = (
            currentArrangement: Meld[],
            remainingPool: Tile[],
            currentIndex: number,
        ) => {
            const currentScore = this.calculateArrangementScore(currentArrangement);

            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestArrangement = [...currentArrangement];
            }

            for (let i = currentIndex; i < allPossibleMelds.length; i++) {
                const candidateMeld = allPossibleMelds[i];

                // Aday grup, elimizde kalan taşlardan oluşturulabiliyor mu?
                if (this.canFormMeld(candidateMeld.tiles, remainingPool)) {
                    // Taşları havuzdan düş
                    const nextRemainingPool = this.removeTilesFromPool(
                        candidateMeld.tiles,
                        remainingPool,
                    );
                    currentArrangement.push(candidateMeld);

                    // DFS
                    search(currentArrangement, nextRemainingPool, i + 1);

                    // Backtrack
                    currentArrangement.pop();
                }
            }
        };

        search([], resolvedTiles, 0);

        const remainingTiles = this.getRemainingTiles(bestArrangement, resolvedTiles);

        return { melds: bestArrangement, remainingTiles, totalScore: maxScore };
    }

    private canFormMeld(neededTiles: Tile[], pool: Tile[]): boolean {
        const poolCounts = new Map<string, number>();
        for (const t of pool) {
            poolCounts.set(t.id, (poolCounts.get(t.id) ?? 0) + 1);
        }

        const neededCounts = new Map<string, number>();
        for (const t of neededTiles) {
            neededCounts.set(t.id, (neededCounts.get(t.id) ?? 0) + 1);
        }

        for (const [id, count] of neededCounts.entries()) {
            if ((poolCounts.get(id) ?? 0) < count) return false;
        }
        return true;
    }

    private removeTilesFromPool(usedTiles: Tile[], pool: Tile[]): Tile[] {
        const remaining = [...pool];
        for (const used of usedTiles) {
            const idx = remaining.findIndex((t) => t.id === used.id);
            if (idx !== -1) remaining.splice(idx, 1);
        }
        return remaining;
    }

    private calculateArrangementScore(melds: Meld[]): number {
        let score = 0;
        for (const meld of melds) {
            score += meld.tiles.reduce((sum, tile) => sum + tile.value, 0);
        }
        return score;
    }

    private getRemainingTiles(melds: Meld[], originalTiles: Tile[]): Tile[] {
        const usedIds = new Set<string>();
        melds.forEach((m) => m.tiles.forEach((t) => usedIds.add(t.id)));
        return originalTiles.filter((t) => !usedIds.has(t.id));
    }
}
