import { View, Text } from "react-native"

interface ScoreHeaderProps {
    whiteScore: number
    blackScore: number
    currentPhase: number
    activePlayer: "WHITE" | "BLACK"
}

export const ScoreHeader = ({ whiteScore, blackScore, currentPhase, activePlayer }: ScoreHeaderProps) => {
    return (
        <View className="w-full flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-xl border border-neutral-200/60 mb-4">
            <View className="items-start m-1">
                <Text className="text-xs font-label text-neutral-400 tracking-wider">WHITE</Text>
                <Text className="text-2xl font-score text-black">{whiteScore}</Text>
            </View>

            <View className="bg-neutral-100 px-4 py-1.5 rounded-full">
                <Text className="text-sm font-status text-black tracking-wider uppercase">
                    Phase {currentPhase} - {activePlayer}'s Turn
                </Text>
            </View>

            <View className="items-end m-1">
                <Text className="text-xs font-label text-neutral-400 tracking-wider">BLACK</Text>
                <Text className="text-2xl font-score text-black">{blackScore}</Text>
            </View>
        </View>
    )
}
