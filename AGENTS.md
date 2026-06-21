# Project Specification & Architecture: Onlinja

Onlinja is an online, turn-based multiplayer implementation of the tactical board game **Linja**. Built for seamless mobile and web deployment using an optimized, decoupled frontend architecture running on React Native (Expo) and a scalable asynchronous backend running on Python (FastAPI).

All the code written must follow explicit, object-oriented class patterns split across dedicated, single-responsibility files. Every method, loop, and variable generated within this engine must strictly conform to the parameters defined in the Strict Code Style Rules section of this document.

---

## Tech Stack & Dependencies

### Frontend (Client-Side)
- **Core Framework:** React Native built using Expo (Universal cross-platform development environment)
- **State Management:** Zustand (Global store handling networking transitions, user metadata, and fallback session persistence)
- **Styling Layer:** NativeWind (Tailwind CSS engine optimized for native styling runtimes via Metro)
- **Bundler Configuration:** Metro Bundler (Universal platform compilation target covering mobile and web engines)

### Backend (Server-Side)
- **Service Framework:** Python FastAPI
- **Realtime Protocol:** Asynchronous WebSockets

The backend is **NOT YET PLANNED FOR IMPLEMENTATION**, agents must not, without explicit permission, implement the server side of this project just yet.

### Deployment & DevOps
- **Infrastructure Containerization:** Docker (For both frontend and backend services with optimized multi-stage builds)

---

## Architectural Division & Rules

You must follow an uncompromising **Separation of Concerns (SoC)** approach with file separation and object programming paradigms (for example classes). Global single-file monolithic layouts are forbidden. Split the client codebase into the following explicit directory boundaries:

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
- **Purpose:** The core state machine of Linja. It defines the mathematical representation, piece coordinates, validation primitives, and pure turn-transition logic for players and bots to follow.
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

## Visual Design & Cross-Platform Feature Specification

This section details the UI/UX paradigms, responsive layout boundaries, and local interaction mechanics. The presentation layer must map these rules directly into NativeWind styling implementations.

### 1. Minimalist Aesthetic & Visual Theme
- **Color Palette:** Strictly monochromatic high-contrast architecture. Background matrices must utilize deep slates or pure blacks (`bg-slate-950` / `bg-black`) paired with stark white components and borders.
- **Background Texture:** A persistent, mathematically repeating structural dot-grid layer must render beneath all views across both mobile and web viewpoints.
- **Interface Controls:** Form triggers, toggle sliders, and state selectors must utilize subtle micro-shadowing transitions and stark geometric outlines rather than heavy skeuomorphic shading blocks.
- **Board Representation:** The game board must be rendered as a top-down view, where each piece looks like a simple outlined circle, each with distinct visual states to indicate occupancy, selected status, and possible moves, when activated (selected).

### 2. Cross-Platform Responsiveness & Adaptation Matrix
The application must evaluate runtime platform contexts using React Native `Platform` properties and layout dimension hooks to scale structural proportions seamlessly across varying display configurations:

| Hardware Engine Layer | Layout Constraint | View Behavior & Scaling Metrics |
| :--- | :--- | :--- |
| **Mobile Runtime (iOS/Android)** | Compact Aspect Ratio | Fixed portrait presentation maximizing grid density. Component margins shift dynamically to protect safe-area constraints. |
| **Desktop Web Viewport** | Expanded Landscape Frame | Centralized structural canvas layout pinned at a maximum content width of 1200px, bordered by symmetrical negative space gutters. |

### 3. Local Phase Feature Layout Matrix
Until the backend services are explicitly authorized for construction, the state store must enforce specific behavioral state flags across the frontend UI presentation:

#### A. Online Matchmaking Interface
- **The Protocol State:** The "Find Match" selection node must be visually disabled (grayed-out), but existing for future implementations. All pointer events and click interactions must be explicitly deactivated to ensure no network or state logic is triggered.

#### B. Autonomous Local Bot Interface
- **The Engine State:** Fully active. The interface must provide explicit difficulty slider selectors configuring parameters directly parsed by the `BotConfiguration` instance.

### 4. Interactive Motion & Interface Fluidity
- **Transitions:** All piece shifts, lane hops, and macro-move turn completions must implement lightweight layout spring animations via React Native Animated primitives to visually track the deterministic momentum calculation of the backend simulation logic.
- **State Feedback:** Phase turn forfeitures or structural game mode violations must communicate instantly to the user via quick, high-contrast border flashes or scale animations without displaying disruptive text modal popups.

