# Project Specification & Architecture

This engineering document specifies the decoupled frontend architecture for a turn-based tactical board game application running on React Native (Expo) with global client state management.

All written code must strictly follow standard TypeScript type parameters, object-oriented patterns, and modular structural boundaries across dedicated single-responsibility files.

---

## Tech Stack & Dependencies

### Frontend (Client-Side)
- **Core Framework:** React Native built using Expo (Universal cross-platform environment)
- **State Management:** Zustand (Global client store handling state transitions, ui flags, and layout metadata)
- **Styling Layer:** NativeWind (Tailwind CSS engine optimized for native styling runtimes via Metro)
- **Bundler Configuration:** Metro Bundler (Universal platform compilation target covering mobile and web runtimes)

### Backend (Server-Side)
- **Service Framework:** Python FastAPI
- **Realtime Protocol:** Asynchronous WebSockets

The backend is **NOT YET PLANNED FOR IMPLEMENTATION**. Agents must not implement the server side of this project without explicit instruction.

### Deployment & DevOps
- **Infrastructure Containerization:** Docker (Optimized multi-stage builds for local development and compilation environments)

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
- **Purpose:** The core state machine of the game rules. It defines the mathematical representation, piece tracking, validation primitives, and pure turn-transition logic for players and bots to follow.
- **Constraints:** Completely stateless and execution-context agnostic. It operates strictly via pure functions: `(CurrentState, Action) => NextState`. It contains zero React hooks, zero network variables, and zero UI constructs. It handles abstract track indexes without containing any knowledge of 2D rendering coordinates or visual dimensions.

### 2. Autonomous Bot Logic (`/frontend/src/bot/`)
- **Purpose:** A deterministic, frontend-executable autonomous bot written in pure algorithmic TypeScript.
- **Constraints:** Isolated domain consumer. It accepts a raw state snapshot from the Domain module, calculates move utility weights entirely on the client thread, and returns an action payload. It has no knowledge of whether the game is online or offline.

### 3. State Management & Hooks (`/frontend/src/hooks/`)
- **Purpose:** React hooks and Zustand stores serving as the application state management orchestrator. It manages view-state reactivity, local player actions, and configuration states.
- **Network Disconnection Strategy:** Because the local simulation matches operate entirely offline using the local engine and bot modules, network state forks are impossible. For future online implementations, if a connection drop or handshake timeout is detected, the store must never silently substitute live actions with a local bot engine. Instead, it must instantly halt input propagation, trigger an explicit connection-error state interface overlay, and gracefully offer the user options to exit to the main menu or forfeit, ensuring client-server synchronization is never deceptively masked or permanently desynchronized.

### 4. Presentation Components (`/frontend/src/components/`)
- **Purpose:** Dumb presentation and layout blocks (`GameBoard.tsx`, `ScoreHeader.tsx`, `ActionSlider.tsx`, `GameOverView.tsx`, `GameButton.tsx`) styled via NativeWind class utilities.
- **Constraints:** Completely isolated from state mutation logic. They read active frames directly from the Zustand store and emit user intent upwards through explicit store methods. They contain zero game rule computations or network lifecycle handlers.

### 5. Utility Functions & Helpers (`/frontend/src/utils/`)
- **Purpose:** Shared purely functional helper blocks, mathematical tools, or configuration constants utilized across the frontend application.

### 6. Backend Match Coupling Service (`/backend/`)
- **Purpose:** An asynchronous FastAPI WebSocket server acting as an authoritative game-state validation, match discovery, and message relay system.
- **Constraints:** While the server does not persist long-term historical analytics profiles, it must actively maintain an in-memory execution instance of the Game Domain Logic for every concurrent live room matrix. The backend serves as the final anticheat arbiter; it must parse and validate incoming client action frames against the game state machine before relaying them to the paired opponent. Action frames that violate structural rules, lane movement calculations, or validation primitives must be instantly rejected, and the violating socket disconnected to preserve match security.

---

## Visual Design & Cross-Platform Feature Specification

This section details the UI/UX paradigms, responsive layout boundaries, and local interaction mechanics. The presentation layer maps these structural requirements into NativeWind class utilities.

### 1. Minimalist Aesthetic & Visual Theme
- **Color Palette:** Premium light, high-contrast minimalist layout. Background matrices utilize clean pure whites (`bg-white`), off-whites, or subtle grays (`bg-neutral-50` to `bg-neutral-100`) paired with sharp dark text (`text-black`, `text-neutral-800`).
- **Interface Controls:** Form triggers, buttons, and state selectors utilize high-contrast flat borders, crisp line rules (`border border-neutral-200`), clean edge rounding (`rounded-xl`), and discrete drop shadows (`shadow-sm` / `shadow-md`).
- **Board Representation:** The board is visually emulated from a top-down perspective, rendering exactly 8 physical horizontal linear tracks spaced sequentially down the vertical layout axis. Pieces are presented as discrete, round tangible tokens resting directly along these track lines rather than numbers or boxed cells.

