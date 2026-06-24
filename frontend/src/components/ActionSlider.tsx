import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated"
import { View, Text, TouchableOpacity } from "react-native"
import { useEffect } from "react"

interface ActionSliderProps<T extends string> {
    options: { label: string; value: T }[]
    selectedValue: T
    onSelect: (value: T) => void
}

export const ActionSlider = <T extends string>({ options, selectedValue, onSelect }: ActionSliderProps<T>) => {
    const activeIndex = options.findIndex(opt => opt.value === selectedValue)
    const sliderOffset = useSharedValue(0)

    useEffect(() => {
        sliderOffset.value = withTiming((activeIndex >= 0 ? activeIndex : 0) * 136, {
            duration: 150,
            easing: Easing.out(Easing.quad)
        })
    }, [activeIndex])

    const animatedSliderStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: sliderOffset.value }]
    }))

    return (
        <View className="flex-row bg-neutral-100 p-1 rounded-xl relative h-11 items-center w-[280px] self-center">
            <Animated.View 
                style={[animatedSliderStyle]} 
                className="absolute left-1 top-1 bottom-1 w-[136px] bg-black rounded-lg shadow-xl"
            />

            {options.map((opt) => (
                <TouchableOpacity 
                    key={opt.value}
                    onPress={() => onSelect(opt.value)}
                    className="w-[136px] h-full justify-center items-center z-10"
                >
                    <Text className={`text-xs font-button ${selectedValue === opt.value ? "text-white" : "text-neutral-500"}`}>
                        {opt.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}
