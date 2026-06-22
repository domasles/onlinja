import { create } from "zustand"

import { GameState, GameEngine, PlayerColor } from "../domain/engine"
import { GameConfig, DEFAULT_LINJA_CONFIG } from "../utils/config"

interface GameStore extends GameState {
    currentScreen: "MAIN_MENU" | "GAMEPLAY"
    navigateTo: (screen: "MAIN_MENU" | "GAMEPLAY") => void
    initializeMatch: (mode: "AGGRESSIVE" | "STRATEGIC", side: PlayerColor, config?: GameConfig) => void
    selectPiece: (laneIndex: number, pieceId: string) => void
    selectTargetLane: (targetLaneIndex: number) => void
    resetGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
    ...GameEngine.generateInitialState(),
    currentScreen: "MAIN_MENU",

    navigateTo: (screen) => set(() => ({ currentScreen: screen })),

    initializeMatch: (mode, side, config) => set(() => ({
        ...GameEngine.generateInitialState(mode, side, config || DEFAULT_LINJA_CONFIG),
        currentScreen: "GAMEPLAY"
    })),

    selectPiece: (laneIndex, pieceId) => set((state) => {
        const lane = state.board[laneIndex]
        const piece = lane.find(p => p.id === pieceId)

        if (!piece || piece.color !== state.activePlayer) return {}
        if (state.selectedPiece?.pieceId === pieceId) return { selectedPiece: null }

        if (state.currentPhase === 2) {
            const movedId = state.phase1MovedPieceId
            if (state.gameMode === "AGGRESSIVE" && movedId && movedId !== pieceId) return {}
            if (state.gameMode === "STRATEGIC" && movedId && movedId === pieceId) return {}
        }

        return { selectedPiece: { laneIndex, pieceId } }
    }),

    selectTargetLane: (targetLaneIndex) => set((state) => {
        if (!state.selectedPiece) return {}

        const { laneIndex, pieceId } = state.selectedPiece
        const validTargets = GameEngine.getValidTargets(state, laneIndex)

        if (!validTargets.includes(targetLaneIndex)) return {}

        const nextBoard = state.board.map((lane) => [...lane])
        const pieceIdx = nextBoard[laneIndex].findIndex(p => p.id === pieceId)
        const [movingPiece] = nextBoard[laneIndex].splice(pieceIdx, 1)

        nextBoard[targetLaneIndex].push(movingPiece)
        const maxIdx = state.config.laneCount - 1

        if (state.currentPhase === 1) {
            const totalLandingPieces = nextBoard[targetLaneIndex].length
            const enemyBaseIndex = movingPiece.color === "WHITE" ? maxIdx : 0

            const cleanHistory = {
                phase1: { pieceId: movingPiece.id, targetLane: targetLaneIndex },
                phase2: null
            }

            if (totalLandingPieces <= 1 || targetLaneIndex === enemyBaseIndex) {
                return {
                    board: nextBoard,
                    selectedPiece: null,
                    currentPhase: 1,
                    phase1MovedPieceId: null,
                    history: cleanHistory,
                    activePlayer: state.activePlayer === "WHITE" ? "BLACK" : "WHITE"
                }
            }

            return {
                board: nextBoard,
                selectedPiece: null,
                currentPhase: 2,
                phase1LandingCount: totalLandingPieces,
                phase1MovedPieceId: movingPiece.id,
                history: cleanHistory
            }
        }

        if (state.currentPhase === 2) {
            return {
                board: nextBoard,
                selectedPiece: null,
                currentPhase: 1,
                phase1LandingCount: 0,
                phase1MovedPieceId: null,
                history: {
                    ...state.history,
                    phase2: { pieceId: movingPiece.id, targetLane: targetLaneIndex }
                },
                activePlayer: state.activePlayer === "WHITE" ? "BLACK" : "WHITE"
            }
        }

        return {}
    }),

    resetGame: () => set((state) => GameEngine.generateInitialState(state.gameMode, state.playerSide, state.config))
}))
