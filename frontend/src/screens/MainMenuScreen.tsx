import AsyncStorage from "@react-native-async-storage/async-storage"
import { View, Text, TouchableOpacity } from "react-native"
import { useState } from "react"
import { MotiView } from "moti"

import { ScreenWrapper } from "../components/layout/ScreenWrapper"
import { MainMenuCard } from "../components/cards/MainMenuCard"
import { useGameStore } from "../hooks/useGameStore"

export const MainMenuScreen = () => {
    const { initializeMatch, startTutorial } = useGameStore()
    const [activeTab, setActiveTab] = useState<"BOT" | "FRIEND" | "TUTORIAL">("BOT")

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
                <View className="w-full flex-row justify-start px-4 -mb-[1px] z-10 gap-1">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setActiveTab("BOT")}

                        className={`px-4 py-2.5 rounded-t-2xl border-t border-x ${
                            activeTab === "BOT" 
                                ? "bg-white border-neutral-200/80"
                                : "bg-neutral-100 border-transparent"
                        }`}
                    >
                        <Text
                            className={`text-center text-xs uppercase tracking-wider ${
                                activeTab === "BOT"
                                    ? "text-black font-subheader-semibold"
                                    : "text-neutral-400 font-subheader"
                            }`}
                        >
                            VS Bot
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setActiveTab("FRIEND")}

                        className={`px-4 py-2.5 rounded-t-2xl border-t border-x ${
                            activeTab === "FRIEND" 
                                ? "bg-white border-neutral-200/80"
                                : "bg-neutral-100 border-transparent"
                        }`}
                    >
                        <Text
                            className={`text-center text-xs uppercase tracking-wider ${
                                activeTab === "FRIEND"
                                    ? "text-black font-subheader-semibold"
                                    : "text-neutral-400 font-subheader"
                            }`}
                        >
                            VS Friend
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleTutorialPress}

                        className={`px-4 py-2.5 rounded-t-2xl border-t border-x ${
                            activeTab === "TUTORIAL"
                                ? "bg-white border-neutral-200/80"
                                : "bg-neutral-100 border-transparent"
                        }`}
                    >
                        <Text
                            className={`text-center text-xs uppercase tracking-wider ${
                                activeTab === "TUTORIAL" ? "text-black font-subheader-semibold" : "text-neutral-400 font-subheader"
                            }`}
                        >
                            Tutorial
                        </Text>
                    </TouchableOpacity>
                </View>

                <MainMenuCard
                    activeTab={activeTab}
                    onStartGame={(mode, side, controllers, difficulty) => {initializeMatch(mode, side, controllers, difficulty)}}
                />
            </MotiView>
        </ScreenWrapper>
    )
}
