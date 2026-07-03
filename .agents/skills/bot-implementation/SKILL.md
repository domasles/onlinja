---
name: bot-implementation
description: Use when implementing or optimization tuning the client-side autonomous bot engine, Minimax loop, scoring heuristics, or blunder layers.
---

# Bot Implementation Skill

## Overview
This skill provides a structured workflow for implementing the autonomous bot logic in the bot layer folder. The bot follows an asynchronous, cooperative multi-turn architecture to prevent blocking the single-threaded React Native UI engine during deep lookahead operations.

## Implementation Workflow

### Step 1: Create Type Definitions
```typescript
export type BotDifficulty = "ROOKIE" | "RUNNER-UP" | "LEGEND"

export interface BotProfile {
    // Search Architecture
    lookaheadTurns: number
    blunderRate: number
    
    // Tempo & Multipliers
    extraTurnBonus: number
    aggressiveModeMultiplier: number

    // Heuristic Weights
    homeBaseClearanceWeight: number
    midfieldEmptyLanePenalty: number
    
    // Trap, Setup and Tactical Thresholds
    fullLaneTrapBonus: number
    fullLaneBackfirePenalty: number
    friendlyClusterBonus: number
    enemyClusterPenalty: number
}
```

### Heuristic Weight Explanations

**Home Base Clearance Weight (`homeBaseClearanceWeight`)**
- Formula: `(12 - basePiecesCount) * weight`
- Purpose: Rewards clearing opponent bases and penalizes blocking your own base
- Impact: Higher weight = more aggressive base clearance strategy
- Example: With weight 1.5 and 8 pieces in opponent base: `(12-8) * 1.5 = 6` points bonus

**Midfield Empty Lane Penalty (`midfieldEmptyLanePenalty`)**
- Formula: `-profile.midfieldEmptyLanePenalty`
- Purpose: Penalizes leaving central lanes empty, encouraging board control
- Impact: Higher penalty = bot avoids creating empty lanes in midfield
- Example: With penalty 4, empty lane in midfield = -4 points

**Full Lane Trap Bonus (`fullLaneTrapBonus`)**
- Formula: `(targetLandedCount === 1) ? profile.fullLaneTrapBonus : ...`
- Purpose: Rewards successful traps where exactly 1 piece lands in next lane
- Impact: Encourages precise trap execution
- Example: With bonus 10, perfect trap = +10 points

**Full Lane Backfire Penalty (`fullLaneBackfirePenalty`)
- Formula: `(targetLandedCount >= 4 ? -profile.fullLaneBackfirePenalty : 0)`
- Purpose: Penalizes failed traps where 4+ pieces land in next lane
- Impact: Discourages overfilled trap attempts
- Example: With penalty 8, failed trap with 4+ pieces = -8 points

**Friendly Cluster Bonus (`friendlyClusterBonus`)**
- Formula: `(allyCanUse ? profile.friendlyClusterBonus : 0)`
- Purpose: Rewards launching from friendly-occupied lanes (cluster advantage)
- Impact: Higher bonus = more aggressive cluster-based tactics
- Example: With bonus 4, launching from friendly cluster = +4 points

**Enemy Cluster Penalty (`enemyClusterPenalty`)**
- Formula: `-(enemyCanUse ? profile.enemyClusterPenalty : 0)`
- Purpose: Penalizes launching toward enemy-occupied lanes (vulnerable positions)
- Impact: Higher penalty = more defensive positioning
- Example: With penalty 3, launching toward enemy cluster = -3 points

**Extra Turn Bonus (`extraTurnBonus`)**
- Formula: `profile.extraTurnBonus`
- Purpose: Rewards for getting extra turns (game-changing advantage)
- Impact: Higher bonus = more aggressive play to secure extra turns
- Example: With bonus 30, extra turn = +30 points

**Aggressive Mode Multiplier (`aggressiveModeMultiplier`)**
- Formula: `profile.aggressiveModeMultiplier`
- Purpose: Amplifies cluster bonuses in aggressive mode
- Impact: Higher multiplier = more aggressive cluster tactics
- Example: With multiplier 2.0, friendly cluster bonus = doubled

### BotDifficulty Presets

