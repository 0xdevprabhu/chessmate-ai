"""Tests for position analysis using Stockfish engine."""

def test_analysis_endpoint_structure(client):
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    resp = client.post(
        "/api/analysis",
        json={"fen": fen, "time_limit": 0.5, "depth_limit": 10, "multipv": 3},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["fen"] == fen
    assert data["side_to_move"] == "white"
    assert "best_move" in data
    assert "best_move_san" in data
    assert "from_square" in data
    assert "to_square" in data
    assert "evaluation" in data
    assert data["depth"] >= 1
    assert "pv_san" in data
    assert "alternative_lines" in data
    assert len(data["alternative_lines"]) >= 1
    assert "hints" in data
    assert "level1_gentle" in data["hints"]
    assert "level2_direction" in data["hints"]
    assert "level3_full" in data["hints"]
    assert "explanation" in data

def test_analysis_tactical_position(client):
    # Back rank mate in 1: Qe8#
    fen = "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1"
    resp = client.post(
        "/api/analysis",
        json={"fen": fen, "time_limit": 0.5, "depth_limit": 10},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["best_move"] == "e1e8"
    assert data["best_move_san"] == "Qe8#"
    assert data["mate"] == 1

def test_analysis_game_over_position(client):
    # Scholar's mate position (already checkmated)
    fen = "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
    resp = client.post("/api/analysis", json={"fen": fen})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_game_over"] is True
    assert "Checkmate" in data["explanation"]

def test_analysis_invalid_fen(client):
    resp = client.post("/api/analysis", json={"fen": "not_a_valid_fen"})
    assert resp.status_code == 400
    assert "invalid" in resp.json()["detail"].lower()
