---
name: domain-simulation
description: Use when modifying or verifying the core stateless game loop mechanics, lane rules, sliding logic, or score configurations.
---

# Game Domain Logic & Simulation Engine

This skill guides the implementation of the core stateless rule engine in the game domain partition.

## Board Topology
- Ordered array from index 0 to 7.
- Index 0: White Base (Infinite Capacity).
- Index 7: Black Base (Infinite Capacity).
- Indices 1-6: Central active lanes (Max capacity controlled by config.maxLaneCapacity, defaulting to 6).

## Move Lifecycle
1. **Move 1 (Initiative Move):** Advance exactly 1 step. Count the total pieces occupying the landing track.
2. **Move 2 (Momentum Move):** Advance by Move 1 Count - 1 steps.
   - **Aggressive Mode:** Move 2 piece MUST match the Move 1 piece.
   - **Strategic Mode:** Move 2 piece MUST be a completely distinct piece.
   - **Dead-End Evaluation:** Immediately after Move 1 updates the board layout, the engine must sweep all pieces belonging to the active player. If no legal targets exist for Move 2 under the active `gameMode` constraints, the turn immediately auto-passes to the opponent at Move 1.
    - **Vulnerability Forfeiture:** If Move 1 lands on a track that had 0 or 1 elements before the move, or hits the opponent base, immediately skip Move 2 and pass the turn.
   - **Extra Turn Trigger:** If Move 2 lands on a track that was completely empty (0 pieces) prior to execution, and an extra turn is not already active, `isExtraTurnActive` sets to true and the player retains the active turn phase loop.
3. **Macro Match Termination Check:** A match is only completed and finalized if `isMatchFinished` is verified true, the active player is back at Move 1, and no extra turn transitions remain pending.

## Mechanical Calculations
- **Sliding Evaluation (Hopping):** If a movement path lands on a lane matching or exceeding maxLaneCapacity, continuously slide the target index forward in the movement trajectory direction until a valid opening or terminal base is matched.
- **Scoring Grid:**
  - Target Base: 5 pts
  - 1 lane away: 3 pts
  - 2 lanes away: 2 pts
  - 3 lanes away: 1 pt
  - Beyond: 0 pts

## Validation Sweeps
- **Comprehensive Legal Matrix:** `GameEngine.getValidTargets` serves as the absolute single source of truth for both human and bot calculations. 
- **Virtual Contexts:** Before changing state properties to `currentMove: 2`, a virtual state context must be tested against the validation loop across all board coordinates to dynamically catch empty target sets before they manifest as UI freezes.

## State Control & Unified Initialization
- **Match Setup:** The engine utilizes a unified initialization matrix accepting structural controller profiles (e.g., mapping player sides directly to local human handlers or bot agents). This layout ensures local loops decoupled from networking interfaces can easily scale to accept remote stream players.
