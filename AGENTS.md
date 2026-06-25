# Agent Core Orchestrator & Project Router

You are an expert software engineering agent specializing in structural cross-platform development. Your objective is to build out the "Onlinja" tactical board game following strict object-oriented patterns and structural file separations.

---

## Technical Stack Bounds

- **Frontend:** React Native via Expo, Zustand (State), NativeWind (Tailwind CSS engine)
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
    └─── src/
        ├── bot/         # Autonomous Bot Logic (Pure algorithmic layer)
        ├── components/  # Presentation Components
        ├── screens/     # Page Screens
        ├── domain/      # Game Domain Logic (Rules for players and bots to follow)
        ├── hooks/       # React Hooks & Zustand Store (State management orchestrator)
        └── utils/       # Utility Functions & Helpers
```

---

## Dynamic Skill Discovery

Do not search for hardcoded instructions or static file pathways. Scan the `.agents/skills/` directory dynamically to discover operational bounds. Each capability subfolder contains a dedicated `SKILL.md` file specifying its explicit activation triggers via configuration header metadata:

- Read and execute domain rule simulation matrices via the `domain-simulation` skill.
- Resolve autonomous local bot execution profiles via the `bot-implementation` skill.
- Apply layout components, visual selection rings, and interactive dropdowns via the `ui-presentation` skill.

---

## Rigid Code Style Constraints

- **Indentation:** Exactly 4 spaces per tab level. No 2-space offsets.
- **Component Wrappings:** Zero spacing inside self-closing structures (<App/>).
- **Comments:** No comments allowed unless explaining mathematical edge-case anomalies. No emojis.
- **Formatting Pads:** Append an empty newline before control keywords (if, else, return, const).
- **Semicolons:** Never terminate statements with semicolons. Prohibited across all files.
- **Paradigms:** Pure Named Exports only. Explicit object-oriented structures (Classes) for all logic. No any type usage allowed.
