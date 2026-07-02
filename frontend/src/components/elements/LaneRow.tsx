import { View, TouchableOpacity } from "react-native"

import { GameLanes, GameRules } from "../../domain"
import { GamePiece } from "../game/GamePiece"
import { useGameStore } from "../../hooks"

interface LaneRowProps {
    laneIdx: number
    state: ReturnType<typeof useGameStore.getState>
    isLocalHumanTurn: boolean
    isTargetable: boolean
    opponentHomeIndex: number
    maxIdx: number
    highlightMode: string
}

export const LaneRow = ({
    laneIdx,
    state,
    isLocalHumanTurn,
    isTargetable,
    opponentHomeIndex,
    maxIdx,
    highlightMode
}: LaneRowProps) => {
    const lanePieces = state.board[laneIdx] || []
    const displayItems = GameLanes.groupLanePieces(lanePieces, laneIdx, maxIdx, state.config.maxLaneCapacity)

    const h1 = state.history.move1
    const h2 = state.history.move2

    let laneHighlightClass = "bg-white"

    if (highlightMode === "YES") {
        if (h1 && h1.originLane === laneIdx) laneHighlightClass = "bg-yellow-500/10"
        if (h2 && h2.originLane === laneIdx) laneHighlightClass = "bg-emerald-500/10"
    }

    if (isTargetable) laneHighlightClass = "bg-neutral-100"

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => state.selectTargetLane(laneIdx)}
            className={`flex-row items-center h-14 w-full px-4 rounded-xl ${laneHighlightClass}`}
        >
            <View className="flex-row items-center justify-center flex-1 h-full">
                {displayItems.map((item) => {
                    const isSelected = !!(state.selectedPiece && item.allIds.includes(state.selectedPiece.pieceId))
                    const activeId = isSelected ? state.selectedPiece!.pieceId : item.pieceId

                    const virtualState = { ...state, selectedPiece: { laneIndex: laneIdx, pieceId: activeId } }
                    const hasLegalMoves = GameRules.getValidTargets(virtualState, laneIdx).length > 0

                    const isSelectable = GameLanes.determineIsSelectable(state, item, laneIdx, opponentHomeIndex, hasLegalMoves, isLocalHumanTurn)

                    const overlayRingStyle = isSelected
                        ? "border-[4px] border-neutral-400 scale-full"
                        : highlightMode === "YES" && item.allIds.some(id => h2 && h2.pieceId === id)
                        ? "border-[3px] border-emerald-400"
                        : highlightMode === "YES" && item.allIds.some(id => h1 && h1.pieceId === id)
                        ? "border-[3px] border-amber-400"
                        : `border-2 ${item.color === "WHITE" ? "border-black" : "border-neutral-800"}`

                    return (
                        <GamePiece
                            key={item.pieceId}
                            item={item}
                            isSelected={isSelected}
                            isSelectable={isSelectable}
                            overlayRingStyle={overlayRingStyle}

                            onPress={(e) => {
                                e.stopPropagation()
                                state.selectPiece(laneIdx, activeId)
                            }}
                        />
                    )
                })}
            </View>
        </TouchableOpacity>
    )
}
