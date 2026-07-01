import { useState, useEffect } from "react"
import { View } from "react-native"
import { MotiView } from "moti"

import { ScreenWrapper } from "../components/layout/ScreenWrapper"
import { TabIndicator } from "../components/elements/TabIndicator"
import { MainMenuCard } from "../components/cards/MainMenuCard"
import { useGameStore } from "../hooks/useGameStore"

export type MainMenuTabs = "BOT" | "FRIEND" | "SETTINGS"

export const MainMenuScreen = () => {
    const { initializeMatch, loadSavedSettings } = useGameStore()
    const [activeTab, setActiveTab] = useState<MainMenuTabs>("BOT")

    useEffect(() => { loadSavedSettings() }, [])

    return (
        <ScreenWrapper maxWidthClass="max-w-md">
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 200 }}
                className="w-full"
            >
                <View className="w-full flex-row justify-start px-4 -mb-[1px] gap-1">
                    <TabIndicator
                        activeTab={activeTab}
                        targetTab="BOT"
                        label="VS Bot"
                        onPress={() => setActiveTab("BOT")}
                    />

                    <TabIndicator
                        activeTab={activeTab}
                        targetTab="FRIEND"
                        label="VS Friend"
                        onPress={() => setActiveTab("FRIEND")}
                    />

                    <TabIndicator
                        activeTab={activeTab}
                        targetTab="SETTINGS"
                        label="Settings"
                        onPress={() => setActiveTab("SETTINGS")}
                    />
                </View>

                <MainMenuCard
                    activeTab={activeTab}
                    onStartGame={(mode, side, controllers, difficulty) => {initializeMatch(mode, side, controllers, difficulty)}}
                />
            </MotiView>
        </ScreenWrapper>
    )
}