### 2. Cross-Platform Responsiveness & Adaptation Matrix
The application evaluates runtime platform contexts using React Native design properties and layout dimension hooks to scale structural proportions seamlessly across varying display configurations:

| Hardware Engine Layer | Layout Constraint | View Behavior & Scaling Metrics |
| :--- | :--- | :--- |
| **Mobile Runtime (iOS/Android)** | Compact Aspect Ratio | Fixed portrait presentation maximizing grid density. Component padding shifts dynamically to protect safe-area constraints. |
| **Desktop Web Viewport** | Expanded Landscape Frame | Centralized structural canvas layout pinned at a maximum content width via wrapper containers (`max-w-xl`, `max-w-md`), bordered by negative space. |

### 3. Local Phase Feature Layout Matrix
Until backend services are explicitly authorized for construction, the state store enforces specific behavioral state flags across the frontend UI presentation:

#### A. Online Matchmaking Interface
- **The Protocol State:** The "Find Match" selection node is visually hidden or disabled. All pointer events and click interactions are deactivated to ensure no network or state logic is triggered.

#### B. Autonomous Local Bot Interface
- **The Engine State:** Fully active. The interface provides explicit slider selectors configuring difficulty parameters directly parsed by a local evaluation engine.

### 4. Interactive Motion & Interface Fluidity
- **Transitions:** All piece shifts, track updates, and macro-move animations implement lightweight layout spring configurations (`Layout.springify()`) and alpha transitions (`FadeIn`, `FadeOut`) via React Native Reanimated to visually track mechanical continuity.
- **State Feedback:** Phase updates, turn sequences, and legal action indicators communicate instantly to the user via high-contrast border thickness shifts, custom color rings, and translucent overlay backgrounds.

### 5. Detailed Screen Hierarchy & UI State Architecture
The presentation layer splits the user interface into mutually exclusive root views managed by a global coordinator state. Monolithic screens are strictly forbidden.

#### A. Welcome & Configuration View (Main Menu)
- **Layout Canvas:** A centered, floating clean geometric card container featuring sharp boundaries, fine lines (`border border-neutral-200`), and a solid background (`bg-white`) suspended over a structural screen wrapper.
- **Header Structure:** The brand title is rendered in a prominent, bold, heavy sans-serif typeface (`font-black`), positioned cleanly beneath an inline dual-circle icon component representing contrasting game tokens.
- **Segmented Control Sliders:** Configuration selectors (Strategic/Aggressive modes, White/Black sides) are laid out via flat, custom `ActionSlider` components managing active option highlights locally.
- **Action Triggers:** Primary buttons span the full width of the configuration card, utilizing high-contrast solid fills, sharp text, and slightly rounded clean edges (`rounded-xl`).

#### B. Active Gameplay View (Match Screen)
- **Layout Canvas:** The layout transitions to top-down tactical nodes. Displaying complex developer panels, debug multi-colored grids, or non-functional control boxes alongside the active board card is prohibited.
- **Scoreboard Frame:** Positioned cleanly at the top of the viewport axis (`ScoreHeader`), rendering current point aggregates, active player turn markers, and active match phase numbers via clean, single-color typographic components.
- **The Linear Board Layout:** The 8 linear lanes are presented as a structured vertical array of physical track rows. Each row physically contains and displays its active, dynamically assigned white and black tokens arranged horizontally along its central axis.
- **Interactive Token Nodes:** Individual game pieces are rendered as simple, solid or hollow monochrome circle buttons. Visual selection and history state tracking are represented exclusively through high-contrast colored borders (`border-amber-400` for Phase 1 historical tracks, `border-emerald-400` for Phase 2 historical tracks, and scaled thick borders for active selections).
- **Turn Event Interrupt Overlays:** When an extra turn condition is met, a localized, absolute-positioned container intercepts user input (`pointerEvents` or explicit blocker buttons consuming event propagation). It applies a subtle backdrop blur (`backdrop-blur-[4px]`) and displays a centered, perfectly aligned geometric vector graphic indicator consisting of a standalone `+` sign mapped via nested layout views inside a rounded white border container, accompanied by structured validation typography detailing the active player state.

---

## Game Domain & Simulation Rules Matrix

