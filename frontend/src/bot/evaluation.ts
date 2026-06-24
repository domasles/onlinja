import { GameState, PlayerColor, GameEngine } from "../domain/engine"

export class EvaluationEngine {
    public static evaluate(state: GameState, perspective: PlayerColor): number {
        const scores = GameEngine.calculateScores(state.board, state.config)
        
        let evaluation = perspective === "WHITE" 
            ? scores.whiteScore - scores.blackScore 
            : scores.blackScore - scores.whiteScore

        if (state.isExtraTurnActive) {
            if (state.activePlayer === perspective) {
                evaluation += 15
            }
            
            else {
                evaluation -= 15
            }
        }

        return evaluation
    }
}
