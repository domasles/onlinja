import { View, Text, ActivityIndicator } from "react-native"

import { useGameStore } from "../../hooks"
import { GameRules } from "../../domain"
import { LaneRow } from "../elements"
import { Overlay } from "../layout"

interface GameBoardCardProps {
    state: ReturnType<typeof useGameStore.getState>
    isThinking: boolean
    isLocalHumanTurn: boolean
}

export const GameBoardCard = ({ state, isThinking, isLocalHumanTurn }: GameBoardCardProps) => {
    const highlightMode = useGameStore((s) => s.highlightMode)
    const totalLanes = state.isTutorialMode && state.board ? state.board.length : state.config.laneCount

    const laneIndices = Array.from({ length: totalLanes }, (_, i) => i)
    const orderedLanes = state.playerSide === "BLACK" ? laneIndices : [...laneIndices].reverse()
    const validTargets = state.selectedPiece ? GameRules.getValidTargets(state, state.selectedPiece.laneIndex) : []

    const maxIdx = totalLanes - 1
    const opponentHomeIndex = state.activePlayer === "WHITE" ? maxIdx : 0

    return (
        <View style={{ position: "relative", overflow: "hidden" }} className="w-full bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xl flex-col">
            <View>
                {orderedLanes.map((laneIdx, viewIdx) => (
                    <View key={laneIdx} className="w-full flex-col">
                        {viewIdx > 0 && (<View className="h-[1px] bg-neutral-200 w-[96%] self-center my-0.5"/>)}

                        <LaneRow
                            laneIdx={laneIdx}
                            state={state}
                            isLocalHumanTurn={isLocalHumanTurn}
                            isTargetable={validTargets.includes(laneIdx)}
                            opponentHomeIndex={opponentHomeIndex}
                            maxIdx={maxIdx}
                            highlightMode={highlightMode}
                        />
                    </View>
                ))}
            </View>

            {(state.showTurnChangeEffect && !state.isTutorialMode) && (
                <Overlay isVisible={state.showTurnChangeEffect}>
                    <View className="flex-row items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-xl border border-neutral-200/50">
                        <Text className="text-sm font-desc text-neutral-800">
                            {state.activePlayer === "WHITE" ? "White's turn" : "Black's turn"}
                        </Text>
                    </View>
                </Overlay>
            )}

            {(isThinking && !state.showTurnChangeEffect) && (
                <Overlay isVisible={isThinking}>
                    <View className="flex-row items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-xl border border-neutral-200/50">
                        <ActivityIndicator size="small" color="#262626"/>
                        <Text className="text-sm font-desc text-neutral-800">Bot thinking...</Text>
                    </View>
                </Overlay>
            )}

            {state.showExtraTurnEffect && (
                <Overlay isVisible={state.showExtraTurnEffect}>
                    <View className="bg-white w-20 h-20 rounded-full items-center justify-center border-4 border-emerald-500 shadow-md relative">
                        <View className="w-6 h-1 bg-emerald-500 rounded-full absolute"/>
                        <View className="w-1 h-6 bg-emerald-500 rounded-full absolute"/>
                    </View>
                    <Text className="text-sm font-desc text-neutral-800 bg-white px-3 py-1.5 rounded-full shadow-xl border border-neutral-200/50">
                        Extra turn awarded to player {state.activePlayer === "WHITE" ? "White" : "Black"}
                    </Text>
                </Overlay>
            )}
        </View>
    )
}
