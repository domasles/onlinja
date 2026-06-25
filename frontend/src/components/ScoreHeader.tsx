import { View, Text } from "react-native"
import { MotiView } from "moti"

import { PlayerColor } from "../domain/engine"

interface ScoreHeaderProps {
    whiteScore: number
    blackScore: number
    currentMove: number
    activePlayer: PlayerColor
}

export const ScoreHeader = ({ whiteScore, blackScore, currentMove, activePlayer }: ScoreHeaderProps) => {
    return (
        <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 200 }}
            className="w-full flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-xl border border-neutral-200/60 mb-4"
        >
            <View className="items-start m-1">
                <Text className="text-xs font-label text-neutral-400 tracking-wider">WHITE</Text>
                <Text className="text-2xl font-score text-black">{whiteScore}</Text>
            </View>

            <View className="bg-neutral-100 px-4 py-1.5 rounded-full">
                <Text className="text-sm font-status text-black tracking-wider uppercase">
                    Move {currentMove} - {activePlayer}'s Turn
                </Text>
            </View>

            <View className="items-end m-1">
                <Text className="text-xs font-label text-neutral-400 tracking-wider">BLACK</Text>
                <Text className="text-2xl font-score text-black">{blackScore}</Text>
            </View>
        </MotiView>
    )
}
