import { useEffect } from "react"
import { View, TouchableOpacity, Text } from "react-native"
import Animated, { LinearTransition, FadeIn, FadeOut } from "react-native-reanimated"

import { useGameStore } from "../hooks/useGameStore"
import { GameEngine } from "../domain/engine"
import { ScreenWrapper } from "./ScreenWrapper"
import { ScoreHeader } from "./ScoreHeader"
import { GameButton } from "./GameButton"
import { GameOverView } from "./GameOverView"

interface RenderItem {
    type: "SINGLE" | "MERGED"
    color: "WHITE" | "BLACK"
    count: number
    pieceId: string
    allIds: string[]
}

export const GameBoard = () => {
    const state = useGameStore()
    const scores = GameEngine.calculateScores(state.board, state.config)
    const isGameOver = GameEngine.isMatchFinished(state.board)

    const laneIndices = Array.from({ length: state.config.laneCount }, (_, i) => i)
    const orderedLanes = state.playerSide === "BLACK" ? laneIndices : [...laneIndices].reverse()
    const validTargets = state.selectedPiece ? GameEngine.getValidTargets(state, state.selectedPiece.laneIndex) : []

    const h1 = state.history.phase1
    const h2 = state.history.phase2
    const maxIdx = state.config.laneCount - 1
    const opponentHomeIndex = state.activePlayer === "WHITE" ? maxIdx : 0

    useEffect(() => {
        if (state.showExtraTurnEffect) {
            const timer = setTimeout(() => { state.clearExtraTurnEffect() }, 1500)
            return () => clearTimeout(timer)
        }
    }, [state.showExtraTurnEffect])

    return (
        <ScreenWrapper maxWidthClass="max-w-xl">
            {isGameOver ? (
                <GameOverView 
                    whiteScore={scores.whiteScore}
                    blackScore={scores.blackScore}
                    onRestart={state.resetGame}
                    onLeave={() => state.navigateTo("MAIN_MENU")}
                />
            ) : (
                <View className="w-full flex-1 relative">
                    <ScoreHeader 
                        whiteScore={scores.whiteScore}
                        blackScore={scores.blackScore}
                        currentPhase={state.currentPhase}
                        activePlayer={state.activePlayer}
                    />

                    <View 
                        style={{ position: "relative", overflow: "hidden" }}
                        className="w-full bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xl flex-col"
                    >
                        {orderedLanes.map((laneIdx, viewIdx) => {
                            const lanePieces = state.board[laneIdx]
                            const isTargetable = validTargets.includes(laneIdx)
                            const isHomeLane = laneIdx === 0 || laneIdx === maxIdx

                            let displayItems: RenderItem[] = []

                            if (isHomeLane) {
                                const rawGroups: { color: "WHITE" | "BLACK"; pieces: typeof lanePieces }[] = []

                                lanePieces.forEach(p => {
                                    const lastGroup = rawGroups[rawGroups.length - 1]

                                    if (lastGroup && lastGroup.color === p.color) {
                                        lastGroup.pieces.push(p)
                                    }

                                    else {
                                        rawGroups.push({ color: p.color, pieces: [p] })
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
                                        color: p.color,
                                        count: 1,
                                        pieceId: p.id,
                                        allIds: [p.id]
                                    })
                                })
                            }

                            let laneHighlightClass = "bg-transparent"

                            if (h1 && h1.targetLane === laneIdx) laneHighlightClass = "bg-yellow-500/10"
                            if (h2 && h2.targetLane === laneIdx) laneHighlightClass = "bg-emerald-500/10"

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
                                                const isSelectable = item.color === state.activePlayer && laneIdx !== opponentHomeIndex && hasLegalMoves

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

                        {state.showExtraTurnEffect && (
                            <Animated.View 
                                entering={FadeIn.duration(150)}
                                exiting={FadeOut.duration(300)}
                                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                                className="bg-neutral-950/10 z-50 items-center justify-center backdrop-blur-[4px]"
                                importantForAccessibility="no-hide-descendants"
                            >
                                <TouchableOpacity 
                                    activeOpacity={1}
                                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                                    onPress={(e) => e.stopPropagation()}
                                />
                                <View className="items-center justify-center gap-3 z-50">
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
                                </View>
                            </Animated.View>
                        )}
                    </View>

                    <View className="w-full flex-row space-x-3 gap-3 mt-4">
                        <GameButton 
                            label="Leave Match"
                            onPress={() => state.navigateTo("MAIN_MENU")}
                            variant="secondary"
                            className="flex-1 h-12"
                        />
                        <GameButton 
                            label="Reset"
                            onPress={state.resetGame}
                            variant="primary"
                            className="px-10 h-12"
                        />
                    </View>
                </View>
            )}
        </ScreenWrapper>
    )
}
