import { MinimaxOptimizer, UnifiedTurnAction } from "./search"
import { BotDifficulty } from "../components/MainMenuCard"
import { GameState } from "../domain/engine"
import { Humanizer } from "./humanizer"

export interface BotProfile {
    depth: number
    errorRate: number
}

export const BOT_PRESETS: Record<BotDifficulty, BotProfile> = {
    "ROOKIE": { depth: 1, errorRate: 0.65 },
    "RUNNER-UP": { depth: 2, errorRate: 0.15 },
    "CHAMPION": { depth: 3, errorRate: 0.0 }
}

export class BotAgent {
    public static computeMove(state: GameState, profile: BotProfile): UnifiedTurnAction | null {
        const optimal = MinimaxOptimizer.optimize(state, profile.depth)
        if (!optimal) return null

        if (profile.errorRate > 0) {
            const allActions = MinimaxOptimizer.generateLegalActions(state)
            return Humanizer.blunder(allActions, optimal, profile.errorRate)
        }

        return optimal
    }
}
