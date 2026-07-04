# Okey and 101 Game Rules Reference (ALGORITHM_RULES.md)

This document describes the core game rules and edge cases used as references by `okey-solver-ts` to validate tile groups.

## 1. Tile Definitions and Values
- **Colors:** Red (RED), Black (BLACK), Blue (BLUE), Yellow (YELLOW).
- **Values:** Numbers 1 to 13 (two identical tiles for each color exist in a deck).
- **False Okey (Sahte Okey):** A special tile with no numerical value (color `JOKER`). It automatically takes the color and value of the designated "Okey" tile for the round.
- **Okey (Wildcard):** The tile whose value is one rank higher than the face-up indicator tile on the table. It acts as a wildcard, substituting for any missing tile in a run or group.

---

## 2. Valid Tile Groups (Meld Types)

### Per (Group)
Consists of 3 or 4 tiles of the same value but with different colors.
- **Valid Example:**
  - Red 7, Black 7, Blue 7 (3-tile Per)
  - Red 7, Black 7, Blue 7, Yellow 7 (4-tile Per)
- **Invalid Example:**
  - Red 7, Black 7, Red 7 (Colors must be unique!)

### Seri (Run)
Consists of 3 or more consecutive tiles of the same color.
- **Valid Example:**
  - Red 1, Red 2, Red 3
  - Blue 10, Blue 11, Blue 12, Blue 13

### Çift (Pair)
Consists of exactly two identical tiles (same color + same value).
- **Valid Example:**
  - Red 11, Red 11

---

## 3. Edge Cases & Special Rules

### 12 - 13 - 1 Rule (Circular Runs)
- In Okey/Rummikub, the number 1 can wrap around after 13.
- **Valid Run:** `[12, 13, 1]` (of the same color).
- **Invalid Run:** `[13, 1, 2]`. Once 1 follows 13, the run must end; it cannot continue back into 2.
- The library fully supports this rule via the `allowOneAfter = true` parameter and circular sliding window algorithms.

### False Okey Resolution
- The False Okey tile (`JOKER` color) automatically resolves to the real Okey's representation.
- The real Okey tile acts as a wildcard (`wildcard` list in the engine), filling any missing slot.
- During meld candidate generation, wildcards are simulated dynamically to map their values.
