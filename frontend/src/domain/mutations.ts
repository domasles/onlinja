import { GameConfig, DEFAULT_LINJA_CONFIG, tutorialInfo } from "../utils/config"
import { GameState, GamePiece, PlayerColor, ControllerType } from "./types"
import { BotDifficulty } from "../bot"
import { GameRules } from "./rules"

export class GameMutations {
    static generateInitialState(
        mode: "AGGRESSIVE" | "STRATEGIC" = "STRATEGIC",
        side: PlayerColor = "WHITE",
        config: GameConfig = DEFAULT_LINJA_CONFIG,
        controllers?: { WHITE: ControllerType; BLACK: ControllerType },
        difficulty: BotDifficulty = "RUNNER-UP"
    ): GameState {
        const board: GamePiece[][] = Array.from({ length: config.laneCount }, () => [])
        let idCounter = 0

        for (let i = 0; i < config.piecesPerBase; i++) {
            board[0].push({ id: `p-${idCounter++}`, player: "WHITE" })
            board[config.laneCount - 1].push({ id: `p-${idCounter++}`, player: "BLACK" })
        }

        for (let l = 1; l < config.laneCount - 1; l++) {
            board[l].push({ id: `p-${idCounter++}`, player: "WHITE" })
            board[l].push({ id: `p-${idCounter++}`, player: "BLACK" })
        }

        const resolvedControllers = controllers ?? {
            WHITE: side === "WHITE" ? "HUMAN" : "BOT",
            BLACK: side === "BLACK" ? "HUMAN" : "BOT",
        }

        return {
            board,
            activePlayer: "WHITE",
            currentMove: 1,
            move1LandingCount: 0,
            selectedPiece: null,
            gameMode: mode,
            playerSide: side,
            botDifficulty: difficulty,
            move1MovedPieceId: null,
            history: { move1: null, move2: null },
            config,
            showExtraTurnEffect: false,
            showTurnChangeEffect: false,
            isExtraTurnActive: false,
            controllers: resolvedControllers
        }
    }

    static selectPiece(
        state: GameState,
        laneIndex: number,
        pieceId: string,
        isTutorialMode: boolean,
        currentTutorialStepIdx: number
    ): Partial<GameState> {
        if (isTutorialMode) {
            const step = tutorialInfo[currentTutorialStepIdx]
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

        const virtualState = { ...state, selectedPiece: { laneIndex, pieceId } }
        const legalTargets = GameRules.getValidTargets(virtualState, laneIndex)

        if (legalTargets.length === 0) return {}
        if (state.selectedPiece?.pieceId === pieceId) return { selectedPiece: null }

        if (state.currentMove === 2) {
            const movedId = state.move1MovedPieceId
            if (state.gameMode === "AGGRESSIVE" && movedId && movedId !== pieceId) return {}
            if (state.gameMode === "STRATEGIC" && movedId && movedId === pieceId) return {}
        }

        return { selectedPiece: { laneIndex, pieceId } }
    }

    static selectTargetLane(
        state: GameState,
        targetLaneIndex: number,
        isTutorialMode: boolean,
        onAdvanceTutorial: () => void
    ): Partial<GameState> {
        if (!state.selectedPiece) return {}

        const { laneIndex, pieceId } = state.selectedPiece
        const validTargets = GameRules.getValidTargets(state, laneIndex)

        if (!validTargets.includes(targetLaneIndex)) return {}

        const isTargetEmptyPrior = state.board[targetLaneIndex]?.length === 0
        const nextBoard = state.board.map((lane) => [...lane])
        const pieceIdx = nextBoard[laneIndex].findIndex(p => p.id === pieceId)
        const [movingPiece] = nextBoard[laneIndex].splice(pieceIdx, 1)

        nextBoard[targetLaneIndex].push(movingPiece)

        const maxIdx = state.config.laneCount - 1
        const isHomeBase = targetLaneIndex === 0 || targetLaneIndex === maxIdx

        let resultingState: Partial<GameState> = {}

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
                    showTurnChangeEffect: true,
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

                        if (GameRules.getValidTargets(testState, l).length > 0) {
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
                        showTurnChangeEffect: true,
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
                    showTurnChangeEffect: true,
                    isExtraTurnActive: false
                }
            }
        }

        if (isTutorialMode) {
            const turnEndedOnMove1 = state.currentMove === 1 && resultingState.currentMove === 1 && resultingState.activePlayer !== state.activePlayer

            if (state.currentMove === 2 || turnEndedOnMove1) {
                setTimeout(() => { onAdvanceTutorial() }, 0)
            }
        }

        return resultingState
    }
}
