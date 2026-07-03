import { GamePiece as DomainPiece, PlayerColor } from "./types"
import { RenderItem } from "../components/game"
import { tutorialInfo } from "../utils/config"
import { useGameStore } from "../hooks"

export class GameLanes {
    static groupLanePieces(
        lanePieces: DomainPiece[],
        laneIdx: number,
        maxIdx: number,
        maxCap: number
    ): RenderItem[] {
        const isHomeLane = laneIdx === 0 || laneIdx === maxIdx
        let displayItems: RenderItem[] = []

        if (isHomeLane) {
            const rawGroups: { color: PlayerColor; pieces: DomainPiece[] }[] = []

            lanePieces.forEach((p) => {
                const lastGroup = rawGroups[rawGroups.length - 1]

                if (lastGroup && lastGroup.color === p.player) {
                    lastGroup.pieces.push(p)
                }

                else {
                    rawGroups.push({ color: p.player, pieces: [p] })
                }
            })

            rawGroups.forEach((g) => {
                g.pieces.forEach((p) => {
                    displayItems.push({
                        type: "SINGLE",
                        color: g.color,
                        count: 1,
                        pieceId: p.id,
                        allIds: [p.id]
                    })
                })
            })

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
            lanePieces.forEach((p) => {
                displayItems.push({
                    type: "SINGLE",
                    color: p.player,
                    count: 1,
                    pieceId: p.id,
                    allIds: [p.id]
                })
            })
        }

        return displayItems
    }

    static determineIsSelectable(
        state: ReturnType<typeof useGameStore.getState>,
        item: RenderItem,
        laneIdx: number,
        opponentHomeIndex: number,
        hasLegalMoves: boolean,
        isLocalHumanTurn: boolean
    ): boolean {
        let isSelectable = isLocalHumanTurn && item.color === state.activePlayer && laneIdx !== opponentHomeIndex && hasLegalMoves

        if (state.isTutorialMode) {
            const currentStep = tutorialInfo[state.currentTutorialStep]

            if (currentStep && currentStep.type === "INTERACTIVE_BOARD" && currentStep.boardSetup) {
                const { allowedSourceLane, allowedPieceId } = currentStep.boardSetup

                if (state.currentMove === 1) {
                    isSelectable = laneIdx === allowedSourceLane && item.allIds.includes(allowedPieceId || "")
                }

                else {
                    if (state.gameMode === "AGGRESSIVE") {
                        isSelectable = item.allIds.includes(state.move1MovedPieceId || "") && hasLegalMoves
                    }

                    else {
                        const firstMovePieceId = state.history.move1?.pieceId
                        isSelectable = item.color === state.activePlayer && !item.allIds.includes(firstMovePieceId || "") && hasLegalMoves
                    }
                }
            }

            else {
                isSelectable = false
            }
        }

        return isSelectable
    }
}
