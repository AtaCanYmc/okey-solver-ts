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
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](/CONTRIBUTING.md)

**[📦 npm](https://www.npmjs.com/package/okey-solver-ts) · [🌐 Live Demo](https://atacanymc.github.io/okey-solver-ts/) · [📚 Docs](/docs/ARCHITECTURE.md) · [🐛 Issues](https://github.com/AtaCanYmc/okey-solver-ts/issues)**

</div>

---

A zero-dependency TypeScript library that solves tile arrangement problems for **Okey** and **Rummikub (101)** using a backtracking algorithm. Fully type-safe, modular, and optimized for performance.

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

For more options and examples, refer to the [API Reference](/docs/API_REFERENCE.md).

---

## 📊 Performance & Complexity

The solver uses a **Backtracking Search** to find the globally optimal arrangement.
- **Complexity:** En el en kötü senaryoda (Worst Case) zaman karmaşıklığı üsteldir ($O(2^n)$). Jokerlerin (Wildcards) fazla olması durum uzayını genişletir.
- **Recommended Bounds:** Standart Okey elinde (14 ila 22 taş) ve normal miktarda joker ile (0-4 adet) solver **mikrosaniyeler** içinde çalışır. Joker sayısı 5 ve üzerinde olduğunda üstel zaman karmaşıklığı arama süresini uzatabilir.

---

## 📖 Documentation & Guides

For details on architecture, rules, and APIs:
- 🏗 **[Architecture & Algorithm Design](/docs/ARCHITECTURE.md)** - Details on Backtracking, DFS, and SOLID Facade pattern.
- 📜 **[Game Rules Reference](/docs/ALGORITHM_RULES.md)** - Okey rules, 12-13-1 circular runs, joker and false okey logic.
- 📐 **[Detailed API Reference](/docs/API_REFERENCE.md)** - Full description of classes, methods, and type definitions.

---

## 🛠 Development & Contributing

Please read the **[Contributing Guide](/CONTRIBUTING.md)** to learn about fork workflow, building, and code styles.

```bash
npm run build   # Compile TypeScript → dist/
npm test        # Run Jest tests with coverage
npm run lint    # ESLint check
npm run format  # Prettier format
```

---

## 📄 License

This project is licensed under the **Apache 2.0 License** — see the [LICENSE](LICENSE) file for details.
