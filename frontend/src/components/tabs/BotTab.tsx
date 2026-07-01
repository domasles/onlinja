import { View, Text } from "react-native"

import { ActionSlider } from "../elements/ActionSlider"
import { GameModes } from "../../hooks/useGameStore"
import { GameButton } from "../elements/GameButton"
import { BotDifficulty } from "../../bot/botAgent"
import { PlayerColor } from "../../domain/engine"
import { TabWrapper } from "../layout/TabWrapper"
import { Dropdown } from "../elements/Dropdown"

interface BotTabProps {
    mode: GameModes
    side: PlayerColor
    difficulty: BotDifficulty
    isFirstLoad?: boolean
    onModeChange: (mode: GameModes) => void
    onSideChange: (side: PlayerColor) => void
    onDifficultyChange: (difficulty: BotDifficulty) => void
    onPressPlay: () => void
    onMountComplete?: () => void
}

export const BotTab = ({
    mode,
    side,
    difficulty,
    isFirstLoad = false,
    onModeChange,
    onSideChange,
    onDifficultyChange,
    onPressPlay,
    onMountComplete
}: BotTabProps) => {
    return (
        <TabWrapper height={280} onMountComplete={onMountComplete} isFirstLoad={isFirstLoad}>
            <View className="w-full mb-4 items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2">- Choose mode -</Text>
                <ActionSlider
                    options={[
                        { label: "Strategic", value: "STRATEGIC" },
                        { label: "Aggressive", value: "AGGRESSIVE" }
                    ]}

                    defaultValue={mode}
                    className="w-75/100"
                    onChange={onModeChange}
                />
            </View>

            <View className="w-full mb-4 items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2">- Choose side -</Text>
                <ActionSlider 
                    options={[
                        { label: "White", value: "WHITE" },
                        { label: "Black", value: "BLACK" }
                    ]}

                    defaultValue={side}
                    className="w-75/100"
                    onChange={onSideChange}
                />
            </View>

            <View className="w-full mb-4 z-20 items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2">- Bot Difficulty -</Text>
                <Dropdown
                    options={[
                        { label: "Rookie", value: "ROOKIE" },
                        { label: "Runner-Up", value: "RUNNER-UP" },
                        { label: "Legend", value: "LEGEND" }
                    ]}

                    defaultValue={difficulty}
                    className="w-75/100"
                    onChange={onDifficultyChange}
                />
            </View>

            <View className="w-full items-center z-10 mt-2">
                <GameButton
                    label="Play vs Bot"
                    onPress={onPressPlay}
                    variant="primary"
                    className="w-85/100 h-12"
                />
            </View>
        </TabWrapper>
    )
}
