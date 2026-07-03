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
   - **Aggressive Mode:** Move 2 piece MUST match the Move 1 piece (tracked via `move1MovedPieceId`).
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

## Sliding Logic - Detailed Algorithm

**Sliding Evaluation Mechanics**
```typescript
while (currentIndex > 0 && currentIndex < maxIdx && state.board[currentIndex].length >= maxCapacity) {
    currentIndex += direction
}
```

**How Sliding Works**
1. **Trigger Condition**: When a movement path lands on a lane where `state.board[currentIndex].length >= maxCapacity` (default 6)
2. **Continuous Sliding**: The algorithm continuously slides forward in movement direction (`+1` for white, `-1` for black)
3. **Stop Conditions**: Continues sliding until:
   - Finding a lane with available capacity (`< maxCapacity`)
   - Reaching a terminal base (index 0 or maxIdx)
   - Going out of board bounds

**Example Scenarios**
- **White player moves to lane 3** (full with 6 pieces):
  - Slides to lane 4 (if available)
  - Continues sliding until finding empty lane or base
- **Black player moves to lane 2** (full with 6 pieces):
  - Slides to lane 1 (if available)
  - Continues sliding until finding empty lane or base

**Edge Cases**
- **Home Base Protection**: Sliding stops at index 0 (white base) or maxIdx (black base)
- **Board Boundaries**: Prevents sliding beyond array limits
- **Capacity Check**: Only slides when target lane is at or exceeds capacity

**Impact on Gameplay**
- **Strategic Depth**: Players must account for sliding when planning moves
- **Risk Management**: Overfilled lanes create "sinks" for opponent pieces
- **Tactical Opportunities**: Full lanes can be used as strategic barriers

## Validation Sweeps - Virtual Context Testing

**Pre-Move Validation Logic**
```typescript
// Before changing state properties to currentMove: 2
const testState = { ...proposedState, selectedPiece: { laneIndex: l, pieceId: p.id } }
if (GameRules.getValidTargets(testState, l).length > 0) {
    holdsAnyLegalMove2 = true
    break
}
```

**Why Virtual Contexts Are Needed**
1. **UI Freeze Prevention**: Detects empty target sets before they cause UI freezes
2. **Dead-End Detection**: Identifies when Move 2 is impossible before committing to Move 1
3. **State Consistency**: Ensures game state remains valid throughout turn processing

**Validation Sweep Process**
1. **Create Test State**: Clone proposed state with Move 2 piece selected
2. **Check Legal Targets**: Use `GameRules.getValidTargets()` to verify Move 2 possibilities
3. **Early Termination**: If no legal targets found, auto-pass to opponent
4. **State Commit**: Only proceed with Move 2 if validation passes

**Performance Impact**
- **Computational Cost**: Additional validation sweeps for each Move 1 attempt
- **UI Responsiveness**: Prevents freezing by catching dead ends early
- **Game Integrity**: Ensures all moves are legally valid before execution

## Controller Integration

**Controller Type System**
```typescript
export type ControllerType = "HUMAN" | "BOT"
```

**Controller Roles**
- **HUMAN**: Player-controlled input through touch/click interactions
- **BOT**: AI-controlled decision making through bot engine

**Controller Assignment**
```typescript
const resolvedControllers = controllers ?? {
    WHITE: side === "WHITE" ? "HUMAN" : "BOT",
    BLACK: side === "BLACK" ? "HUMAN" : "BOT",
}
```

**Controller-Specific Behavior**
- **HUMAN Controllers**: Use `selectPiece()` and `selectTargetLane()` for input processing
- **BOT Controllers**: Use `BotAgent.computeMove()` for AI decision making
- **Mixed Controllers**: Enable PvP and PvAI game modes

**Controller State Management**
- **BotDifficulty**: Imported from `../bot` and stored in GameState
- **Active Player**: Determined by turn progression and controller assignments
- **Move Validation**: Different validation rules for human vs bot turns

## Validation Sweeps
- **Comprehensive Legal Matrix:** `GameEngine.getValidTargets` serves as the absolute single source of truth for both human and bot calculations. 
- **Virtual Contexts:** Before changing state properties to `currentMove: 2`, a virtual state context must be tested against the validation loop across all board coordinates to dynamically catch empty target sets before they manifest as UI freezes.

## State Control & Unified Initialization
- **Match Setup:** The engine utilizes a unified initialization matrix accepting structural controller profiles (e.g., mapping player sides directly to local human handlers or bot agents). This layout ensures local loops decoupled from networking interfaces can easily scale to accept remote stream players.

## Implementation Notes
- **BotDifficulty** type is defined in `botAgent.ts` and imported by the domain engine.
- **ControllerType** is `"HUMAN" | "BOT"` and controls whether a player is human or bot-controlled.
- **GameState** interface includes: `board`, `activePlayer`, `currentMove`, `move1LandingCount`, `selectedPiece`, `gameMode`, `playerSide`, `botDifficulty`, `move1MovedPieceId`, `history`, `config`, `showExtraTurnEffect`, `isExtraTurnActive`, `controllers`.
- **GameEngine** class provides: `generateInitialState()`, `getValidTargets()`, `calculateScores()`, `isMatchFinished()`.
