import { View, Text, TouchableOpacity } from "react-native"
import { MotiView, AnimatePresence } from "moti"

import { TutorialStepConfig, TutorialTextVariant } from "../utils/config"
import { GameButton } from "./GameButton"

interface TutorialCardProps {
    currentStep: TutorialStepConfig
    onNext: () => void
    onSkip: () => void
    onExitComplete?: () => void
}

const TEXT_VARIANT_STYLES: Record<TutorialTextVariant, string> = {
    small: "text-xs font-desc text-neutral-500 leading-normal",
    base: "text-base font-desc text-neutral-600 leading-relaxed",
    large: "text-2xl font-desc-medium text-neutral-800 leading-snug"
}

export const TutorialCard = ({ currentStep, onNext, onSkip, onExitComplete }: TutorialCardProps) => {
    const isInteractiveBoard = currentStep.type === "INTERACTIVE_BOARD"

    return (
        <MotiView
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 500 }}
            className="w-full bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-xl items-center z-30 overflow-hidden"
        >
            <View className="flex-row items-center space-x-2 gap-2 mb-2">
                <View className="w-6 h-6 rounded-full bg-black border border-black"/>
                <View className="w-6 h-6 rounded-full bg-white border border-neutral-300"/>
            </View>

            <View className="w-full justify-center items-center">
                <AnimatePresence exitBeforeEnter onExitComplete={onExitComplete}>
                    <MotiView
                        key={currentStep.id}
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "timing", duration: 200 }}
                        style={{ width: "100%" }}
                    >
                        <View className="w-full items-center">
                            {currentStep.showLogo && (
                                <View className="items-center w-full">
                                    <Text className="w-full text-center font-logo text-5xl text-black tracking-tight leading-tight m-5 mt-3">
                                        Onlinja
                                    </Text>
                                </View>
                            )}

                            {currentStep.title && (
                                <Text className="w-full text-sm font-subheader text-neutral-400 uppercase tracking-widest m-5 mb-3 text-center">
                                    - {currentStep.title} -
                                </Text>
                            )}

                            <View className="gap-3 px-2 w-full">
                                {currentStep.textLines.map((line, idx) => {
                                    const variant = currentStep.lineVariants?.[idx] || "base"
                                    const variantClass = TEXT_VARIANT_STYLES[variant] || TEXT_VARIANT_STYLES["base"]

                                    return (
                                        <MotiView
                                            key={`${currentStep.id}-line-${idx}`}
                                            from={{ opacity: 0, translateY: -10 }}
                                            animate={{ opacity: 1, translateY: 0 }}
                                            transition={{ type: "timing", duration: 200, delay: idx * 80 }}
                                            style={{ width: "100%" }}
                                        >
                                            <Text className={`${variantClass} text-center -mb-0.5 w-full`}>
                                                {line}
                                            </Text>
                                        </MotiView>
                                    )
                                })}
                            </View>

                            {!isInteractiveBoard && (
                                <View className="w-full mt-6 items-center">
                                    <GameButton
                                        label={currentStep.primaryButtonText}
                                        onPress={onNext}
                                        variant="primary"
                                        className="w-full h-12"
                                    />
                                </View>
                            )}

                            {currentStep.primaryButtonText !== "Finish" && (
                                <View className="w-full mt-5 items-center gap-4">
                                    <TouchableOpacity activeOpacity={0.7} onPress={onSkip}>
                                        <Text className="font-desc text-xs text-neutral-400 underline tracking-wide">
                                            Skip Tutorial
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </MotiView>
                </AnimatePresence>
            </View>
        </MotiView>
    )
}
