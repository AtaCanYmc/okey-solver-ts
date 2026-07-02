import { Tile, Arrangement, OkeyMeta } from '../types';
export declare class SolverEngine {
    /**
     * Karışık bir eli alır ve en optimum per/seri dizilimini döndürür.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın "Okey" (Joker/Wildcard) olduğunu belirtir
     */
    static findBestArrangement(tiles: Tile[], okeyMeta?: OkeyMeta): Arrangement;
    /**
     * Çifte Gitme: Eldeki taşlardan en fazla "özdeş çift (identical pair)" bulur.
     * 101 ve Okey'de 7 çift yaparak çıkılabilir.
     * @param tiles - Eldeki taşlar
     * @param okeyMeta - Hangi taşın Okey olduğunu belirtir
     * @returns Bulunan çiftler ve kalan taşlar
     */
    static findBestPairs(tiles: Tile[], okeyMeta?: OkeyMeta): {
        pairs: [Tile, Tile][];
        remainingTiles: Tile[];
        totalPairs: number;
    };
    /**
     * Sahte Okey taşlarını, gerçek "Okey" taşının değerine dönüştürür.
     * Sahte Okey'in rengi ve değeri, gerçek okey taşıyla aynı olur.
     */
    private static resolveFalseOkeys;
    /**
     * Eldeki taşlardan üretilebilecek TÜM olası üçlü/dörtlü kombinasyonları çıkarır.
     */
    private static generateAllPossibleMelds;
    /**
     * Circular Sliding Window ile seri üretir. 12-13-1 desteğiyle.
     * Okey (Wildcard) taşlarını eksik pozisyonlara yerleştirir.
     */
    private static generateAllSeris;
    /**
     * Verilen başlangıç değerinden itibaren kayan pencere ile seri üretir.
     * Joker taşlar, eksik değerlerin yerine geçer.
     */
    private static generateWindowedSeris;
    /**
     * Per jeneratörü. Joker (Wildcard) taşları eksik renklerin yerine geçer.
     */
    private static generateAllPers;
    /**
     * Verilen bir diziden, istenen boyutta tüm kombinasyonları (sırasız alt kümeler) çıkarır.
     */
    private static getCombinations;
    /**
     * Birden fazla dizinin Kartezyen Çarpımını (Cartesian Product) alır.
     */
    private static cartesianProduct;
    /**
     * İstenen grubun, mevcut taş havuzundan çıkıp çıkamayacağını denetler (Çakışma Testi)
     */
    private static canFormMeld;
    /**
     * Kullanılan taşları ana havuzdan eksiltir
     */
    private static removeTilesFromPool;
    /**
     * Dizilimin toplam değerini hesaplar.
     */
    private static calculateArrangementScore;
    private static getRemainingTiles;
}
