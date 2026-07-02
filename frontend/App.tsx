import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar, } from "react-native"
import { useFonts } from "expo-font"
import { useEffect } from "react"

import { MainMenuScreen, TutorialScreen, GameScreen } from "./src/screens"
import { useGameStore } from "./src/hooks"

import "./global.css"

export const App = () => {
    const currentScreen = useGameStore((state) => state.currentScreen)
    const startTutorial = useGameStore((state) => state.startTutorial)

    useFonts({
        "Inter-Regular": require("./assets/fonts/inter/Inter-Regular.ttf"),
        "Inter-Medium": require("./assets/fonts/inter/Inter-Medium.ttf"),
        "Inter-SemiBold": require("./assets/fonts/inter/Inter-SemiBold.ttf"),

        "Oswald-Regular": require("./assets/fonts/oswald/Oswald-Regular.ttf"),
        "Oswald-SemiBold": require("./assets/fonts/oswald/Oswald-SemiBold.ttf"),

        "Space-Grotesk-Regular": require("./assets/fonts/space-grotesk/Space-Grotesk-Regular.ttf"),
    })

    useEffect(() => {
        const checkTutorialStatus = async () => {
            const hasCompleted = await AsyncStorage.getItem("onlinja_tutorial_completed").catch(() => {})

            if (!hasCompleted || hasCompleted === "false") {
                startTutorial()
            }
        }

        checkTutorialStatus()
    }, [startTutorial])

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
