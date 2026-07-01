import { TurnAction } from "./minimax"

export class Humanizer {
    public static blunder(actions: TurnAction[], optimal: TurnAction, blunderRate: number): TurnAction {
        if (actions.length <= 1 || Math.random() > blunderRate) return optimal

        const remaining = actions.filter((act) => act !== optimal)
        const randomIdx = Math.floor(Math.random() * remaining.length)

        return remaining[randomIdx]
    }
}
