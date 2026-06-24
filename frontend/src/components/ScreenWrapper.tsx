import { View } from "react-native"
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
            <View className={`w-full ${maxWidthClass} z-10 flex-col items-center`}>
                {children}
            </View>
        </View>
    )
}
