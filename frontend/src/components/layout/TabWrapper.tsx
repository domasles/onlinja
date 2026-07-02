import { ReactNode, useRef } from "react"
import { View } from "react-native"
import { MotiView } from "moti"

interface TabWrapperProps {
    children: ReactNode
    height: number
    isFirstLoad?: boolean
    onMountComplete?: () => void
}

export const TabWrapper = ({ children, height, isFirstLoad = false, onMountComplete }: TabWrapperProps) => {
    const isOpening = useRef(true)

    return (
        <View className="w-full mb-6">
            <MotiView
                from={{
                    opacity: isFirstLoad ? 1 : 0,
                    height: isFirstLoad ? height : 0
                }}

                animate={{ opacity: 1, height }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "timing", duration: 300 }}
                style={{ width: "100%" }}

                onDidAnimate={(prop, finished) => {
                    if (prop === "height" && finished && isOpening.current) {
                        onMountComplete?.()
                        isOpening.current = false
                    }
                }}
            >
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, height }}>
                    {children}
                </View>
            </MotiView>
        </View>
    )
}
