import { GameState, GameEngine } from "../domain/engine"
import { EvaluationEngine } from "./evaluation"

export interface BotAction {
    type: "PHASE_1" | "PHASE_2"
    laneIndex: number
    pieceId: string
    targetLaneIndex?: number
}

export interface UnifiedTurnAction {
    p1Lane: number
    p1PieceId: string
    p1Target: number
    p2Lane: number
    p2PieceId: string
    p2Target: number
}

export class MinimaxOptimizer {
    public static generateLegalActions(state: GameState): UnifiedTurnAction[] {
        const moves: UnifiedTurnAction[] = []
        const maxIdx = state.config.laneCount - 1

        for (let l1 = 0; l1 <= maxIdx; l1++) {
            const lane = state.board[l1]

            for (const p1 of lane) {
                if (p1.color !== state.activePlayer) continue

                const vState1 = { 
                    ...state, 
                    currentPhase: 1 as const,
                    selectedPiece: { laneIndex: l1, pieceId: p1.id } 
                }

                const targets1 = GameEngine.getValidTargets(vState1, l1)

                for (const t1 of targets1) {
                    if (t1 === l1) continue

                    const stateAfterP1 = this.simulatedPhase1(state, l1, p1.id, t1)

                    if (stateAfterP1.activePlayer !== state.activePlayer) {
                        moves.push({ p1Lane: l1, p1PieceId: p1.id, p1Target: t1, p2Lane: -1, p2PieceId: "", p2Target: -1 })
                        continue
                    }

                    for (let l2 = 0; l2 <= maxIdx; l2++) {
                        const lane2 = stateAfterP1.board[l2]

                        for (const p2 of lane2) {
                            if (p2.color !== stateAfterP1.activePlayer) continue

                            if (stateAfterP1.gameMode === "AGGRESSIVE" && p2.id !== stateAfterP1.phase1MovedPieceId) continue
                            if (stateAfterP1.gameMode === "STRATEGIC" && p2.id === stateAfterP1.phase1MovedPieceId) continue

                            const vState2 = { 
                                ...stateAfterP1, 
                                currentPhase: 2 as const,
                                selectedPiece: { laneIndex: l2, pieceId: p2.id } 
                            }

                            const targets2 = GameEngine.getValidTargets(vState2, l2)

                            for (const t2 of targets2) {
                                if (t2 === l2) continue
                                moves.push({ p1Lane: l1, p1PieceId: p1.id, p1Target: t1, p2Lane: l2, p2PieceId: p2.id, p2Target: t2 })
                            }
                        }
                    }
                }
            }
        }

        return moves
    }

    public static optimize(state: GameState, depth: number): UnifiedTurnAction | null {
        const actions = this.generateLegalActions(state)
        if (actions.length === 0) return null

        let bestAction: UnifiedTurnAction | null = null
        let bestScore = -Infinity

        const player = state.activePlayer

        for (const action of actions) {
            const nextState = this.simulateFullMove(state, action)
            const score = this.minimax(nextState, depth - 1, -Infinity, Infinity, false, player)

            if (score > bestScore) {
                bestScore = score
                bestAction = action
            }
        }

        return bestAction
    }

    private static minimax(state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean, player: "WHITE" | "BLACK"): number {
        if (depth === 0 || GameEngine.isMatchFinished(state.board)) {
            return EvaluationEngine.evaluate(state, player)
        }

        const actions = this.generateLegalActions(state)
        if (actions.length === 0) return EvaluationEngine.evaluate(state, player)

        if (isMaximizing) {
            let maxEval = -Infinity

            for (const action of actions) {
                const nextState = this.simulateFullMove(state, action)
                const score = this.minimax(nextState, depth - 1, alpha, beta, false, player)

                maxEval = Math.max(maxEval, score)
                alpha = Math.max(alpha, score)

                if (beta <= alpha) break
            }

            return maxEval
        }
        
        else {
            let minEval = Infinity

            for (const action of actions) {
                const nextState = this.simulateFullMove(state, action)
                const score = this.minimax(nextState, depth - 1, alpha, beta, true, player)

                minEval = Math.min(minEval, score)
                beta = Math.min(beta, score)

                if (beta <= alpha) break
            }

            return minEval
        }
    }

    private static simulatedPhase1(state: GameState, l1: number, p1Id: string, t1: number): GameState {
        const nextBoard = state.board.map((l) => [...l])
        const pIdx = nextBoard[l1].findIndex((p) => p.id === p1Id)
        const [piece] = nextBoard[l1].splice(pIdx, 1)

        nextBoard[t1].push(piece)

        const maxIdx = state.config.laneCount - 1
        const totalLandingPieces = nextBoard[t1].length
        const enemyBaseIndex = piece.color === "WHITE" ? maxIdx : 0

        if (totalLandingPieces <= 1 || t1 === enemyBaseIndex) {
            return {
                ...state,
                board: nextBoard,
                currentPhase: 1,
                phase1MovedPieceId: null,
                activePlayer: state.activePlayer === "WHITE" ? "BLACK" : "WHITE"
            }
        }

        return {
            ...state,
            board: nextBoard,
            currentPhase: 2,
            phase1LandingCount: Math.max(totalLandingPieces, 2),
            phase1MovedPieceId: piece.id
        }
    }

    private static simulateFullMove(state: GameState, action: UnifiedTurnAction): GameState {
        let ongoing = this.simulatedPhase1(state, action.p1Lane, action.p1PieceId, action.p1Target)
        if (ongoing.currentPhase === 1 || action.p2Lane === -1) return ongoing

        const nextBoard = ongoing.board.map((l) => [...l])
        const pIdx = nextBoard[action.p2Lane].findIndex((p) => p.id === action.p2PieceId)
        const [piece] = nextBoard[action.p2Lane].splice(pIdx, 1)
        const isTargetEmptyPrior = nextBoard[action.p2Target].length === 0

        nextBoard[action.p2Target].push(piece)

        if (isTargetEmptyPrior && !ongoing.isExtraTurnActive) {
            return {
                ...ongoing,
                board: nextBoard,
                currentPhase: 1,
                phase1LandingCount: 0,
                phase1MovedPieceId: null,
                isExtraTurnActive: true
            }
        }

        return {
            ...ongoing,
            board: nextBoard,
            currentPhase: 1,
            phase1LandingCount: 0,
            phase1MovedPieceId: null,
            activePlayer: ongoing.activePlayer === "WHITE" ? "BLACK" : "WHITE",
            isExtraTurnActive: false
        }
    }
}
