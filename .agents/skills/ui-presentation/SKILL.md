---
name: ui-presentation
description: Use when compiling layout blocks, style engines, custom action controllers, lane selection overlays, dropdown menus, animations, or modal overlays.
---

# Skill: Visual Design & Presentation Components

This skill guides visual rendering inside the presentation components folder.

## Design Layout Properties
- **Theme:** Premium light, minimalist contrast (`bg-white`, `bg-neutral-50`, `text-black`).
- **Borders:** Thin line weights (`border border-neutral-200`), explicit corner radius rules (`rounded-xl`), and soft shadow effects (`shadow-sm`).
- **Typography Matrix:** Standard typography strings must map directly to raw pre-compiled global hooks (`font-logo`, `font-subheader`, `font-subheader-semibold`, `font-desc`, `font-desc-medium`, `font-score`, `font-status`, `font-label`). No inline weight synthesis variants are allowed.

## Screen & Flow State Management
- **Screen Router Navigation:** View progression relies entirely on the global store's `currentScreen` state `"MAIN_MENU" | "TUTORIAL" | "GAMEPLAY"`. Transitioning between top-level layouts runs through the `navigateTo()` action in the store.
  - **Player Onboarding Flow:** Tutorial status is checked on app initialization via `startTutorial()` action in the store. It checks whether `onlinja_tutorial_completed` flag is set in AsyncStorage. The exact stage of the tutorial is determined by `currentTutorialStep` state which ensures that even if the app crashes, the tutorial can resume from the last saved point. Tutorial is configured via the main config file with the following parameters:
    ```typescript
    export interface TutorialStepConfig {
        id: string
        type: "TEXT_ONLY" | "INTERACTIVE_BOARD"
        showLogo: boolean
        title?: string
        textLines: string[]
        lineVariants?: TutorialTextVariant[]
        primaryButtonText: "Next" | "Finish"
        gameMode: "AGGRESSIVE" | "STRATEGIC"
        boardSetup?: {
            board: GamePiece[][]
            activePlayer: PlayerColor
            playerSide: PlayerColor
            allowedSourceLane?: number
            allowedPieceId?: string
        }
    }
    ```
- **State-Driven Mounting:** Ensure that screen-level containers cleanly unmount and clear temporary animation contexts when switching between root routes.

## Interactive Navigation & Controls
- **Dynamic Lane Highlighting:** Render contextual indicator backgrounds when a lane index matches a target coordinate in `getValidTargets()`. Use `bg-yellow-500/10` for Move 1 highlights (origin lane), `bg-emerald-500/10` for Move 2 paths (second move origin), and `bg-neutral-100` for valid target lanes.
- **Tryout Mode in Tutorial:** The tutorial screen features an interactive way to try the game out with pre-configured board states. It displays a simplified `GameBoardCard` component without the score header and `Leave`/`Reset` buttons. The board is fully interactive, allowing the user to select pieces and move them according to the tutorial's current step configuration.
- **Configuration Dropdown Controllers:** Menu selection structures for match configuration parameter initialization (`initializeMatch`) utilize clean custom dropdown blocks instead of native system modals. Apply flat geometric outlines (`border border-neutral-200 bg-white rounded-xl`), clean layout offsets, and dedicated selection item mapping.
- **Animation & Transition Effects:** All layout transitions, modal popups, and lane selection overlays utilize the `EASE_CURVE` easing function defined in `config.ts` (bezier curve: `0.25, 0.1, 0.25, 1`). This easing curve is applied consistently across all `GameBoardCard` and `StatusOverlay` transitions using `LinearTransition.easing(EASE_CURVE).duration()`.

## View Decomposition & Component Isolation
- **`MainMenuCard` Component Isolation:** Form selection views, game mode selectors (`"AGGRESSIVE" | "STRATEGIC"`), controller mapping switches, and state sliders are decoupled completely from root container components to ensure view presentation models stay highly modularized.
- **"VS Friend" Layout State:** When the "LOCAL" tab is active, the side orientation options are hidden (the entire bot difficulty dropdown is hidden via conditional rendering in `MainMenuCard`).

