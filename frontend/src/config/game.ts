import { Easing } from "react-native-reanimated"

export interface GameConfig {
    laneCount: number
    piecesPerBase: number
    maxLaneCapacity: number
}

export const DEFAULT_LINJA_CONFIG: GameConfig = {
    laneCount: 8,
    piecesPerBase: 6,
    maxLaneCapacity: 6
}

export const EASE_CURVE = Easing.bezier(0.25, 0.1, 0.25, 1)
