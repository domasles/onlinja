import { View, Text, TouchableOpacity } from "react-native"
import { useState } from "react"
import { MotiView } from "moti"

import { useGameStore } from "../../hooks/useGameStore"
import { GameButton } from "../elements"
import { Stats } from "../game"

interface GameOverCardProps {
    whiteScore: number
    blackScore: number
    onRestart: () => void
    onLeave: () => void
}

export const GameOverCard = ({ whiteScore, blackScore, onRestart, onLeave }: GameOverCardProps) => {
    const [showStats, setShowStats] = useState(false)

    const whiteMoves = useGameStore((s) => s.whiteMoves ?? 0)
    const blackMoves = useGameStore((s) => s.blackMoves ?? 0)
    const whiteExtraTurns = useGameStore((s) => s.whiteExtraTurns ?? 0)
    const blackExtraTurns = useGameStore((s) => s.blackExtraTurns ?? 0)
    const whiteHomeRuns = useGameStore((s) => s.whiteHomeRuns ?? 0)
    const blackHomeRuns = useGameStore((s) => s.blackHomeRuns ?? 0)

    const getWinnerLabel = () => {
        if (whiteScore > blackScore) return "WHITE WINS!"
        if (blackScore > whiteScore) return "BLACK WINS!"

        return "IT'S A TIE!"
    }

    return (
        <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 250 }}
            className="w-full bg-white border border-neutral-200/90 p-8 rounded-3xl shadow-xl items-center my-auto"
        >
            <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2">
                Match Finished
            </Text>
            <Text className="text-3xl font-logo text-black tracking-tighter mb-8 text-center">
                {getWinnerLabel()}
            </Text>

            <View className="w-full flex-row justify-around items-center bg-neutral-50 border border-neutral-100 p-6 rounded-2xl mb-8">
                <View className="items-center">
                    <Text className="text-xs font-subheader text-neutral-400 tracking-wider uppercase">White</Text>
                    <Text className="text-4xl font-score text-black mt-1">{whiteScore}</Text>
                </View>

                <View className="h-10 w-[1px] bg-neutral-200"/>

                <View className="items-center">
                    <Text className="text-xs font-subheader text-neutral-400 tracking-wider uppercase">Black</Text>
                    <Text className="text-4xl font-score text-black mt-1">{blackScore}</Text>
                </View>
            </View>

            <View className="w-full flex-col space-y-3 gap-3 mb-6">
                <GameButton 
                    label="Play Again"
                    onPress={onRestart}
                    variant="primary"
                    className="w-full h-12"
                />
                <GameButton 
                    label="Back to Main Menu"
                    onPress={onLeave}
                    variant="secondary"
                    className="w-full h-12"
                />
            </View>

            <TouchableOpacity 
                onPress={() => setShowStats(!showStats)}
                activeOpacity={0.7}
                className="flex-row items-center justify-center"
            >
                <Text className="text-xs font-subheader text-neutral-500 border-b border-neutral-300 tracking-wider uppercase">
                    {showStats ? "Hide Match Statistics" : "Show Match Statistics"}
                </Text>
            </TouchableOpacity>

            <MotiView
                from={{ height: 0, marginTop: 0 }}
                animate={{ height: showStats ? 170 : 0 }}
                transition={{ type: "timing", duration: 300 }}
                style={{ width: "100%", overflow: "hidden" }}
            >
                <Stats 
                    whiteMoves={whiteMoves}
                    blackMoves={blackMoves}
                    whiteExtraTurns={whiteExtraTurns}
                    blackExtraTurns={blackExtraTurns}
                    whiteHomeRuns={whiteHomeRuns}
                    blackHomeRuns={blackHomeRuns}
                />
            </MotiView>
        </MotiView>
    )
}
