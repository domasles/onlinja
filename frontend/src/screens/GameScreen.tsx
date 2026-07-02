import { useEffect, useState, useRef } from "react"
import { View } from "react-native"
import { MotiView } from "moti"

import { GameBoardCard, GameOverCard } from "../components/cards"
import { useGameStore } from "../hooks/useGameStore"
import { ScreenWrapper } from "../components/layout"
import { GameButton } from "../components/elements"
import { ScoreHeader } from "../components/game"
import { BOT_PRESETS, BotAgent } from "../bot"
import { GameRules } from "../domain"

export const GameScreen = () => {
    const state = useGameStore()
    const [isThinking, setIsThinking] = useState(false)
    const [resetNonce, setResetNonce] = useState(0)
    const turnIdRef = useRef(0)
    
    const scores = GameRules.calculateScores(state.board, state.config)
    const isGameOver = GameRules.isMatchFinished(state) && state.currentMove === 1 && !state.showExtraTurnEffect && !state.isExtraTurnActive

    const activeControllerType = state.controllers?.[state.activePlayer] ?? "HUMAN"
    const isLocalHumanTurn = !isGameOver && activeControllerType === "HUMAN"
    const isBotTurn = !isGameOver && activeControllerType === "BOT"

    useEffect(() => {
        if (isGameOver) return

        if (state.showTurnChangeEffect) {
            const timer = setTimeout(() => { state.setTurnChangeEffect(false) }, 1000)
            return () => clearTimeout(timer)
        }
    }, [state.showTurnChangeEffect, isGameOver])

    useEffect(() => {
        if (isGameOver) return

        if (state.showExtraTurnEffect) {
            const timer = setTimeout(() => { state.setShowExtraTurnEffect(false) }, 1500)
            return () => clearTimeout(timer)
        }
    }, [state.showExtraTurnEffect, isGameOver])

    useEffect(() => {
        if (!isBotTurn || state.currentMove !== 1 || state.showExtraTurnEffect || state.showTurnChangeEffect) return

        turnIdRef.current += 1
        const currentTurnId = turnIdRef.current

        const executeBotTurn = async () => {
            setIsThinking(true)
            await new Promise((resolve) => setTimeout(resolve, 50))

            if (currentTurnId !== turnIdRef.current) return

            const activeProfile = BOT_PRESETS[state.botDifficulty]
            const botMove = await BotAgent.computeMove(state, activeProfile)

            const runStep = async (delay: number, action: () => void) => {
                await new Promise((resolve) => setTimeout(resolve, delay))
                if (currentTurnId === turnIdRef.current) action()
            }

            if (currentTurnId !== turnIdRef.current) return
            setIsThinking(false)
            if (!botMove) return

            await runStep(600, () => state.selectPiece(botMove.p1Lane, botMove.p1PieceId))
            await runStep(400, () => state.selectTargetLane(botMove.p1Target))

            if (botMove.p2Lane !== -1) {
                await runStep(600, () => state.selectPiece(botMove.p2Lane, botMove.p2PieceId))
                await runStep(400, () => state.selectTargetLane(botMove.p2Target))
            }
        }

        executeBotTurn()
        return () => { turnIdRef.current += 1 }
    }, [isBotTurn, state.activePlayer, state.isExtraTurnActive, state.showExtraTurnEffect, state.showTurnChangeEffect, resetNonce])

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
