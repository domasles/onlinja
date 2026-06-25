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
export type BotDifficulty = "ROOKIE" | "RUNNER-UP" | "CHAMPION"

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
import { GameState, PlayerColor } from "../domain/engine"
import { BotProfile } from "./botAgent"

export interface UnifiedTurnAction {
    p1Lane: number
    p1PieceId: string
    p1Target: number
    p2Lane: number
    p2PieceId: string
    p2Target: number
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
import { BotProfile, BotDifficulty } from "./botAgent"
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
  "CHAMPION": {
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
- **CHAMPION:** Lookahead 3 turns, 0.00 blunder rate. Deep lookahead, perfect play.

## Cooperative Event Loop Interception
- Thread Yielding: The Minimax tree search uses a threshold tracker (operationCount). Every 400 node evaluations, it must execute await new Promise((resolve) => setTimeout(resolve, 0)) to allow the React Native event loop to process layout frames and click interactions.
- Async Execution Vectors: Any call stack interacting with BotAgent.computeMove must be flagged as async and explicitly awaited.

## Verification Checklist
- [ ] All classes use named exports only
- [ ] No any types used
- [ ] State immutability preserved (deep mapping lane arrays for board state copies)
- [ ] No semicolons at end of statements
- [ ] 4-space indentation
- [ ] Files separated by concern (types, evaluation, search, humanizer, agent)
