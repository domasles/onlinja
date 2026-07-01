import { View, Text } from "react-native"

import { ActionSlider, GameButton } from "../elements"
import { GameModes } from "../../hooks/useGameStore"
import { TabWrapper } from "../layout"

interface FriendsTabProps {
    mode: GameModes
    isFirstLoad?: boolean
    onModeChange: (mode: GameModes) => void
    onPressPlay: () => void
    onMountComplete?: () => void
}

export const FriendsTab = ({ mode, isFirstLoad = false, onModeChange, onPressPlay, onMountComplete }: FriendsTabProps) => {
    return (
        <TabWrapper height={115} onMountComplete={onMountComplete} isFirstLoad={isFirstLoad}>
            <View className="w-full mb-4 items-center self-center">
                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Choose mode -</Text>
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

            <View className="w-full items-center mt-2">
                <GameButton
                    label="Play vs Friend"
                    onPress={onPressPlay}
                    variant="primary"
                    className="w-85/100 h-12"
                />
            </View>
        </TabWrapper>
    )
}
