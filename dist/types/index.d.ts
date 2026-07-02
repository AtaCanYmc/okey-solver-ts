export type TileColor = 'RED' | 'BLACK' | 'BLUE' | 'YELLOW' | 'JOKER';
export interface Tile {
    id: string;
    color: TileColor;
    value: number;
}
export type MeldType = 'SERI' | 'PER' | 'CIFT' | 'INVALID';
export interface Meld {
    type: MeldType;
    tiles: Tile[];
    score: number;
}
export interface OkeyMeta {
    color: TileColor;
    value: number;
}
export interface Arrangement {
    melds: Meld[];
    remainingTiles: Tile[];
    totalScore: number;
}
