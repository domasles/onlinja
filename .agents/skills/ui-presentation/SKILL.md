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
- **Screen Router Navigation:** View progression relies entirely on the global store's `currentScreen` state `"MAIN_MENU" | "TUTORIAL" | "GAMEPLAY"`. Transitioning between top-level layouts must run through the decoupled `MapsTo` controller rather than local component state variables.
- **Player Onboarding Flow:** `startTutorial` boolean state must be checked on app initialization to determine whether to route the user to `"TUTORIAL"` or `"MAIN_MENU"` screens. This state is set via the `checkTutorialStatus()` method. It checks whether `onlinja_tutorial_completed` flag is set in AsyncStorage. Tutorial is configured via the main config file with the following parameters:
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
- **Dynamic Lane Highlighting:** Render contextual indicator borders or translucent overlays when a lane index matches a target coordinate in `getValidTargets()`. Use `border-amber-400` for Move 1 highlights and `border-emerald-400` for Move 2 paths.
- **Tryout Mode in Tutorial:** The tutorial screen must feature an interactive way to try the game out with pre-configured board states. It must display a simplified `GameBoardCard` component without the score header and `Leave`/`Reset` buttons. The board must be fully interactive, allowing the user to select pieces and move them according to the tutorial's current step configuration.
- **Configuration Dropdown Controllers:** Menu selection structures for match configuration parameter initialization (`initializeMatch`) utilize clean custom dropdown blocks instead of native system modals. Apply flat geometric outlines (`border border-neutral-200 bg-white rounded-xl`), clean layout offsets, and dedicated selection item mapping.
- **Animation & Transition Effects:** All layout transitions, modal popups, and lane selection overlays must utilize spring-based animation engines (`LinearTransition.springify()`) or zoom/fade parameter modifications with a consistent easing curve across all `GameBoard` and `StatusOverlay` transitions, defined within the main config file. Using the easing curve anywhere else is prohibited.

## View Decomposition & Component Isolation
- **`MainMenuCard` Component Isolation:** Form selection views, game mode selectors (`"AGGRESSIVE" | "STRATEGIC"`), controller mapping switches, and state sliders are decoupled completely from root container components to ensure view presentation models stay highly modularized.
- **Pass & Play Layout State:** Form layouts hide side orientation options natively when a local human-to-human interface tab context is mounted.

## Layout Interaction Overlays
- **Token Compression:** Lanes packed to baseline limits combine tokens visually into a single node with a numeric tracking indicator (+count).
- **Extra Turn Interrupt:** When `isExtraTurnActive` triggers, a layer interceptor locks screen navigation using pointer events. Renders a translucent canvas overlay using `backdrop-blur-[4px]` around a structured notification container.
- **Transitions:** Layout alterations, piece reposition paths, and modal screens utilize standard spring engines (`LinearTransition.springify()`).
