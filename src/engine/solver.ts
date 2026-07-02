// src/engine/solver.ts
import { Tile, Meld, Arrangement, OkeyMeta, TileColor } from '../types';
import { RuleValidator } from '../rules/validator';

const ALL_COLORS: TileColor[] = ['RED', 'BLACK', 'BLUE', 'YELLOW'];

export class SolverEngine {
    /**
     * Karışık bir eli alır ve en optimum per/seri dizilimini döndürür.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın "Okey" (Joker/Wildcard) olduğunu belirtir
     */
    public static findBestArrangement(tiles: Tile[], okeyMeta?: OkeyMeta): Arrangement {
        // Sahte Okey taşlarını gerçek okey değerine dönüştür
        const resolvedTiles = okeyMeta ? this.resolveFalseOkeys(tiles, okeyMeta) : tiles;

        // Okey (Wildcard) taşlarını bul
        const wildcards = okeyMeta ? resolvedTiles.filter(t => t.color === okeyMeta.color && t.value === okeyMeta.value) : [];
        const normalTiles = okeyMeta ? resolvedTiles.filter(t => !(t.color === okeyMeta.color && t.value === okeyMeta.value)) : resolvedTiles;

        // 1. Adım: Eldeki taşlardan çıkabilecek tüm geçerli per ve serileri bul (Aday Havuzu)
        const allPossibleMelds = this.generateAllPossibleMelds(normalTiles, wildcards, okeyMeta);

        // 2. Adım: Backtracking ile en iyi kombinasyonu ara
        let bestArrangement: Meld[] = [];
        let maxScore = 0;

        // Recursive arama fonksiyonu
        const search = (currentArrangement: Meld[], remainingPool: Tile[], currentIndex: number) => {
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

        search([], resolvedTiles, 0);

        // Kalan boş taşları bul (orijinal tile listesinden)
        const remainingTiles = this.getRemainingTiles(bestArrangement, resolvedTiles);

        return { melds: bestArrangement, remainingTiles, totalScore: maxScore };
    }

    /**
     * Çifte Gitme: Eldeki taşlardan en fazla "özdeş çift (identical pair)" bulur.
     * 101 ve Okey'de 7 çift yaparak çıkılabilir.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın Okey olduğunu belirtir
     * @returns Bulunan çiftler ve kalan taşlar
     */
    public static findBestPairs(tiles: Tile[], okeyMeta?: OkeyMeta): { pairs: [Tile, Tile][]; remainingTiles: Tile[]; totalPairs: number } {
        const resolvedTiles = okeyMeta ? this.resolveFalseOkeys(tiles, okeyMeta) : tiles;
        const wildcards = okeyMeta ? resolvedTiles.filter(t => t.color === okeyMeta.color && t.value === okeyMeta.value) : [];
        const normalTiles = okeyMeta ? resolvedTiles.filter(t => !(t.color === okeyMeta.color && t.value === okeyMeta.value)) : resolvedTiles;

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
        let wildcardsLeft = [...wildcards];
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

        const remainingTiles = resolvedTiles.filter(t => !usedIds.has(t.id));
        return { pairs, remainingTiles, totalPairs: pairs.length };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  PRIVATE: Meld Generation
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sahte Okey taşlarını, gerçek "Okey" taşının değerine dönüştürür.
     * Sahte Okey'in rengi ve değeri, gerçek okey taşıyla aynı olur.
     */
    private static resolveFalseOkeys(tiles: Tile[], okeyMeta: OkeyMeta): Tile[] {
        return tiles.map(t => {
            if (t.color === 'JOKER') {
                return { ...t, color: okeyMeta.color, value: okeyMeta.value };
            }
            return t;
        });
    }

    /**
     * Eldeki taşlardan üretilebilecek TÜM olası üçlü/dörtlü kombinasyonları çıkarır.
     */
    private static generateAllPossibleMelds(normalTiles: Tile[], wildcards: Tile[], okeyMeta?: OkeyMeta): Meld[] {
        const validMelds: Meld[] = [];
        validMelds.push(...this.generateAllPers(normalTiles, wildcards, okeyMeta));
        validMelds.push(...this.generateAllSeris(normalTiles, wildcards, okeyMeta));
        return validMelds;
    }

    /**
     * Circular Sliding Window ile seri üretir. 12-13-1 desteğiyle.
     * Okey (Wildcard) taşlarını eksik pozisyonlara yerleştirir.
     */
    private static generateAllSeris(normalTiles: Tile[], wildcards: Tile[], okeyMeta?: OkeyMeta): Meld[] {
        const melds: Meld[] = [];
        const numWildcards = wildcards.length;

        // Taşları renklerine göre grupla (normal taşlar)
        const groupedByColor = new Map<string, Tile[]>();
        for (const tile of normalTiles) {
            if (!groupedByColor.has(tile.color)) {
                groupedByColor.set(tile.color, []);
            }
            groupedByColor.get(tile.color)!.push(tile);
        }

        for (const [color, groupTiles] of groupedByColor.entries()) {
            const valueMap = new Map<number, Tile[]>();
            for (const t of groupTiles) {
                if (!valueMap.has(t.value)) valueMap.set(t.value, []);
                valueMap.get(t.value)!.push(t);
            }

            // 1'i, döngüsel seri için "14" olarak da ekle (12-13-1 desteği)
            // Dizinin sonuna 1'leri 14 değeriyle koy
            const circularMap = new Map<number, Tile[]>(valueMap);
            if (valueMap.has(1)) {
                const ones = valueMap.get(1)!;
                circularMap.set(14, ones);
            }

            // Tüm değerler: 1-13 + (14 = 1 kopyası) → sıralı
            const allUniqueValues = Array.from(circularMap.keys()).sort((a, b) => a - b);

            // Kayan pencere: her başlangıç noktasından en uzun seriyi bul, tüm alt dizileri üret
            for (let i = 0; i < allUniqueValues.length; i++) {
                const startVal = allUniqueValues[i];

                // Başlangıç değerinin 14'ten küçük olmasına dikkat et
                // (14 ile başlayan seri olmaz, 14 sadece 1'in döngüsel kopyasıdır)
                if (startVal === 14) continue;

                // Bu noktadan itibaren ardışık bir pencere oluştur
                // Joker ile kapatılabilecek boşluklar dahil
                this.generateWindowedSeris(startVal, color, circularMap, numWildcards, wildcards, melds, okeyMeta);
            }
        }

        // Joker-only seriler: joker sayısı 3'ten azsa anlamsız (zaten normal taşlara ekleniyor)
        // Joker >= 3 ise tek başına oluşturabildikleri kombinasyonlar yukarıda kapsanıyor

        return melds;
    }

    /**
     * Verilen başlangıç değerinden itibaren kayan pencere ile seri üretir.
     * Joker taşlar, eksik değerlerin yerine geçer.
     */
    private static generateWindowedSeris(
        startVal: number,
        color: string,
        circularMap: Map<number, Tile[]>,
        maxWildcards: number,
        wildcards: Tile[],
        melds: Meld[],
        okeyMeta?: OkeyMeta
    ): void {
        // Pencereyi genişlet: ardışık değerleri bul (joker ile boşlukları doldur)
        // Maksimum seri uzunluğu 13 (1 → 13 arası)
        let currentVal = startVal;
        let wildcardsUsed = 0;
        const windowValues: { val: number; isWildcard: boolean }[] = [];

        while (currentVal <= 13 || (currentVal === 14 && windowValues.length > 0)) {
            const effectiveVal = currentVal === 14 ? 1 : currentVal;
            if (circularMap.has(currentVal)) {
                windowValues.push({ val: currentVal, isWildcard: false });
            } else if (wildcardsUsed < maxWildcards) {
                // Joker ile bu değeri doldur
                windowValues.push({ val: currentVal, isWildcard: true });
                wildcardsUsed++;
            } else {
                // Daha fazla joker yok, pencere bozuldu
                break;
            }

            // Pencere en az 3 uzunluğundaysa meld üret
            if (windowValues.length >= 3) {
                // Joker pozisyonlarını belirle ve tüm gerçek taş kombinasyonlarıyla eşleştir
                const normalPositions = windowValues.filter(w => !w.isWildcard);
                const wildcardPositions = windowValues.filter(w => w.isWildcard);

                // Her normal pozisyon için kartezyen çarpım al
                const normalOptions = normalPositions.map(w => circularMap.get(w.val)!);
                const cartesianSets = this.cartesianProduct(normalOptions);

                for (const normalSet of cartesianSets) {
                    // Kullanılacak wildcard sayısı: wildcardPositions.length
                    const wcCount = wildcardPositions.length;
                    // Yeterli wildcard var mı?
                    if (wcCount > wildcards.length) continue;
                    const usedWcTiles = wildcards.slice(0, wcCount);

                    // Tüm taşları doğru sıraya diz
                    const tileSet: Tile[] = [];
                    let nIdx = 0;
                    let wIdx = 0;
                    for (const w of windowValues) {
                        if (w.isWildcard) {
                            // Joker'e efektif değer ver ki validator doğrulayabilsin
                            const effectiveVal = w.val === 14 ? 1 : w.val;
                            tileSet.push({ ...usedWcTiles[wIdx], color: color as TileColor, value: effectiveVal });
                            wIdx++;
                        } else {
                            tileSet.push(normalSet[nIdx++]);
                        }
                    }

                    // Seriyi val=14 ise val=1 olarak normalize et
                    const normalizedSet = tileSet.map(t => ({ ...t, value: t.value === 14 ? 1 : t.value }));

                    // Validator kontrolü
                    const meldType = RuleValidator.evaluateGroup(normalizedSet, okeyMeta);
                    if (meldType === 'SERI') {
                        const score = normalizedSet.reduce((sum, t) => sum + t.value, 0);
                        melds.push({ type: 'SERI', tiles: normalizedSet, score });
                    }
                }
            }

            currentVal++;
            // 1 değerinin 14 kopyasından sonra dur
            if (currentVal > 14) break;
        }
    }

    /**
     * Per jeneratörü. Joker (Wildcard) taşları eksik renklerin yerine geçer.
     */
    private static generateAllPers(normalTiles: Tile[], wildcards: Tile[], okeyMeta?: OkeyMeta): Meld[] {
        const melds: Meld[] = [];
        const numWildcards = wildcards.length;

        // Taşları değerlerine göre grupla (1'den 13'e kadar)
        const groupedByValue = new Map<number, Tile[]>();
        for (const tile of normalTiles) {
            if (!groupedByValue.has(tile.value)) {
                groupedByValue.set(tile.value, []);
            }
            groupedByValue.get(tile.value)!.push(tile);
        }

        // Her bir değer grubu için per kombinasyonlarını bul
        for (const [value, groupTiles] of groupedByValue.entries()) {
            // Renklere göre alt gruplama
            const colors = new Map<string, Tile[]>();
            for (const t of groupTiles) {
                if (!colors.has(t.color)) colors.set(t.color, []);
                colors.get(t.color)!.push(t);
            }

            const availableColors = Array.from(colors.keys());
            const missingColors = ALL_COLORS.filter(c => !availableColors.includes(c));

            // 3'lü per: eldeki renklerden 3'lü kombinasyonlar
            if (availableColors.length >= 3) {
                const combinations3 = this.getCombinations(availableColors, 3);
                for (const combo of combinations3) {
                    const tileOptions = combo.map(color => colors.get(color)!);
                    const cartesianTiles = this.cartesianProduct(tileOptions);

                    for (const tileSet of cartesianTiles) {
                        const meldType = RuleValidator.evaluateGroup(tileSet, okeyMeta);
                        if (meldType === 'PER') {
                            const score = tileSet.reduce((sum, t) => sum + t.value, 0);
                            melds.push({ type: 'PER', tiles: tileSet, score });
                        }
                    }
                }

                // 4'lü per kombinasyonları (Eğer 4 farklı renk varsa)
                if (availableColors.length === 4) {
                    const tileOptions = availableColors.map(color => colors.get(color)!);
                    const cartesianTiles = this.cartesianProduct(tileOptions);

                    for (const tileSet of cartesianTiles) {
                        const meldType = RuleValidator.evaluateGroup(tileSet, okeyMeta);
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
                        // Bu iki renk kombinasyonu üçüncü bir renk gerektiriyor mu?
                        const usedColors = new Set(combo);
                        const candidateThirdColors = ALL_COLORS.filter(c => !usedColors.has(c));
                        if (candidateThirdColors.length === 0) continue;

                        const tileOptions = combo.map(c => colors.get(c)!);
                        const cartesianTiles = this.cartesianProduct(tileOptions);

                        for (const tileSet of cartesianTiles) {
                            // Joker ekle (hangi renk olduğunu simüle et)
                            for (const wcColor of candidateThirdColors) {
                                const wcTile: Tile = { ...wildcards[0], color: wcColor, value };
                                const fullSet = [...tileSet, wcTile];
                                const meldType = RuleValidator.evaluateGroup(fullSet, okeyMeta);
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
                        const baseTiles = colors.get(baseColor)!;
                        const otherColors = ALL_COLORS.filter(c => c !== baseColor);
                        const colorPairs = this.getCombinations(otherColors, 2);

                        for (const colorPair of colorPairs) {
                            for (const baseTile of baseTiles) {
                                const wc1: Tile = { ...wildcards[0], color: colorPair[0], value };
                                const wc2: Tile = { ...wildcards[1], color: colorPair[1], value };
                                const fullSet = [baseTile, wc1, wc2];
                                const meldType = RuleValidator.evaluateGroup(fullSet, okeyMeta);
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
                    const tileOptions = availableColors.map(c => colors.get(c)!);
                    const cartesianTiles = this.cartesianProduct(tileOptions);

                    for (const tileSet of cartesianTiles) {
                        const wcTile: Tile = { ...wildcards[0], color: missingColor, value };
                        const fullSet = [...tileSet, wcTile];
                        const meldType = RuleValidator.evaluateGroup(fullSet, okeyMeta);
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

    // ─────────────────────────────────────────────────────────────────────────
    //  PRIVATE: Utility Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Verilen bir diziden, istenen boyutta tüm kombinasyonları (sırasız alt kümeler) çıkarır.
     */
    private static getCombinations<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];

        const combine = (start: number, currentCombo: T[]) => {
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
     */
    private static cartesianProduct<T>(arrays: T[][]): T[][] {
        if (arrays.length === 0) return [[]];
        return arrays.reduce<T[][]>(
            (acc, curr) => {
                const result: T[][] = [];
                acc.forEach(a => {
                    curr.forEach(c => {
                        result.push([...a, c]);
                    });
                });
                return result;
            },
            [[]],
        );
    }

    /**
     * İstenen grubun, mevcut taş havuzundan çıkıp çıkamayacağını denetler (Çakışma Testi)
     */
    private static canFormMeld(neededTiles: Tile[], pool: Tile[]): boolean {
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

    /**
     * Kullanılan taşları ana havuzdan eksiltir
     */
    private static removeTilesFromPool(usedTiles: Tile[], pool: Tile[]): Tile[] {
        const remaining = [...pool];
        for (const used of usedTiles) {
            const idx = remaining.findIndex(t => t.id === used.id);
            if (idx !== -1) remaining.splice(idx, 1);
        }
        return remaining;
    }

    /**
     * Dizilimin toplam değerini hesaplar.
     */
    private static calculateArrangementScore(melds: Meld[]): number {
        let score = 0;
        for (const meld of melds) {
            score += meld.tiles.reduce((sum, tile) => sum + tile.value, 0);
        }
        return score;
    }

    private static getRemainingTiles(melds: Meld[], originalTiles: Tile[]): Tile[] {
        const usedIds = new Set<string>();
        melds.forEach(m => m.tiles.forEach(t => usedIds.add(t.id)));
        return originalTiles.filter(t => !usedIds.has(t.id));
    }
}