## Layout Interaction Overlays
- **Token Compression:** Lanes packed to baseline limits combine tokens visually into a single node with a numeric tracking indicator (+count).
- **Extra Turn Interrupt:** When `isExtraTurnActive` triggers, a layer interceptor locks screen navigation using pointer events. Renders a translucent canvas overlay using `backdrop-blur-[4px]` around a structured notification container.
- **Transitions:** Layout alterations, piece reposition paths, and modal screens utilize the consistent `EASE_CURVE` easing function defined in `config.ts`.

## Tab System Architecture
- **TabIndicator Component:** Individual tab triggers with active state management. Uses `bg-white border-neutral-200/80` for active tabs and `bg-neutral-100 border-transparent` for inactive tabs. Active tabs use `text-black font-subheader-semibold` while inactive use `text-neutral-400 font-subheader`. Handles press events through `onPress` callback.
- **TabWrapper Component:** Container for tab content with mount animations and height management. Supports `isFirstLoad` prop for initial animation control and `onMountComplete` callback for animation completion. Height is configurable via `height` prop.
- **Tab Navigation Logic:** Three main tabs (`BotTab`, `FriendsTab`, `SettingsTab`) manage game configuration. Tabs communicate with global store through `currentScreen` state. Bot difficulty dropdown is conditionally hidden when "LOCAL" tab is active.

## Game Statistics Display
- **Stats Component:** Central game statistics display showing turns, extra turns, escapes, and home runs. Uses `StatsRow` subcomponents for individual stat display. Primarily used in `GameOverCard` for post-match statistics review.
- **StatsRow Component:** Individual stat row with white and black player values. Features label in middle with `font-subheader text-neutral-500`. White and black values use `font-score text-black font-semibold`. Responsive layout with proper spacing and borders.
- **Statistics Placement:** Stats displayed in `GameOverCard` as expandable section below match results. Provides comprehensive post-match analysis including turn counts, extra turns, escapes, and home runs.

## Turn Indication Overlay
- **Turn Change Animations:** Visual feedback for turn transitions using `Overlay` component with `EASE_CURVE` animations. Move 1 highlights use `bg-yellow-500/10`, Move 2 paths use `bg-emerald-500/10`, valid targets use `bg-neutral-100`.
- **Post-Turn Indicators:** After turn completion, displays move results and updates game state. Shows piece movements and lane occupancy changes with smooth transitions.
- **Extra Turn Visuals:** When `isExtraTurnActive` triggers, renders translucent overlay with `backdrop-blur-[4px]` and structured notification container. Locks screen navigation during extra turn processing.
- **Move Validation Feedback:** Real-time visual highlighting of legal moves based on `getValidTargets()` results. Provides immediate user feedback during piece selection and movement.

## Component Integration
- **GameBoardCard:** Main game board component with lane rows, turn change overlays, bot thinking indicators, and extra turn effects
- **GameHeader:** Score display and turn information (Move X - Player's Turn)
- **GameFooter:** Restart and leave match controls
- **LaneRow:** Individual lane display with piece visualization and highlighting
- **Overlay:** Generic overlay component used for turn changes, bot thinking, and extra turns
- **Stats:** Game statistics display used primarily in `GameOverCard`
- **TabIndicator:** Individual tab components for main menu navigation
- **TabWrapper:** Container for tab content with mount animations
- **ActionSlider:** Configuration options for game mode, side selection, and bot difficulty
- **GameButton:** Primary and secondary action buttons throughout the application

## Component Dependencies
- **Stats** depends on `StatsRow` for individual stat display
- **GameBoardCard** integrates `LaneRow`, `Overlay`, and game state management
- **GameOverCard** combines score display, action buttons, and expandable statistics
- **Tab components** work together with global store for navigation and configuration
- **Overlay** is reused across multiple components for consistent visual feedback
