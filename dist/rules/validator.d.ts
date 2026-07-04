import { Tile, MeldType, OkeyMeta } from '../types';
import { IRuleValidator } from './rule-validator.interface';
export declare class OkeyRuleValidator implements IRuleValidator {
    /**
     * Grubun geçerli bir "Per" (Aynı sayı, farklı renk) olup olmadığını kontrol eder.
     */
    isPer(tiles: Tile[], okeyMeta?: OkeyMeta): boolean;
    /**
     * Grubun geçerli bir "Seri" (Aynı renk, ardışık sayı) olup olmadığını kontrol eder.
     */
    isSeri(tiles: Tile[], allowOneAfter?: boolean, okeyMeta?: OkeyMeta): boolean;
    /**
     * Taş grubunu analiz edip tipini döndürür.
     */
    evaluateGroup(tiles: Tile[], okeyMeta?: OkeyMeta): MeldType;
    /**
     * Taşlar aynı renk ve aynı değerde mi?
     */
    isTilesSame(tileA: Tile, tileB: Tile, okeyMeta?: OkeyMeta): boolean;
    /**
     * JOKER (Sahte Okey) taşını gerçek okey değerine dönüştürür.
     */
    getEffectiveTile(tile: Tile, okeyMeta?: OkeyMeta): Tile;
    getEffectiveTiles(tiles: Tile[], okeyMeta?: OkeyMeta): Tile[];
}
export declare class RuleValidator {
    private static validator;
    static isPer(tiles: Tile[], okeyMeta?: OkeyMeta): boolean;
    static isSeri(tiles: Tile[], allowOneAfter?: boolean, okeyMeta?: OkeyMeta): boolean;
    static evaluateGroup(tiles: Tile[], okeyMeta?: OkeyMeta): MeldType;
    static isTilesSame(tileA: Tile, tileB: Tile, okeyMeta?: OkeyMeta): boolean;
    static getEffectiveTile(tile: Tile, okeyMeta?: OkeyMeta): Tile;
    static getEffectiveTiles(tiles: Tile[], okeyMeta?: OkeyMeta): Tile[];
}
