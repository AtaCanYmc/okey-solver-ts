<div align="center">
  <img src=".github/screenshots/okey-solver-logo.png" alt="Okey Solver TS Logo" width="200" />
  <h1>Okey Solver TS</h1>
</div>

---
[![npm version](https://img.shields.io/npm/v/okey-solver-ts.svg?style=flat-square)](https://www.npmjs.com/package/okey-solver-ts)
[![npm downloads](https://img.shields.io/npm/dt/okey-solver-ts.svg?style=flat-square)](https://www.npmjs.com/package/okey-solver-ts)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

A TypeScript library for evaluating and finding the best arrangement of tiles for games like Rummikub and Okey 101.

## Features

- **Backtracking Algorithm**: Evaluates combinations of tiles to find the most optimal arrangement for max score/tiles used.
- **Rules Validation**: Implements rules for "Seri" (runs) and "Per" (groups) correctly.
- **Type-safe**: Written entirely in TypeScript with definitions included out of the box.

## Installation

You can install the package using npm:

```bash
npm install okey-solver-ts
```

Or using yarn:

```bash
yarn add okey-solver-ts
```

## Usage Example

```typescript
import { SolverEngine, Tile, Arrangement } from 'okey-solver-ts';

// 1. Define your tiles
const myTiles: Tile[] = [
    { id: 'r_5_1', color: 'RED', value: 5 },
    { id: 'r_6_1', color: 'RED', value: 6 },
    { id: 'r_7_1', color: 'RED', value: 7 },
    { id: 'b_5_1', color: 'BLUE', value: 5 },
    { id: 'y_5_1', color: 'YELLOW', value: 5 },
    // ... add more tiles
];

// 2. Find the best arrangement
const bestArrangement: Arrangement = SolverEngine.findBestArrangement(myTiles);

// 3. Review the result
console.log('Total Score:', bestArrangement.totalScore);
console.log('Melds:', bestArrangement.melds);
console.log('Remaining Tiles:', bestArrangement.remainingTiles);
```

## Types and Interfaces

The library exposes standard types so you can have autocomplete and static checks in your project (like React Native or Web).

```typescript
export type TileColor = 'RED' | 'BLACK' | 'BLUE' | 'YELLOW' | 'JOKER';

export interface Tile {
    id: string; // Unique identifier for the tile
    color: TileColor;
    value: number; // 1-13 (0 for false okey/joker if necessary)
}

export type MeldType = 'SERI' | 'PER' | 'CIFT' | 'INVALID';

export interface Meld {
    type: MeldType;
    tiles: Tile[];
    score: number;
}
```

## Development

If you want to contribute or build locally:

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to compile the TypeScript code.
4. Run `npm run test` to execute the Jest tests.
5. Run `npm run lint` and `npm run format` for code quality.

## License

This project is open-sourced under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.
