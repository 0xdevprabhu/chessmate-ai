# ChessMate AI

**ChessMate AI** is a personal chess analysis assistant designed specifically for physical chessboard practice and offline over-the-board training.

When practicing or playing on a real, physical chessboard with a friend or study partner, you manually mirror each move on ChessMate AI. After every move, the integrated **Stockfish 19** chess engine evaluates the actual position and recommends the strongest candidate moves and tactical explanations for your side.

---

## 🎯 Purpose & Physical Board Workflow

### How the Physical Board Companion Works:
1. **Choose Your Side**: Select whether you are playing **White** or **Black** on your physical chessboard.
   - If playing **White**: You make the first move on your physical board, enter it on the website, and ChessMate AI waits for your opponent's reply. Once the opponent moves on the physical board, you enter their reply, and ChessMate AI immediately calculates and recommends your next move.
   - If playing **Black**: The website prompts: *"Waiting for opponent (White) to make their opening move."* You enter their move first, and the engine immediately recommends Black's strongest response.
2. **Move Recommendation**: Stockfish calculates the highest-quality move, principal variation (PV), alternative candidate lines, and dynamic evaluation (e.g. `+0.35`, `-1.20`, `M3`).
3. **Execute on Board**: You play the recommended move on your physical board.
4. **Enter Opponent's Move**: When your opponent replies on the physical board, enter their move on ChessMate AI.
5. **Cycle Continues**: The application repeats this cycle until checkmate, stalemate, or manual game termination.

> **Note**: ChessMate AI is strictly designed for personal practice, analysis, and over-the-board study. It never assumes the opponent's next move and always analyzes the authoritative board state.

---

## 🏗️ Architecture & Technology Stack

```
chessmate-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application & lifecycle management
│   │   ├── config.py            # Pydantic v2 settings & Stockfish path resolution
│   │   ├── schemas.py           # Pydantic request & response models
│   │   ├── chess_service.py     # python-chess rules, validation, FEN/PGN parser
│   │   ├── engine_service.py    # Stockfish UCI integration, async locks & timeout control
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py        # /api/health & /api/engine/status
│   │       ├── game.py          # /api/game/new, /move, /undo, /import-*, /export-pgn
│   │       └── analysis.py      # /api/analysis
│   ├── bin/                     # Local Stockfish executable directory
│   ├── tests/                   # 15 automated pytest unit & integration tests
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Backend environment template
│   └── .env                     # Local backend configuration
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # SEO metadata & fonts
│   │   ├── page.tsx             # Main responsive dashboard
│   │   └── globals.css          # Design system & dark charcoal aesthetic
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   └── ResponsiveLayout.tsx
│   │   ├── chess/
│   │   │   ├── ChessBoard.tsx          # react-chessboard with tap-to-move & drag-and-drop
│   │   │   ├── BoardControls.tsx       # Flip, Undo, Analyze, Navigation
│   │   │   ├── MoveHistory.tsx         # Interactive move navigation list
│   │   │   ├── CapturedPieces.tsx      # Piece difference & material counter
│   │   │   ├── BestMoveCard.tsx        # Recommendation, evaluation, explanation
│   │   │   ├── HintControls.tsx        # 3-tier progressive hint system
│   │   │   ├── EvaluationBar.tsx       # Live vertical/horizontal evaluation bar
│   │   │   └── PhysicalWorkflowGuide.tsx # Companion banner
│   │   ├── dialogs/
│   │   │   ├── NewGameDialog.tsx
│   │   │   ├── PromotionDialog.tsx
│   │   │   ├── ImportPositionDialog.tsx
│   │   │   └── SettingsDialog.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       └── LoadingState.tsx
│   ├── lib/
│   │   ├── api.ts               # Type-safe API client with request cancellation
│   │   ├── sound.ts             # Web Audio API synthesized chess sounds
│   │   ├── storage.ts           # LocalStorage persistence
│   │   └── types.ts             # TypeScript interface definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   └── .env.example
├── scripts/
│   └── download_stockfish.py   # Automatic Stockfish binary downloader
└── README.md
```

---

## ⚡ Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18.x or 20.x or higher
- **Stockfish**: Automatically downloaded via included script or installed via package manager.

---

## 🚀 Quick Start Guide

### 1. Download Stockfish (Automated)

Run the included automated installer script from the project root:

```bash
python scripts/download_stockfish.py
```

This automatically downloads the official Stockfish binary for your operating system and places it into `backend/bin/stockfish.exe` (or `backend/bin/stockfish` on macOS/Linux).

