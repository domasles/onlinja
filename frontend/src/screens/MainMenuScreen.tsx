import { View, Text, TouchableOpacity } from "react-native"
import { useState } from "react"
import { MotiView } from "moti"

import { ScreenWrapper } from "../components/ScreenWrapper"
import { MainMenuCard } from "../components/MainMenuCard"
import { useGameStore } from "../hooks/useGameStore"

export const MainMenuScreen = () => {
    const { initializeMatch } = useGameStore()
    const [activeTab, setActiveTab] = useState<"BOT" | "LOCAL">("BOT")

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
                        className={`px-6 py-2.5 rounded-t-2xl border-t border-x ${
                            activeTab === "BOT" 
                                ? "bg-white border-neutral-200/80"
                                : "bg-neutral-100 border-transparent"
                        }`}
                    >
                        <Text
                            numberOfLines={1}
                            className={`text-xs uppercase tracking-wider ${
                            activeTab === "BOT" ? "text-black font-subheader-semibold" : "text-neutral-400 font-subheader"
                        }`}>
                            VS Bot
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setActiveTab("LOCAL")}
                        className={`px-6 py-2.5 rounded-t-2xl border-t border-x ${
                            activeTab === "LOCAL" 
                                ? "bg-white border-neutral-200/80"
                                : "bg-neutral-100 border-transparent"
                        }`}
                    >
                        <Text
                            numberOfLines={1}
                            className={`text-xs uppercase tracking-wider ${
                                activeTab === "LOCAL" ? "text-black font-subheader-semibold" : "text-neutral-400 font-subheader"
                            }`}
                        >
                            Pass & Play
                        </Text>
                    </TouchableOpacity>
                </View>

                <MainMenuCard
                    activeTab={activeTab}
                    onStartGame={(mode, side, controllers, difficulty) => {
                        initializeMatch(mode, side, controllers, difficulty)
                    }}
                />
            </MotiView>
        </ScreenWrapper>
    )
}
