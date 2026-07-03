import { View, Text } from "react-native"

interface MatchStatsRowProps {
    label: string
    whiteValue: number | string
    blackValue: number | string
}

export const StatsRow = ({ label, whiteValue, blackValue }: MatchStatsRowProps) => {
    return (
        <View className="w-full flex-row items-center justify-between py-2.5 px-1 border-b border-neutral-100 last:border-b-0">
            <View className="w-16 items-center">
                <Text className="text-base font-score text-black font-semibold">
                    {whiteValue}
                </Text>
            </View>

            <View className="flex-1 bg-neutral-100/80 border border-neutral-200/40 rounded-full py-1 mx-4 items-center">
                <Text className="text-xxs font-subheader text-neutral-500 uppercase tracking-widest text-center">
                    {label}
                </Text>
            </View>

            <View className="w-16 items-center">
                <Text className="text-base font-score text-black font-semibold">
                    {blackValue}
                </Text>
            </View>
        </View>
    )
}
