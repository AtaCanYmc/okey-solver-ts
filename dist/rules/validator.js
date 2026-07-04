"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleValidator = exports.OkeyRuleValidator = void 0;
class OkeyRuleValidator {
    /**
     * Grubun geçerli bir "Per" (Aynı sayı, farklı renk) olup olmadığını kontrol eder.
     */
    isPer(tiles, okeyMeta) {
        if (tiles.length < 3 || tiles.length > 4)
            return false;
        const effectiveTiles = this.getEffectiveTiles(tiles, okeyMeta);
        const firstValue = effectiveTiles[0].value;
        const colors = new Set();
        for (const tile of effectiveTiles) {
            if (tile.value !== firstValue)
                return false; // Sayılar aynı olmalı
            if (colors.has(tile.color))
                return false; // Renkler farklı olmalı
            colors.add(tile.color);
        }
        return true;
    }
    /**
     * Grubun geçerli bir "Seri" (Aynı renk, ardışık sayı) olup olmadığını kontrol eder.
     */
    isSeri(tiles, allowOneAfter = true, okeyMeta) {
        if (tiles.length < 3)
            return false;
        const effectiveTiles = this.getEffectiveTiles(tiles, okeyMeta);
        // Taşları değerlerine göre küçükten büyüğe sırala
        const sortedTiles = [...effectiveTiles].sort((a, b) => a.value - b.value);
        const firstColor = sortedTiles[0].color;
        let isNormal = true;
        let isCircular = true;
        for (let i = 0; i < sortedTiles.length; i++) {
            if (sortedTiles[i].color !== firstColor)
                return false; // Renkler aynı olmalı
            if (i > 0) {
                if (sortedTiles[i].value !== sortedTiles[i - 1].value + 1) {
                    isNormal = false;
                }
                if (i > 1 && sortedTiles[i].value !== sortedTiles[i - 1].value + 1) {
                    isCircular = false;
                }
            }
        }
        if (isNormal)
            return true;
        // 12-13-1 durumunu kontrol et
        if (allowOneAfter &&
            isCircular &&
            sortedTiles[0].value === 1 &&
            sortedTiles[sortedTiles.length - 1].value === 13) {
            return true;
        }
        return false;
    }
    /**
     * Taş grubunu analiz edip tipini döndürür.
     */
    evaluateGroup(tiles, okeyMeta) {
        if (this.isPer(tiles, okeyMeta))
            return 'PER';
        if (this.isSeri(tiles, true, okeyMeta))
            return 'SERI';
        if (tiles.length === 2 && this.isTilesSame(tiles[0], tiles[1], okeyMeta))
            return 'CIFT';
        return 'INVALID';
    }
    /**
     * Taşlar aynı renk ve aynı değerde mi?
     */
    isTilesSame(tileA, tileB, okeyMeta) {
        const effA = this.getEffectiveTile(tileA, okeyMeta);
        const effB = this.getEffectiveTile(tileB, okeyMeta);
        return effA.value === effB.value && effA.color === effB.color;
    }
    /**
     * JOKER (Sahte Okey) taşını gerçek okey değerine dönüştürür.
     */
    getEffectiveTile(tile, okeyMeta) {
        if (!okeyMeta)
            return tile;
        // Sahte okey, Okey taşı yerine geçer.
        if (tile.color === 'JOKER') {
            return Object.assign(Object.assign({}, tile), { color: okeyMeta.color, value: okeyMeta.value });
        }
        return tile;
    }
    getEffectiveTiles(tiles, okeyMeta) {
        return tiles.map((t) => this.getEffectiveTile(t, okeyMeta));
    }
}
exports.OkeyRuleValidator = OkeyRuleValidator;
// Backward compatible static class wrapper
class RuleValidator {
    static isPer(tiles, okeyMeta) {
        return this.validator.isPer(tiles, okeyMeta);
    }
    static isSeri(tiles, allowOneAfter = true, okeyMeta) {
        return this.validator.isSeri(tiles, allowOneAfter, okeyMeta);
    }
    static evaluateGroup(tiles, okeyMeta) {
        return this.validator.evaluateGroup(tiles, okeyMeta);
    }
    static isTilesSame(tileA, tileB, okeyMeta) {
        return this.validator.isTilesSame(tileA, tileB, okeyMeta);
    }
    static getEffectiveTile(tile, okeyMeta) {
        return this.validator.getEffectiveTile(tile, okeyMeta);
    }
    static getEffectiveTiles(tiles, okeyMeta) {
        return this.validator.getEffectiveTiles(tiles, okeyMeta);
    }
}
exports.RuleValidator = RuleValidator;
RuleValidator.validator = new OkeyRuleValidator();
