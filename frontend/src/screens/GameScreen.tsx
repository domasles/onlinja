import { View } from "react-native"
import { useState } from "react"

import { GameBoardCard, GameOverCard } from "../components/cards"
import { useTurnEffects } from "../hooks/useTurnEffects"
import { useGameStore } from "../hooks/useGameStore"
import { ScreenWrapper } from "../components/layout"
import { GameButton } from "../components/elements"
import { ScoreHeader } from "../components/game"
import { useBotTurn } from "../hooks/useBotTurn"
import { GameRules } from "../domain"

export const GameScreen = () => {
    const state = useGameStore()
    const [resetNonce, setResetNonce] = useState(0)
    
    const scores = GameRules.calculateScores(state.board, state.config)
    const isGameOver = GameRules.isMatchFinished(state) && state.currentMove === 1 && !state.showExtraTurnEffect && !state.isExtraTurnActive

    const activeControllerType = state.controllers?.[state.activePlayer] ?? "HUMAN"
    const isLocalHumanTurn = !isGameOver && activeControllerType === "HUMAN"
    const isBotTurn = !isGameOver && activeControllerType === "BOT"

    useTurnEffects({ state, isGameOver })
    const { isThinking, turnIdRef, setIsThinking } = useBotTurn({ state, isBotTurn, resetNonce })

    const handleRestart = () => {
        const savedDiff = state.botDifficulty
        const savedControllers = state.controllers

        turnIdRef.current += 1
        setIsThinking(false)

        state.resetGame()
        useGameStore.setState({ botDifficulty: savedDiff, controllers: savedControllers })

        setResetNonce(prev => prev + 1)
    }

    const handleLeave = () => {
        turnIdRef.current += 1
        setIsThinking(false)
        state.navigateTo("MAIN_MENU")
    }

    return (
        <ScreenWrapper maxWidthClass="max-w-xl">
            {isGameOver ? (
                <GameOverCard
                    whiteScore={scores.whiteScore}
                    blackScore={scores.blackScore}
                    onRestart={handleRestart}
                    onLeave={handleLeave}
                />
            ) : (
                <>
                    <ScoreHeader
                        whiteScore={scores.whiteScore}
                        blackScore={scores.blackScore}
                        currentMove={state.currentMove}
                        activePlayer={state.activePlayer}
                    />

                    <GameBoardCard 
                        state={state}
                        isThinking={isThinking}
                        isLocalHumanTurn={isLocalHumanTurn}
                    />

                    <View className="w-full flex-row space-x-3 gap-3 mt-4">
                        <GameButton
                            label="Leave Match"
                            onPress={handleLeave}
                            variant="secondary"
                            className="flex-1 w-full h-12"
                        />
                        <GameButton
                            label="Reset"
                            onPress={handleRestart}
                            variant="primary"
                            className="flex-1 w-full h-12"
                        />
                    </View>
                </>
            )}
        </ScreenWrapper>
    )
}
