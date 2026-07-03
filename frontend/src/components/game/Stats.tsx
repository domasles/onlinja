import { View } from "react-native"
import { StatsRow } from "./StatsRow"

interface StatsProps {
    whiteMoves: number
    blackMoves: number
    whiteExtraTurns: number
    blackExtraTurns: number
    whiteHomeRuns: number
    blackHomeRuns: number
}

export const Stats = ({
    whiteMoves,
    blackMoves,
    whiteExtraTurns,
    blackExtraTurns,
    whiteHomeRuns,
    blackHomeRuns
}: StatsProps) => {
    return (
        <View className="w-full flex-col py-3 px-2 gap-y-1">
            <StatsRow
                label="Total Moves"
                whiteValue={whiteMoves}
                blackValue={blackMoves}
            />
            <StatsRow
                label="Extra Turns"
                whiteValue={whiteExtraTurns}
                blackValue={blackExtraTurns}
            />
            <StatsRow
                label="Home Runs"
                whiteValue={whiteHomeRuns}
                blackValue={blackHomeRuns}
            />
        </View>
    )
}
