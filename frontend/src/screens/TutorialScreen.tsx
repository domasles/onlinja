import { useState, useEffect, useRef } from "react"
import { MotiView } from "moti"

import { GameBoardCard, TutorialCard } from "../components/cards"
import { ScreenWrapper } from "../components/layout"
import { tutorialInfo } from "../utils/config"
import { useGameStore } from "../hooks"

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
                    className="w-full mt-8"
                >
                    <GameBoardCard
                        state={state}
                        isThinking={false}
                        isLocalHumanTurn={true}
                    />
                </MotiView>
            )}
        </ScreenWrapper>
    )
}