---

## Game Domain & Simulation Rules Matrix

This section establishes the formal, mathematical game rules engine for Onlinja. The properties and state logic defined here must be implemented entirely within the domain module.

Game target is to get own pieces to the opponent's base. Game is played until every white piece surpasses the black pieces or vice versa. If both players end up with the same score, the game is a draw. The player with the most points at the end of the game wins.

### 1. Board Representation & Structural Bounds
- **The Grid:** The board consists of exactly 8 sequential linear lanes tracked as an ordered array index from 0 to 7
  - **Index 0:** Player White's home storage base
  - **Index 7:** Player Black's home storage base
  - **Indices 1 through 6:** The central active gaps where tactical piece manipulation occurs

Setup/start of the game must implement the following initial configuration:

| Lane / Array Index | Lane Description | White Pieces | Black Pieces | Total Pieces |
| :--- | :--- | :--- | :--- | :--- |
| **Index 0** | Player White's Base (Remaining Leftovers) | 6 | 0 | 6 |
| **Index 1** | Active Central Lane 1 | 1 | 1 | 2 |
| **Index 2** | Active Central Lane 2 | 1 | 1 | 2 |
| **Index 3** | Active Central Lane 3 | 1 | 1 | 2 |
| **Index 4** | Active Central Lane 4 | 1 | 1 | 2 |
| **Index 5** | Active Central Lane 5 | 1 | 1 | 2 |
| **Index 6** | Active Central Lane 6 | 1 | 1 | 2 |
| **Index 7** | Player Black's Base (Remaining Leftovers) | 0 | 6 | 6 |

Methods defining and returning the board state must only return indices and piece count within, for both players and bots, while the frontend automatically handles the rendering of pieces and their respective colors. The domain module must not contain any knowledge of 2D coordinates, board geometry, or visual rendering metrics for it to be optimized.

### 2. Turn Mechanics & Combo Chains (The Macro-Move)
Every full active turn is parsed as a unified combination chain consisting of two mandatory sequential phases executed by the active player.

#### Phase 1: The Initiative Move
- The active player selects any one of their pieces located on indices 0 through 6 and advances it exactly 1 lane forward toward the opponent's home base.
- **The Deterministic Driver:** The total number of combined tokens (both White and Black) occupying the *landing lane* at the conclusion of Phase 1 determines the exact mechanical distance of Phase 2.

#### Phase 2: The Momentum Move
- The player advances a piece forward by the exact number of steps dictated by the Phase 1 landing lane token count, subject to the structural rules of the active game mode.
- **Universal Turn Forfeiture (Vulnerability Trap):** In all game modes, if the Phase 1 initiative move lands on a lane containing 0 other pieces (a blank space), or lands directly inside the opponent's home base storage (Index 7 for White, Index 0 for Black), the active player instantly forfeits the remainder of their turn. Phase 2 validation is bypassed entirely, zero steps are awarded, and the turn swaps immediately to the opponent.

### 3. Structural Gameplay Modes
The domain validation engine must enforce one of two distinct structural mode parameters selected by the player and passed by the state payload during move generation.

#### A. Aggressive Mode
- **Execution Constraint:** The piece selected for Phase 2 must be identical to the piece moved in Phase 1. Selecting any other token for the momentum move is an illegal action.

#### B. Strategic Mode
- **Execution Constraint:** The piece selected for Phase 2 must be completely distinct from the piece moved in Phase 1. Selecting the same token for both phases is an illegal action.

### 4. Lane Obstruction & Exploitation Rules
- **The Wall:** A lane is considered maximum-capacity if it contains exactly 6 pieces.
- **The Hopping Primitive:** Pieces are legally required to pass *over* a maximum-capacity lane during movement and they can never land on it. If a piece's step count would cause it to land on a lane with 6 pieces, it skips over that lane entirely to land on the next available space, consuming no extra steps for the hop.
- **The Empty Lane Privilege:** If a second move piece's landing lane is empty, a whole extra turn is awarded to the active player. Extra moves cannot be chained together and after the first extra move (if given), right to move must be rotated to the other player.

### 5. Official Scoring Engine
Scoring is calculated strictly on a per-piece basis depending on its final row depth:

| Array Index Position | Relative Score Territory | Point Value Per Piece |
| :--- | :--- | :--- |
| Indices 0 through 3 | Initial Territory / Lower Gaps | 0 Points |
| Index 4 | Over the 4th Line | 1 Point |
| Index 5 | Over the 5th Line | 2 Points |
| Index 6 | Over the 6th Line | 3 Points |
| Index 7 | Opponent Home Base Storage | 5 Points |

