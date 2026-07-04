import { Tile, MeldType, OkeyMeta } from '../types';
export interface IRuleValidator {
    isPer(tiles: Tile[], okeyMeta?: OkeyMeta): boolean;
    isSeri(tiles: Tile[], allowOneAfter?: boolean, okeyMeta?: OkeyMeta): boolean;
    evaluateGroup(tiles: Tile[], okeyMeta?: OkeyMeta): MeldType;
    isTilesSame(tileA: Tile, tileB: Tile, okeyMeta?: OkeyMeta): boolean;
    getEffectiveTile(tile: Tile, okeyMeta?: OkeyMeta): Tile;
    getEffectiveTiles(tiles: Tile[], okeyMeta?: OkeyMeta): Tile[];
}
