import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"

import { GameState, GameEngine, PlayerColor, ControllerType } from "../domain/engine"
import { GameConfig, DEFAULT_LINJA_CONFIG, tutorialInfo } from "../utils/config"
import { BotDifficulty } from "../bot/botAgent"

export type HighlightMode = "YES" | "NO"
export type GameModes = "STRATEGIC" | "AGGRESSIVE"
export type Screens = "MAIN_MENU" | "GAMEPLAY" | "TUTORIAL"

interface GameStore extends GameState {
    currentScreen: Screens
    isTutorialMode: boolean
    currentTutorialStepIdx: number

    isHydrated: boolean
    highlightMode: HighlightMode
    defaultGameMode: GameModes
    defaultSide: PlayerColor
    defaultDifficulty: BotDifficulty

    loadSavedSettings: () => Promise<void>
    setHighlightMode: (mode: HighlightMode) => void
    setDefaultGameMode: (mode: GameModes) => void
    setDefaultSide: (side: PlayerColor) => void
    setDefaultDifficulty: (difficulty: BotDifficulty) => void

    navigateTo: (screen: Screens) => void

    initializeMatch: (
        mode: GameModes, 
        side: PlayerColor, 
        controllers?: Record<PlayerColor, ControllerType>,
        difficulty?: BotDifficulty,
        config?: GameConfig
    ) => void

    selectPiece: (laneIndex: number, pieceId: string) => void
    selectTargetLane: (targetLaneIndex: number) => void
    clearExtraTurnEffect: () => void
    resetGame: () => void

    startTutorial: () => void
    nextTutorialStep: () => void
    exitTutorial: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
    ...GameEngine.generateInitialState(),
    currentScreen: "MAIN_MENU",
    isTutorialMode: false,
    currentTutorialStepIdx: 0,

    isHydrated: false,
    highlightMode: "YES",
    defaultGameMode: "STRATEGIC",
    defaultSide: "WHITE",
    defaultDifficulty: "ROOKIE",

    loadSavedSettings: async () => {
        try {
            const [hMode, gMode, sMode, dMode] = await Promise.all([
                AsyncStorage.getItem("onlinja_pref_highlight"),
                AsyncStorage.getItem("onlinja_pref_gmode"),
                AsyncStorage.getItem("onlinja_pref_side"),
                AsyncStorage.getItem("onlinja_pref_difficulty")
            ])

            set({
                highlightMode: (hMode as HighlightMode) || "YES",
                defaultGameMode: (gMode as GameModes) || "STRATEGIC",
                defaultSide: (sMode as PlayerColor) || "WHITE",
                defaultDifficulty: (dMode as BotDifficulty) || "ROOKIE",
                isHydrated: true
            })
        }

        catch (e) {
            console.warn("Could not read app local settings preferences:", e)
            set({ isHydrated: true })
        }
    },

    setHighlightMode: (mode) => set(() => {
        AsyncStorage.setItem("onlinja_pref_highlight", mode).catch(() => {})
        return { highlightMode: mode }
    }),

    setDefaultGameMode: (mode) => set(() => {
        AsyncStorage.setItem("onlinja_pref_gmode", mode).catch(() => {})
        return { defaultGameMode: mode }
    }),

    setDefaultSide: (side) => set(() => {
        AsyncStorage.setItem("onlinja_pref_side", side).catch(() => {})
        return { defaultSide: side }
    }),

    setDefaultDifficulty: (difficulty) => set(() => {
        AsyncStorage.setItem("onlinja_pref_difficulty", difficulty).catch(() => {})
        return { defaultDifficulty: difficulty }
    }),

    navigateTo: (screen) => set(() => ({ currentScreen: screen })),

    initializeMatch: (mode, side, controllers, difficulty, config) => set(() => {
        const initialState = GameEngine.generateInitialState(mode, side, config || DEFAULT_LINJA_CONFIG)

        return {
            ...initialState,
            currentScreen: "GAMEPLAY",
            playerSide: side,
            isTutorialMode: false,
            currentTutorialStepIdx: 0,
            ...(controllers && { controllers }),
            ...(difficulty && { botDifficulty: difficulty })
        }
    }),

    startTutorial: () => set(() => {
        const firstStep = tutorialInfo[0]
        const baseState = GameEngine.generateInitialState(firstStep.gameMode, "WHITE", DEFAULT_LINJA_CONFIG)
        const runtimeLaneCount = firstStep.boardSetup?.board?.length || DEFAULT_LINJA_CONFIG.laneCount

        return {
            ...baseState,
            currentScreen: "TUTORIAL",
            isTutorialMode: true,
            currentTutorialStepIdx: 0,
            controllers: { WHITE: "HUMAN", BLACK: "BOT" },

            config: {
                ...baseState.config,
                laneCount: runtimeLaneCount
            }
        }
    }),