**Note on Scoring Perspective:** The indices above represent the board state from Player White's point of view. For Player Black, the point valuations are perfectly inverted across the array axis.

---

## Bot Engineering Specification

This section defines the structural engineering rules, interfaces, and execution benchmarks for the autonomous bot module. The implementation must strictly consume types, configurations, algorithms, and logic exported by the Game Domain module.

### 1. Structural Harness & Interface Contract
The bot entry point must expose a single named execution function that fulfills the following structural contract:
- **Input:** It must accept a read-only, fully-typed `GameState` object representing the current board configuration, alongside a `BotConfiguration` object containing difficulty properties. Both objects must belong to the domain module and be fully validated before execution.
- **Output:** It must return a singular, validated `MacroMove` action payload or a null termination status if no legal actions exist.
- **Side Effects:** The execution path must be purely deterministic. No local state mutation, file system writes, network requests, or clock-dependent tracking operations are permitted within this scope.
- **Data Abstraction & Presentation Boundary:** The bot must operate strictly on abstract domain data slices provided by the state payload. It must completely disregard spatial 2D coordinates, board visualization geometries, and token rendering metrics, consuming only the abstract game tracking structures calculated by the presentation and domain layers.

### 2. Implementation Sub-Modules
To guarantee structural concern separation, the bot module must isolate its internal operations across three explicit Object-Oriented classes:

#### A. Evaluation Engine (`EvaluationEngine` Class)
- Translates a physical `GameState` snapshot into a singular scalar numeric utility score via a static `evaluate(state: GameState): number` method.
- Calculates score differentials by consuming the official game scoring algorithms, advancement point functions, and tactical state evaluations exported directly from the Game Domain module.

#### B. Search Space Optimizer (`MinimaxOptimizer` Class)
- Computes optimal tactical pathing using an alpha-beta pruned minimax lookahead tree algorithm.
- Implements a private `minimax(state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean): number` cycle.
- Must dynamically restrict lookahead search depth ceilings strictly according to the active configuration difficulty parameters: **ROOKIE** (capped at Depth 1 to calculate immediate, shallow turn choices), **RUNNER-UP** (capped at Depth 2 to evaluate immediate human opponent responses), and **CHAMPION** (capped at Depth 4 to map out complex, multi-turn combination loops).
- Branch pruning must evaluationally disregard statistically unfeasible paths early to conserve client-side UI main thread performance profiles.

#### C. Humanization Layer (`Humanizer` Class)
- Intercepts raw minimax evaluations when difficulty configurations dictate non-expert play behavior.
- Injects a targeted blunder utility vector that filters a ranked list of calculated legal moves, forcing selection down to sub-optimal secondary or tertiary tactical move variants based on assigned probability matrices.

### 3. Verification & Compliance Harness
To ensure continuous operation during network failover execution routines, the module must pass the following structural validation criteria:
- **State Immutability Verification:** Executing the selection loop across 10,000 test branches must introduce zero alterations to the source memory addresses of the processed domain state.
- **Memory Optimization Ceiling:** Search calculations executing at the maximum lookahead depth ceiling must be optimized as well as possible, without the use of unnecessary looping operations. Bot must only use line indices for move calculations, as provided by the domain layer.

---

## Strict Code Style Rules

You must align your generation algorithms perfectly with this precise format. Deviations are rejected.

### 1. Spacing & Indentation
- **Indentation:** Exactly 4 spaces per tab level. No 2-space offsets.
- **Component Wrapping:** Zero spaces inside self-closing component envelopes. Use `<App/>` and `<View/>` instead of `<App />` or `<View />`.

### 2. Comments
- **Rule:** Do not write comments under any circumstances unless explaining a highly dense, non-obvious mathematical formula or board algorithm anomaly. Strip out generic structural or helper text. If a comment is necessary, ensure it adds value and does not simply restate the code, is concise, but clear. Usage of emojis is strictly prohibited within the entirety of this codebase.

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
- **Object-Oriented Paradigm (OOP):** All algorithmic layers, engines, and domain utilities must be written using explicit class structures with strongly typed fields and static or instance methods where appropriate. 
- **Physical File Separation:** Monolithic single-file configurations are strictly forbidden. Individual classes, sub-modules, and domain engines must reside in their own dedicated files (e.g., `evaluation.ts` separate from `botBrain.ts`) to maintain physical separation of concerns.

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
