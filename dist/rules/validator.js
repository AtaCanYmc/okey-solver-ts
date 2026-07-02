"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleValidator = void 0;
class RuleValidator {
    /**
     * Grubun geçerli bir "Per" (Aynı sayı, farklı renk) olup olmadığını kontrol eder.
     */
    static isPer(tiles) {
        if (tiles.length < 3 || tiles.length > 4)
            return false;
        const firstValue = tiles[0].value;
        const colors = new Set();
        for (const tile of tiles) {
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
    static isSeri(tiles, allowOneAfter = false) {
        if (tiles.length < 3)
            return false;
        // Taşları değerlerine göre küçükten büyüğe sırala
        const sortedTiles = [...tiles].sort((a, b) => a.value - b.value);
        const firstColor = sortedTiles[0].color;
        for (let i = 0; i < sortedTiles.length; i++) {
            if (sortedTiles[i].color !== firstColor)
                return false; // Renkler aynı olmalı
            if (i > 0) {
                const prevValue = sortedTiles[i - 1].value;
                const currentValue = sortedTiles[i].value;
                // 13'ten sonra 1 gelme kuralı (12-13-1) için özel durum kontrolü eklenebilir,
                // şimdilik standart ardışıklık kontrolü yapıyoruz.
                if (currentValue !== prevValue + 1) {
                    // Eğer 13 ve 1 yan yanaysa (Okey kurallarında 13'ten sonra 1 gelebilir)
                    if (prevValue === 13 && currentValue === 1 && allowOneAfter) {
                        continue;
                    }
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Taş grubunu analiz edip tipini döndürür.
     */
    static evaluateGroup(tiles) {
        if (this.isPer(tiles))
            return 'PER';
        if (this.isSeri(tiles))
            return 'SERI';
        if (tiles.length === 2 && this.isTilesSame(tiles[0], tiles[1]))
            return 'CIFT';
        return 'INVALID';
    }
    /**
     * Taşlar aynı renk ve aynı değerde mi?
     * @param tileA ilk taş
     * @param tileB ikinci taş
     */
    static isTilesSame(tileA, tileB) {
        return tileA.value === tileB.value && tileA.color === tileB.color;
    }
}
exports.RuleValidator = RuleValidator;
