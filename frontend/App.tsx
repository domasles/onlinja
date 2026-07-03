import { StatusBar, ActivityIndicator, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useFonts } from "expo-font"
import { useEffect } from "react"

import { MainMenuScreen, TutorialScreen, GameScreen } from "./src/screens"
import { useGameStore } from "./src/hooks"

import "./global.css"

export const App = () => {
    const currentScreen = useGameStore((state) => state.currentScreen)
    const startTutorial = useGameStore((state) => state.startTutorial)
    const loadSavedSettings = useGameStore((state) => state.loadSavedSettings)
    const isHydrated = useGameStore((state) => state.isHydrated)
    const isTutorialCompleted = useGameStore((state) => state.isTutorialCompleted)

    const [fontsLoaded, fontError] = useFonts({
        "Inter-Regular": require("./assets/fonts/inter/Inter-Regular.ttf"),
        "Inter-Medium": require("./assets/fonts/inter/Inter-Medium.ttf"),
        "Inter-SemiBold": require("./assets/fonts/inter/Inter-SemiBold.ttf"),

        "Oswald-Regular": require("./assets/fonts/oswald/Oswald-Regular.ttf"),
        "Oswald-SemiBold": require("./assets/fonts/oswald/Oswald-SemiBold.ttf"),

        "Space-Grotesk-Regular": require("./assets/fonts/space-grotesk/Space-Grotesk-Regular.ttf"),
    })

    useEffect(() => {
        loadSavedSettings()
    }, [loadSavedSettings])

    useEffect(() => {
        if (!isHydrated) return

        if (!isTutorialCompleted) {
            startTutorial()
        }
    }, [isHydrated, isTutorialCompleted, startTutorial])

    if (!isHydrated || (!fontsLoaded && !fontError)) {
        return (
            <View className="flex-1 items-center justify-center bg-neutral-50">
                <StatusBar barStyle="dark-content" />
                <ActivityIndicator size="large" color="#171717" />
            </View>
        )
    }

    return (
        <SafeAreaProvider className="flex-1 bg-neutral-50">
            <StatusBar barStyle="dark-content"/>
            {currentScreen === "MAIN_MENU" ? (
                <MainMenuScreen/>
            ) : currentScreen === "TUTORIAL" ? (
                <TutorialScreen/>
            ) : (
                <GameScreen/>
            )}
        </SafeAreaProvider>
    )
}
