import { GameState, PlayerColor, GameEngine } from "../domain/engine"

export class EvaluationEngine {
    public static evaluate(state: GameState, perspective: PlayerColor): number {
        const board = state.board
        const maxIdx = state.config.laneCount - 1
        const isWhite = perspective === "WHITE"
        const scores = GameEngine.calculateScores(board, state.config)

        let evaluation = isWhite 
            ? scores.whiteScore - scores.blackScore 
            : scores.blackScore - scores.whiteScore

        if (state.isExtraTurnActive) {
            evaluation += (state.activePlayer === perspective) ? 30 : -30
        }

        const modeMultiplier = state.gameMode === "AGGRESSIVE" ? 2.0 : 1.0
        const forwardVector = isWhite ? 1 : -1
        const backwardVector = isWhite ? -1 : 1
        const allyColor = perspective
        const enemyColor = isWhite ? "BLACK" : "WHITE"

        let positionalBonus = 0

        for (let l = 0; l <= maxIdx; l++) {
            const lanePieces = board[l]
            const count = lanePieces.length

            if (l === 0 || l === maxIdx) {
                const isHomeBase = (l === 0 && isWhite) || (l === maxIdx && !isWhite)
                const basePiecesCount = lanePieces.filter(p => p.color === (l === 0 ? "WHITE" : "BLACK")).length
                const clearanceValue = (12 - basePiecesCount) * 1.5

                positionalBonus += isHomeBase ? clearanceValue : -clearanceValue

                continue
            }

            if (count === 0) {
                positionalBonus -= 6
                continue
            }

            const nextLane = board[l + forwardVector] || []
            const prevLane = board[l + backwardVector] || []

            if (count === 6) {
                const targetLandedCount = nextLane.length
                positionalBonus += (targetLandedCount === 1) ? 10 : (targetLandedCount === 0 ? 3 : (targetLandedCount >= 4 ? -8 : 0))
            } 

            else if (count >= 4 && count <= 5) {
                const allyCanUse = prevLane.some(p => p.color === allyColor)
                const enemyCanUse = nextLane.some(p => p.color === enemyColor)
                const launchpadScore = (allyCanUse ? 4 : 0) - (enemyCanUse ? 3 : 0)

                positionalBonus += launchpadScore * modeMultiplier
            }
        }

        return evaluation + positionalBonus
    }
}
