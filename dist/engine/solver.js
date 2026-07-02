"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolverEngine = void 0;
const validator_1 = require("../rules/validator");
class SolverEngine {
    /**
     * Karışık bir eli alır ve en optimum dizilimi döndürür.
     */
    static findBestArrangement(tiles) {
        // 1. Adım: Eldeki taşlardan çıkabilecek tüm geçerli per ve serileri bul (Aday Havuzu)
        const allPossibleMelds = this.generateAllPossibleMelds(tiles);
        // 2. Adım: Backtracking ile en iyi kombinasyonu ara
        let bestArrangement = [];
        let maxScore = 0;
        // Recursive arama fonksiyonu
        const search = (currentArrangement, remainingPool, currentIndex) => {
            // Mevcut dizilimin skorunu hesapla (Şimdilik her taş 1 puan veya 101 için değer toplamı)
            const currentScore = this.calculateArrangementScore(currentArrangement);
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestArrangement = [...currentArrangement];
            }
            // Ağacı gezmeye devam et
            for (let i = currentIndex; i < allPossibleMelds.length; i++) {
                const candidateMeld = allPossibleMelds[i];
                // Aday grup, elimizde kalan taşlardan oluşturulabiliyor mu? (Çakışma kontrolü)
                if (this.canFormMeld(candidateMeld.tiles, remainingPool)) {
                    // Taşları havuzdan düş
                    const nextRemainingPool = this.removeTilesFromPool(candidateMeld.tiles, remainingPool);
                    currentArrangement.push(candidateMeld);
                    // Derinlemesine in (DFS - Depth First Search)
                    search(currentArrangement, nextRemainingPool, i + 1);
                    // Backtrack: Geri dönerken taşı tekrar havuza koy
                    currentArrangement.pop();
                }
            }
        };
        search([], tiles, 0);
        // Kalan boş taşları bul
        const remainingTiles = this.getRemainingTiles(bestArrangement, tiles);
        return { melds: bestArrangement, remainingTiles, totalScore: maxScore };
    }
    /**
     * Eldeki taşlardan üretilebilecek TÜM olası üçlü/dörtlü kombinasyonları çıkarır.
     * (Brute-force kombinasyon üreticisi)
     */
    static generateAllPossibleMelds(tiles) {
        const validMelds = [];
        validMelds.push(...this.generateAllPers(tiles));
        validMelds.push(...this.generateAllSeris(tiles));
        return validMelds;
    }
    static generateAllSeris(tiles) {
        const melds = [];
        // Taşları renklerine göre grupla
        const groupedByColor = new Map();
        for (const tile of tiles) {
            if (!groupedByColor.has(tile.color)) {
                groupedByColor.set(tile.color, []);
            }
            groupedByColor.get(tile.color).push(tile);
        }
        for (const [color, groupTiles] of groupedByColor.entries()) {
            // Taşları değerlerine göre küçükten büyüğe sırala
            const sortedGroup = groupTiles.sort((a, b) => a.value - b.value);
            // Değerlere göre alt gruplama (Örn: İki adet "Mavi 5" varsa ayırmak için)
            const valueMap = new Map();
            for (const t of sortedGroup) {
                if (!valueMap.has(t.value))
                    valueMap.set(t.value, []);
                valueMap.get(t.value).push(t);
            }
            const uniqueValues = Array.from(valueMap.keys());
            // Kayan pencere (Sliding Window) mantığı ile minimum 3 uzunluğundaki ardışık dizileri bul
            for (let i = 0; i < uniqueValues.length; i++) {
                let currentSequence = [uniqueValues[i]];
                for (let j = i + 1; j < uniqueValues.length; j++) {
                    if (uniqueValues[j] === uniqueValues[j - 1] + 1) {
                        currentSequence.push(uniqueValues[j]);
                        // Eğer dizi uzunluğu 3 veya daha fazlaysa, bu geçerli bir seridir
                        if (currentSequence.length >= 3) {
                            const sequenceOptions = currentSequence.map((val) => valueMap.get(val));
                            const cartesianTiles = this.cartesianProduct(sequenceOptions);
                            for (const tileSet of cartesianTiles) {
                                // VALIDATOR KONTROLÜ
                                const meldType = validator_1.RuleValidator.evaluateGroup(tileSet);
                                if (meldType === 'SERI') {
                                    const score = tileSet.reduce((sum, t) => sum + t.value, 0);
                                    melds.push({ type: 'SERI', tiles: tileSet, score });
                                }
                            }
                        }
                    }
                    else {
                        // Ardışıklık bozuldu, aramayı kes
                        break;
                    }
                }
            }
            // TODO: 12-13-1 serisi (Okey kuralı) için buraya özel bir modül (circular check) eklenebilir.
        }
        return melds;
    }
    static generateAllPers(tiles) {
        const melds = [];
        // Taşları değerlerine göre grupla (1'den 13'e kadar)
        const groupedByValue = new Map();
        for (const tile of tiles) {
            if (!groupedByValue.has(tile.value)) {
                groupedByValue.set(tile.value, []);
            }
            groupedByValue.get(tile.value).push(tile);
        }
        // Her bir değer grubu için per kombinasyonlarını bul
        for (const [value, groupTiles] of groupedByValue.entries()) {
            // Renklere göre alt gruplama (Aynı renkten olan kopyaları ayırmak için)
            const colors = new Map();
            for (const t of groupTiles) {
                if (!colors.has(t.color))
                    colors.set(t.color, []);
                colors.get(t.color).push(t);
            }
            const availableColors = Array.from(colors.keys());
            // Per olabilmesi için en az 3 farklı renk lazım
            if (availableColors.length >= 3) {
                // 3'lü per kombinasyonları
                const combinations3 = this.getCombinations(availableColors, 3);
                for (const combo of combinations3) {
                    const tileOptions = combo.map((color) => colors.get(color));
                    const cartesianTiles = this.cartesianProduct(tileOptions);
                    for (const tileSet of cartesianTiles) {
                        // VALIDATOR KONTROLÜ
                        const meldType = validator_1.RuleValidator.evaluateGroup(tileSet);
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
                        // VALIDATOR KONTROLÜ
                        const meldType = validator_1.RuleValidator.evaluateGroup(tileSet);
                        if (meldType === 'PER') {
                            const score = tileSet.reduce((sum, t) => sum + t.value, 0);
                            melds.push({ type: 'PER', tiles: tileSet, score });
                        }
                    }
                }
            }
        }
        return melds;
    }
    /**
     * Verilen bir diziden, istenen boyutta tüm kombinasyonları (sırasız alt kümeler) çıkarır.
     */
    static getCombinations(array, size) {
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
    /**
     * Birden fazla dizinin Kartezyen Çarpımını (Cartesian Product) alır.
     * Amacı: Elimizde iki adet Kırmızı 5 ve bir adet Kırmızı 6, Kırmızı 7 varsa,
     * bize iki farklı seri ihtimalini (R5_A-R6-R7 ve R5_B-R6-R7) döndürmesidir.
     */
    static cartesianProduct(arrays) {
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
    /**
     * İstenen grubun, mevcut taş havuzundan çıkıp çıkamayacağını denetler (Çakışma Testi)
     */
    static canFormMeld(neededTiles, pool) {
        const poolIds = new Set(pool.map((t) => t.id));
        return neededTiles.every((t) => poolIds.has(t.id));
    }
    /**
     * Kullanılan taşları ana havuzdan eksiltir
     */
    static removeTilesFromPool(usedTiles, pool) {
        const usedIds = new Set(usedTiles.map((t) => t.id));
        return pool.filter((t) => !usedIds.has(t.id));
    }
    /**
     * Dizilimin toplam değerini hesaplar. Optimizasyon hedefine göre değişir.
     */
    static calculateArrangementScore(melds) {
        let score = 0;
        for (const meld of melds) {
            // 101 için taşların üstündeki rakamların toplamı olabilir.
            // Klasik okey için sadece kullanılan taş sayısı olabilir.
            score += meld.tiles.reduce((sum, tile) => sum + tile.value, 0);
        }
        return score;
    }
    static getRemainingTiles(melds, originalTiles) {
        const usedIds = new Set();
        melds.forEach((m) => m.tiles.forEach((t) => usedIds.add(t.id)));
        return originalTiles.filter((t) => !usedIds.has(t.id));
    }
}
exports.SolverEngine = SolverEngine;
