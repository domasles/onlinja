export interface GameConfig {
    laneCount: number
    piecesPerBase: number
    maxLaneCapacity: number
}

export const DEFAULT_LINJA_CONFIG: GameConfig = {
    laneCount: 7,
    piecesPerBase: 6,
    maxLaneCapacity: 6
}
