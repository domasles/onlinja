import { GamePiece, PlayerColor } from "../domain"

export type TutorialTextVariant = "small" | "base" | "large"

export interface TutorialStepConfig {
    id: string
    type: "TEXT_ONLY" | "INTERACTIVE_BOARD"
    showLogo: boolean
    title?: string
    textLines: string[]
    lineVariants?: TutorialTextVariant[]
    primaryButtonText: "Next" | "Finish" | "Try it out"
    gameMode: "AGGRESSIVE" | "STRATEGIC"
    boardSetup?: {
        board: GamePiece[][]
        activePlayer: PlayerColor
        playerSide: PlayerColor
        allowedSourceLane?: number
        allowedPieceId?: string
    }
}

const makePieces = (player: PlayerColor, count: number, startIdOffset: number): GamePiece[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `tut-p-${startIdOffset + i}-${player}`,
        player
    }))
}

export const tutorialInfo: TutorialStepConfig[] = [
    {
        id: "intro",
        type: "TEXT_ONLY",
        showLogo: true,
        textLines: [
            "Hello, and welcome to Onlinja!",
            "Your favourite abstract game, everytime and everywhere!",
            "Let's show you around."
        ],
        lineVariants: ["large", "base", "small"],
        primaryButtonText: "Next",
        gameMode: "STRATEGIC"
    },
    {
        id: "rules_header",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "The Basics",
        lineVariants: ["large"],
        textLines: [
            "First of all, you should learn some rules."
        ],
        primaryButtonText: "Next",
        gameMode: "STRATEGIC"
    },
    {
        id: "rules_intro",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "The Basics",
        lineVariants: ["large", "base", "base", "small"],
        textLines: [
            "The board consists of 8 lanes.",
            "Your must race your pieces to the opponent's home base first.",
            "Game ends when all white pieces surpass all black pieces, or vice versa.",
            "*White starts first, pieces move forward. Always."
        ],
        primaryButtonText: "Next",
        gameMode: "STRATEGIC"
    },
    {
        id: "modes_intro",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "Game Modes",
        lineVariants: ["large", "base"],
        textLines: [
            "In Onlinja there are 2 modes. Aggressive and Strategic.",
            "You'll start with aggressive mode in a simplified board to understand the fundamentals."
        ],
        primaryButtonText: "Next",
        gameMode: "AGGRESSIVE"
    },
    {
        id: "aggressive_rules",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "Aggressive Mode Rules",
        lineVariants: ["large", "base", "base", "base", "base"],
        textLines: [
            "Rules are simple:",
            "During your turn, you have to make 2 moves.",
            "Select a piece and note the amount of pieces in highlighted lane.",
            "Move your chosen piece to that lane.",
            "Remember the piece count? That's how much lanes your piece must advance the second time!"
        ],
        primaryButtonText: "Next",
        gameMode: "AGGRESSIVE"
    },
    {
        id: "lane_highlighting_tips",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "Lane Highlighting",
        lineVariants: ["large", "base", "base", "base", "base"],
        textLines: [
            "The board helps you out!",
            "You don't need to count moves yourself. It highlights the lanes!",
            "A lane is highlighted gray when you select a piece. This hints where you can move it.",
            "Yellow highlights where the first piece was moved from.",
            "Green indicates your second move's starting point.",
        ],
        primaryButtonText: "Try it out",
        gameMode: "AGGRESSIVE"
    },
    {
        id: "aggressive_demo",
        type: "INTERACTIVE_BOARD",
        showLogo: false,
        title: "Try Aggressive Mode",
        lineVariants: ["large", "base", "small"],
        textLines: [
            "Select your White piece on the 1st lane. Move it up one lane.",
            "Lane 2 contains 2 pieces, so your second move forces that SAME piece forward by two lanes!",
            "Select the same piece again and complete your turn."
        ],
        primaryButtonText: "Next",
        gameMode: "AGGRESSIVE",
        boardSetup: {
            activePlayer: "WHITE",
            playerSide: "WHITE",
            allowedSourceLane: 0,
            allowedPieceId: "tut-p-100-WHITE",
            board: [
                [{ id: "tut-p-100-WHITE", player: "WHITE" }],
                makePieces("BLACK", 2, 10),
                [],
                makePieces("BLACK", 5, 20)
            ]
        }
    },
    {
        id: "strategic_rules",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "Strategic Mode Rules",
        lineVariants: ["large", "base", "base", "base"],
        textLines: [
            "In Strategic Mode, the distance math remains exactly the same.",
            "However, your second move MUST be performed using a completely different piece.",
            "This spreads your power out dynamically across the field."
        ],
        primaryButtonText: "Try it out",
        gameMode: "STRATEGIC"
    },
    {
        id: "strategic_demo",
        type: "INTERACTIVE_BOARD",
        showLogo: false,
        title: "Try Strategic Mode",
        lineVariants: ["large", "base", "base"],
        textLines: [
            "Move your piece at Lane 1 forward.",
            "Because this is Strategic Mode, choose any OTHER piece to make the second move!"
        ],
        primaryButtonText: "Next",
        gameMode: "STRATEGIC",
        boardSetup: {
            activePlayer: "WHITE",
            playerSide: "WHITE",
            allowedSourceLane: 0,
            allowedPieceId: "tut-p-200-WHITE",
            board: [
                [{ id: "tut-p-200-WHITE", player: "WHITE" }],
                makePieces("WHITE", 2, 30),
                [],
                makePieces("BLACK", 5, 40)
            ]
        }
    },
    {
        id: "scoring_rules",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "Score Counting",
        lineVariants: ["large", "base", "base", "base"],
        textLines: [
            "There would be no purpose without points.",
            "Each piece is worth 0, 1, 2, 3, or 5 points.",
            "If a piece stands in the opponent's home base, it's worth the maximum.",
            "Lane below opponent's home awards you 3 points, then 2, then 1, and finally 0 for any lane below."
        ],
        primaryButtonText: "Next",
        gameMode: "STRATEGIC"
    },
    {
        id: "jumping_rules",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "Lanes Capacity & Jumping",
        lineVariants: ["large", "base", "base"],
        textLines: [
            "Non-home lanes have a strict maximum capacity of 6 pieces.",
            "If your move distance forces a piece to land precisely on a full lane...",
            "The piece completely leaps over, directly into the next non-full lane!"
        ],
        primaryButtonText: "Try it out",
        gameMode: "STRATEGIC"
    },
    {
        id: "jumping_demo",
        type: "INTERACTIVE_BOARD",
        showLogo: false,
        title: "Try Jumping Over a Full Lane",
        lineVariants: ["large", "base", "small"],
        textLines: [
            "Try to move your piece at Lane 1 forward.",
            "Lane 2 has 6 pieces, so you'll be forced to jump over it.",
            "*This works with both moves of a turn."
        ],
        primaryButtonText: "Next",
        gameMode: "STRATEGIC",
        boardSetup: {
            activePlayer: "WHITE",
            playerSide: "WHITE",
            allowedSourceLane: 0,
            allowedPieceId: "tut-p-300-WHITE",
            board: [
                [{ id: "tut-p-300-WHITE", player: "WHITE" }],
                makePieces("BLACK", 6, 50),
                [],
                makePieces("BLACK", 3, 60)
            ]
        }
    },
    {
        id: "empty_lane_rules",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "Empty Lane Bonus",
        lineVariants: ["large", "base", "base", "small"],
        textLines: [
            "Here is a powerful secret strategy:",
            "If your SECOND move of a turn lands in an empty lane...",
            "You are immediately awarded an extra turn!",
            "*You can only get one extra turn per round."
        ],
        primaryButtonText: "Next",
        gameMode: "STRATEGIC"
    },
    {
        id: "extra_rules",
        type: "TEXT_ONLY",
        showLogo: false,
        title: "Extra rules",
        lineVariants: ["large", "base"],
        textLines: [
            "One last thing:",
            "If your first move ended on a lane with 0 pieces or the opponent's home base, your turn is over."
        ],
        primaryButtonText: "Next",
        gameMode: "STRATEGIC"
    },
    {
        id: "outro",
        type: "TEXT_ONLY",
        showLogo: true,
        lineVariants: ["large", "base", "small"],
        textLines: [
            "You are now ready to dominate the board!",
            "Play against our competitive training bots or grab a friend!",
            "Good luck! You'll need it ;)"
        ],
        primaryButtonText: "Finish",
        gameMode: "STRATEGIC"
    }
]
