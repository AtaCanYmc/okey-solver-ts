<div align="center">
  <img src=".github/screenshots/okey-solver-logo.png" alt="Okey Solver TS Logo" width="180" />
  <h1>okey-solver-ts</h1>
  <p>TypeScript library for solving Okey & Rummikub tile arrangements</p>
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/okey-solver-ts.svg?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/okey-solver-ts)
[![npm downloads](https://img.shields.io/npm/dt/okey-solver-ts.svg?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/okey-solver-ts)
[![CI](https://img.shields.io/github/actions/workflow/status/AtaCanYmc/okey-solver-ts/deploy-demo.yml?branch=main&style=flat-square&label=CI%2FCD&logo=github)](https://github.com/AtaCanYmc/okey-solver-ts/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**[📦 npm](https://www.npmjs.com/package/okey-solver-ts) · [🌐 Live Demo](https://atacanymc.github.io/okey-solver-ts/) · [🐛 Issues](https://github.com/AtaCanYmc/okey-solver-ts/issues)**

</div>

---

A zero-dependency TypeScript library that solves tile arrangement problems for **Okey** and **Rummikub (101)** using a backtracking algorithm. Fully type-safe, with built-in `.d.ts` definitions.

## ✨ Features

| Feature | Description |
|---|---|
| 🧩 **Backtracking Solver** | Finds the globally optimal arrangement via depth-first search |
| 🃏 **Joker / Wildcard** | Okey tile fills any missing position in a run or group |
| 🔄 **12-13-1 Circular Runs** | Supports wrap-around sequences like `12 → 13 → 1` |
| 👥 **Going Double** | `findBestPairs()` calculates max identical pairs for the "7 pairs" win condition |
| 🎭 **Sahte Okey** | False Okey tile (color `JOKER`) is resolved to the real Okey's value automatically |
| 📐 **Type-safe** | Full TypeScript types & IntelliSense with shipped `.d.ts` definitions |

---

## 📦 Installation

```bash
npm install okey-solver-ts
```

```bash
yarn add okey-solver-ts
```

```bash
pnpm add okey-solver-ts
```

---

## 🚀 Quick Start

### Basic Arrangement

```typescript
import { SolverEngine, Tile } from 'okey-solver-ts';

const myTiles: Tile[] = [
    { id: 'r5', color: 'RED',    value: 5 },
    { id: 'r6', color: 'RED',    value: 6 },
    { id: 'r7', color: 'RED',    value: 7 },  // RED 5-6-7 → Seri
    { id: 'b5', color: 'BLUE',   value: 5 },
    { id: 'y5', color: 'YELLOW', value: 5 },  // RED+BLUE+YELLOW 5 → Per
    { id: 'bk3', color: 'BLACK', value: 3 },  // leftover
];

const result = SolverEngine.findBestArrangement(myTiles);

console.log(result.totalScore);      // 42
console.log(result.melds.length);    // 2
console.log(result.remainingTiles);  // [{ id: 'bk3', ... }]
```

### With Joker (Wildcard / Okey Tile)

```typescript
import { SolverEngine, Tile, OkeyMeta } from 'okey-solver-ts';

// Declare which tile is the "Okey" (wildcard)
const okeyMeta: OkeyMeta = { color: 'RED', value: 7 };

const tiles: Tile[] = [
    { id: 'r4',   color: 'RED', value: 4  },
    { id: 'okey', color: 'RED', value: 7  },  // Joker → acts as RED 5
    { id: 'r6',   color: 'RED', value: 6  },
];

const result = SolverEngine.findBestArrangement(tiles, okeyMeta);
// RED 4 + Joker(5) + RED 6 → valid Seri ✅
```

### With Sahte Okey (False Okey)

```typescript
// Tile with color 'JOKER' is the False Okey.
// It takes the real Okey's color and value automatically.
const falseOkey: Tile = { id: 'sahte', color: 'JOKER', value: 0 };
const okeyMeta: OkeyMeta = { color: 'YELLOW', value: 5 };

const tiles: Tile[] = [
    { id: 'y3', color: 'YELLOW', value: 3 },
    { id: 'y4', color: 'YELLOW', value: 4 },
    falseOkey,  // resolved to YELLOW 5 → completes Y 3-4-5 Seri
];

const result = SolverEngine.findBestArrangement(tiles, okeyMeta);
```

### Going Double (Çifte Gitme)

```typescript
import { SolverEngine } from 'okey-solver-ts';

// Find maximum identical pairs from your hand
const result = SolverEngine.findBestPairs(myTiles, okeyMeta);

console.log(result.totalPairs);     // e.g. 6
console.log(result.pairs);          // [[Tile, Tile], ...]
console.log(result.remainingTiles); // unpaired tiles

if (result.totalPairs >= 7) {
    console.log('🎉 You can go double!');
}
```

### 12-13-1 Circular Run

```typescript
const tiles: Tile[] = [
    { id: 'r12', color: 'RED', value: 12 },
    { id: 'r13', color: 'RED', value: 13 },
    { id: 'r1',  color: 'RED', value: 1  },
];

const result = SolverEngine.findBestArrangement(tiles);
// RED 12-13-1 → valid circular Seri ✅
```

---

## 📐 API Reference

### `SolverEngine.findBestArrangement(tiles, okeyMeta?)`

| Parameter | Type | Description |
|---|---|---|
| `tiles` | `Tile[]` | The tiles in your hand |
| `okeyMeta` | `OkeyMeta?` | *(optional)* Which tile is the Okey (wildcard) |

Returns `Arrangement`:

```typescript
interface Arrangement {
    melds: Meld[];          // Groups (Seri / Per) found
    remainingTiles: Tile[]; // Tiles not used in any meld
    totalScore: number;     // Sum of tile values in all melds
}
```

### `SolverEngine.findBestPairs(tiles, okeyMeta?)`

Returns the maximum number of identical pairs (same color + same value) for the "Going Double" win condition.

```typescript
{ pairs: [Tile, Tile][]; remainingTiles: Tile[]; totalPairs: number }
```

---

## 🗂 Type Definitions

```typescript
export type TileColor = 'RED' | 'BLACK' | 'BLUE' | 'YELLOW' | 'JOKER';

export interface Tile {
    id: string;       // Unique identifier (e.g. "r_12_1")
    color: TileColor;
    value: number;    // 1–13; use 0 for False Okey (JOKER color)
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
```

---

## 🛠 Development

```bash
git clone https://github.com/AtaCanYmc/okey-solver-ts.git
cd okey-solver-ts
npm install

npm run build   # Compile TypeScript → dist/
npm test        # Run Jest tests (26 tests)
npm run lint    # ESLint check
npm run format  # Prettier format
```

---

## 🌐 Live Demo

An interactive browser demo is automatically deployed to GitHub Pages on every push to `main`:

👉 **[atacanymc.github.io/okey-solver-ts](https://atacanymc.github.io/okey-solver-ts/)**

Add tiles, enable Joker mode, and see the solver in action — no build step needed.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **Apache 2.0 License** — see the [LICENSE](LICENSE) file for details.
