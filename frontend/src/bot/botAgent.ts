import { BotDifficulty } from "../components/MainMenuCard"
import { Minimax, UnifiedTurnAction } from "./minimax"
import { GameState } from "../domain/engine"
import { Humanizer } from "./humanizer"

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
    public static async computeMove(state: GameState, profile: BotProfile): Promise<UnifiedTurnAction | null> {
        const optimal = await Minimax.optimize(state, profile)
        if (!optimal) return null

        if (profile.blunderRate > 0) {
            const allActions = Minimax.generateLegalActions(state)
            return Humanizer.blunder(allActions, optimal, profile.blunderRate)
        }

        return optimal
    }
}
