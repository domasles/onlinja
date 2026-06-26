import Animated, { ZoomIn, ZoomOut, FadeIn, FadeOut } from "react-native-reanimated"
import { TouchableOpacity } from "react-native"
import React from "react"

import { EASE_CURVE } from "../utils/config"

interface StatusOverlayProps {
    isVisible: boolean
    children: React.ReactNode
}

export const StatusOverlay = ({ isVisible, children }: StatusOverlayProps) => {
    if (!isVisible) return null

    return (
        <Animated.View
            entering={FadeIn.easing(EASE_CURVE).duration(250)}
            exiting={FadeOut.easing(EASE_CURVE).duration(200)}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            className="bg-neutral-950/10 z-50 items-center justify-center backdrop-blur-[4px]"
            importantForAccessibility="no-hide-descendants"
        >
            <TouchableOpacity
                activeOpacity={1}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                onPress={(e) => e.stopPropagation()}
            />
            <Animated.View
                entering={ZoomIn.easing(EASE_CURVE).duration(250)}
                exiting={ZoomOut.easing(EASE_CURVE).duration(200)}
                className="items-center justify-center gap-3 z-50"
            >
                {children}
            </Animated.View>
        </Animated.View>
    )
}
