"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BacktrackingSolver = void 0;
class BacktrackingSolver {
    /**
     * Backtracking ile aday havuzundaki per/seri kombinasyonlarından en yüksek puanlı çakışmasız dizilimi bulur.
     */
    solve(resolvedTiles, allPossibleMelds) {
        let bestArrangement = [];
        let maxScore = 0;
        const search = (currentArrangement, remainingPool, currentIndex) => {
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
                    const nextRemainingPool = this.removeTilesFromPool(candidateMeld.tiles, remainingPool);
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
    canFormMeld(neededTiles, pool) {
        var _a, _b, _c;
        const poolCounts = new Map();
        for (const t of pool) {
            poolCounts.set(t.id, ((_a = poolCounts.get(t.id)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
        const neededCounts = new Map();
        for (const t of neededTiles) {
            neededCounts.set(t.id, ((_b = neededCounts.get(t.id)) !== null && _b !== void 0 ? _b : 0) + 1);
        }
        for (const [id, count] of neededCounts.entries()) {
            if (((_c = poolCounts.get(id)) !== null && _c !== void 0 ? _c : 0) < count)
                return false;
        }
        return true;
    }
    removeTilesFromPool(usedTiles, pool) {
        const remaining = [...pool];
        for (const used of usedTiles) {
            const idx = remaining.findIndex((t) => t.id === used.id);
            if (idx !== -1)
                remaining.splice(idx, 1);
        }
        return remaining;
    }
    calculateArrangementScore(melds) {
        let score = 0;
        for (const meld of melds) {
            score += meld.tiles.reduce((sum, tile) => sum + tile.value, 0);
        }
        return score;
    }
    getRemainingTiles(melds, originalTiles) {
        const usedIds = new Set();
        melds.forEach((m) => m.tiles.forEach((t) => usedIds.add(t.id)));
        return originalTiles.filter((t) => !usedIds.has(t.id));
    }
}
exports.BacktrackingSolver = BacktrackingSolver;
