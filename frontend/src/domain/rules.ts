import { GamePiece, GameState } from "./types"
import { GameConfig } from "../config"

export class GameRules {
    static getValidTargets(state: GameState, laneIndex: number): number[] {
        const maxIdx = state.config.laneCount - 1
        const piece = state.board[laneIndex].find(p => p.id === state.selectedPiece?.pieceId || p.id === state.move1MovedPieceId)
        const pieceColor = piece ? piece.player : state.activePlayer
        const isWhite = pieceColor === "WHITE"

        const opponentHomeIndex = isWhite ? maxIdx : 0
        if (laneIndex === opponentHomeIndex) return []

        const direction = isWhite ? 1 : -1
        const maxCapacity = state.config.maxLaneCapacity || 6

        let currentIndex = laneIndex
        let totalSteps = state.currentMove === 1 ? 1 : state.move1LandingCount - 1

        if (state.currentMove === 2 && totalSteps <= 0) return []

        for (let i = 0; i < totalSteps; i++) {
            currentIndex += direction

            if (isWhite && currentIndex >= maxIdx) {
                currentIndex = maxIdx
                break
            }

            if (!isWhite && currentIndex <= 0) {
                currentIndex = 0
                break
            }
        }

        while (currentIndex > 0 && currentIndex < maxIdx && state.board[currentIndex].length >= maxCapacity) {
            currentIndex += direction
        }

        if (isWhite && currentIndex > maxIdx) return []
        if (!isWhite && currentIndex < 0) return []

        return [currentIndex]
    }

    static calculateScores(board: GamePiece[][], config: GameConfig) {
        let whiteScore = 0
        let blackScore = 0

        const maxIdx = config.laneCount - 1

        for (let l = 0; l <= maxIdx; l++) {
            const pieces = board[l]

            for (let p = 0; p < pieces.length; p++) {
                if (pieces[p].player === "WHITE") {
                    if (l === maxIdx) whiteScore += 5
                    else if (l === maxIdx - 1 && l >= 0) whiteScore += 3
                    else if (l === maxIdx - 2 && l >= 0) whiteScore += 2
                    else if (l === maxIdx - 3 && l >= 0) whiteScore += 1
                }

                if (pieces[p].player === "BLACK") {
                    if (l === 0) blackScore += 5
                    else if (l === 1 && l <= maxIdx) blackScore += 3
                    else if (l === 2 && l <= maxIdx) blackScore += 2
                    else if (l === 3 && l <= maxIdx) blackScore += 1
                }
            }
        }

        return { whiteScore, blackScore }
    }

    static isMatchFinished(state: GameState): boolean {
        const board = state.board
        const maxIdx = state.config.laneCount - 1

        const whiteLanes = board
            .map((lane, idx) => lane.some(p => p.player === "WHITE") ? idx : -1)
            .filter(idx => idx !== -1)

        const blackLanes = board
            .map((lane, idx) => lane.some(p => p.player === "BLACK") ? idx : -1)
            .filter(idx => idx !== -1)

        if (whiteLanes.length === 0 || blackLanes.length === 0) return true

        const isRoundComplete = state.activePlayer === "WHITE" && state.currentMove === 1 && !state.isExtraTurnActive

        const maxWhite = Math.max(...whiteLanes)
        const minWhite = Math.min(...whiteLanes)
        const maxBlack = Math.max(...blackLanes)
        const minBlack = Math.min(...blackLanes)

        if ((maxWhite < minBlack || maxBlack < minWhite) && isRoundComplete) return true

        let whiteHasMoves = false
        let blackHasMoves = false

        for (let l = 0; l <= maxIdx; l++) {
            for (const piece of board[l]) {
                if (!whiteHasMoves && piece.player === "WHITE") {
                    const targets = GameRules.getValidTargets({ ...state, activePlayer: "WHITE", selectedPiece: { laneIndex: l, pieceId: piece.id } }, l)
                    if (targets.length > 0) whiteHasMoves = true
                }

                if (!blackHasMoves && piece.player === "BLACK") {
                    const targets = GameRules.getValidTargets({ ...state, activePlayer: "BLACK", selectedPiece: { laneIndex: l, pieceId: piece.id } }, l)
                    if (targets.length > 0) blackHasMoves = true
                }
            }

            if (whiteHasMoves && blackHasMoves) break
        }

        if (!blackHasMoves && state.activePlayer !== "BLACK") return true
        if (!whiteHasMoves && isRoundComplete) return true

        return false
    }
}
