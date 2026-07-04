import { Tile, Meld, OkeyMeta } from '../types';
import { IRuleValidator } from '../rules/rule-validator.interface';
export declare class MeldGenerator {
    private validator;
    constructor(validator: IRuleValidator);
    /**
     * Eldeki taşlardan üretilebilecek TÜM olası üçlü/dörtlü kombinasyonları çıkarır.
     */
    generateAllPossibleMelds(normalTiles: Tile[], wildcards: Tile[], okeyMeta?: OkeyMeta): Meld[];
    /**
     * Per jeneratörü. Joker (Wildcard) taşları eksik renklerin yerine geçer.
     */
    private generateAllPers;
    /**
     * Circular Sliding Window ile seri üretir. 12-13-1 desteğiyle.
     */
    private generateAllSeris;
    /**
     * Verilen başlangıç değerinden itibaren kayan pencere ile seri üretir.
     * Basitleştirilmiş rekürsif "boşluk doldurma" yaklaşımıyla.
     */
    private generateWindowedSeris;
    private getCombinations;
    private cartesianProduct;
}
