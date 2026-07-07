import { View, LayoutChangeEvent } from "react-native"
import { ReactNode, useRef, useState } from "react"
import { MotiView } from "moti"

interface TabWrapperProps {
    children: ReactNode
    isFirstLoad?: boolean
    onMountComplete?: () => void
}

export const TabWrapper = ({ children, isFirstLoad = false, onMountComplete }: TabWrapperProps) => {
    const isOpening = useRef(true)
    const [measuredHeight, setMeasuredHeight] = useState<number | null>(null)

    const handleLayout = (event: LayoutChangeEvent) => {
        if (measuredHeight === null) {
            const { height } = event.nativeEvent.layout

            if (height > 0) {
                setMeasuredHeight(height)
            }
        }
    }

    return (
        <View className="w-full">
            {measuredHeight === null && (
                <View onLayout={handleLayout} style={{ position: "absolute", opacity: 0, width: "100%" }}>
                    {children}
                </View>
            )}

            {measuredHeight !== null && (
                <MotiView
                    from={{
                        opacity: isFirstLoad ? 1 : 0,
                        height: isFirstLoad ? measuredHeight : 0
                    }}

                    animate={{ opacity: 1, height: measuredHeight }}
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
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: measuredHeight }}>
                        {children}
                    </View>
                </MotiView>
            )}
        </View>
    )
}
