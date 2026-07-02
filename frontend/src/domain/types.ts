import { GameConfig } from "../utils/config"
import { BotDifficulty } from "../bot"

export type PlayerColor = "WHITE" | "BLACK"
export type ControllerType = "HUMAN" | "BOT"

export interface GamePiece {
    id: string
    player: PlayerColor
}

export interface MoveHistory {
    move1: { pieceId: string; originLane: number; targetLane: number } | null
    move2: { pieceId: string; originLane: number; targetLane: number } | null
}

export interface GameState {
    board: GamePiece[][]
    activePlayer: PlayerColor
    currentMove: 1 | 2
    move1LandingCount: number
    selectedPiece: { laneIndex: number; pieceId: string } | null
    gameMode: "AGGRESSIVE" | "STRATEGIC"
    playerSide: PlayerColor
    botDifficulty: BotDifficulty
    move1MovedPieceId: string | null
    history: MoveHistory
    config: GameConfig
    showExtraTurnEffect: boolean
    showTurnChangeEffect: boolean
    isExtraTurnActive: boolean

    controllers: {
        WHITE: ControllerType
        BLACK: ControllerType
    }
}
