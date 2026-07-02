import { View } from "react-native"
import { GameButton } from "../elements"

export interface GameFooterProps {
    onRestart: () => void
    onLeave: () => void
}

export const GameFooter = ({ onRestart, onLeave }: GameFooterProps) => {
    return (
        <View className="w-full flex-row space-x-3 gap-3 mt-4">
            <GameButton
                label="Leave Match"
                onPress={onLeave}
                variant="secondary"
                className="flex-1 w-full h-12"
            />
            <GameButton
                label="Reset"
                onPress={onRestart}
                variant="primary"
                className="flex-1 w-full h-12"
            />
        </View>
    )
}
