"""Pytest fixtures for ChessMate backend testing using TestClient."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.engine_service import engine_service

@pytest.fixture(scope="session", autouse=True)
def init_engine():
    """Ensure engine is initialized before tests and cleaned up after."""
    engine_service.initialize_sync()
    yield
    engine_service.close_sync()

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
