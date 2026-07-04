"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeldGenerator = void 0;
const ALL_COLORS = ['RED', 'BLACK', 'BLUE', 'YELLOW'];
class MeldGenerator {
    constructor(validator) {
        this.validator = validator;
    }
    /**
     * Eldeki taşlardan üretilebilecek TÜM olası üçlü/dörtlü kombinasyonları çıkarır.
     */
    generateAllPossibleMelds(normalTiles, wildcards, okeyMeta) {
        const validMelds = [];
        validMelds.push(...this.generateAllPers(normalTiles, wildcards, okeyMeta));
        validMelds.push(...this.generateAllSeris(normalTiles, wildcards, okeyMeta));
        return validMelds;
    }
    /**
     * Per jeneratörü. Joker (Wildcard) taşları eksik renklerin yerine geçer.
     */
    generateAllPers(normalTiles, wildcards, okeyMeta) {
        const melds = [];
        const numWildcards = wildcards.length;
        // Taşları değerlerine göre grupla (1'den 13'e kadar)
        const groupedByValue = new Map();
        for (const tile of normalTiles) {
            if (!groupedByValue.has(tile.value)) {
                groupedByValue.set(tile.value, []);
            }
            groupedByValue.get(tile.value).push(tile);
        }
        // Her bir değer grubu için per kombinasyonlarını bul
        for (const [value, groupTiles] of groupedByValue.entries()) {
            // Renklere göre alt gruplama
            const colors = new Map();
            for (const t of groupTiles) {
                if (!colors.has(t.color))
                    colors.set(t.color, []);
                colors.get(t.color).push(t);
            }
            const availableColors = Array.from(colors.keys());
            const missingColors = ALL_COLORS.filter((c) => !availableColors.includes(c));
            // 3'lü per: eldeki renklerden 3'lü kombinasyonlar
            if (availableColors.length >= 3) {
                const combinations3 = this.getCombinations(availableColors, 3);
                for (const combo of combinations3) {
                    const tileOptions = combo.map((color) => colors.get(color));
                    const cartesianTiles = this.cartesianProduct(tileOptions);
                    for (const tileSet of cartesianTiles) {
                        const meldType = this.validator.evaluateGroup(tileSet, okeyMeta);
                        if (meldType === 'PER') {
                            const score = tileSet.reduce((sum, t) => sum + t.value, 0);
                            melds.push({ type: 'PER', tiles: tileSet, score });
                        }
                    }
                }
                // 4'lü per kombinasyonları (Eğer 4 farklı renk varsa)
                if (availableColors.length === 4) {
                    const tileOptions = availableColors.map((color) => colors.get(color));
                    const cartesianTiles = this.cartesianProduct(tileOptions);
                    for (const tileSet of cartesianTiles) {
                        const meldType = this.validator.evaluateGroup(tileSet, okeyMeta);
                        if (meldType === 'PER') {
                            const score = tileSet.reduce((sum, t) => sum + t.value, 0);
                            melds.push({ type: 'PER', tiles: tileSet, score });
                        }
                    }
                }
            }
            // Joker ile eksik renkleri tamamlayarak per üret
            if (numWildcards > 0) {
                // 2 normal taş + 1 joker = 3'lü per
                if (availableColors.length >= 2 && numWildcards >= 1) {
                    const combinations2 = this.getCombinations(availableColors, 2);
                    for (const combo of combinations2) {
                        const usedColors = new Set(combo);
                        const candidateThirdColors = ALL_COLORS.filter((c) => !usedColors.has(c));
                        if (candidateThirdColors.length === 0)
                            continue;
                        const tileOptions = combo.map((c) => colors.get(c));
                        const cartesianTiles = this.cartesianProduct(tileOptions);
                        for (const tileSet of cartesianTiles) {
                            for (const wcColor of candidateThirdColors) {
                                const wcTile = Object.assign(Object.assign({}, wildcards[0]), { color: wcColor, value });
                                const fullSet = [...tileSet, wcTile];
                                const meldType = this.validator.evaluateGroup(fullSet, okeyMeta);
                                if (meldType === 'PER') {
                                    const score = fullSet.reduce((sum, t) => sum + t.value, 0);
                                    melds.push({ type: 'PER', tiles: fullSet, score });
                                }
                            }
                        }
                    }
                }
                // 1 normal taş + 2 joker = 3'lü per (3 farklı renk, joker 2 eksik rengi kaplar)
                if (availableColors.length >= 1 && numWildcards >= 2) {
                    for (const baseColor of availableColors) {
                        const baseTiles = colors.get(baseColor);
                        const otherColors = ALL_COLORS.filter((c) => c !== baseColor);
                        const colorPairs = this.getCombinations(otherColors, 2);
                        for (const colorPair of colorPairs) {
                            for (const baseTile of baseTiles) {
                                const wc1 = Object.assign(Object.assign({}, wildcards[0]), { color: colorPair[0], value });
                                const wc2 = Object.assign(Object.assign({}, wildcards[1]), { color: colorPair[1], value });
                                const fullSet = [baseTile, wc1, wc2];
                                const meldType = this.validator.evaluateGroup(fullSet, okeyMeta);
                                if (meldType === 'PER') {
                                    const score = fullSet.reduce((sum, t) => sum + t.value, 0);
                                    melds.push({ type: 'PER', tiles: fullSet, score });
                                }
                            }
                        }
                    }
                }
                // 3 normal taş + 1 joker = 4'lü per
                if (availableColors.length === 3 && numWildcards >= 1) {
                    const missingColor = missingColors[0];
                    const tileOptions = availableColors.map((c) => colors.get(c));
                    const cartesianTiles = this.cartesianProduct(tileOptions);
                    for (const tileSet of cartesianTiles) {
                        const wcTile = Object.assign(Object.assign({}, wildcards[0]), { color: missingColor, value });
                        const fullSet = [...tileSet, wcTile];
                        const meldType = this.validator.evaluateGroup(fullSet, okeyMeta);
                        if (meldType === 'PER') {
                            const score = fullSet.reduce((sum, t) => sum + t.value, 0);
                            melds.push({ type: 'PER', tiles: fullSet, score });
                        }
                    }
                }
            }
        }
        return melds;
    }
    /**
     * Circular Sliding Window ile seri üretir. 12-13-1 desteğiyle.
     */
    generateAllSeris(normalTiles, wildcards, okeyMeta) {
        const melds = [];
        const numWildcards = wildcards.length;
        const groupedByColor = new Map();
        for (const tile of normalTiles) {
            if (!groupedByColor.has(tile.color)) {
                groupedByColor.set(tile.color, []);
            }
            groupedByColor.get(tile.color).push(tile);
        }
        for (const [color, groupTiles] of groupedByColor.entries()) {
            const valueMap = new Map();
            for (const t of groupTiles) {
                if (!valueMap.has(t.value))
                    valueMap.set(t.value, []);
                valueMap.get(t.value).push(t);
            }
            const circularMap = new Map(valueMap);
            if (valueMap.has(1)) {
                const ones = valueMap.get(1);
                circularMap.set(14, ones);
            }
            const allUniqueValues = Array.from(circularMap.keys()).sort((a, b) => a - b);
            for (let i = 0; i < allUniqueValues.length; i++) {
                const startVal = allUniqueValues[i];
                if (startVal === 14)
                    continue;
                this.generateWindowedSeris(startVal, color, circularMap, numWildcards, wildcards, melds, okeyMeta);
            }
        }
        return melds;
    }
    /**
     * Verilen başlangıç değerinden itibaren kayan pencere ile seri üretir.
     * Basitleştirilmiş rekürsif "boşluk doldurma" yaklaşımıyla.
     */
    generateWindowedSeris(startVal, color, circularMap, maxWildcards, wildcards, melds, okeyMeta) {
        const buildRun = (currentVal, currentTiles, wildcardsUsed) => {
            if (currentTiles.length >= 3) {
                const normalizedSet = currentTiles.map((t) => (Object.assign(Object.assign({}, t), { value: t.value === 14 ? 1 : t.value })));
                if (this.validator.evaluateGroup(normalizedSet, okeyMeta) === 'SERI') {
                    const score = normalizedSet.reduce((sum, t) => sum + t.value, 0);
                    melds.push({ type: 'SERI', tiles: normalizedSet, score });
                }
            }
            if (currentVal > 14)
                return;
            const effectiveVal = currentVal === 14 ? 1 : currentVal;
            if (circularMap.has(currentVal)) {
                const tiles = circularMap.get(currentVal);
                for (const tile of tiles) {
                    buildRun(currentVal + 1, [...currentTiles, tile], wildcardsUsed);
                }
            }
            if (wildcardsUsed < maxWildcards && wildcardsUsed < wildcards.length) {
                const wildcardTile = Object.assign(Object.assign({}, wildcards[wildcardsUsed]), { color: color, value: effectiveVal });
                buildRun(currentVal + 1, [...currentTiles, wildcardTile], wildcardsUsed + 1);
            }
        };
        buildRun(startVal, [], 0);
    }
    getCombinations(array, size) {
        const result = [];
        const combine = (start, currentCombo) => {
            if (currentCombo.length === size) {
                result.push([...currentCombo]);
                return;
            }
            for (let i = start; i < array.length; i++) {
                currentCombo.push(array[i]);
                combine(i + 1, currentCombo);
                currentCombo.pop();
            }
        };
        combine(0, []);
        return result;
    }
    cartesianProduct(arrays) {
        if (arrays.length === 0)
            return [[]];
        return arrays.reduce((acc, curr) => {
            const result = [];
            acc.forEach((a) => {
                curr.forEach((c) => {
                    result.push([...a, c]);
                });
            });
            return result;
        }, [[]]);
    }
}
exports.MeldGenerator = MeldGenerator;
