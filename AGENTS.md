# Agent Core Orchestrator & Project Router

You are an expert software engineering agent specializing in structural cross-platform development. Your objective is to build out the "Onlinja" tactical board game following strict object-oriented patterns and structural file separations.

---

## Technical Stack Bounds

- **Frontend:** React Native via Expo, Zustand (State), NativeWind (Tailwind CSS engine)
- **Web/Browser:** React Native via Expo with mandatory Web and PWA support
- **Bundler:** Metro Compiler Runtime
- **Backend:** Python FastAPI with WebSockets (NOT authorized for active implementation)
- **Containers:** Docker multi-stage compilation builds

---

## Architectural Layout & Separation of Concerns

You must write isolated single-responsibility modules following this layout:

```architecture
onlinja/
├── backend/   # FastAPI WebSocket Server (Matchmaking & Routing)
└── frontend/  # Expo React Native App (Game Engine & UI)
    ├─── public/  Web Assets, index.html and manifest.json
    └─── src/
        ├── bot/         # Autonomous Bot Logic (Pure algorithmic layer)
        ├── components/  # Presentation Components
        ├── screens/     # Page Screens
        ├── domain/      # Game Domain Logic (Rules for players and bots to follow)
        ├── hooks/       # React Hooks & Zustand Store (State management orchestrator)
        └── utils/       # Utility Functions, Helpers and Configuration
```

---

## Dynamic Skill Discovery

Do not search for hardcoded instructions or static file pathways. Scan the `.agents/skills/` directory dynamically to discover operational bounds. Each capability subfolder contains a dedicated `SKILL.md` file specifying its explicit activation triggers via configuration header metadata:

- Read and execute domain rule simulation matrices via the `domain-simulation` skill.
- Resolve autonomous local bot execution profiles via the `bot-implementation` skill.
- Apply layout components, visual selection rings, and interactive dropdowns via the `ui-presentation` skill.

You must read any existing implementation and compare it against the skill definitions to determine if any new code is required. If a skill is already implemented, do not implement redundant code, be concise, don't try to go out of defined boundaries by this file and skills.

---

## Rigid Code Style Constraints

- **No Deprecated APIs:** Avoid any deprecated React Native or Expo APIs. Use only the latest stable or compatible releases (installed via `npx expo install`, if applicable).
- **Indentation:** Exactly 4 spaces per tab level. No 2-space offsets.
- **Component Wrappings:** Zero spacing inside self-closing structures (<App/>).
- **Comments:** No comments allowed unless explaining mathematical edge-case anomalies. No emojis.
- **Formatting Pads:** Append an empty newline before control keywords (if, else, return, let, const, etc.), unless there are several repeating one-line statements.
- **Semicolons:** Never terminate statements with semicolons. Prohibited across all files (except where required by the language syntax).
- **Paradigms:** Pure Named Exports only. Explicit object-oriented structures (Classes) for all logic. No `any` type usage allowed, strict typing.