#### Manual Stockfish Installation Alternatives:
- **Windows**: Download from [stockfishchess.org](https://stockfishchess.org/download/) and place the `.exe` into `backend/bin/stockfish.exe`, or configure `STOCKFISH_PATH` in `backend/.env`.
- **macOS**: `brew install stockfish`
- **Linux (Ubuntu/Debian)**: `sudo apt-get install stockfish`

---

### 2. Backend Setup & Startup

From the project root (`e:\my projects\chessmate-ai`):
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

*(Or simply double-click `run_backend.bat`)*

> **Tip**: If your terminal is inside the `backend/` folder (`cd backend`), run:
> ```bash
> python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
> ```

Verify backend connectivity:
- API Index: [http://localhost:8000/](http://localhost:8000/)
- Interactive OpenAPI Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Engine Status: [http://localhost:8000/api/engine/status](http://localhost:8000/api/engine/status)

---

### 3. Frontend Setup & Startup

From the `frontend` folder:
```bash
cd frontend
npm run dev
```

*(Or simply double-click `run_frontend.bat` from the root folder)*

Open your browser to: **[http://localhost:3000](http://localhost:3000)**

---

## 💡 Key Features & Usage

### 1. Interactive Chessboard & Touch Controls
- **Drag-and-Drop & Tap-to-Move**: Click a piece to highlight legal destination squares (with dot and capture ring indicators), then click the destination square.
- **Pawn Promotion**: A dedicated modal appears when promoting pawns (Queen, Rook, Bishop, Knight).
- **Board Orientation**: Flip the board between White and Black views at any time, or set to auto-follow your player color.
- **Sound Effects**: Instant synthesized sound effects via the Web Audio API for moves, captures, check, and game over (can be muted in Settings).

### 2. Multi-Level Hint System
- **Level 1: Gentle Hint**: Highlights the candidate piece and square without giving away the move.
- **Level 2: Direction Hint**: Draws an arrow indicating the piece and destination vector.
- **Level 3: Full Hint**: Discloses the exact SAN move notation, evaluation, and from-to coordinate squares.

### 3. Move History & Historical Variations
- **Step-by-Step Navigation**: Navigate moves using First (`|<`), Previous (`<`), Next (`>`), and Latest (`>|`) buttons, or click any move in the history list.
- **Branching Variations**: If you navigate backward and make a new physical move, ChessMate AI cleanly replaces future moves with your new variation without conflicting state.

### 4. Position Import & Export
- **FEN Import**: Synchronize a physical board mid-game by pasting a valid FEN string.
- **PGN Import**: Load completed or ongoing games from PGN text.
- **PGN Export**: Download the active physical board session as a `.pgn` file.

### 5. Settings & Personalization
- Customize analysis search depth (10–25 plies) and time limit (0.5s–5.0s).
- Select between 4 board themes: Charcoal, Classic Wood, Walnut, and Emerald Green.
- Toggle board coordinates, legal move markers, and best move arrows.
- Persistent session storage in browser LocalStorage.

---

## 🧪 Automated Testing

### Backend Test Suite
The backend contains 15 automated tests covering API health, move validation, wrong-side rejection, illegal moves, checkmate detection, stalemate detection, FEN/PGN import/export, and live Stockfish tactical position solving:

```bash
python -m pytest backend/tests -v
```

**Test Results:**
```
============================= test session starts =============================
backend/tests/test_analysis.py::test_analysis_endpoint_structure PASSED  [  6%]
backend/tests/test_analysis.py::test_analysis_tactical_position PASSED   [ 13%]
backend/tests/test_analysis.py::test_analysis_game_over_position PASSED  [ 20%]
backend/tests/test_analysis.py::test_analysis_invalid_fen PASSED         [ 26%]
backend/tests/test_game.py::test_new_game PASSED                         [ 33%]
backend/tests/test_game.py::test_legal_moves_and_fen_update PASSED       [ 40%]
backend/tests/test_game.py::test_illegal_move_rejected PASSED            [ 46%]
backend/tests/test_game.py::test_wrong_side_move_rejected PASSED         [ 53%]
backend/tests/test_game.py::test_checkmate_detection PASSED              [ 60%]
backend/tests/test_game.py::test_stalemate_detection PASSED              [ 66%]
backend/tests/test_game.py::test_undo_behavior PASSED                    [ 73%]
backend/tests/test_game.py::test_fen_import_invalid PASSED               [ 80%]
backend/tests/test_game.py::test_pgn_import_and_export PASSED            [ 86%]
backend/tests/test_health.py::test_health_endpoint PASSED                [ 93%]
backend/tests/test_health.py::test_engine_status_endpoint PASSED         [100%]
======================= 15 passed, 1 warning in 10.45s ========================
```

### Frontend Build Verification
Verify strict TypeScript compilation and Next.js static asset generation:

```bash
cd frontend
npm run build
```

---

## 🔒 Security & Reliability
- Authoritative backend validation: All moves and positions are independently validated by `python-chess` before being submitted to the engine.
- Concurrency control: Stockfish UCI commands are guarded by an asynchronous lock (`asyncio.Lock`), ensuring concurrent requests never corrupt the engine process.
- Engine timeouts: Analysis queries are executed in background threads with strict timeouts and automatic crash recovery.
- Safe origins: CORS is restricted to frontend development origins.
