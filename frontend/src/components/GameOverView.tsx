import { View, Text } from "react-native"
import { GameButton } from "./GameButton"

interface GameOverViewProps {
    whiteScore: number
    blackScore: number
    onRestart: () => void
    onLeave: () => void
}

export const GameOverView = ({ whiteScore, blackScore, onRestart, onLeave }: GameOverViewProps) => {
    const getWinnerLabel = () => {
        if (whiteScore > blackScore) return "WHITE WINS!"
        if (blackScore > whiteScore) return "BLACK WINS!"

        return "IT'S A TIE!"
    }

    return (
        <View className="w-full bg-white border border-neutral-200/90 p-8 rounded-3xl shadow-xl items-center my-auto">
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

            <View className="w-full flex-col space-y-3 gap-3">
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
        </View>
    )
}
