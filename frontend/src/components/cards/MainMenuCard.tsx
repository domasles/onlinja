import { useRef, useState, useEffect } from "react"
import { MotiView, AnimatePresence } from "moti"
import { View, Text } from "react-native"

import { useGameStore, GameModes } from "../../hooks/useGameStore"
import { PlayerColor, ControllerType } from "../../domain"
import { SettingsTab, FriendsTab, BotTab } from "../tabs"
import { MainMenuTabs } from "../../screens"
import { BotDifficulty } from "../../bot"

interface MainMenuCardProps {
    activeTab: MainMenuTabs

    onStartGame: (
        mode: GameModes,
        side: PlayerColor,
        controllers: Record<PlayerColor, ControllerType>,
        difficulty: BotDifficulty
    ) => void
}

export const MainMenuCard = ({ activeTab, onStartGame }: MainMenuCardProps) => {
    const defaultGameMode = useGameStore((state) => state.defaultGameMode)
    const defaultSide = useGameStore((state) => state.defaultSide)
    const defaultDifficulty = useGameStore((state) => state.defaultDifficulty)
    const isHydrated = useGameStore((state) => state.isHydrated)

    const selectedGameMode = useRef<GameModes>("STRATEGIC")
    const selectedSide = useRef<PlayerColor>("WHITE")
    const selectedDifficulty = useRef<BotDifficulty>("RUNNER-UP")

    const isFirstRender = useRef(true)
    const hasInitializedDefaults = useRef(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isReadyToRenderTabs, setIsReadyToRenderTabs] = useState(false)

    useEffect(() => {
        if (isHydrated && !hasInitializedDefaults.current) {
            selectedGameMode.current = defaultGameMode
            selectedSide.current = defaultSide
            selectedDifficulty.current = defaultDifficulty
            hasInitializedDefaults.current = true

            setIsReadyToRenderTabs(true)
        }
    }, [isHydrated, defaultGameMode, defaultSide, defaultDifficulty])

    useEffect(() => {
        if (isFirstRender.current) return
        setIsTransitioning(true)
    }, [activeTab])

    const handleInitialMountComplete = () => {
        setIsTransitioning(false)
        isFirstRender.current = false
    }

    const handlePressStart = () => {
        const mode = selectedGameMode.current
        const side = selectedSide.current
        const difficulty = selectedDifficulty.current

        const controllers: Record<PlayerColor, ControllerType> = activeTab === "BOT"
            ? { 
                WHITE: side === "WHITE" ? "HUMAN" : "BOT",
                BLACK: side === "BLACK" ? "HUMAN" : "BOT"
              }
            : { WHITE: "HUMAN", BLACK: "HUMAN" }

        onStartGame(mode, side, controllers, difficulty)
    }

    return (
        <MotiView
            className="w-full bg-white border border-neutral-200/80 p-8 rounded-b-3xl rounded-tr-3xl shadow-xl items-center"
            style={{ overflow: isTransitioning ? "hidden" : "visible" }}
        >
            <View className="flex-row items-center space-x-2 gap-2 mb-2">
                <View className="w-6 h-6 rounded-full bg-black border border-black"/>
                <View className="w-6 h-6 rounded-full bg-white border border-neutral-300"/>
            </View>

            <Text className="w-full text-center font-logo text-5xl text-black tracking-tight leading-tight m-5 mt-3">Onlinja</Text>
            <Text className="font-desc text-sm text-neutral-400 text-center mb-6 px-4">Your favorite abstract board game, but digital.</Text>

            <View className="w-full" style={{ overflow: "visible" }}>
                {isReadyToRenderTabs && (
                    <AnimatePresence exitBeforeEnter>
                        {activeTab === "BOT" && (
                            <BotTab
                                key="bot-tab"
                                mode={selectedGameMode.current}
                                side={selectedSide.current}
                                difficulty={selectedDifficulty.current}
                                isFirstLoad={isFirstRender.current}
                                onModeChange={(val) => { selectedGameMode.current = val as GameModes }}
                                onSideChange={(val) => { selectedSide.current = val as PlayerColor }}
                                onDifficultyChange={(val) => { selectedDifficulty.current = val as BotDifficulty }}
                                onPressPlay={handlePressStart}
                                onMountComplete={handleInitialMountComplete}
                            />
                        )}

                        {activeTab === "FRIEND" && (
                            <FriendsTab
                                key="friends-tab"
                                mode={selectedGameMode.current}
                                isFirstLoad={isFirstRender.current}
                                onModeChange={(val) => { selectedGameMode.current = val as GameModes }}
                                onPressPlay={handlePressStart}
                                onMountComplete={handleInitialMountComplete}
                            />
                        )}

                        {activeTab === "SETTINGS" && (
                            <SettingsTab
                                key="settings-tab"
                                isFirstLoad={isFirstRender.current}
                                onMountComplete={handleInitialMountComplete}
                            />
                        )}
                    </AnimatePresence>
                )}
            </View>
        </MotiView>
    )
}