This section establishes the formal, mathematical game rules engine. The properties and state logic defined here are implemented entirely within the domain module, independent of visual layers.

The objective is to advance own pieces to the final opposing track. A match runs until every piece of one side has bypassed all pieces of the opposing side. If both players end up with identical final aggregates, a draw is declared. The player with the highest total point valuation wins.

### 1. Board Representation & Structural Bounds
- **The Grid:** The board consists of exactly 8 sequential linear lanes tracked as an ordered array index from 0 to 7.
  - **Index 0:** Player White's initial base.
  - **Index 7:** Player Black's initial base.
  - **Indices 1 through 6:** Central active tracks where pieces are manipulated.

The game setup initializes the following state configuration:

| Lane / Array Index | Lane Description | White Pieces | Black Pieces | Total Pieces |
| :--- | :--- | :--- | :--- | :--- |
| **Index 0** | Player White's Base | 6 | 0 | 6 |
| **Index 1** | Central Track 1 | 1 | 1 | 2 |
| **Index 2** | Central Track 2 | 1 | 1 | 2 |
| **Index 3** | Central Track 3 | 1 | 1 | 2 |
| **Index 4** | Central Track 4 | 1 | 1 | 2 |
| **Index 5** | Central Track 5 | 1 | 1 | 2 |
| **Index 6** | Central Track 6 | 1 | 1 | 2 |
| **Index 7** | Player Black's Base | 0 | 6 | 6 |

Methods defining and returning the board configuration process indices and abstract piece arrays. The domain module contains zero knowledge of 2D coordinates, board rendering geometries, or style tokens.

### 2. Turn Mechanics & Combo Chains (The Macro-Move)
Every complete player turn is parsed as a unified combination chain consisting of sequential phases executed by the active player.

#### Phase 1: The Initiative Move
- The active player selects any one of their pieces located on valid starting indices and advances it exactly 1 lane forward toward the opponent's home base.
- **The Deterministic Driver:** The total number of combined pieces occupying the *landing lane* at the conclusion of Phase 1 determines the exact mechanical distance parameters awarded for Phase 2.

#### Phase 2: The Momentum Move
- The player advances a piece forward by the exact number of steps dictated by the Phase 1 landing lane piece count, subject to active game mode restrictions.
- **Universal Turn Forfeiture (Vulnerability Trap):** If the Phase 1 initiative move lands on a lane containing 0 other pieces prior to the move, or lands directly inside the opponent's home base storage, the active player instantly forfeits the remainder of their turn. Phase 2 validation is bypassed, zero momentum steps are awarded, and the active player state swaps immediately to the opponent.

### 3. Structural Gameplay Modes
The domain validation engine enforces one of two distinct structural mode parameters passed by the state payload during move generation:

#### A. Aggressive Mode
- **Execution Constraint:** The piece selected for Phase 2 must be identical to the piece moved in Phase 1. Selecting any other token for the momentum move is an illegal action.

#### B. Strategic Mode
- **Execution Constraint:** The piece selected for Phase 2 must be completely distinct from the piece moved in Phase 1. Selecting the same token for both phases is an illegal action.

### 4. Lane Obstruction & Exploitation Rules
- **The Wall:** A lane is considered at maximum-capacity if its piece array length matches or exceeds the dynamic configuration metric (`config.maxLaneCapacity`). Home bases (Index 0 and `maxIdx`) are structurally excluded from this rule and possess infinite capacity.
- **The Hopping Primitive:** The maximum-capacity landing check must execute strictly as a terminal resolution step *after* all baseline momentum steps have been fully applied. A piece passing through a maximum-capacity lane during its active movement steps ignores the capacity limit and counts the track normally. If, and only if, the piece's final calculated step index terminates directly on top of a maximum-capacity lane, the engine triggers a continuous sliding evaluation, advancing the piece forward along its trajectory axis until it matches a track index containing fewer pieces than `config.maxLaneCapacity` or enters a terminal base.
- **The Base Exclusion Rule:** The home bases (Index 0 for White and `maxIdx` for Black) are absolute final destination boundaries. If a piece possesses more remaining movement steps than there are lanes available before the opponent's home base, it is fully permitted to target that base. The moment the moving piece's calculated step path touches the opponent's home base index, any remaining unspent steps are instantly absorbed, the execution loop terminates early, and the piece settles on the base index. The move is only evaluated as illegal if the calculation cannot structurally enter or land on the base boundary line.
- **The Selection Constraint:** If the hopping loop calculation evaluates that every single lane remaining between a token's starting index and the opposing scoring terminal boundary is completely filled to maximum-capacity, the piece cannot complete a valid landing path. The simulation engine must mark this token as non-selectable.
- **The Empty Lane Privilege:** If a Phase 2 momentum move terminates on a destination lane that contained exactly 0 pieces, an extra turn sequence is awarded to the active player. This evaluation must target a frozen state snapshot recorded immediately prior to the execution of Phase 1 of the active player's turn sequence. A lane becoming empty solely because a piece departed from it during the current macro-move cycle does not satisfy this condition.

