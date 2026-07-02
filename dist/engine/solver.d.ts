import { Tile, Arrangement } from '../types';
export declare class SolverEngine {
    /**
     * Karışık bir eli alır ve en optimum dizilimi döndürür.
     */
    static findBestArrangement(tiles: Tile[]): Arrangement;
    /**
     * Eldeki taşlardan üretilebilecek TÜM olası üçlü/dörtlü kombinasyonları çıkarır.
     * (Brute-force kombinasyon üreticisi)
     */
    private static generateAllPossibleMelds;
    private static generateAllSeris;
    private static generateAllPers;
    /**
     * Verilen bir diziden, istenen boyutta tüm kombinasyonları (sırasız alt kümeler) çıkarır.
     */
    private static getCombinations;
    /**
     * Birden fazla dizinin Kartezyen Çarpımını (Cartesian Product) alır.
     * Amacı: Elimizde iki adet Kırmızı 5 ve bir adet Kırmızı 6, Kırmızı 7 varsa,
     * bize iki farklı seri ihtimalini (R5_A-R6-R7 ve R5_B-R6-R7) döndürmesidir.
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
     * Dizilimin toplam değerini hesaplar. Optimizasyon hedefine göre değişir.
     */
    private static calculateArrangementScore;
    private static getRemainingTiles;
}
