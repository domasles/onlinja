import { GameState, PlayerColor, GameRules } from "../domain"
import { BotProfile } from "./botAgent"

export class EvaluationEngine {
    public static evaluate(state: GameState, player: PlayerColor, profile: BotProfile): number {
        const board = state.board
        const maxIdx = state.config.laneCount - 1
        const isWhite = player === "WHITE"
        const scores = GameRules.calculateScores(board, state.config)

        let evaluation = isWhite 
            ? scores.whiteScore - scores.blackScore 
            : scores.blackScore - scores.whiteScore

        if (state.isExtraTurnActive) {
            evaluation += (state.activePlayer === player)
                ? profile.extraTurnBonus
                : -profile.extraTurnBonus
        }

        const modeMultiplier = state.gameMode === "AGGRESSIVE"
            ? profile.aggressiveModeMultiplier
            : 1.0

        const forwardVector = isWhite ? 1 : -1
        const backwardVector = isWhite ? -1 : 1
        const allyColor = player
        const enemyColor = isWhite ? "BLACK" : "WHITE"

        let positionalBonus = 0

        for (let l = 0; l <= maxIdx; l++) {
            const lanePieces = board[l]
            const count = lanePieces.length

            if (l === 0 || l === maxIdx) {
                const isHomeBase = (l === 0 && isWhite) || (l === maxIdx && !isWhite)
                const basePiecesCount = lanePieces.filter(p => p.player === (l === 0 ? "WHITE" : "BLACK")).length
                const clearanceValue = (12 - basePiecesCount) * profile.homeBaseClearanceWeight

                positionalBonus += isHomeBase ? clearanceValue : -clearanceValue

                continue
            }

            if (count === 0) {
                positionalBonus -= profile.midfieldEmptyLanePenalty
                continue
            }

            const nextLane = board[l + forwardVector] || []
            const prevLane = board[l + backwardVector] || []

            if (count === 6) {
                const targetLandedCount = nextLane.length

                positionalBonus += (targetLandedCount === 1)
                    ? profile.fullLaneTrapBonus
                    : (targetLandedCount === 0 ? 3 : (targetLandedCount >= 4 ? -profile.fullLaneBackfirePenalty : 0))
            } 

            else if (count >= 4 && count <= 5) {
                const allyCanUse = prevLane.some(p => p.player === allyColor)
                const enemyCanUse = nextLane.some(p => p.player === enemyColor)

                const launchpadScore = (allyCanUse ? profile.friendlyClusterBonus : 0) - (enemyCanUse ? profile.enemyClusterPenalty : 0)

                positionalBonus += launchpadScore * modeMultiplier
            }
        }

        return evaluation + positionalBonus
    }
}
