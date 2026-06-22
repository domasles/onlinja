import { View, TouchableOpacity } from "react-native"
import Animated, { Layout, FadeIn, FadeOut } from "react-native-reanimated"

import { useGameStore } from "../hooks/useGameStore"
import { GameEngine } from "../domain/engine"
import { ScreenWrapper } from "./ScreenWrapper"
import { ScoreHeader } from "./ScoreHeader"
import { GameButton } from "./GameButton"
import { GameOverView } from "./GameOverView"

export const GameBoard = () => {
    const state = useGameStore()
    const scores = GameEngine.calculateScores(state.board, state.config)

    const isGameOver = GameEngine.isMatchFinished(state.board)

    const laneIndices = Array.from({ length: state.config.laneCount }, (_, i) => i)
    const orderedLanes = state.playerSide === "BLACK" ? laneIndices : [...laneIndices].reverse()
    const validTargets = state.selectedPiece ? GameEngine.getValidTargets(state, state.selectedPiece.laneIndex) : []

    const h1 = state.history.phase1
    const h2 = state.history.phase2

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
                <>
                    <ScoreHeader 
                        whiteScore={scores.whiteScore}
                        blackScore={scores.blackScore}
                        currentPhase={state.currentPhase}
                        activePlayer={state.activePlayer}
                    />

                    <View className="w-full bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xl flex-col">
                        {orderedLanes.map((laneIdx, viewIdx) => {
                            const lanePieces = state.board[laneIdx]
                            const isTargetable = validTargets.includes(laneIdx)

                            let laneHighlightClass = "bg-transparent"

                            if (h1 && h1.targetLane === laneIdx) laneHighlightClass = "bg-yellow-500/10"
                            if (h2 && h2.targetLane === laneIdx) laneHighlightClass = "bg-emerald-500/10"

                            return (
                                <View key={laneIdx} className="w-full flex-col">
                                    {viewIdx > 0 && (
                                        <View className="h-[1px] bg-neutral-200 w-[96%] self-center my-0.5" />
                                    )}

                                    <TouchableOpacity 
                                        activeOpacity={0.9}
                                        onPress={() => state.selectTargetLane(laneIdx)}
                                        className={`flex-row items-center h-14 w-full px-4 rounded-xl transition-colors ${
                                            isTargetable ? "bg-neutral-50" : laneHighlightClass
                                        }`}
                                    >
                                        <View className="flex-row items-center justify-center flex-1 h-full">
                                            {lanePieces.map((piece) => {
                                                const isSelected = state.selectedPiece?.pieceId === piece.id
                                                let overlayRingStyle = ""

                                                if (isSelected) {
                                                    overlayRingStyle = "border-[4px] border-neutral-400 scale-105"
                                                }

                                                else if (h2 && h2.pieceId === piece.id) {
                                                    overlayRingStyle = "border-[3px] border-emerald-400"
                                                }

                                                else if (h1 && h1.pieceId === piece.id) {
                                                    overlayRingStyle = "border-[3px] border-amber-400"
                                                }

                                                else {
                                                    overlayRingStyle = `border-2 ${piece.color === "WHITE" ? "border-black" : "border-neutral-800"}`
                                                }

                                                return (
                                                    <Animated.View
                                                        key={piece.id}
                                                        layout={Layout.springify().damping(15).stiffness(240)}
                                                        entering={FadeIn.duration(30)}
                                                        exiting={FadeOut.duration(30)}
                                                        className="justify-center"
                                                    >
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            onPress={(e) => {
                                                                e.stopPropagation()
                                                                state.selectPiece(laneIdx, piece.id)
                                                            }}
                                                            className={`w-9 h-9 rounded-full mx-1 shadow-xl items-center justify-center ${
                                                                piece.color === "WHITE" ? "bg-white" : "bg-black"
                                                            } ${overlayRingStyle}`}
                                                        />
                                                    </Animated.View>
                                                )
                                            })}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
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
                </>
            )}
        </ScreenWrapper>
    )
}
