"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleValidator = void 0;
class RuleValidator {
    /**
     * Grubun geçerli bir "Per" (Aynı sayı, farklı renk) olup olmadığını kontrol eder.
     */
    static isPer(tiles, okeyMeta) {
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
    static isSeri(tiles, allowOneAfter = true, okeyMeta) {
        if (tiles.length < 3)
            return false;
        const effectiveTiles = this.getEffectiveTiles(tiles, okeyMeta);
        // Taşları değerlerine göre küçükten büyüğe sırala
        const sortedTiles = [...effectiveTiles].sort((a, b) => a.value - b.value);
        const firstColor = sortedTiles[0].color;
        let isValidSequence = true;
        for (let i = 0; i < sortedTiles.length; i++) {
            if (sortedTiles[i].color !== firstColor)
                return false; // Renkler aynı olmalı
            if (i > 0) {
                const prevValue = sortedTiles[i - 1].value;
                const currentValue = sortedTiles[i].value;
                if (currentValue !== prevValue + 1) {
                    isValidSequence = false;
                    break;
                }
            }
        }
        if (isValidSequence)
            return true;
        // 12-13-1 durumunu kontrol et
        if (allowOneAfter && sortedTiles[0].value === 1 && sortedTiles[sortedTiles.length - 1].value === 13) {
            let isValidCircular = true;
            for (let i = 1; i < sortedTiles.length; i++) {
                if (sortedTiles[i].color !== firstColor)
                    return false;
                if (i > 1) {
                    if (sortedTiles[i].value !== sortedTiles[i - 1].value + 1) {
                        isValidCircular = false;
                        break;
                    }
                }
            }
            if (isValidCircular)
                return true;
        }
        return false;
    }
    /**
     * Taş grubunu analiz edip tipini döndürür.
     */
    static evaluateGroup(tiles, okeyMeta) {
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
    static isTilesSame(tileA, tileB, okeyMeta) {
        const effA = this.getEffectiveTile(tileA, okeyMeta);
        const effB = this.getEffectiveTile(tileB, okeyMeta);
        return effA.value === effB.value && effA.color === effB.color;
    }
    /**
     * JOKER (Sahte Okey) taşını gerçek okey değerine,
     * Okey (Joker) taşını da gerektiği durumda (bu fonksiyonda değil, engine'de) dönüştürür.
     */
    static getEffectiveTile(tile, okeyMeta) {
        if (!okeyMeta)
            return tile;
        // Sahte okey, Okey taşı yerine geçer.
        if (tile.color === 'JOKER') {
            return Object.assign(Object.assign({}, tile), { color: okeyMeta.color, value: okeyMeta.value });
        }
        // Okey taşı (Wildcard) engine tarafından zaten hedeflenen değerle (efektif) gelir.
        // Bu yüzden eğer validator.ts 'efektif' haliyle çağrılıyorsa buna ek bir şey yapmamıza gerek yok,
        // ancak engine "şu taş Okey taşı, bunu her şeye dönüştür" demesi için, 
        // engine wildcard taşların değerini `simulate` eder.
        return tile;
    }
    static getEffectiveTiles(tiles, okeyMeta) {
        return tiles.map(t => this.getEffectiveTile(t, okeyMeta));
    }
}
exports.RuleValidator = RuleValidator;
