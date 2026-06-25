import { MotiView, AnimatePresence } from "moti"
import { View, Text } from "react-native"
import { useState } from "react"

import { PlayerColor, ControllerType } from "../domain/engine"
import { ActionSlider } from "./ActionSlider"
import { GameButton } from "./GameButton"
import { Dropdown } from "./Dropdown"

export type BotDifficulty = "ROOKIE" | "RUNNER-UP" | "CHAMPION"

interface MainMenuCardProps {
    activeTab: "BOT" | "LOCAL"

    onStartGame: (
        mode: "STRATEGIC" | "AGGRESSIVE",
        side: PlayerColor,
        controllers: Record<PlayerColor, ControllerType>,
        difficulty?: BotDifficulty
    ) => void
}

export const MainMenuCard = ({ activeTab, onStartGame }: MainMenuCardProps) => {
    const [selectedMode, setSelectedMode] = useState<"STRATEGIC" | "AGGRESSIVE">("STRATEGIC")
    const [selectedSide, setSelectedSide] = useState<PlayerColor>("WHITE")
    const [difficulty, setDifficulty] = useState<BotDifficulty>("RUNNER-UP")
    const [isDropdownActive, setIsDropdownActive] = useState(false)

    const handlePressStart = () => {
        const controllers: Record<PlayerColor, ControllerType> = activeTab === "BOT"
            ? { 
                WHITE: selectedSide === "WHITE" ? "HUMAN" : "BOT", 
                BLACK: selectedSide === "BLACK" ? "HUMAN" : "BOT" 
              }
            : { WHITE: "HUMAN", BLACK: "HUMAN" }

        onStartGame(selectedMode, selectedSide, controllers, activeTab === "BOT" ? difficulty : undefined)
    }

    return (
        <View
            style={{ overflow: isDropdownActive ? "visible" : "hidden" }}
            className="w-full bg-white border border-neutral-200/80 p-8 rounded-b-3xl rounded-tr-3xl shadow-xl items-center z-30"
        >
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

            <AnimatePresence>
                {activeTab === "BOT" && (
                    <MotiView
                        from={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 160, marginBottom: 20 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ type: "timing", duration: 220 }}
                        style={{ width: "100%", overflow: isDropdownActive ? "visible" : "hidden", zIndex: 40 }}
                    >
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "timing", duration: 150, delay: 50 }}
                            style={{ width: "100%", overflow: isDropdownActive ? "visible" : "hidden" }}
                        >
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

                            <View className="w-full mb-6 items-center">
                                <Text className="text-xs font-subheader text-neutral-400 uppercase tracking-widest mb-2 self-center">- Bot Difficulty -</Text>
                                <Dropdown
                                    options={[
                                        { label: "Rookie", value: "ROOKIE" },
                                        { label: "Runner-Up", value: "RUNNER-UP" },
                                        { label: "Champion", value: "CHAMPION" }
                                    ]}

                                    selectedValue={difficulty}
                                    onSelect={setDifficulty}
                                    onToggle={setIsDropdownActive}
                                />
                            </View>
                        </MotiView>
                    </MotiView>
                )}
            </AnimatePresence>

            <View className="w-full mt-2 z-10">
                <GameButton
                    label={activeTab === "BOT" ? "Play vs Bot" : "Start Local Match"}
                    onPress={handlePressStart}
                    variant="primary"
                    className="w-full h-12"
                />
            </View>
        </View>
    )
}
