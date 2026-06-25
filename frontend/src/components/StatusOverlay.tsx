import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { TouchableOpacity, View } from "react-native"

interface StatusOverlayProps {
    isVisible: boolean
    children: React.ReactNode
}

export const StatusOverlay = ({ isVisible, children }: StatusOverlayProps) => {
    if (!isVisible) return null

    return (
        <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(300)}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            className="bg-neutral-950/10 z-50 items-center justify-center backdrop-blur-[4px]"
            importantForAccessibility="no-hide-descendants"
        >
            <TouchableOpacity
                activeOpacity={1}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                onPress={(e) => e.stopPropagation()}
            />
            <View className="items-center justify-center gap-3 z-50">
                {children}
            </View>
        </Animated.View>
    )
}
