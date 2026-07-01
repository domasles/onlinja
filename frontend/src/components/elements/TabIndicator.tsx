import { TouchableOpacity, Text } from "react-native"

interface TabIndicatorProps<T extends string> {
    activeTab: T
    targetTab: T
    label: string
    onPress: () => void
}

export const TabIndicator = <T extends string>({ activeTab, targetTab, label, onPress }: TabIndicatorProps<T>) => {
    const isActive = activeTab === targetTab

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className={`px-4 py-2.5 rounded-t-2xl border-t border-x ${
                isActive 
                    ? "bg-white border-neutral-200/80" 
                    : "bg-neutral-100 border-transparent"
            }`}
        >
            <Text
                className={`text-center text-xs uppercase tracking-wider ${
                    isActive
                        ? "text-black font-subheader-semibold"
                        : "text-neutral-400 font-subheader"
                }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    )
}
