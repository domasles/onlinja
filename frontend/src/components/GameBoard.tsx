import Animated, { LinearTransition, FadeIn, FadeOut } from "react-native-reanimated"
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native"
import { useEffect, useState, useRef } from "react"
import { MotiView } from "moti"

import { GameEngine, PlayerColor } from "../domain/engine"
import { BOT_PRESETS, BotAgent } from "../bot/botAgent"
import { useGameStore } from "../hooks/useGameStore"
import { ScreenWrapper } from "./ScreenWrapper"
import { StatusOverlay } from "./StatusOverlay"
import { GameOverCard } from "./GameOverCard"
import { ScoreHeader } from "./ScoreHeader"
import { GameButton } from "./GameButton"

interface RenderItem {
    type: "SINGLE" | "MERGED"
    color: PlayerColor
    count: number
    pieceId: string
    allIds: string[]
}

export const GameBoard = () => {
    const state = useGameStore()
    const [isThinking, setIsThinking] = useState(false)
    const [resetNonce, setResetNonce] = useState(0)
    const turnIdRef = useRef(0)
    const scores = GameEngine.calculateScores(state.board, state.config)
    const isGameOver = GameEngine.isMatchFinished(state) && state.currentMove === 1 && !state.showExtraTurnEffect && !state.isExtraTurnActive

    const laneIndices = Array.from({ length: state.config.laneCount }, (_, i) => i)
    const orderedLanes = state.playerSide === "BLACK" ? laneIndices : [...laneIndices].reverse()
    const validTargets = state.selectedPiece ? GameEngine.getValidTargets(state, state.selectedPiece.laneIndex) : []

    const h1 = state.history.move1
    const h2 = state.history.move2
    const maxIdx = state.config.laneCount - 1
    const opponentHomeIndex = state.activePlayer === "WHITE" ? maxIdx : 0

    const activeControllerType = state.controllers?.[state.activePlayer] ?? "HUMAN"
    const isLocalHumanTurn = !isGameOver && activeControllerType === "HUMAN"
    const isBotTurn = !isGameOver && activeControllerType === "BOT"

    useEffect(() => {
        if (!isBotTurn || state.currentMove !== 1 || state.showExtraTurnEffect) return

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

        return () => {
            turnIdRef.current += 1
        }
    }, [isBotTurn, state.activePlayer, state.isExtraTurnActive, state.showExtraTurnEffect, resetNonce])

    useEffect(() => {
        if (state.showExtraTurnEffect) {
            const timer = setTimeout(() => { state.clearExtraTurnEffect() }, 1500)
            return () => clearTimeout(timer)
        }
    }, [state.showExtraTurnEffect])

    return (
        <ScreenWrapper maxWidthClass="max-w-xl">
            {isGameOver ? (
                <GameOverCard
                    whiteScore={scores.whiteScore}
                    blackScore={scores.blackScore}

                    onRestart={() => {
                        const savedDiff = state.botDifficulty
                        const savedControllers = state.controllers
                        turnIdRef.current += 1
                        setIsThinking(false)
                        state.resetGame()
                        useGameStore.setState({ botDifficulty: savedDiff, controllers: savedControllers })
                        setResetNonce(prev => prev + 1)
                    }}

                    onLeave={() => {
                        turnIdRef.current += 1
                        setIsThinking(false)
                        state.navigateTo("MAIN_MENU")
                    }}
                />
            ) : (
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 200 }}
                    className="w-full flex-1 relative"
                >
                    <ScoreHeader
                        whiteScore={scores.whiteScore}
                        blackScore={scores.blackScore}
                        currentMove={state.currentMove}
                        activePlayer={state.activePlayer}
                    />

                    <View style={{ position: "relative", overflow: "hidden" }} className="w-full bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xl flex-col">
                        <View
                            pointerEvents={isLocalHumanTurn && !isThinking ? "auto" : "none"}
                        >
                            {orderedLanes.map((laneIdx, viewIdx) => {
                                const lanePieces = state.board[laneIdx]
                                const isTargetable = validTargets.includes(laneIdx)
                                const isHomeLane = laneIdx === 0 || laneIdx === maxIdx

                                let displayItems: RenderItem[] = []

                                if (isHomeLane) {
                                    const rawGroups: { color: PlayerColor; pieces: typeof lanePieces }[] = []

                                    lanePieces.forEach(p => {
                                        const lastGroup = rawGroups[rawGroups.length - 1]

                                        if (lastGroup && lastGroup.color === p.player) {
                                            lastGroup.pieces.push(p)
                                        }

                                        else {
                                            rawGroups.push({ color: p.player, pieces: [p] })
                                        }
                                    })

                                    rawGroups.forEach(g => {
                                        g.pieces.forEach(p => {
                                            displayItems.push({
                                                type: "SINGLE",
                                                color: g.color,
                                                count: 1,
                                                pieceId: p.id,
                                                allIds: [p.id]
                                            })
                                        })
                                    })

                                    const maxCap = state.config.maxLaneCapacity

                                    while (displayItems.length > maxCap) {
                                        let merged = false

                                        for (let i = 0; i < displayItems.length - 1; i++) {
                                            if (displayItems[i].color === displayItems[i + 1].color) {
                                                displayItems[i] = {
                                                    type: "MERGED",
                                                    color: displayItems[i].color,
                                                    count: displayItems[i].count + displayItems[i + 1].count,
                                                    pieceId: displayItems[i].pieceId,
                                                    allIds: [...displayItems[i].allIds, ...displayItems[i + 1].allIds]
                                                }

                                                displayItems.splice(i + 1, 1)
                                                merged = true

                                                break
                                            }
                                        }

                                        if (!merged) break
                                    }
                                }

                                else {
                                    lanePieces.forEach(p => {
                                        displayItems.push({
                                            type: "SINGLE",
                                            color: p.player,
                                            count: 1,
                                            pieceId: p.id,
                                            allIds: [p.id]
                                        })
                                    })
                                }

                                let laneHighlightClass = "bg-transparent"

                                if (h1 && h1.originLane === laneIdx) laneHighlightClass = "bg-yellow-500/10"
                                if (h2 && h2.originLane === laneIdx) laneHighlightClass = "bg-emerald-500/10"

                                return (
                                    <View key={laneIdx} className="w-full flex-col">
                                        {viewIdx > 0 && (
                                            <View className="h-[1px] bg-neutral-200 w-[96%] self-center my-0.5"/>
                                        )}

                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            onPress={() => state.selectTargetLane(laneIdx)}
                                            className={`flex-row items-center h-14 w-full px-4 rounded-xl transition-colors ${
                                                isTargetable ? "bg-neutral-100" : laneHighlightClass
                                            }`}
                                        >
                                            <View className="flex-row items-center justify-center flex-1 h-full">
                                                {displayItems.map((item) => {
                                                    const isSelected = state.selectedPiece && item.allIds.includes(state.selectedPiece.pieceId)
                                                    const activeId = isSelected ? state.selectedPiece!.pieceId : item.pieceId

                                                    const virtualState = { ...state, selectedPiece: { laneIndex: laneIdx, pieceId: activeId } }
                                                    const hasLegalMoves = GameEngine.getValidTargets(virtualState, laneIdx).length > 0
                                                    const isSelectable = isLocalHumanTurn && item.color === state.activePlayer && laneIdx !== opponentHomeIndex && hasLegalMoves

                                                    let overlayRingStyle = isSelected
                                                        ? "border-[4px] border-neutral-400 scale-105"
                                                        : item.allIds.some(id => h2 && h2.pieceId === id)
                                                        ? "border-[3px] border-emerald-400"
                                                        : item.allIds.some(id => h1 && h1.pieceId === id)
                                                        ? "border-[3px] border-amber-400"
                                                        : `border-2 ${item.color === "WHITE" ? "border-black" : "border-neutral-800"}`

                                                    return (
                                                        <Animated.View
                                                            key={item.pieceId}
                                                            layout={LinearTransition.springify()}
                                                            entering={FadeIn.duration(300)}
                                                            exiting={FadeOut.duration(300)}
                                                            className="justify-center"
                                                        >
                                                            <TouchableOpacity
                                                                activeOpacity={isSelectable ? 0.8 : 1}
                                                                disabled={!isSelectable}
                                                                
                                                                onPress={(e) => {
                                                                    e.stopPropagation()
                                                                    state.selectPiece(laneIdx, activeId)
                                                                }}

                                                                className={`w-9 h-9 rounded-full mx-1 shadow-xl items-center justify-center ${
                                                                    item.color === "WHITE" ? "bg-white" : "bg-black"
                                                                } ${overlayRingStyle}`}
                                                            >
                                                                {item.type === "MERGED" && (
                                                                    <Text className={`font-status text-xs font-bold ${
                                                                        item.color === "WHITE" ? "text-neutral-900" : "text-white"
                                                                    }`}>
                                                                        +{item.count}
                                                                    </Text>
                                                                )}
                                                            </TouchableOpacity>
                                                        </Animated.View>
                                                    )
                                                })}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>

                        {isThinking && (
                            <StatusOverlay isVisible={isThinking}>
                                <View className="flex-row items-center gap-3 bg-white/90 px-3 py-1.5 rounded-full shadow-xl border border-neutral-200/50">
                                    <ActivityIndicator size="small" color="#262626" />
                                    <Text className="text-sm font-desc text-neutral-800">
                                        Bot thinking...
                                    </Text>
                                </View>
                            </StatusOverlay>
                        )}

                        {state.showExtraTurnEffect && (
                            <StatusOverlay isVisible={state.showExtraTurnEffect}>
                                <Animated.View
                                    layout={LinearTransition.springify()}
                                    className="bg-white w-20 h-20 rounded-full items-center justify-center border-4 border-emerald-500 shadow-md relative"
                                >
                                    <View className="w-6 h-1 bg-emerald-500 rounded-full absolute"/>
                                    <View className="w-1 h-6 bg-emerald-500 rounded-full absolute"/>
                                </Animated.View>
                                <Text className="text-sm font-desc text-neutral-800 bg-white/90 px-3 py-1.5 rounded-full shadow-xl border border-neutral-200/50">
                                    Extra turn awarded to player {state.activePlayer === "WHITE" ? "White" : "Black"}
                                </Text>
                            </StatusOverlay>
                        )}
                    </View>

                    <View className="w-full flex-row space-x-3 gap-3 mt-4">
                        <GameButton
                            label="Leave Match"

                            onPress={() => {
                                turnIdRef.current += 1
                                setIsThinking(false)
                                state.navigateTo("MAIN_MENU")
                            }}

                            variant="secondary"
                            className="flex-1 h-12"
                        />
                        <GameButton
                            label="Reset"

                            onPress={() => {
                                const savedDiff = state.botDifficulty
                                const savedControllers = state.controllers
                                turnIdRef.current += 1
                                setIsThinking(false)
                                state.resetGame()
                                useGameStore.setState({ botDifficulty: savedDiff, controllers: savedControllers })
                                setResetNonce(prev => prev + 1)
                            }}

                            variant="primary"
                            className="px-10 h-12"
                        />
                    </View>
                </MotiView>
            )}
        </ScreenWrapper>
    )
}
