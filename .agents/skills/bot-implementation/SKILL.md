---
name: bot-implementation
description: Use when implementing or optimization tuning the client-side autonomous bot engine, Minimax loop, scoring heuristics, or blunder layers.
---

# Bot Implementation Skill

## Overview
This skill provides a structured workflow for implementing the autonomous bot logic in the bot layer folder. The bot follows a three-class architecture with strict separation of concerns, deterministic processing, and state immutability guarantees.

## Implementation Workflow

### Step 1: Create Type Definitions
```typescript
export type BotDifficulty = "ROOKIE" | "RUNNER-UP" | "CHAMPION"

export interface BotProfile {
    depth: number
    errorRate: number
}

export interface BotAction {
    type: "PHASE_1" | "PHASE_2"
    laneIndex: number
    pieceId: string
    targetLaneIndex?: number
}

export interface UnifiedTurnAction {
    p1Lane: number
    p1PieceId: string
    p1Target: number
    p2Lane: number
    p2PieceId: string
    p2Target: number
}
```

### Step 2: Implement EvaluationEngine
```typescript
import { GameState, PlayerColor } from "../domain/engine"

export class EvaluationEngine {
    // Pure mathematical evaluator that scores active board state positions
    public static evaluate(state: GameState, perspective: PlayerColor): number
}
```

### Step 3: Implement MinimaxOptimizer
```typescript
import { GameState } from "../domain/engine"
import { UnifiedTurnAction } from "./types"

export class MinimaxOptimizer {
    // Generates all legal combinatory macro-moves for the current active phase sequence
    public static generateLegalActions(state: GameState): UnifiedTurnAction[]

    // Traverses lookahead branches using alpha-beta pruning to find the absolute mathematically optimal path
    public static optimize(state: GameState, depth: number): UnifiedTurnAction | null
}
```

### Step 4: Implement Humanizer
```typescript
import { UnifiedTurnAction } from "./types"

export class Humanizer {
    // Applies blunder probabilities to dynamically force sub-optimal move selections on lower difficulties
    public static blunder(actions: UnifiedTurnAction[], optimal: UnifiedTurnAction, errorRate: number): UnifiedTurnAction
}
```

### Step 5: Create Bot Agent Entry Point
```typescript
import { GameState } from "../domain/engine"
import { UnifiedTurnAction, BotProfile, BotDifficulty } from "./types"

// Calibrated performance parameters matching skill progression jumps
export const BOT_PRESETS: Record<BotDifficulty, BotProfile> = {
    "ROOKIE": { depth: 1, errorRate: 0.60 },
    "RUNNER-UP": { depth: 2, errorRate: 0.15 },
    "CHAMPION": { depth: 4, errorRate: 0.00 }
}

export class BotAgent {
    // Main UI thread entry point that processes and passes the final computed action
    public static computeMove(state: GameState, profile: BotProfile): UnifiedTurnAction | null
}
```

## Difficulty Configuration
- **ROOKIE:** Depth 1, 0.60 error rate. Shallow lookahead, frequent blunders.
- **RUNNER-UP:** Depth 2, 0.15 error rate. Medium lookahead, occasional mistakes.
- **CHAMPION:** Depth 4, 0.00 error rate. Deep lookahead, perfect play.

## Verification Checklist
- [ ] All classes use named exports only
- [ ] No any types used
- [ ] State immutability preserved (spread operators for all state copies)
- [ ] No semicolons at end of statements
- [ ] 4-space indentation
- [ ] Files separated by concern (types, evaluation, search, humanizer, agent)
