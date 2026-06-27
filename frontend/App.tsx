import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "react-native"
import { useFonts } from "expo-font"

import { MainMenuScreen } from "./src/screens/MainMenuScreen"
import { useGameStore } from "./src/hooks/useGameStore"
import { GameScreen } from "./src/screens/GameScreen"

import "./global.css"

export const App = () => {
    const currentScreen = useGameStore((state) => state.currentScreen)
    
    const [fontsLoaded] = useFonts({
        "Inter-Regular": require("./assets/fonts/inter/Inter-Regular.ttf"),
        "Inter-SemiBold": require("./assets/fonts/inter/Inter-SemiBold.ttf"),
        "Oswald-Regular": require("./assets/fonts/oswald/Oswald-Regular.ttf"),
        "Oswald-SemiBold": require("./assets/fonts/oswald/Oswald-SemiBold.ttf"),
        "Space-Grotesk-Regular": require("./assets/fonts/space-grotesk/Space-Grotesk-Regular.ttf"),
    })

    if (!fontsLoaded) return null

    return (
        <SafeAreaProvider className="flex-1 bg-neutral-50">
            <StatusBar barStyle="dark-content"/>
            {currentScreen === "MAIN_MENU" ? <MainMenuScreen/> : <GameScreen/>}
        </SafeAreaProvider>
    )
}
