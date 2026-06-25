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

## Phase Lifecycle
1. **Phase 1 (Initiative Move):** Advance exactly 1 step. Count the total pieces occupying the landing track.
2. **Phase 2 (Momentum Move):** Advance by Phase 1 Count - 1 steps.
   - **Vulnerability Forfeiture:** If Phase 1 lands on a track that had 0 elements before the move, or hits the opponent base, immediately skip Phase 2 and pass the turn.
   - **Aggressive Mode:** Phase 2 piece MUST match the Phase 1 piece.
   - **Strategic Mode:** Phase 2 piece MUST be a completely distinct piece.
3. **Macro Match Termination Check:** A match is only completed and finalized if `isMatchFinished` is verified true, the active player is back at Phase 1, and no extra turn transitions remain pending.

## Mechanical Calculations
- **Sliding Evaluation (Hopping):** If a movement path lands on a lane matching or exceeding maxLaneCapacity, continuously slide the target index forward in the movement trajectory direction until a valid opening or terminal base is matched.
- **Scoring Grid:**
  - Target Base: 5 pts
  - 1 lane away: 3 pts
  - 2 lanes away: 2 pts
  - 3 lanes away: 1 pt
  - Beyond: 0 pts

## State Control & Unified Initialization
- **Match Setup:** The engine utilizes a unified initialization matrix accepting structural controller profiles (e.g., mapping player sides directly to local human handlers or bot agents). This layout ensures local loops decoupled from networking interfaces can easily scale to accept remote stream players.
