"""Tests for chess game logic, moves, validation, undo, and PGN/FEN operations."""

def test_new_game(client):
    response = client.post("/api/game/new", json={"player_color": "white"})
    assert response.status_code == 200
    data = response.json()
    assert data["fen"] == "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    assert data["turn"] == "white"
    assert len(data["legal_moves"]) == 20
    assert not data["status"]["is_game_over"]
    assert not data["status"]["is_check"]

def test_legal_moves_and_fen_update(client):
    # 1. White plays e4 (UCI: e2e4)
    start_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    resp1 = client.post("/api/game/move", json={"fen": start_fen, "move": "e2e4"})
    assert resp1.status_code == 200
    d1 = resp1.json()
    assert d1["turn"] == "black"
    assert d1["last_move"]["san"] == "e4"
    assert d1["last_move"]["from_square"] == "e2"
    assert d1["last_move"]["to_square"] == "e4"

    # 2. Black plays e5 (UCI: e7e5)
    resp2 = client.post("/api/game/move", json={"fen": d1["fen"], "move": "e7e5"})
    assert resp2.status_code == 200
    d2 = resp2.json()
    assert d2["turn"] == "white"
    assert d2["last_move"]["san"] == "e5"

def test_illegal_move_rejected(client):
    start_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    # Moving rook on a1 diagonally to e4 is illegal
    resp = client.post("/api/game/move", json={"fen": start_fen, "move": "a1e4"})
    assert resp.status_code == 400
    assert "not legal" in resp.json()["detail"].lower()

def test_wrong_side_move_rejected(client):
    start_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    # Black piece moving on White's turn
    resp = client.post("/api/game/move", json={"fen": start_fen, "move": "e7e5"})
    assert resp.status_code == 400
    assert "not legal" in resp.json()["detail"].lower()

def test_checkmate_detection(client):
    # Scholar's mate position: 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
    scholars_mate_fen = "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
    resp = client.post("/api/game/import-fen", json={"fen": scholars_mate_fen})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"]["is_checkmate"] is True
    assert data["status"]["is_game_over"] is True
    assert data["status"]["result"] == "1-0"
    assert "Checkmate" in data["status"]["status_text"]

def test_stalemate_detection(client):
    # Standard stalemate position: White king on c8, queen on c7, Black king on a8
    stalemate_fen = "k7/2Q5/1K6/8/8/8/8/8 b - - 0 1"
    resp = client.post("/api/game/import-fen", json={"fen": stalemate_fen})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"]["is_stalemate"] is True
    assert data["status"]["is_game_over"] is True
    assert data["status"]["result"] == "1/2-1/2"

def test_undo_behavior(client):
    # Play 1. e4 e5 2. Nf3
    moves = ["e4", "e5", "Nf3"]
    resp = client.post("/api/game/undo", json={"history": moves})
    assert resp.status_code == 200
    data = resp.json()
    assert data["turn"] == "white"
    assert data["move_history"] == ["e4", "e5"]
    assert data["last_move"]["san"] == "e5"

def test_fen_import_invalid(client):
    resp = client.post("/api/game/import-fen", json={"fen": "invalid_fen_string_123"})
    assert resp.status_code == 400
    assert "invalid" in resp.json()["detail"].lower()

def test_pgn_import_and_export(client):
    pgn_sample = """[Event "Test Match"]
[Site "Local"]
[White "Player"]
[Black "Opponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 1-0"""

    import_resp = client.post("/api/game/import-pgn", json={"pgn": pgn_sample})
    assert import_resp.status_code == 200
    data = import_resp.json()
    assert data["move_history"] == ["e4", "e5", "Nf3", "Nc6", "Bb5"]
    assert data["turn"] == "black"

    # Now export
    export_resp = client.get("/api/game/export-pgn?moves=e4,e5,Nf3,Nc6,Bb5")
    assert export_resp.status_code == 200
    pgn_out = export_resp.json()["pgn"]
    assert "1. e4 e5 2. Nf3 Nc6 3. Bb5" in pgn_out
