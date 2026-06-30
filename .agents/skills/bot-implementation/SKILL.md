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
