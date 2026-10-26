"""Tests for health and engine status endpoints."""

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "engine_ready" in data

def test_engine_status_endpoint(client):
    response = client.get("/api/engine/status")
    assert response.status_code == 200
    data = response.json()
    assert "ready" in data
    assert "max_depth" in data
    assert "max_time" in data
