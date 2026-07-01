import { useRef, useState, useEffect } from "react"
import { MotiView, AnimatePresence } from "moti"
import { View, Text } from "react-native"

import { PlayerColor, ControllerType } from "../../domain/engine"
import { MainMenuTabs } from "../../screens/MainMenuScreen"
import { BotDifficulty } from "../../bot/botAgent"
import { FriendsTab } from "../tabs/FriendsTab"
import { BotTab } from "../tabs/BotTab"

export type GameModes = "STRATEGIC" | "AGGRESSIVE"

interface MainMenuCardProps {
    activeTab: MainMenuTabs

    onStartGame: (
        mode: GameModes,
        side: PlayerColor,
        controllers: Record<PlayerColor, ControllerType>,
        difficulty?: BotDifficulty
    ) => void
}

export const MainMenuCard = ({ activeTab, onStartGame }: MainMenuCardProps) => {
    const selectedMode = useRef<GameModes>("STRATEGIC")
    const selectedSide = useRef<PlayerColor>("WHITE")
    const difficulty = useRef<BotDifficulty>("RUNNER-UP")
    const isFirstRender = useRef(true)

    const [isTransitioning, setIsTransitioning] = useState(false)
    
    useEffect(() => {
        if (isFirstRender.current) return
        setIsTransitioning(true)
    }, [activeTab])

    const handleInitialMountComplete = () => {
        setIsTransitioning(false)
        isFirstRender.current = false
    }

    const handlePressStart = () => {
        const mode = selectedMode.current
        const side = selectedSide.current
        const diff = difficulty.current

        const controllers: Record<PlayerColor, ControllerType> = activeTab === "BOT"
            ? { 
                WHITE: side === "WHITE" ? "HUMAN" : "BOT",
                BLACK: side === "BLACK" ? "HUMAN" : "BOT"
              }
            : { WHITE: "HUMAN", BLACK: "HUMAN" }

        onStartGame(mode, side, controllers, activeTab === "BOT" ? diff : undefined)
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
                <AnimatePresence exitBeforeEnter>
                    {activeTab === "BOT" && (
                        <BotTab 
                            key="bot-tab"
                            mode={selectedMode.current}
                            side={selectedSide.current}
                            difficulty={difficulty.current}
                            isFirstLoad={isFirstRender.current}
                            onModeChange={(val) => { selectedMode.current = val }}
                            onSideChange={(val) => { selectedSide.current = val }}
                            onDifficultyChange={(val) => { difficulty.current = val }}
                            onPressPlay={handlePressStart}
                            onMountComplete={handleInitialMountComplete}
                        />
                    )}

                    {activeTab === "FRIEND" && (
                        <FriendsTab 
                            key="friends-tab"
                            mode={selectedMode.current}
                            isFirstLoad={isFirstRender.current}
                            onModeChange={(val) => { selectedMode.current = val }}
                            onPressPlay={handlePressStart}
                            onMountComplete={handleInitialMountComplete}
                        />
                    )}
                </AnimatePresence>
            </View>
        </MotiView>
    )
}