**ROOKIE (Easy)**
- `lookaheadTurns: 1` - Shallow lookahead, limited planning
- `blunderRate: 0.65` - 65% chance of random mistakes
- `extraTurnBonus: 10` - Moderate extra turn value
- `aggressiveModeMultiplier: 1.0` - No aggressive bonus
- `homeBaseClearanceWeight: 0.5` - Conservative base strategy
- `midfieldEmptyLanePenalty: 2` - Mild penalty for empty lanes
- `fullLaneTrapBonus: 3` - Small trap rewards
- `fullLaneBackfirePenalty: 2` - Mild backfire penalty
- `friendlyClusterBonus: 1` - Small cluster bonus
- `enemyClusterPenalty: 1` - Mild enemy cluster penalty

**RUNNER-UP (Medium)**
- `lookaheadTurns: 2` - Deeper lookahead, better planning
- `blunderRate: 0.15` - 15% chance of random mistakes
- `extraTurnBonus: 20` - High extra turn value
- `aggressiveModeMultiplier: 1.5` - Moderate aggressive bonus
- `homeBaseClearanceWeight: 1.0` - Balanced base strategy
- `midfieldEmptyLanePenalty: 4` - Strong penalty for empty lanes
- `fullLaneTrapBonus: 6` - Medium trap rewards
- `fullLaneBackfirePenalty: 5` - Medium backfire penalty
- `friendlyClusterBonus: 2` - Medium cluster bonus
- `enemyClusterPenalty: 2` - Medium enemy cluster penalty

**LEGEND (Hard)**
- `lookaheadTurns: 3` - Deep lookahead, excellent planning
- `blunderRate: 0.0` - No random mistakes
- `extraTurnBonus: 30` - Maximum extra turn value
- `aggressiveModeMultiplier: 2.0` - Maximum aggressive bonus
- `homeBaseClearanceWeight: 1.5` - Aggressive base strategy
- `midfieldEmptyLanePenalty: 6` - Strongest penalty for empty lanes
- `fullLaneTrapBonus: 10` - Maximum trap rewards
- `fullLaneBackfirePenalty: 8` - Strongest backfire penalty
- `friendlyClusterBonus: 4` - Maximum cluster bonus
- `enemyClusterPenalty: 3` - Strongest enemy cluster penalty

### Async Patterns & UI Coordination

**Frame Yield Mechanism**
```typescript
private static async yieldToMainThread(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}
```

**Why Frame Yields Are Needed**
- React Native is single-threaded
- Deep minimax searches could block UI for seconds
- `setTimeout(resolve, 0)` yields to main thread after current call stack
- Allows UI to remain responsive during bot calculations

**Async Minimax Pattern**
1. `optimize()` calls `generateLegalActions()` synchronously for immediate UI response
2. Then runs async `minimax()` with periodic yields
3. Each recursive call includes `await this.yieldToMainThread()`
4. Prevents UI freezing during deep lookahead searches

**Operation Count Management**
- `YIELD_THRESHOLD = 400` operations per yield
- Tracks `operationCount` to control yield frequency
- Balances search depth with UI responsiveness
- Ensures smooth gameplay even with complex bot calculations

### Step 2: Implement EvaluationEngine
```typescript
import { GameState, PlayerColor } from "../domain/engine"
import { BotProfile } from "./botAgent"

export class EvaluationEngine {
    // Pure mathematical evaluator that scores active board state positions using profile multipliers
    public static evaluate(state: GameState, player: PlayerColor, profile: BotProfile): number
}
```

### Step 3: Implement Minimax
```typescript
import { GameState, PlayerColor, GameEngine } from "../domain/engine"
import { BotProfile } from "./botAgent"

export interface UnifiedTurnAction {
    p1Lane: number
    p1PieceId: string
    p1Target: number
    p2Lane: number
    p2PieceId: string
    p2Target: number // Note: Set to -1 alongside p2Lane when Move 2 is physically unavailable or blocked
}

export class Minimax {
    private static operationCount: number
    private static readonly YIELD_THRESHOLD = 400

    // Synchronous action-space branch generator for immediate permutations
    public static generateLegalActions(state: GameState): UnifiedTurnAction[]

    // Asynchronous engine wrapper initializing computation passes
    public static async optimize(state: GameState, profile: BotProfile): Promise<UnifiedTurnAction | null>

    // Asynchronous recursive lookup routine featuring periodic macro-task frame yields
    private static async minimax(state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean, player: PlayerColor, profile: BotProfile): Promise<number>

    // Simulates Move 1 and returns updated state
    private static simulatedMove1(state: GameState, l1: number, p1Id: string, t1: number): GameState

    // Simulates full turn (Move 1 + optional Move 2) and returns resulting state
    private static simulateFullMove(state: GameState, action: UnifiedTurnAction): GameState
}
```

