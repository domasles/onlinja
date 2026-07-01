import { GameState, GameRules, PlayerColor } from "../domain"
import { EvaluationEngine } from "./evaluation"
import { BotProfile } from "./botAgent"

export interface TurnAction {
    p1Lane: number
    p1PieceId: string
    p1Target: number
    p2Lane: number
    p2PieceId: string
    p2Target: number
}

export class Minimax {
    private static operationCount = 0
    private static readonly YIELD_THRESHOLD = 400

    private static async yieldToMainThread(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, 0))
    }

    public static generateLegalActions(state: GameState): TurnAction[] {
        const moves: TurnAction[] = []
        const maxIdx = state.config.laneCount - 1

        for (let l1 = 0; l1 <= maxIdx; l1++) {
            const lane = state.board[l1]

            for (const p1 of lane) {
                if (p1.player !== state.activePlayer) continue

                const vState1 = {
                    ...state,
                    currentMove: 1 as const,
                    selectedPiece: { laneIndex: l1, pieceId: p1.id }
                }

                const targets1 = GameRules.getValidTargets(vState1, l1)

                for (const t1 of targets1) {
                    if (t1 === l1) continue
                    const stateAfterP1 = this.simulatedMove1(state, l1, p1.id, t1)

                    if (stateAfterP1.activePlayer !== state.activePlayer) {
                        moves.push({ p1Lane: l1, p1PieceId: p1.id, p1Target: t1, p2Lane: -1, p2PieceId: "", p2Target: -1 })
                        continue
                    }

                    let foundValidMove2 = false

                    for (let l2 = 0; l2 <= maxIdx; l2++) {
                        const lane2 = stateAfterP1.board[l2]

                        for (const p2 of lane2) {
                            if (p2.player !== stateAfterP1.activePlayer) continue

                            if (stateAfterP1.gameMode === "AGGRESSIVE" && p2.id !== stateAfterP1.move1MovedPieceId) continue
                            if (stateAfterP1.gameMode === "STRATEGIC" && p2.id === stateAfterP1.move1MovedPieceId) continue

                            const vState2 = {
                                ...stateAfterP1,
                                currentMove: 2 as const,
                                selectedPiece: { laneIndex: l2, pieceId: p2.id }
                            }

                            const targets2 = GameRules.getValidTargets(vState2, l2)

                            for (const t2 of targets2) {
                                if (t2 === l2) continue
                                moves.push({ p1Lane: l1, p1PieceId: p1.id, p1Target: t1, p2Lane: l2, p2PieceId: p2.id, p2Target: t2 })
                                foundValidMove2 = true
                            }
                        }
                    }

                    if (!foundValidMove2) {
                        moves.push({ p1Lane: l1, p1PieceId: p1.id, p1Target: t1, p2Lane: -1, p2PieceId: "", p2Target: -1 })
                    }
                }
            }
        }

        return moves
    }

    public static async optimize(state: GameState, profile: BotProfile): Promise<TurnAction | null> {
        this.operationCount = 0

        const actions = this.generateLegalActions(state)
        if (actions.length === 0) return null

        let bestAction: TurnAction | null = null
        let bestScore = -Infinity

        const player = state.activePlayer

        for (const action of actions) {
            const nextState = this.simulateFullMove(state, action)
            const nextIsMaximizing = nextState.activePlayer === player
            const score = await this.minimax(nextState, profile.lookaheadTurns - 1, -Infinity, Infinity, nextIsMaximizing, player, profile)

            if (score > bestScore) {
                bestScore = score
                bestAction = action
            }
        }

        return bestAction
    }

    private static async minimax(
        state: GameState,
        depth: number,
        alpha: number,
        beta: number,
        isMaximizing: boolean,
        player: PlayerColor,
        profile: BotProfile
    ): Promise<number> {
        this.operationCount++

        if (this.operationCount % this.YIELD_THRESHOLD === 0) {
            await this.yieldToMainThread()
        }

        if (depth === 0 || GameRules.isMatchFinished(state)) {
            return EvaluationEngine.evaluate(state, player, profile)
        }

        const actions = this.generateLegalActions(state)
        if (actions.length === 0) return EvaluationEngine.evaluate(state, player, profile)

        if (isMaximizing) {
            let maxEval = -Infinity

            for (const action of actions) {
                const nextState = this.simulateFullMove(state, action)
                const nextIsMaximizing = nextState.activePlayer === player
                const score = await this.minimax(nextState, depth - 1, alpha, beta, nextIsMaximizing, player, profile)

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
                const nextIsMaximizing = nextState.activePlayer === player
                const score = await this.minimax(nextState, depth - 1, alpha, beta, nextIsMaximizing, player, profile)

                minEval = Math.min(minEval, score)
                beta = Math.min(beta, score)

                if (beta <= alpha) break
            }

            return minEval
        }
    }

    private static simulatedMove1(state: GameState, l1: number, p1Id: string, t1: number): GameState {
        const nextBoard = state.board.map((l) => [...l])
        const pIdx = nextBoard[l1].findIndex((p) => p.id === p1Id)
        const [piece] = nextBoard[l1].splice(pIdx, 1)

        nextBoard[t1].push(piece)

        const maxIdx = state.config.laneCount - 1
        const totalLandingPieces = nextBoard[t1].length
        const enemyBaseIndex = piece.player === "WHITE" ? maxIdx : 0

        if (totalLandingPieces <= 1 || t1 === enemyBaseIndex) {
            return {
                ...state,
                board: nextBoard,
                currentMove: 1,
                move1MovedPieceId: null,
                activePlayer: state.activePlayer === "WHITE" ? "BLACK" : "WHITE"
            }
        }

        return {
            ...state,
            board: nextBoard,
            currentMove: 2,
            move1LandingCount: Math.max(totalLandingPieces, 2),
            move1MovedPieceId: piece.id
        }
    }

    private static simulateFullMove(state: GameState, action: TurnAction): GameState {
        let ongoing = this.simulatedMove1(state, action.p1Lane, action.p1PieceId, action.p1Target)

        if (action.p2Lane === -1) {
            return {
                ...ongoing,
                currentMove: 1,
                move1LandingCount: 0,
                move1MovedPieceId: null,
                activePlayer: state.activePlayer === "WHITE" ? "BLACK" : "WHITE",
                isExtraTurnActive: false
            }
        }

        if (ongoing.currentMove === 1) return ongoing

        const nextBoard = ongoing.board.map((l) => [...l])
        const pIdx = nextBoard[action.p2Lane].findIndex((p) => p.id === action.p2PieceId)
        const [piece] = nextBoard[action.p2Lane].splice(pIdx, 1)
        const isTargetEmptyPrior = nextBoard[action.p2Target].length === 0

        nextBoard[action.p2Target].push(piece)

        if (isTargetEmptyPrior && !ongoing.isExtraTurnActive) {
            return {
                ...ongoing,
                board: nextBoard,
                currentMove: 1,
                move1LandingCount: 0,
                move1MovedPieceId: null,
                isExtraTurnActive: true
            }
        }

        return {
            ...ongoing,
            board: nextBoard,
            currentMove: 1,
            move1LandingCount: 0,
            move1MovedPieceId: null,
            activePlayer: ongoing.activePlayer === "WHITE" ? "BLACK" : "WHITE",
            isExtraTurnActive: false
        }
    }
}
