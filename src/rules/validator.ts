// src/rules/validator.ts
import { Tile, MeldType, OkeyMeta } from '../types';
import { IRuleValidator } from './rule-validator.interface';

export class OkeyRuleValidator implements IRuleValidator {
    /**
     * Grubun geçerli bir "Per" (Aynı sayı, farklı renk) olup olmadığını kontrol eder.
     */
    public isPer(tiles: Tile[], okeyMeta?: OkeyMeta): boolean {
        if (tiles.length < 3 || tiles.length > 4) return false;

        const effectiveTiles = this.getEffectiveTiles(tiles, okeyMeta);
        const firstValue = effectiveTiles[0].value;
        const colors = new Set<string>();

        for (const tile of effectiveTiles) {
            if (tile.value !== firstValue) return false; // Sayılar aynı olmalı
            if (colors.has(tile.color)) return false; // Renkler farklı olmalı
            colors.add(tile.color);
        }

        return true;
    }

    /**
     * Grubun geçerli bir "Seri" (Aynı renk, ardışık sayı) olup olmadığını kontrol eder.
     */
    public isSeri(tiles: Tile[], allowOneAfter = true, okeyMeta?: OkeyMeta): boolean {
        if (tiles.length < 3) return false;

        const effectiveTiles = this.getEffectiveTiles(tiles, okeyMeta);

        // Taşları değerlerine göre küçükten büyüğe sırala
        const sortedTiles = [...effectiveTiles].sort((a, b) => a.value - b.value);
        const firstColor = sortedTiles[0].color;

        let isNormal = true;
        let isCircular = true;

        for (let i = 0; i < sortedTiles.length; i++) {
            if (sortedTiles[i].color !== firstColor) return false; // Renkler aynı olmalı

            if (i > 0) {
                if (sortedTiles[i].value !== sortedTiles[i - 1].value + 1) {
                    isNormal = false;
                }
                if (i > 1 && sortedTiles[i].value !== sortedTiles[i - 1].value + 1) {
                    isCircular = false;
                }
            }
        }

        if (isNormal) return true;

        // 12-13-1 durumunu kontrol et
        if (
            allowOneAfter &&
            isCircular &&
            sortedTiles[0].value === 1 &&
            sortedTiles[sortedTiles.length - 1].value === 13
        ) {
            return true;
        }

        return false;
    }

    /**
     * Taş grubunu analiz edip tipini döndürür.
     */
    public evaluateGroup(tiles: Tile[], okeyMeta?: OkeyMeta): MeldType {
        if (this.isPer(tiles, okeyMeta)) return 'PER';
        if (this.isSeri(tiles, true, okeyMeta)) return 'SERI';
        if (tiles.length === 2 && this.isTilesSame(tiles[0], tiles[1], okeyMeta)) return 'CIFT';
        return 'INVALID';
    }

    /**
     * Taşlar aynı renk ve aynı değerde mi?
     */
    public isTilesSame(tileA: Tile, tileB: Tile, okeyMeta?: OkeyMeta): boolean {
        const effA = this.getEffectiveTile(tileA, okeyMeta);
        const effB = this.getEffectiveTile(tileB, okeyMeta);
        return effA.value === effB.value && effA.color === effB.color;
    }

    /**
     * JOKER (Sahte Okey) taşını gerçek okey değerine dönüştürür.
     */
    public getEffectiveTile(tile: Tile, okeyMeta?: OkeyMeta): Tile {
        if (!okeyMeta) return tile;

        // Sahte okey, Okey taşı yerine geçer.
        if (tile.color === 'JOKER') {
            return { ...tile, color: okeyMeta.color, value: okeyMeta.value };
        }

        return tile;
    }

    public getEffectiveTiles(tiles: Tile[], okeyMeta?: OkeyMeta): Tile[] {
        return tiles.map((t) => this.getEffectiveTile(t, okeyMeta));
    }
}

// Backward compatible static class wrapper
export class RuleValidator {
    private static validator = new OkeyRuleValidator();

    public static isPer(tiles: Tile[], okeyMeta?: OkeyMeta): boolean {
        return this.validator.isPer(tiles, okeyMeta);
    }

    public static isSeri(tiles: Tile[], allowOneAfter = true, okeyMeta?: OkeyMeta): boolean {
        return this.validator.isSeri(tiles, allowOneAfter, okeyMeta);
    }

    public static evaluateGroup(tiles: Tile[], okeyMeta?: OkeyMeta): MeldType {
        return this.validator.evaluateGroup(tiles, okeyMeta);
    }

    public static isTilesSame(tileA: Tile, tileB: Tile, okeyMeta?: OkeyMeta): boolean {
        return this.validator.isTilesSame(tileA, tileB, okeyMeta);
    }

    public static getEffectiveTile(tile: Tile, okeyMeta?: OkeyMeta): Tile {
        return this.validator.getEffectiveTile(tile, okeyMeta);
    }

    public static getEffectiveTiles(tiles: Tile[], okeyMeta?: OkeyMeta): Tile[] {
        return this.validator.getEffectiveTiles(tiles, okeyMeta);
    }
}
