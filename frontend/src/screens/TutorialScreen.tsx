import { useState, useEffect, useRef } from "react"
import { MotiView } from "moti"

import { ScreenWrapper } from "../components/layout/ScreenWrapper"
import { GameBoardCard } from "../components/cards/GameBoardCard"
import { TutorialCard } from "../components/cards/TutorialCard"
import { useGameStore } from "../hooks/useGameStore"
import { tutorialInfo } from "../utils/config"

export const TutorialScreen = () => {
    const state = useGameStore()
    const currentStep = tutorialInfo[state.currentTutorialStepIdx]
    const [shouldRenderBoard, setShouldRenderBoard] = useState(false)
    const prevTypeRef = useRef(currentStep.type)

    useEffect(() => {
        if (currentStep.type !== "INTERACTIVE_BOARD" && prevTypeRef.current !== "INTERACTIVE_BOARD") {
            setShouldRenderBoard(false)
        }

        prevTypeRef.current = currentStep.type
    }, [state.currentTutorialStepIdx])

    const handleExitComplete = () => {
        if (currentStep.type === "INTERACTIVE_BOARD") {
            setShouldRenderBoard(true)
        }

        else {
            setShouldRenderBoard(false)
        }
    }

    return (
        <ScreenWrapper maxWidthClass="max-w-md">
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 200 }}
                className="w-full items-center gap-6"
            >
                <TutorialCard
                    currentStep={currentStep}
                    onNext={state.nextTutorialStep}
                    onSkip={state.exitTutorial}
                    onExitComplete={handleExitComplete}
                />

                {shouldRenderBoard && (
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}

                        animate={{
                            opacity: currentStep.type === "INTERACTIVE_BOARD" ? 1 : 0,
                            scale: currentStep.type === "INTERACTIVE_BOARD" ? 1 : 0.95
                        }}

                        transition={{ type: "timing", duration: 250 }}
                        className="w-full mt-2"
                        style={{ pointerEvents: currentStep.type === "INTERACTIVE_BOARD" ? "auto" : "none" }}
                    >
                        <GameBoardCard
                            state={state}
                            isThinking={false}
                            isLocalHumanTurn={true}
                        />
                    </MotiView>
                )}
            </MotiView>
        </ScreenWrapper>
    )
}
