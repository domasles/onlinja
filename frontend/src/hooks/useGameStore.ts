import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"

import { DEFAULT_LINJA_CONFIG, GameConfig, tutorialInfo, TutorialStepConfig } from "../config"
import { GameState, GameMutations, PlayerColor, ControllerType } from "../domain"
import { BotDifficulty } from "../bot"

export type HighlightMode = "true" | "false"
export type GameModes = "STRATEGIC" | "AGGRESSIVE"
export type Screens = "MAIN_MENU" | "GAMEPLAY" | "TUTORIAL"

interface GameStore extends GameState {
    currentScreen: Screens
    isTutorialMode: boolean
    currentTutorialStep: number
    isTutorialCompleted: boolean

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

const getTutorialBoardUpdates = (step: TutorialStepConfig) => {
    if (step.boardSetup && step.boardSetup.board && step.boardSetup.board.length > 0) {
        return {
            board: step.boardSetup.board.map(lane => [...lane]),
            activePlayer: step.boardSetup.activePlayer,
            playerSide: step.boardSetup.playerSide,
            currentMove: 1 as const,
            selectedPiece: null,
            move1MovedPieceId: null,
            history: { move1: null, move2: null },
            isExtraTurnActive: false,
            showExtraTurnEffect: false
        }
    }

    return {}
}

export const useGameStore = create<GameStore>((set, get) => ({
    ...GameMutations.generateInitialState(),
    currentScreen: "MAIN_MENU",
    isTutorialMode: false,
    currentTutorialStep: 0,
    isTutorialCompleted: false,

    isHydrated: false,
    highlightMode: "true",
    defaultGameMode: "STRATEGIC",
    defaultSide: "WHITE",
    defaultDifficulty: "RUNNER-UP",

    loadSavedSettings: async () => {
        try {
            const [hMode, gMode, sMode, dMode, tStep, tComp] = await Promise.all([
                AsyncStorage.getItem("onlinja_pref_highlight"),
                AsyncStorage.getItem("onlinja_pref_gamemode"),
                AsyncStorage.getItem("onlinja_pref_side"),
                AsyncStorage.getItem("onlinja_pref_difficulty"),
                AsyncStorage.getItem("onlinja_tutorial_step"),
                AsyncStorage.getItem("onlinja_tutorial_completed")
            ])

            const resolvedHighlight = (hMode as HighlightMode) || "true"
            const resolvedGMode = (gMode as GameModes) || "STRATEGIC"
            const resolvedSide = (sMode as PlayerColor) || "WHITE"
            const resolvedDifficulty = (dMode as BotDifficulty) || "RUNNER-UP"
            const resolvedTStep = tStep ? parseInt(tStep, 10) : 0
            const resolvedTComp = tComp === "true"

            AsyncStorage.setItem("onlinja_pref_highlight", resolvedHighlight)
            AsyncStorage.setItem("onlinja_pref_gamemode", resolvedGMode)
            AsyncStorage.setItem("onlinja_pref_side", resolvedSide)
            AsyncStorage.setItem("onlinja_pref_difficulty", resolvedDifficulty)
            AsyncStorage.setItem("onlinja_tutorial_step", resolvedTStep.toString())
            AsyncStorage.setItem("onlinja_tutorial_completed", String(resolvedTComp))

            set({
                highlightMode: resolvedHighlight,
                defaultGameMode: resolvedGMode,
                defaultSide: resolvedSide,
                defaultDifficulty: resolvedDifficulty,
                currentTutorialStep: resolvedTStep,
                isTutorialCompleted: resolvedTComp,
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
        AsyncStorage.setItem("onlinja_pref_gamemode", mode).catch(() => {})
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
            currentTutorialStep: 0,
            ...(controllers && { controllers }),
            ...(difficulty && { botDifficulty: difficulty }),
            whiteMoves: 0,
            blackMoves: 0,
            whiteExtraTurns: 0,
            blackExtraTurns: 0,
            whiteHomeRuns: 0,
            blackHomeRuns: 0
        }
    }),

    startTutorial: () => set((state) => {
        AsyncStorage.setItem("onlinja_tutorial_completed", "false").catch(() => {})
        let stepIdx = state.currentTutorialStep

        if (stepIdx >= tutorialInfo.length) {
            stepIdx = 0
        }

        const currentStep = tutorialInfo[stepIdx]
        const baseState = GameMutations.generateInitialState(currentStep.gameMode, "WHITE", DEFAULT_LINJA_CONFIG)
        const runtimeLaneCount = currentStep.boardSetup?.board?.length || DEFAULT_LINJA_CONFIG.laneCount

        return {
            ...baseState,
            currentScreen: "TUTORIAL",
            isTutorialMode: true,
            currentTutorialStep: stepIdx,
            isTutorialCompleted: false,
            controllers: { WHITE: "HUMAN", BLACK: "BOT" },
            whiteMoves: 0,
            blackMoves: 0,
            whiteExtraTurns: 0,
            blackExtraTurns: 0,
            whiteHomeRuns: 0,
            blackHomeRuns: 0,
            ...getTutorialBoardUpdates(currentStep),

            config: {
                ...baseState.config,
                laneCount: runtimeLaneCount
            }
        }
    }),

    nextTutorialStep: () => set((state) => {
        const nextIdx = state.currentTutorialStep + 1

        if (nextIdx >= tutorialInfo.length) {
            AsyncStorage.setItem("onlinja_tutorial_completed", "true").catch(() => {})
            AsyncStorage.setItem("onlinja_tutorial_step", "0").catch(() => {})

            return {
                isTutorialMode: false,
                currentScreen: "MAIN_MENU",
                currentTutorialStep: 0,
                isTutorialCompleted: true
            }
        }

        AsyncStorage.setItem("onlinja_tutorial_step", nextIdx.toString()).catch(() => {})

        const nextStep = tutorialInfo[nextIdx]
        const runtimeLaneCount = nextStep.boardSetup?.board?.length || state.config.laneCount

        return {
            currentTutorialStep: nextIdx,
            gameMode: nextStep.gameMode,
            ...getTutorialBoardUpdates(nextStep),

            config: {
                ...state.config,
                laneCount: runtimeLaneCount
            }
        }
    }),

    exitTutorial: () => {
        AsyncStorage.setItem("onlinja_tutorial_completed", "true").catch(() => {})
        AsyncStorage.setItem("onlinja_tutorial_step", "0").catch(() => {})

        set(() => ({
            isTutorialMode: false,
            currentTutorialStep: 0,
            isTutorialCompleted: true,
            currentScreen: "MAIN_MENU",
            ...GameMutations.generateInitialState(),
            whiteMoves: 0,
            blackMoves: 0,
            whiteExtraTurns: 0,
            blackExtraTurns: 0,
            whiteHomeRuns: 0,
            blackHomeRuns: 0
        }))
    },

    selectPiece: (laneIndex, pieceId) => set((state) => {
        return GameMutations.selectPiece(
            state,
            laneIndex,
            pieceId,
            state.isTutorialMode,
            state.currentTutorialStep
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

    resetGame: () => set((state) => {
        const initialState = GameMutations.generateInitialState(
            state.gameMode,
            state.playerSide,
            state.config,
            state.controllers,
            state.botDifficulty
        )

        return {
            ...initialState,
            currentScreen: "GAMEPLAY",
            isTutorialMode: false,
            currentTutorialStep: 0,
            whiteMoves: 0,
            blackMoves: 0,
            whiteExtraTurns: 0,
            blackExtraTurns: 0,
            whiteHomeRuns: 0,
            blackHomeRuns: 0
        }
    })
}))
