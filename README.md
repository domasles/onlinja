![Onlinja Logo](./OnlinjaLogo.svg)

# Onlinja

Your favorite abstract board game, but digital.

## What is it?

Onlinja is a digital, modern board game adaptation, inspired by [Linja](https://steffen-spiele.com/products/linja).

Built to provide a highly interactive experience available instantly, this game challenges players with forward-thinking moments, while balancing positioning across multiple parallel lanes.

Onlinja is about minimalism and instant entertainment. With simple core mechanics, players experience complex strategies with high rewards, if executed efficiently.

## Features

Onlinja offers an elegant mix of lightweight UI mechanics and robust state orchestration:

- **Dual Gameplay Core** - Implementation of Aggressive and Strategic modes. See more at [Rules](#rules).
- **Fluid Transitions** - Interactive tutorial and piece animations make the game more engaging.
- **Dynamic Move Highlighting** - Live highlighting of valid moves to guide player decisions easier.
- **Smart Local Bots** - Multi-tiered automated opponents running local algorithms.
- **Lightweight Architecture** - Decentralized architecture for efficient performance while both playing and developing.

## Rules

Here is a brief overview of the game rules:

### General Flow

- **The Board:** The game is played across **8 lanes**.
- **The Goal:** Race all of your pieces forward into your opponent's home base.
- **Turn Structure:** A round consists of a pair of turns (one turn for each player). A turn consists of 2 moves (see more at [Game Modes](#game-modes) and [Movement Mechanics](#movement-mechanics)).
- **Starting:** **White always starts first.**
- **Game End:** The game concludes immediately when all white pieces surpass all black pieces, or vice versa. If white pieces surpass last black piece and the game hasn't ended yet, black player gets one final turn (to end a round). The score is calculated only then.

---

### Game Modes

Every turn consists of **2 separate moves**, but how you use your pieces depends on the mode:

- **Aggressive Mode:** Both moves of your turn must be performed using the **same piece**.
- **Strategic Mode:** Your second move must be performed using a **completely different piece**, spreading your presence across the board.

---

### Movement Mechanics

Your movement distance dynamically scales based on the board state:

1. **First Move:** Select a piece and move it exactly **1 lane forward**.
2. **The Multiplier:** Before moving, check the total number of pieces currently resting in the lane directly ahead of your piece. 
3. **Second Move:** The number of pieces counted dictates exactly how many lanes forward the player must advance for the second move.

If the first move lands on a lane with **0 pieces** or the opponent's **home base**, your turn ends immediately.

> **NOTE - Visual Helpers:** You don't have to count manually! A **grey lane** shows where a selected piece can legally move. **Yellow** highlights where your first piece moved from, and **Green** highlights the starting point of your second move.

---

### Special Conditions
- **Lanes Capacity & Jumping:** Non-home lanes have a maximum capacity of **6 pieces**. If a move forces a piece to land precisely on a full lane, it completely leaps over it and lands in the next available non-full lane.
- **Empty Lane Bonus:** If the **second move** of your turn lands exactly in a completely empty lane, you are immediately awarded an **extra turn** (limited to one extra turn per round).

## Requirements to Run Onlinja

- **Modern Web Browser**: Any browser (Chrome, Safari, Firefox, Edge) with JavaScript active should do the job.

## Requirements for a Build

- **Docker**: For easy deployment.
- **Node.js Environment**: Version 26 or higher (with npm) is recommended for local compilation.

## Build Instructions

1. **Clone the repository**:
```bash
git clone https://github.com/domasles/onlinja.git
cd onlinja
```

2. **Launch the environment**:

    **Way 1**: Using **Docker Compose**
    ```bash
    docker compose up --build -d
    ```

    **Way 2**: Using `npx expo start` (recommended for development)
    ```bash
    cd frontend
    npx expo start --web
    ```

3. **Verify the client**:
Open your browser (will open automatically if using `npx expo start`), navigate to `http://localhost:8080` (if using Docker) to interact with the frontend app.

## Architecture

The project follows a modern mono-repository:

```architecture
.github/
└── workflows/
    └── build-frontend.yml  # GitHub Actions workflow for Docker builds

frontend/
├── .dockerignore
├── .gitignore
├── App.tsx        # Core entry layout
├── Dockerfile     # Multi-stage Alpine-Node and Nginx build manifest
├── package.json   # Dependency definitions
└── src/
    ├── bot/         # Bot logic for the game
    ├── components/  # UI elements
    ├── domain/      # Core engine math
    ├── hooks/       # Global state hooks and store
    ├── screens/     # UI elements that house components
    └── config/      # Game and tutorial configuration

docker-compose.yml
```

## Support

For issues, feature requests, or questions open an issue or pull request on GitHub.

---

Built with love for the gaming community. _Open source, as intended._
