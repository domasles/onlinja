import { useState } from "react"

import { useTurnEffects, useBotTurn, useGameStore } from "../hooks"
import { GameBoardCard, GameOverCard } from "../components/cards"
import { GameFooter, GameHeader } from "../components/game"
import { ScreenWrapper } from "../components/layout"
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
                    <GameHeader
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

                    <GameFooter
                        onRestart={handleRestart}
                        onLeave={handleLeave}
                    />
                </>
            )}
        </ScreenWrapper>
    )
}
