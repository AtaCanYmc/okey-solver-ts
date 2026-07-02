import { Tile, MeldType, OkeyMeta } from '../types';
export declare class RuleValidator {
    /**
     * Grubun geçerli bir "Per" (Aynı sayı, farklı renk) olup olmadığını kontrol eder.
     */
    static isPer(tiles: Tile[], okeyMeta?: OkeyMeta): boolean;
    /**
     * Grubun geçerli bir "Seri" (Aynı renk, ardışık sayı) olup olmadığını kontrol eder.
     */
    static isSeri(tiles: Tile[], allowOneAfter?: boolean, okeyMeta?: OkeyMeta): boolean;
    /**
     * Taş grubunu analiz edip tipini döndürür.
     */
    static evaluateGroup(tiles: Tile[], okeyMeta?: OkeyMeta): MeldType;
    /**
     * Taşlar aynı renk ve aynı değerde mi?
     */
    static isTilesSame(tileA: Tile, tileB: Tile, okeyMeta?: OkeyMeta): boolean;
    /**
     * JOKER (Sahte Okey) taşını gerçek okey değerine,
     * Okey (Joker) taşını da gerektiği durumda (bu fonksiyonda değil, engine'de) dönüştürür.
     */
    static getEffectiveTile(tile: Tile, okeyMeta?: OkeyMeta): Tile;
    static getEffectiveTiles(tiles: Tile[], okeyMeta?: OkeyMeta): Tile[];
}
