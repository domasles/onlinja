import { View, Text } from "react-native"

import { useGameStore, HighlightMode, GameModes } from "../../hooks/useGameStore"
import { ActionSlider, GameButton, Dropdown } from "../elements"
import { PlayerColor } from "../../domain"
import { BotDifficulty } from "../../bot"
import { TabWrapper } from "../layout"

interface SettingsTabProps {
    isFirstLoad?: boolean
    onMountComplete?: () => void
}

export const SettingsTab = ({
    isFirstLoad = false,
    onMountComplete
}: SettingsTabProps) => {
    const highlightMode = useGameStore((state) => state.highlightMode)
    const defaultGameMode = useGameStore((state) => state.defaultGameMode)
    const defaultSide = useGameStore((state) => state.defaultSide)
    const defaultDifficulty = useGameStore((state) => state.defaultDifficulty)

    const setHighlightMode = useGameStore((state) => state.setHighlightMode)
    const setDefaultGameMode = useGameStore((state) => state.setDefaultGameMode)
    const setDefaultSide = useGameStore((state) => state.setDefaultSide)
    const setDefaultDifficulty = useGameStore((state) => state.setDefaultDifficulty)

    const startTutorial = useGameStore((state) => state.startTutorial)

    return (
        <TabWrapper height={365} onMountComplete={onMountComplete} isFirstLoad={isFirstLoad}>
            <View className="w-full mb-4 items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Highlight Lanes -</Text>
                <ActionSlider
                    options={[
                        { label: "Yes", value: "YES" },
                        { label: "No", value: "NO" }
                    ]}

                    defaultValue={highlightMode}
                    className="w-75/100"
                    onChange={(val) => setHighlightMode(val as HighlightMode)}
                />
            </View>

            <View className="w-full mb-4 items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Default Game Mode -</Text>
                <ActionSlider
                    options={[
                        { label: "Strategic", value: "STRATEGIC" },
                        { label: "Aggressive", value: "AGGRESSIVE" }
                    ]}

                    defaultValue={defaultGameMode}
                    className="w-75/100"
                    onChange={(val) => setDefaultGameMode(val as GameModes)}
                />
            </View>

            <View className="w-full mb-4 items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Default Side -</Text>
                <ActionSlider
                    options={[
                        { label: "White", value: "WHITE" },
                        { label: "Black", value: "BLACK" }
                    ]}

                    defaultValue={defaultSide}
                    className="w-75/100"
                    onChange={(val) => setDefaultSide(val as PlayerColor)}
                />
            </View>

            <View className="w-full mb-4 z-20 items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2">- Default Bot Difficulty -</Text>
                <Dropdown
                    options={[
                        { label: "Rookie", value: "ROOKIE" },
                        { label: "Runner-Up", value: "RUNNER-UP" },
                        { label: "Legend", value: "LEGEND" }
                    ]}

                    defaultValue={defaultDifficulty}
                    className="w-75/100"
                    onChange={(val) => setDefaultDifficulty(val as BotDifficulty)}
                />
            </View>

            <View className="w-full items-center mt-2">
                <GameButton
                    label="Replay Tutorial"
                    onPress={startTutorial}
                    variant="primary"
                    className="w-75/100 h-12"
                />
            </View>
        </TabWrapper>
    )
}
