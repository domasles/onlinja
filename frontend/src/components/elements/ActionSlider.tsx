import Animated, { useAnimatedStyle, useDerivedValue, withTiming, Easing } from "react-native-reanimated"
import { View, Text, TouchableOpacity } from "react-native"
import { useState } from "react"

interface ActionSliderProps<T extends string> {
    options: { label: string; value: T }[]
    defaultValue?: T
    className?: string
    onChange?: (value: T) => void
}

export const ActionSlider = <T extends string>({ options, defaultValue, className = "", onChange }: ActionSliderProps<T>) => {
    const [selectedValue, setSelectedValue] = useState<T>(defaultValue ?? options[0].value)

    const activeIndex = options.findIndex(opt => opt.value === selectedValue)
    const validIndex = activeIndex >= 0 ? activeIndex : 0

    const sliderOffset = useDerivedValue(() => {
        return withTiming(validIndex * 100, {
            duration: 150,
            easing: Easing.out(Easing.quad)
        })
    }, [validIndex])

    const animatedSliderStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: `${sliderOffset.value}%` }]
    }))

    const handlePress = (value: T) => {
        setSelectedValue(value)
        onChange?.(value)
    }

    return (
        <View className={`flex-row bg-neutral-100 p-1 rounded-xl relative h-11 items-center ${className}`}>
            <Animated.View
                style={[animatedSliderStyle]}
                className="absolute left-1 top-1 bottom-1 w-1/2 bg-black rounded-lg shadow-xl"
            />

            {options.map((opt) => (
                <TouchableOpacity
                    key={opt.value}
                    activeOpacity={1}
                    onPress={() => handlePress(opt.value)}
                    className="flex-1 h-full justify-center items-center"
                >
                    <Text className={`text-xs font-button ${selectedValue === opt.value ? "text-white" : "text-neutral-500"}`}>
                        {opt.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}