### 5. Official Scoring Engine
Scoring is calculated on a per-piece basis anchored relatively to the target baseline of the dynamically configured total lane count parameter (`config.laneCount`), where tracks span across array indices from 0 to `config.laneCount - 1`. The valuation maps backward from each player's target baseline, naturally compressing the lowest scoring brackets if the lane variable is modified below 5:

| White Piece Position Axis | Point Value | Black Piece Position Axis | Point Value |
| :--- | :--- | :--- | :--- |
| `maxIdx` (Opponent Base) | 5 Points | Index 0 (Opponent Base) | 5 Points |
| `maxIdx - 1` | 3 Points | Index 1 | 3 Points |
| `maxIdx - 2` | 2 Points | Index 2 | 2 Points |
| `maxIdx - 3` | 1 Point | Index 3 | 1 Point |
| All Indices $\le$ `maxIdx - 4` | 0 Points | All Indices $\ge$ 4 | 0 Points |

*Note:* Where `maxIdx` equals `config.laneCount - 1`. If the board dimensions scale down such that the configuration is smaller than 4 total lanes, point assignments cascade downwards sequentially from the 5-point terminal tier until index boundaries hit the player's own starting base line.

---

## Bot Engineering Specification

This section defines the structural engineering rules, interfaces, and execution benchmarks for the autonomous local bot module. The implementation consumes types, configurations, algorithms, and logic exported by the Game Domain module.

### 1. Structural Harness & Interface Contract
The bot entry point exposes a single execution function that fulfills the following contract:
- **Input:** It accepts a read-only, fully-typed state object representing the current board configuration, alongside a configuration object containing difficulty properties. Both objects belong to the domain module.
- **Output:** It returns a validated action payload or a null termination status if no legal actions exist.
- **Side Effects:** The execution path is purely deterministic. No local state mutation, file system writes, network requests, or clock-dependent tracking operations are permitted within this scope.
- **Data Abstraction:** The bot operates strictly on abstract domain data slices provided by the state payload. It completely disregards spatial 2D coordinates, board visualization geometries, and token rendering metrics, consuming only the abstract lane tracking indices calculated by the domain layer.

### 2. Implementation Sub-Modules
To guarantee structural concern separation, the bot module isolates its internal operations across three explicit Object-Oriented classes:

#### A. Evaluation Engine (`EvaluationEngine` Class)
- Translates a physical board state snapshot into a singular scalar numeric utility score via a static evaluate method.
- Calculates score differentials by consuming the official game scoring algorithms, advancement point functions, and tactical state evaluations exported directly from the Game Domain module.

#### B. Search Space Optimizer (`MinimaxOptimizer` Class)
- Computes optimal tactical pathing using an alpha-beta pruned minimax lookahead tree algorithm.
- Implements a private minimax search loop.
- Dynamically restricts lookahead search depth ceilings strictly according to the active configuration difficulty parameters: **ROOKIE** (capped at Depth 1 to calculate immediate, shallow turn choices), **RUNNER-UP** (capped at Depth 2 to evaluate immediate human opponent responses), and **CHAMPION** (capped at Depth 4 to map out complex, multi-turn combination loops).
- Branch pruning evaluationally disregards statistically unfeasible paths early to conserve client-side UI main thread performance profiles.

#### C. Humanization Layer (`Humanizer` Class)
- Intercepts raw minimax evaluations when difficulty configurations dictate non-expert play behavior.
- Injects a targeted blunder utility vector that filters a ranked list of calculated legal moves, forcing selection down to sub-optimal secondary or tertiary tactical move variants based on assigned probability matrices.

### 3. Verification & Compliance Harness
To ensure continuous operation during alternative execution routines, the module passes the following structural validation criteria:
- **State Immutability Verification:** Executing the selection loop across 10,000 test branches introduces zero alterations to the source memory addresses of the processed domain state.
- **Memory Optimization Ceiling:** Search calculations executing at the maximum lookahead depth ceiling must be optimized, avoiding unnecessary nested looping blocks. The bot must strictly use track array indices for move calculations as provided by the domain layer.

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
import React from "react"
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
        const temp = p1Score

        p1Score = p2Score
        p2Score = temp

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
