import { View } from "react-native"
import { MotiView } from "moti"
import React from "react"

import { BackgroundMatrix } from "./BackgroundMatrix"

interface ScreenWrapperProps {
    children: React.ReactNode
    maxWidthClass?: string
}

export const ScreenWrapper = ({ children, maxWidthClass = "max-w-xl" }: ScreenWrapperProps) => {
    return (
        <View className="flex-1 justify-center items-center bg-neutral-50 p-6 relative">
            <BackgroundMatrix/>

            <MotiView
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 250 }}
                className={`w-full ${maxWidthClass} flex-col items-center`}
            >
                {children}
            </MotiView>
        </View>
    )
}