    nextTutorialStep: () => set((state) => {
        const nextIdx = state.currentTutorialStepIdx + 1

        if (nextIdx >= tutorialInfo.length) {
            AsyncStorage.setItem("onlinja_tutorial_completed", "true").catch(() => {})
            return { isTutorialMode: false, currentScreen: "MAIN_MENU" }
        }

        const nextStep = tutorialInfo[nextIdx]
        let boardUpdates = {}

        if (nextStep.boardSetup && nextStep.boardSetup.board && nextStep.boardSetup.board.length > 0) {
            const runtimeLaneCount = nextStep.boardSetup.board.length

            boardUpdates = {
                board: nextStep.boardSetup.board.map(lane => [...lane]),

                config: {
                    ...state.config,
                    laneCount: runtimeLaneCount
                },

                activePlayer: nextStep.boardSetup.activePlayer,
                playerSide: nextStep.boardSetup.playerSide,
                gameMode: nextStep.gameMode,
                currentMove: 1 as const,
                selectedPiece: null,
                move1MovedPieceId: null,
                history: { move1: null, move2: null },
                isExtraTurnActive: false,
                showExtraTurnEffect: false
            }
        }

        else {
            boardUpdates = {
                gameMode: nextStep.gameMode
            }
        }

        return {
            currentTutorialStepIdx: nextIdx,
            ...boardUpdates
        }
    }),

    exitTutorial: () => {
        AsyncStorage.setItem("onlinja_tutorial_completed", "true").catch(() => {})

        set(() => ({
            isTutorialMode: false,
            currentTutorialStepIdx: 0,
            currentScreen: "MAIN_MENU",
            ...GameEngine.generateInitialState()
        }))
    },

    selectPiece: (laneIndex, pieceId) => set((state) => {
        if (state.isTutorialMode) {
            const step = tutorialInfo[state.currentTutorialStepIdx]

            if (step && step.type === "INTERACTIVE_BOARD" && step.boardSetup) {
                if (state.currentMove === 1) {
                    const { allowedSourceLane, allowedPieceId } = step.boardSetup

                    if (allowedSourceLane !== undefined && allowedSourceLane !== laneIndex) return {}
                    if (allowedPieceId !== undefined && allowedPieceId !== pieceId) return {}
                }
            }

            else {
                return {} 
            }
        }

        const lane = state.board[laneIndex]
        if (!lane) return {}

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

        const isTargetEmptyPrior = state.board[targetLaneIndex]?.length === 0
        const nextBoard = state.board.map((lane) => [...lane])
        const pieceIdx = nextBoard[laneIndex].findIndex(p => p.id === pieceId)
        const [movingPiece] = nextBoard[laneIndex].splice(pieceIdx, 1)

        nextBoard[targetLaneIndex].push(movingPiece)

        const maxIdx = state.config.laneCount - 1
        const isHomeBase = targetLaneIndex === 0 || targetLaneIndex === maxIdx

        let resultingState: Partial<GameStore> = {}

        if (state.currentMove === 1) {
            const totalLandingPieces = nextBoard[targetLaneIndex].length
            const enemyBaseIndex = movingPiece.player === "WHITE" ? maxIdx : 0

            const cleanHistory = {
                move1: { pieceId: movingPiece.id, originLane: laneIndex, targetLane: targetLaneIndex },
                move2: null
            }

            if (totalLandingPieces <= 1 || targetLaneIndex === enemyBaseIndex) {
                resultingState = {
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

            else {
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
                    if (!nextBoard[l]) continue

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
                    resultingState = {
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

                else {
                    resultingState = {
                        board: nextBoard,
                        selectedPiece: null,
                        currentMove: 2,
                        move1LandingCount: Math.max(totalLandingPieces, 2),
                        move1MovedPieceId: movingPiece.id,
                        history: cleanHistory,
                        isExtraTurnActive: state.isExtraTurnActive
                    }
                }
            }
        }

        else if (state.currentMove === 2) {
            if (isTargetEmptyPrior && !isHomeBase && !state.isExtraTurnActive) {
                resultingState = {
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

            else {
                resultingState = {
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
        }

        if (state.isTutorialMode) {
            const turnEndedOnMove1 = state.currentMove === 1 && resultingState.currentMove === 1 && resultingState.activePlayer !== state.activePlayer

            if (state.currentMove === 2 || turnEndedOnMove1) {
                setTimeout(() => { get().nextTutorialStep() }, 0)
            }
        }

        return resultingState
    }),

    clearExtraTurnEffect: () => set(() => ({ showExtraTurnEffect: false })),
    resetGame: () => set((state) => GameEngine.generateInitialState(state.gameMode, state.playerSide, state.config))
}))
