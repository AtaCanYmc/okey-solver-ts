# Code Architecture and Algorithm Design (ARCHITECTURE.md)

This document explains the architectural design, algorithms used, and performance trade-offs of the `okey-solver-ts` library.

## Architectural Structure (SOLID & SOLID Facade)

The library is designed based on **SOLID** principles and the **Facade** design pattern:

1. **SRP (Single Responsibility Principle):**
   - [IRuleValidator](file:///Users/atacan/ata-codes/okey-solver-ts/src/rules/rule-validator.interface.ts): Validates tile groups (meld/seri/pair) for rule compliance.
   - [MeldGenerator](file:///Users/atacan/ata-codes/okey-solver-ts/src/engine/meld-generator.ts): Generates all potential runs and groups from the tiles in hand (Candidate Pool).
   - [BacktrackingSolver](file:///Users/atacan/ata-codes/okey-solver-ts/src/engine/backtracking-solver.ts): Performs depth-first backtracking search to find the highest-scoring combination without tile conflicts.
   - [PairFinder](file:///Users/atacan/ata-codes/okey-solver-ts/src/engine/pair-finder.ts): Optimizes pairs for the "going double" winning strategy.
   - [SolverEngine](file:///Users/atacan/ata-codes/okey-solver-ts/src/engine/solver.ts): Serves as the main Facade class coordinating these sub-systems.

2. **OCP (Open/Closed Principle):**
   - Game rules are abstracted through the `IRuleValidator` interface. Developers can implement custom validators (e.g., for Rummikub, Okey 101, or custom variations) and inject them into `SolverEngine` without modifying the core solver logic.

---

## Search Algorithm: Backtracking and DFS

Finding the optimal tile arrangement (maximizing score or minimizing leftover tiles) is fundamentally a Set Packing / Exact Cover problem variation. This problem belongs to the **NP-Complete** complexity class.

### Algorithm Steps
1. **Candidate Pool Generation (Meld Generation):**
   - The hand (typically 14 to 22 tiles) is scanned to identify all possible valid runs (seris) and groups (pers).
   - Joker tiles (Wildcards) are recursively simulated to fill missing slots in candidate combinations.
2. **Backtracking and Depth-First Search (DFS):**
   - Candidate melds are sequentially selected from the pool.
   - The solver checks if the candidate meld conflicts with already used tiles.
   - If there is no conflict, tiles are deducted from the available hand, and the search goes deeper (`search(...)`).
   - If the search reaches a dead-end or exhausts options, it backtracks, restoring tiles and exploring alternative branches.
   - The configuration yielding the highest total score is selected.

### Why Backtracking instead of Dynamic Programming (DP)?
- In Okey, tiles can be reused across different sets (both runs and groups). Although this creates overlapping subproblems, the presence of duplicate tiles and wildcards makes the state space highly dynamic.
- Dynamic programming approaches (like Knapsack DP) would generate massive state-transition matrices. Backtracking paired with aggressive pruning handles small hand sizes (14-22 tiles) extremely fast with minimal memory footprints.

---

## Time and Space Complexity

### Time Complexity
- **Worst Case:** $O(2^N)$ or $O(M!)$ ($N$ = number of candidate melds, $M$ = number of tiles in hand). An excessive amount of wildcards in hand increases the search tree branching factor.
- **Average Case:** Due to tile conflicts, the search tree is quickly pruned. For standard 14-tile hands, solutions are found in microseconds.

### Space Complexity
- **Stack Depth:** The maximum recursion depth is bounded by the number of tiles divided by 3 (since each meld requires at least 3 tiles). Stack depth $D \le 7$ (for a standard hand) or $D \le 10$ (for a 101 hand).
- **Memory Footprint:** $O(N + M)$ and extremely lightweight.
