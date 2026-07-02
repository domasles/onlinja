import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"

import { GameState, GameMutations, PlayerColor, ControllerType } from "../domain"
import { GameConfig, DEFAULT_LINJA_CONFIG, tutorialInfo } from "../utils/config"
import { BotDifficulty } from "../bot"

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
    setShowExtraTurnEffect: (show: boolean) => void
    setTurnChangeEffect: (show: boolean) => void
    resetGame: () => void

    startTutorial: () => void
    nextTutorialStep: () => void
    exitTutorial: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
    ...GameMutations.generateInitialState(),
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
        const initialState = GameMutations.generateInitialState(mode, side, config || DEFAULT_LINJA_CONFIG)

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
        AsyncStorage.setItem("onlinja_tutorial_completed", "false").catch(() => {})
    
        const firstStep = tutorialInfo[0]
        const baseState = GameMutations.generateInitialState(firstStep.gameMode, "WHITE", DEFAULT_LINJA_CONFIG)
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
            ...GameMutations.generateInitialState()
        }))
    },

    selectPiece: (laneIndex, pieceId) => set((state) => {
        return GameMutations.selectPiece(
            state,
            laneIndex,
            pieceId,
            state.isTutorialMode,
            state.currentTutorialStepIdx
        )
    }),

    selectTargetLane: (targetLaneIndex) => set((state) => {
        return GameMutations.selectTargetLane(
            state,
            targetLaneIndex,
            state.isTutorialMode,
            () => get().nextTutorialStep()
        )
    }),

    setShowExtraTurnEffect: (show: boolean) => set(() => ({ showExtraTurnEffect: show })),
    setTurnChangeEffect: (show) => set(() => ({ showTurnChangeEffect: show })),
    resetGame: () => set((state) => GameMutations.generateInitialState(state.gameMode, state.playerSide, state.config))
}))
