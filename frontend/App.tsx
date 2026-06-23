import { SafeAreaView, StatusBar } from "react-native"

import { useGameStore } from "./src/hooks/useGameStore"
import { MainMenu } from "./src/components/MainMenu"
import { GameBoard } from "./src/components/GameBoard"

import "./global.css"

export default function App() {
    const currentScreen = useGameStore((state) => state.currentScreen)

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <StatusBar barStyle="dark-content"/>
            {currentScreen === "MAIN_MENU" ? <MainMenu/> : <GameBoard/>}
        </SafeAreaView>
    )
}