### Step 4: Implement Humanizer
```typescript
import { UnifiedTurnAction } from "./minimax"

export class Humanizer {
    // Applies blunder probabilities to dynamically force sub-optimal move selections on lower difficulties
    public static blunder(actions: UnifiedTurnAction[], optimal: UnifiedTurnAction, blunderRate: number): UnifiedTurnAction
}
```

### Step 5: Create Bot Agent Entry Point
```typescript
import { BotDifficulty, BotProfile } from "./botAgent"
import { UnifiedTurnAction } from "./minimax"
import { GameState } from "../domain/engine"

export const BOT_PRESETS: Record<BotDifficulty, BotProfile> = {
    "ROOKIE": {
        lookaheadTurns: 1,
        blunderRate: 0.65,
        extraTurnBonus: 10,
        aggressiveModeMultiplier: 1.0,
        homeBaseClearanceWeight: 0.5,
        midfieldEmptyLanePenalty: 2,
        fullLaneTrapBonus: 3,
        fullLaneBackfirePenalty: 2,
        friendlyClusterBonus: 1,
        enemyClusterPenalty: 1
    },
    "RUNNER-UP": {
        lookaheadTurns: 2,
        blunderRate: 0.15,
        extraTurnBonus: 20,
        aggressiveModeMultiplier: 1.5,
        homeBaseClearanceWeight: 1.0,
        midfieldEmptyLanePenalty: 4,
        fullLaneTrapBonus: 6,
        fullLaneBackfirePenalty: 5,
        friendlyClusterBonus: 2,
        enemyClusterPenalty: 2
    },
    "LEGEND": {
        lookaheadTurns: 3,
        blunderRate: 0.0,
        extraTurnBonus: 30,
        aggressiveModeMultiplier: 2.0,
        homeBaseClearanceWeight: 1.5,
        midfieldEmptyLanePenalty: 6,
        fullLaneTrapBonus: 10,
        fullLaneBackfirePenalty: 8,
        friendlyClusterBonus: 4,
        enemyClusterPenalty: 3
    }
}

export class BotAgent {
    // Non-blocking UI call vector returning computed trajectories via asynchronous Promises
    public static async computeMove(state: GameState, profile: BotProfile): Promise<UnifiedTurnAction | null>
}
```

## Difficulty Configuration
- **ROOKIE:** Lookahead 1 turn, 0.65 blunder rate. Shallow lookahead, frequent blunders.
- **RUNNER-UP:** Lookahead 2 turns, 0.15 blunder rate. Medium lookahead, occasional mistakes.
- **LEGEND:** Lookahead 3 turns, 0.00 blunder rate. Deep lookahead, perfect play.

## Symmetrical Move Fallbacks
- **Turn Autopass Alignment:** The branch generator (`generateLegalActions`) must actively track if a chosen Move 1 forces a second move state (`currentMove: 2`) but possesses zero valid second targets under the current `gameMode` criteria.
- **Single-Move Fallback Injection:** If no legal second move exists, the generator must append a fallback action configuring `p2Lane: -1` and `p2Target: -1`.
- **State Transition Sync:** During full turn simulation (`simulateFullMove`), encountering a `-1` fallback action must instantly trigger an opponent turn switch and completely reset all `move1` parameters, mirroring the store's exact behavior.

## Verification Checklist
- [ ] All classes use named exports only
- [ ] No any types used
- [ ] State immutability preserved (deep mapping lane arrays for board state copies)
- [ ] No semicolons at end of statements
- [ ] 4-space indentation
- [ ] Files separated by concern (evaluation, minimax, humanizer, botAgent)
- [ ] Move 2 fallback structures precisely replicate Zustand store turn transitions
