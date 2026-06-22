import { useState } from "react"
import { View, Text } from "react-native"

import { useGameStore } from "../hooks/useGameStore"
import { ActionSlider } from "./ActionSlider"
import { ScreenWrapper } from "./ScreenWrapper"
import { GameButton } from "./GameButton"

export const MainMenu = () => {
    const { initializeMatch } = useGameStore()
    const [selectedMode, setSelectedMode] = useState<"STRATEGIC" | "AGGRESSIVE">("STRATEGIC")
    const [selectedSide, setSelectedSide] = useState<"WHITE" | "BLACK">("WHITE")

    return (
        <ScreenWrapper maxWidthClass="max-w-md">
            <View className="w-full bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-xl items-center">
                <View className="flex-row items-center space-x-2 gap-2 mb-2">
                    <View className="w-6 h-6 rounded-full bg-black border border-black" />
                    <View className="w-6 h-6 rounded-full bg-white border border-neutral-300" />
                </View>

                <Text className="text-4xl font-black text-black tracking-tighter mb-2">Onlinja</Text>
                <Text className="text-xs text-neutral-400 text-center mb-8 px-4">
                    Slide your pieces across tracks and outmaneuver your opponent.
                </Text>
                
                <View className="w-full mb-5">
                    <Text className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 self-center">- Choose mode -</Text>
                    <ActionSlider 
                        options={[
                            { label: "Strategic", value: "STRATEGIC" },
                            { label: "Aggressive", value: "AGGRESSIVE" }
                        ]}
                        selectedValue={selectedMode}
                        onSelect={setSelectedMode}
                    />
                </View>

                <View className="w-full mb-8">
                    <Text className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 self-center">- Choose side -</Text>
                    <ActionSlider 
                        options={[
                            { label: "White", value: "WHITE" },
                            { label: "Black", value: "BLACK" }
                        ]}
                        selectedValue={selectedSide}
                        onSelect={setSelectedSide}
                    />
                </View>

                <GameButton 
                    label="Play vs Local Mirror" 
                    onPress={() => initializeMatch(selectedMode, selectedSide)}
                    variant="primary"
                    className="w-full h-12"
                />
            </View>
        </ScreenWrapper>
    )
}
