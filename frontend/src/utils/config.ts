export interface GameConfig {
    laneCount: number
    piecesPerBase: number
    maxLaneCapacity: number
    colors: {
        player1: string
        player2: string
    }
}

export const DEFAULT_LINJA_CONFIG: GameConfig = {
    laneCount: 7,
    piecesPerBase: 6,
    maxLaneCapacity: 6,
    colors: {
        player1: "WHITE",
        player2: "BLACK"
    }
}
