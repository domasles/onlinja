# Project Specification & Architecture: Onlinja

Onlinja is an online, turn-based multiplayer implementation of the tactical board game **Linja**. Built for seamless mobile and web deployment using an optimized, decoupled frontend architecture running on React Native (Expo) and a scalable asynchronous backend running on Python (FastAPI).

---

## Tech Stack & Dependencies

### Frontend (Client-Side)
- **Core Framework:** React Native built using Expo (Universal cross-platform development environment)
- **State Management:** Zustand (Global store handling networking transitions, user metadata, and fallback session persistence)
- **Styling Layer:** NativeWind (Tailwind CSS engine optimized for native styling runtimes via Metro)
- **Bundler Configuration:** Metro Bundler (Universal platform compilation target covering mobile and web engines)

### Backend (Server-Side)
* **Service Framework:** Python FastAPI
* **Realtime Protocol:** Asynchronous WebSockets

### Deployment & DevOps
- **Infrastructure Containerization:** Docker (For both frontend and backend services with optimized multi-stage builds)

---

## Architectural Division & Rules

You must follow an uncompromising **Separation of Concerns (SoC)** approach. Global single-file monolithic layouts are forbidden. Split the client codebase into the following explicit directory boundaries:

```architecture
onlinja/
├── backend/   # FastAPI WebSocket Server (Matchmaking & Routing)
└── frontend/  # Expo React Native App (Game Engine & UI)
    └─── src/
        ├── bot/         # Autonomous Bot Logic (Pure algorithmic layer)
        ├── components/  # Presentation Components
        ├── domain/      # Game Domain Logic (Rules for players and bots to follow)
        ├── hooks/       # React Hooks & Zustand Store (State management orchestrator)
        └── utils/       # Utility Functions & Helpers
```

### 1. Game Domain & Simulation Engine (`/frontend/src/domain/`)
- **Purpose:** The core state machine of Linja. It defines the mathematical grid, piece coordinates, validation primitives, and pure turn-transition logic for players and bots to follow.
- **Constraints:** Completely stateless and execution-context agnostic. It operates strictly via pure functions: `(CurrentState, Action) => NextState`. It contains zero React hooks, zero network variables, and zero UI constructs.

### 2. Autonomous Bot Logic (`/frontend/src/bot/`)
- **Purpose:** A deterministic, frontend-executable autonomous bot written in pure algorithmic TypeScript.
- **Constraints:** Isolated domain consumer. It accepts a raw state snapshot from the Domain module, calculates move utility weights entirely on the client thread, and returns an action payload. It has no knowledge of whether the game is online or offline.

### 3. State Management & Hooks (`/frontend/src/hooks/`)
- **Purpose:** React hooks and Zustand stores serving as the application state management orchestrator. It manages view-state reactivity, player actions, websocket streaming events, and the fallback engine logic.
- **Network Failback Strategy:** If a connection drop or handshake timeout is detected, the store hot-swaps the input stream—intercepting opponent action requests and routing them to the local `/frontend/src/bot/` module instead of the WebSocket pipeline. The rendering layer remains completely unaware of this switch.

### 4. Presentation Components (`/frontend/src/components/`)
- **Purpose:** Atomic UI layout components (`Grid.tsx`, `Piece.tsx`, `ScoreBoard.tsx`) styled via NativeWind.
- **Constraints:** Dumb presentation blocks. They read layout frames directly from the state store and emit user intent upward. They contain zero game logic or network management code.

### 5. Utility Functions & Helpers (`/frontend/src/utils/`)
- **Purpose:** Shared purely functional helper blocks, mathematical tools, or configuration constants utilized across the frontend application.

### 6. Backend Match Coupling Service (`/backend/`)
- **Purpose:** A lightweight, asynchronous FastAPI WebSocket server acting strictly as a match discovery and message relay system.
- **Constraints:** The backend does not compute or maintain long-term game state. It authenticates sockets, manages active concurrent room matrices, pair-matches players, and pipes action frames symmetrically between paired clients.

---

## Strict Code Style Rules

You must align your generation algorithms perfectly with this precise format. Deviations are rejected.

### 1. Spacing & Indentation
- **Indentation:** Exactly 4 spaces per tab level. No 2-space offsets.
- **Component Wrapping:** Zero spaces inside self-closing component envelopes. Use `<App/>` and `<View/>` instead of `<App />` or `<View />`.

### 2. Comments
- **Rule:** Do not write comments under any circumstances unless explaining a highly dense, non-obvious mathematical formula or board algorithm anomaly. Strip out generic structural or helper text.

### 3. Structural Newlines & Padding
- **Small Code Blocks (<= 2 lines):** Do not insert internal blank lines inside the brackets or flow.
- **Larger Functional Blocks (>= 3 lines):** You must precede statement blocks with an empty newline.
- **Control Flow Padding:** Always append an empty newline immediately before statements using keywords like `if`, `else`, `return`, `function`, `const`, or `let` when part of a larger composition (for small code blocks this does not apply, as stated above).
- **Variable Configurations:** If a function registers a block of calculations or declarations exceeding 5 lines, group them cleanly using explicit line breaks according to data type or functional destination.
- **Trailing Newline:** Always end files with a single newline character. No more, no less.

### 4. Naming Conventions
- **Variables & Functions:** Use camelCase for all variable and function names (e.g., `calculateMoveUtility`).
- **Components:** Use PascalCase for all React component names (e.g., `GameBoard`).
- **Constants:** Use UPPER_SNAKE_CASE for all constant values (e.g., `MAX_PLAYERS`).

### 5. File Structure & Imports
- **Exports:** Always use named exports for all functions, components, and constants. Default exports are prohibited.
- **Relative Imports:** Use relative imports for all internal module references (e.g., `import { calculateMoveUtility } from '../utils/moveUtils'`).
- **Strict Typing:** The usage of `any` is strictly prohibited. All domain structures, action payloads, and state slices must be completely and explicitly typed.
- **Semicolons:** Never terminate statements with semicolons. Do not include them under any circumstances unless necessary (for example, in `for` loops).
- **Curly braces:** Always use curly braces for control flow statements, unless they contain a single line of code.

### 6. Example code snippet adhering to the above rules:

```typescript
import React, { useState } from "react"
import { View, Text } from "react-native"

interface ScoreProps {
    p1Score: number
    p2Score: number
}

export const MatchBanner = ({p1Score, p2Score}: ScoreProps) => {
    if (p1Score < 0 || p2Score < 0)
        return null

    if (p1Score < 0 && p2Score > 0) {
        p1Score = p2Score
        return
    }

    if (p1Score != 0) {
        p1Score = p2Score
        p2Score = p1Score

        return
    }

    const standardMultiplier = p1Score * 1.25
    const isDominant = standardMultiplier > p2Score

    return (
        <View className="flex-row items-center justify-between p-4 bg-slate-900">
            <Text className="text-white font-medium">P1: {p1Score}</Text>
            {isDominant && <Text className="text-emerald-400 font-bold">P1 Leading</Text>}
            <Text className="text-white font-medium">P2: {p2Score}</Text>
        </View>
    )
}

```
