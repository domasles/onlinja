import { GameConfig, DEFAULT_LINJA_CONFIG } from "../utils/config"

export type PlayerColor = "WHITE" | "BLACK"

export interface GamePiece {
    id: string
    color: PlayerColor
}

export interface MoveHistory {
    phase1: { pieceId: string; targetLane: number } | null
    phase2: { pieceId: string; targetLane: number } | null
}

export interface GameState {
    board: GamePiece[][]
    activePlayer: PlayerColor
    currentPhase: 1 | 2
    phase1LandingCount: number
    selectedPiece: { laneIndex: number; pieceId: string } | null
    gameMode: "AGGRESSIVE" | "STRATEGIC"
    playerSide: PlayerColor
    phase1MovedPieceId: string | null
    history: MoveHistory
    config: GameConfig
    showExtraTurnEffect: boolean
    isExtraTurnActive: boolean
}

export class GameEngine {
    static generateInitialState(
        mode: "AGGRESSIVE" | "STRATEGIC" = "STRATEGIC",
        side: PlayerColor = "WHITE",
        config: GameConfig = DEFAULT_LINJA_CONFIG
    ): GameState {
        const board: GamePiece[][] = Array.from({ length: config.laneCount }, () => [])
        let idCounter = 0

        for (let i = 0; i < config.piecesPerBase; i++) {
            board[0].push({ id: `p-${idCounter++}`, color: "WHITE" })
            board[config.laneCount - 1].push({ id: `p-${idCounter++}`, color: "BLACK" })
        }

        for (let l = 1; l < config.laneCount - 1; l++) {
            board[l].push({ id: `p-${idCounter++}`, color: "WHITE" })
            board[l].push({ id: `p-${idCounter++}`, color: "BLACK" })
        }

        return {
            board,
            activePlayer: "WHITE",
            currentPhase: 1,
            phase1LandingCount: 0,
            selectedPiece: null,
            gameMode: mode,
            playerSide: side,
            phase1MovedPieceId: null,
            history: { phase1: null, phase2: null },
            config,
            showExtraTurnEffect: false,
            isExtraTurnActive: false
        }
    }

    static getValidTargets(state: GameState, laneIndex: number): number[] {
        const piece = state.board[laneIndex].find(p => p.id === state.selectedPiece?.pieceId || p.id === state.phase1MovedPieceId)
        const pieceColor = piece ? piece.color : state.activePlayer
        const isWhite = pieceColor === "WHITE"
        const maxIdx = state.config.laneCount - 1
        const maxCapacity = state.config.maxLaneCapacity || 6
        const potentialTargets: number[] = []

        if (state.currentPhase === 1) {
            const target = isWhite ? laneIndex + 1 : laneIndex - 1

            if (target >= 0 && target <= maxIdx) {
                potentialTargets.push(target)
            }
        }

        if (state.currentPhase === 2) {
            const steps = state.phase1LandingCount - 1
            if (steps <= 0) return []

            const rawTarget = isWhite ? laneIndex + steps : laneIndex - steps
            const boundedTarget = isWhite ? Math.min(rawTarget, maxIdx) : Math.max(rawTarget, 0)

            potentialTargets.push(boundedTarget)
        }

        const validTargets: number[] = []

        for (const targetLane of potentialTargets) {
            const isHomeLane = targetLane === 0 || targetLane === maxIdx
            if (!isHomeLane && state.board[targetLane].length >= maxCapacity) continue

            validTargets.push(targetLane)
        }

        return validTargets
    }

    static calculateScores(board: GamePiece[][], config: GameConfig) {
        let whiteScore = 0
        let blackScore = 0
        const maxIdx = config.laneCount - 1

        for (let l = 0; l <= maxIdx; l++) {
            const pieces = board[l]

            for (let p = 0; p < pieces.length; p++) {
                if (pieces[p].color === "WHITE") {
                    if (l === maxIdx) whiteScore += 5
                    else if (l === maxIdx - 1) whiteScore += 3
                    else if (l === maxIdx - 2) whiteScore += 2
                    else if (l === maxIdx - 3) whiteScore += 1
                }

                if (pieces[p].color === "BLACK") {
                    const invertedLane = maxIdx - l

                    if (invertedLane === maxIdx) blackScore += 5
                    else if (invertedLane === maxIdx - 1) blackScore += 3
                    else if (invertedLane === maxIdx - 2) blackScore += 2
                    else if (invertedLane === maxIdx - 3) blackScore += 1
                }
            }
        }

        return { whiteScore, blackScore }
    }

    static isMatchFinished(board: any[][]): boolean {
        const whiteLanes = board
            .map((lane, idx) => lane.some(p => p.color === "WHITE") ? idx : -1)
            .filter(idx => idx !== -1)

        const blackLanes = board
            .map((lane, idx) => lane.some(p => p.color === "BLACK") ? idx : -1)
            .filter(idx => idx !== -1)

        const maxWhite = Math.max(...whiteLanes)
        const minWhite = Math.min(...whiteLanes)
        const maxBlack = Math.max(...blackLanes)
        const minBlack = Math.min(...blackLanes)

        return maxWhite < minBlack || maxBlack < minWhite
    }
}
