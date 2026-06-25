---
name: ui-presentation
description: Use when compiling layout blocks, style engines, custom action controllers, lane selection overlays, dropdown menus, animations, or modal overlays.
---

# Skill: Visual Design & Presentation Components

This skill guides visual rendering inside the presentation components folder.

## Design Layout Properties
- **Theme:** Premium light, minimalist contrast (`bg-white`, `bg-neutral-50`, `text-black`).
- **Borders:** Thin line weights (`border border-neutral-200`), explicit corner radius rules (`rounded-xl`), and soft shadow effects (`shadow-sm`).
- **Typography Matrix:** Standard typography strings must map directly to raw pre-compiled global hooks (`font-logo`, `font-subheader`, `font-desc`, `font-status`, `font-score`). No inline weight synthesis variants are allowed.

## Screen & Flow State Management
- **Screen Router Navigation:** View progression relies entirely on the global store's `currentScreen` state ("MAIN_MENU" | "GAMEPLAY"). Transitioning between top-level layouts must run through the decoupled `MapsTo` controller rather than local component state variables.
- **State-Driven Mounting:** Ensure that screen-level containers cleanly unmount and clear temporary animation contexts when switching between root routes.

## Interactive Navigation & Controls
- **Dynamic Lane Highlighting:** Render contextual indicator borders or translucent overlays when a lane index matches a target coordinate in `getValidTargets()`. Use `border-amber-400` for Move 1 highlights and `border-emerald-400` for Move 2 paths.
- **Configuration Dropdown Controllers:** Menu selection structures for match configuration parameter initialization (`initializeMatch`) utilize clean custom dropdown blocks instead of native system modals. Apply flat geometric outlines (`border border-neutral-200 bg-white rounded-xl`), clean layout offsets, and dedicated selection item mapping.

## View Decomposition & Component Isolation
- **`MainMenuCard` Component Isolation:** Form selection views, game mode selectors (`"AGGRESSIVE" | "STRATEGIC"`), controller mapping switches, and state sliders are decoupled completely from root container components to ensure view presentation models stay highly modularized.
- **Pass & Play Layout State:** Form layouts hide side orientation options natively when a local human-to-human interface tab context is mounted.

## Layout Interaction Overlays
- **Token Compression:** Lanes packed to baseline limits combine tokens visually into a single node with a numeric tracking indicator (+count).
- **Extra Turn Interrupt:** When `isExtraTurnActive` triggers, a layer interceptor locks screen navigation using pointer events. Renders a translucent canvas overlay using `backdrop-blur-[4px]` around a structured notification container.
- **Transitions:** Layout alterations, piece reposition paths, and modal screens utilize standard spring engines (`LinearTransition.springify()`).
