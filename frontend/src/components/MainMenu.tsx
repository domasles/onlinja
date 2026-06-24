import { View, Text } from "react-native"
import { useState } from "react"

import { useGameStore } from "../hooks/useGameStore"
import { ScreenWrapper } from "./ScreenWrapper"
import { ActionSlider } from "./ActionSlider"
import { GameButton } from "./GameButton"
import { Dropdown } from "./Dropdown"

export type BotDifficulty = "ROOKIE" | "RUNNER-UP" | "CHAMPION"

export const MainMenu = () => {
    const { initializeMatch } = useGameStore()
    const [selectedMode, setSelectedMode] = useState<"STRATEGIC" | "AGGRESSIVE">("STRATEGIC")
    const [selectedSide, setSelectedSide] = useState<"WHITE" | "BLACK">("WHITE")
    const [difficulty, setDifficulty] = useState<BotDifficulty>("RUNNER-UP")

    return (
        <ScreenWrapper maxWidthClass="max-w-md">
            <View className="w-full bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-xl items-center">
                <View className="flex-row items-center space-x-2 gap-2 mb-2">
                    <View className="w-6 h-6 rounded-full bg-black border border-black"/>
                    <View className="w-6 h-6 rounded-full bg-white border border-neutral-300"/>
                </View>

                <Text className="font-logo text-5xl text-black tracking-tight m-5 mt-3">Onlinja</Text>
                <Text className="font-desc text-sm text-neutral-400 text-center mb-6 px-4">
                    Your favorite abstract board game, but digital.
                </Text>
                
                <View className="w-full mb-5">
                    <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Choose mode -</Text>
                    <ActionSlider 
                        options={[
                            { label: "Strategic", value: "STRATEGIC" },
                            { label: "Aggressive", value: "AGGRESSIVE" }
                        ]}
                        selectedValue={selectedMode}
                        onSelect={setSelectedMode}
                    />
                </View>

                <View className="w-full mb-5">
                    <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Choose side -</Text>
                    <ActionSlider 
                        options={[
                            { label: "White", value: "WHITE" },
                            { label: "Black", value: "BLACK" }
                        ]}
                        selectedValue={selectedSide}
                        onSelect={setSelectedSide}
                    />
                </View>

                <View style={{ zIndex: 50 }} className="w-full mb-8">
                    <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Bot Difficulty -</Text>
                    <Dropdown
                        options={[
                            { label: "Rookie", value: "ROOKIE" },
                            { label: "Runner-Up", value: "RUNNER-UP" },
                            { label: "Champion", value: "CHAMPION" }
                        ]}
                        selectedValue={difficulty}
                        onSelect={setDifficulty}
                    />
                </View>

                <GameButton 
                    label="Play vs Bot" 
                    onPress={() => initializeMatch(selectedMode, selectedSide)}
                    variant="primary"
                    className="w-full h-12"
                />
            </View>
        </ScreenWrapper>
    )
}
