import AsyncStorage from "@react-native-async-storage/async-storage"
import { View } from "react-native"
import { useState } from "react"
import { MotiView } from "moti"

import { ScreenWrapper } from "../components/layout/ScreenWrapper"
import { TabIndicator } from "../components/elements/TabIndicator"
import { MainMenuCard } from "../components/cards/MainMenuCard"
import { useGameStore } from "../hooks/useGameStore"

export type MainMenuTabs = "BOT" | "FRIEND" | "TUTORIAL"

export const MainMenuScreen = () => {
    const { initializeMatch, startTutorial } = useGameStore()
    const [activeTab, setActiveTab] = useState<MainMenuTabs>("BOT")

    const handleTutorialPress = async () => {
        setActiveTab("TUTORIAL")

        try {
            await AsyncStorage.setItem("onlinja_tutorial_completed", "false")
            startTutorial()
        }

        catch (error) {
            console.warn("Could not write tutorial flag status to AsyncStorage:", error)
        }
    }

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
                        targetTab="TUTORIAL"
                        label="Tutorial"
                        onPress={handleTutorialPress}
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
