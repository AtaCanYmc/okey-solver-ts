import { Tile, MeldType } from '../types';
export declare class RuleValidator {
    /**
     * Grubun geçerli bir "Per" (Aynı sayı, farklı renk) olup olmadığını kontrol eder.
     */
    static isPer(tiles: Tile[]): boolean;
    /**
     * Grubun geçerli bir "Seri" (Aynı renk, ardışık sayı) olup olmadığını kontrol eder.
     */
    static isSeri(tiles: Tile[], allowOneAfter?: boolean): boolean;
    /**
     * Taş grubunu analiz edip tipini döndürür.
     */
    static evaluateGroup(tiles: Tile[]): MeldType;
    /**
     * Taşlar aynı renk ve aynı değerde mi?
     * @param tileA ilk taş
     * @param tileB ikinci taş
     */
    static isTilesSame(tileA: Tile, tileB: Tile): boolean;
}
