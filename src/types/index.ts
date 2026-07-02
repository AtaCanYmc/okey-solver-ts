// src/types/index.ts

export type TileColor = 'RED' | 'BLACK' | 'BLUE' | 'YELLOW' | 'JOKER';

export interface Tile {
    id: string; // Örn: "r_12_1" (Kırmızı 12, 1. kopya)
    color: TileColor;
    value: number; // 1-13 arası. Sahte okey veya gerçek okey için 0 atanabilir.
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

