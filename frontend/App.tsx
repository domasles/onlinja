import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "react-native"
import { useFonts } from "expo-font"

import { useGameStore } from "./src/hooks/useGameStore"
import { MainMenu } from "./src/components/MainMenu"
import { GameBoard } from "./src/components/GameBoard"

import "./global.css"

export const App = () => {
    const currentScreen = useGameStore((state) => state.currentScreen)
    
    const [fontsLoaded] = useFonts({
        "Inter": require("./assets/fonts/inter/Inter.ttf"),
        "Lobster": require("./assets/fonts/lobster/Lobster.ttf"),
        "Oswald": require("./assets/fonts/oswald/Oswald.ttf"),
        "Space-Grotesk": require("./assets/fonts/space-grotesk/Space-Grotesk.ttf"),
    })

    if (!fontsLoaded) return null

    return (
        <SafeAreaProvider className="flex-1 bg-neutral-50">
            <StatusBar barStyle="dark-content"/>
            {currentScreen === "MAIN_MENU" ? <MainMenu/> : <GameBoard/>}
        </SafeAreaProvider>
    )
}
