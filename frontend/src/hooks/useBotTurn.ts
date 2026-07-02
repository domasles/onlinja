import { useState, useEffect, useRef } from "react"

import { BOT_PRESETS, BotAgent } from "../bot"
import { useGameStore } from "./useGameStore"

interface BotTurnParams {
    state: ReturnType<typeof useGameStore.getState>
    isBotTurn: boolean
    resetNonce: number
}

export const useBotTurn = ({ state, isBotTurn, resetNonce }: BotTurnParams) => {
    const [isThinking, setIsThinking] = useState(false)
    const turnIdRef = useRef(0)

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

    return { isThinking, turnIdRef, setIsThinking }
}
