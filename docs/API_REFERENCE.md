# API Reference (API_REFERENCE.md)

This document lists the main modules, classes, and types exported by the `okey-solver-ts` library.

## 1. Core Modules and Classes

### `SolverEngine`
The main Facade class coordinating the meld generation, backtracking, and pair finding.

#### Methods:
- `findBestArrangement(tiles: Tile[], okeyMeta?: OkeyMeta): Arrangement`
  - Scans the hand and returns the optimal scoring run/group configuration.
- `findBestPairs(tiles: Tile[], okeyMeta?: OkeyMeta): { pairs: [Tile, Tile][]; remainingTiles: Tile[]; totalPairs: number }`
  - Calculates the maximum number of identical pairs for the double-going win condition.

---

### `IRuleValidator` (Interface)
Interface defining validation rules for runs, groups, and twin pairings.

#### Methods:
- `isPer(tiles: Tile[], okeyMeta?: OkeyMeta): boolean`
- `isSeri(tiles: Tile[], allowOneAfter?: boolean, okeyMeta?: OkeyMeta): boolean`
- `evaluateGroup(tiles: Tile[], okeyMeta?: OkeyMeta): MeldType`

---

### `OkeyRuleValidator`
Standard rules validator implementing `IRuleValidator` according to classic Okey/101 and Rummikub guidelines.

---

### `MeldGenerator`
Generates all possible combinations (candidate melds) from the player's tiles.

---

### `BacktrackingSolver`
Solves the candidate meld selection using DFS and backtracking logic to find the optimal arrangement.

---

### `PairFinder`
Finds and pairs identical tiles.

---

## 2. Type Definitions

```typescript
export type TileColor = 'RED' | 'BLACK' | 'BLUE' | 'YELLOW' | 'JOKER';

export interface Tile {
    id: string;      // Unique identifier (e.g., "r_12_1")
    color: TileColor;
    value: number;   // Value between 1 and 13
}

export type MeldType = 'SERI' | 'PER' | 'CIFT' | 'INVALID';

export interface Meld {
    type: MeldType;
    tiles: Tile[];
    score: number;
}

export interface OkeyMeta {
    color: TileColor; // The color of the Okey (wildcard) tile
    value: number;    // The value of the Okey (wildcard) tile
}

export interface Arrangement {
    melds: Meld[];
    remainingTiles: Tile[];
    totalScore: number;
}
```
