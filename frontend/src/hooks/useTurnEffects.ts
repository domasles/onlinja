import { useEffect } from "react"
import { useGameStore } from "./useGameStore"

interface TurnEffectsParams {
    state: ReturnType<typeof useGameStore.getState>
    isGameOver: boolean
}

export const useTurnEffects = ({ state, isGameOver }: TurnEffectsParams) => {
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
}
