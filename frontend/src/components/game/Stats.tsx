import { View } from "react-native"
import { StatsRow } from "./StatsRow"

interface StatsProps {
    whiteTurns: number
    blackTurns: number
    whiteExtraTurns: number
    blackExtraTurns: number
    whiteEscapes: number
    blackEscapes: number
    whiteHomeRuns: number
    blackHomeRuns: number
}

export const Stats = ({
    whiteTurns,
    blackTurns,
    whiteExtraTurns,
    blackExtraTurns,
    whiteEscapes,
    blackEscapes,
    whiteHomeRuns,
    blackHomeRuns
}: StatsProps) => {
    return (
        <View className="w-full flex-col py-3 px-2 gap-y-1">
            <StatsRow
                label="Total Turns"
                whiteValue={whiteTurns}
                blackValue={blackTurns}
            />
            <StatsRow
                label="Extra Turns"
                whiteValue={whiteExtraTurns}
                blackValue={blackExtraTurns}
            />
            <StatsRow
                label="Home Escapes"
                whiteValue={whiteEscapes}
                blackValue={blackEscapes}
            />
            <StatsRow
                label="Home Runs"
                whiteValue={whiteHomeRuns}
                blackValue={blackHomeRuns}
            />
        </View>
    )
}
