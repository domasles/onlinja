import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated"
import { Pressable, Text } from "react-native"
import { useEffect } from "react"

import { PlayerColor } from "../domain/engine"
import { EASE_CURVE } from "../utils/config"

export interface RenderItem {
    type: "SINGLE" | "MERGED"
    color: PlayerColor
    count: number
    pieceId: string
    allIds: string[]
}

interface GamePieceProps {
    item: RenderItem
    isSelected: boolean | null
    isSelectable: boolean
    overlayRingStyle: string
    onPress: (e: any) => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const GamePiece = ({ item, isSelected, isSelectable, overlayRingStyle, onPress }: GamePieceProps) => {
    const scale = useSharedValue(1)

    const squishStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }))

    const triggerSquish = () => {
        scale.value = withSequence(
            withTiming(0.95, { duration: 90, easing: EASE_CURVE }),
            withTiming(1, { duration: 110, easing: EASE_CURVE })
        )
    }

    useEffect(() => {
        if (isSelected) {
            triggerSquish()
        }
    }, [isSelected])

    const handlePress = (e: any) => {
        triggerSquish()
        onPress(e)
    }

    return (
        <AnimatedPressable
            disabled={!isSelectable}
            onPress={handlePress}
            style={[squishStyle]}

            className={`w-9 h-9 rounded-full mx-1 shadow-xl items-center justify-center ${
                item.color === "WHITE" ? "bg-white" : "bg-black"
            } ${overlayRingStyle}`}
        >
            {item.type === "MERGED" && (
                <Text className={`font-label text-xs ${item.color === "WHITE" ? "text-neutral-900" : "text-white"}`}>
                    +{item.count}
                </Text>
            )}
        </AnimatedPressable>
    )
}