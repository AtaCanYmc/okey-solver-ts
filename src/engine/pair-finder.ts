// src/engine/pair-finder.ts
import { Tile, OkeyMeta } from '../types';

export class PairFinder {
    /**
     * Çifte Gitme: Eldeki taşlardan en fazla "özdeş çift" bulur.
     */
    public findBestPairs(
        tiles: Tile[],
        okeyMeta?: OkeyMeta,
    ): { pairs: [Tile, Tile][]; remainingTiles: Tile[]; totalPairs: number } {
        const resolvedTiles = okeyMeta ? this.resolveFalseOkeys(tiles, okeyMeta) : tiles;
        const wildcards = okeyMeta
            ? resolvedTiles.filter((t) => t.color === okeyMeta.color && t.value === okeyMeta.value)
            : [];
        const normalTiles = okeyMeta
            ? resolvedTiles.filter(
                  (t) => !(t.color === okeyMeta.color && t.value === okeyMeta.value),
              )
            : resolvedTiles;

        const pairs: [Tile, Tile][] = [];
        const usedIds = new Set<string>();

        // Aynı renk ve aynı değere sahip taşları özdeş çift olarak eşleştir
        for (let i = 0; i < normalTiles.length; i++) {
            if (usedIds.has(normalTiles[i].id)) continue;
            for (let j = i + 1; j < normalTiles.length; j++) {
                if (usedIds.has(normalTiles[j].id)) continue;
                if (
                    normalTiles[i].color === normalTiles[j].color &&
                    normalTiles[i].value === normalTiles[j].value
                ) {
                    pairs.push([normalTiles[i], normalTiles[j]]);
                    usedIds.add(normalTiles[i].id);
                    usedIds.add(normalTiles[j].id);
                    break;
                }
            }
        }

        // Kalan joker taşlarını eşleştirilmemiş herhangi bir taşa çift yap
        const wildcardsLeft = [...wildcards];
        for (const tile of normalTiles) {
            if (usedIds.has(tile.id)) continue;
            if (wildcardsLeft.length > 0) {
                const wc = wildcardsLeft.shift()!;
                pairs.push([tile, wc]);
                usedIds.add(tile.id);
                usedIds.add(wc.id);
            }
        }

        // Jokerler kendi aralarında da çift yapabilir (iki joker varsa)
        while (wildcardsLeft.length >= 2) {
            const wc1 = wildcardsLeft.shift()!;
            const wc2 = wildcardsLeft.shift()!;
            pairs.push([wc1, wc2]);
            usedIds.add(wc1.id);
            usedIds.add(wc2.id);
        }

        const remainingTiles = resolvedTiles.filter((t) => !usedIds.has(t.id));
        return { pairs, remainingTiles, totalPairs: pairs.length };
    }

    private resolveFalseOkeys(tiles: Tile[], okeyMeta: OkeyMeta): Tile[] {
        return tiles.map((t) => {
            if (t.color === 'JOKER') {
                return { ...t, color: okeyMeta.color, value: okeyMeta.value };
            }
            return t;
        });
    }
}
