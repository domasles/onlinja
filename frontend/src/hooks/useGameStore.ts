import { create } from "zustand"

import { GameState, GameEngine, PlayerColor, ControllerType } from "../domain/engine"
import { GameConfig, DEFAULT_LINJA_CONFIG } from "../utils/config"
import { BotDifficulty } from "../components/MainMenuCard"

interface GameStore extends GameState {
    currentScreen: "MAIN_MENU" | "GAMEPLAY"
    navigateTo: (screen: "MAIN_MENU" | "GAMEPLAY") => void

    initializeMatch: (
        mode: "AGGRESSIVE" | "STRATEGIC", 
        side: PlayerColor, 
        controllers?: Record<PlayerColor, ControllerType>,
        difficulty?: BotDifficulty,
        config?: GameConfig
    ) => void

    selectPiece: (laneIndex: number, pieceId: string) => void
    selectTargetLane: (targetLaneIndex: number) => void
    clearExtraTurnEffect: () => void
    resetGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
    ...GameEngine.generateInitialState(),
    currentScreen: "MAIN_MENU",

    navigateTo: (screen) => set(() => ({ currentScreen: screen })),

    initializeMatch: (mode, side, controllers, difficulty, config) => set(() => {
        const initialState = GameEngine.generateInitialState(mode, side, config || DEFAULT_LINJA_CONFIG)

        return {
            ...initialState,
            currentScreen: "GAMEPLAY",
            playerSide: side,
            ...(controllers && { controllers }),
            ...(difficulty && { botDifficulty: difficulty })
        }
    }),

    selectPiece: (laneIndex, pieceId) => set((state) => {
        const lane = state.board[laneIndex]
        const piece = lane.find(p => p.id === pieceId)
        const maxIdx = state.config.laneCount - 1

        if (!piece || piece.player !== state.activePlayer) return {}

        const opponentHomeIndex = state.activePlayer === "WHITE" ? maxIdx : 0
        if (laneIndex === opponentHomeIndex) return {}

        const virtualState = {
            ...state,
            selectedPiece: { laneIndex, pieceId }
        }

        const legalTargets = GameEngine.getValidTargets(virtualState, laneIndex)

        if (legalTargets.length === 0) return {}
        if (state.selectedPiece?.pieceId === pieceId) return { selectedPiece: null }

        if (state.currentMove === 2) {
            const movedId = state.move1MovedPieceId

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

        const isTargetEmptyPrior = state.board[targetLaneIndex].length === 0

        const nextBoard = state.board.map((lane) => [...lane])
        const pieceIdx = nextBoard[laneIndex].findIndex(p => p.id === pieceId)
        const [movingPiece] = nextBoard[laneIndex].splice(pieceIdx, 1)

        nextBoard[targetLaneIndex].push(movingPiece)

        const maxIdx = state.config.laneCount - 1
        const isHomeBase = targetLaneIndex === 0 || targetLaneIndex === maxIdx

        if (state.currentMove === 1) {
            const totalLandingPieces = nextBoard[targetLaneIndex].length
            const enemyBaseIndex = movingPiece.player === "WHITE" ? maxIdx : 0

            const cleanHistory = {
                move1: { pieceId: movingPiece.id, originLane: laneIndex, targetLane: targetLaneIndex },
                move2: null
            }

            if (totalLandingPieces <= 1 || targetLaneIndex === enemyBaseIndex) {
                return {
                    board: nextBoard,
                    selectedPiece: null,
                    currentMove: 1,
                    move1MovedPieceId: null,
                    history: cleanHistory,
                    activePlayer: state.activePlayer === "WHITE" ? "BLACK" : "WHITE",
                    isExtraTurnActive: false
                }
            }

            const proposedState = {
                ...state,
                board: nextBoard,
                currentMove: 2 as const,
                move1LandingCount: Math.max(totalLandingPieces, 2),
                move1MovedPieceId: movingPiece.id,
                history: cleanHistory,
            }

            let holdsAnyLegalMove2 = false

            for (let l = 0; l <= maxIdx; l++) {
                for (const p of nextBoard[l]) {
                    if (p.player !== state.activePlayer) continue

                    if (state.gameMode === "AGGRESSIVE" && p.id !== movingPiece.id) continue
                    if (state.gameMode === "STRATEGIC" && p.id === movingPiece.id) continue

                    const testState = { ...proposedState, selectedPiece: { laneIndex: l, pieceId: p.id } }

                    if (GameEngine.getValidTargets(testState, l).length > 0) {
                        holdsAnyLegalMove2 = true
                        break
                    }
                }

                if (holdsAnyLegalMove2) break
            }

            if (!holdsAnyLegalMove2) {
                return {
                    board: nextBoard,
                    selectedPiece: null,
                    currentMove: 1,
                    move1LandingCount: 0,
                    move1MovedPieceId: null,
                    history: cleanHistory,
                    activePlayer: state.activePlayer === "WHITE" ? "BLACK" : "WHITE",
                    isExtraTurnActive: false
                }
            }

            return {
                board: nextBoard,
                selectedPiece: null,
                currentMove: 2,
                move1LandingCount: Math.max(totalLandingPieces, 2),
                move1MovedPieceId: movingPiece.id,
                history: cleanHistory,
                isExtraTurnActive: state.isExtraTurnActive
            }
        }

        if (state.currentMove === 2) {
            if (isTargetEmptyPrior && !isHomeBase && !state.isExtraTurnActive) {
                return {
                    board: nextBoard,
                    selectedPiece: null,
                    currentMove: 1,
                    move1LandingCount: 0,
                    move1MovedPieceId: null,

                    history: {
                        ...state.history,
                        move2: { pieceId: movingPiece.id, originLane: laneIndex, targetLane: targetLaneIndex }
                    },

                    showExtraTurnEffect: true,
                    isExtraTurnActive: true
                }
            }

            return {
                board: nextBoard,
                selectedPiece: null,
                currentMove: 1,
                move1LandingCount: 0,
                move1MovedPieceId: null,

                history: {
                    ...state.history,
                    move2: { pieceId: movingPiece.id, originLane: laneIndex, targetLane: targetLaneIndex }
                },

                activePlayer: state.activePlayer === "WHITE" ? "BLACK" : "WHITE",
                isExtraTurnActive: false
            }
        }

        return {}
    }),

    clearExtraTurnEffect: () => set(() => ({ showExtraTurnEffect: false })),
    resetGame: () => set((state) => GameEngine.generateInitialState(state.gameMode, state.playerSide, state.config))
}))
