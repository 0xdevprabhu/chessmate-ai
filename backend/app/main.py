"""ChessMate AI FastAPI main application."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .engine_service import engine_service
from .routes import health, game, analysis

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("chessmate.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Try initializing Stockfish engine
    logger.info("Initializing ChessMate AI Engine Service...")
    engine_ready = engine_service.initialize_sync()
    if engine_ready:
        logger.info("Stockfish engine is ready.")
    else:
        logger.warning("Stockfish is not currently ready. Analysis endpoints will return 503 until configured.")
    yield
    # Shutdown: Cleanly terminate Stockfish engine process
    logger.info("Shutting down Stockfish engine...")
    engine_service.close_sync()

app = FastAPI(
    title="ChessMate AI Backend API",
    description="Backend API powering ChessMate AI physical chess board analysis assistant.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration - Allow all origins including Vercel production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check server logs."},
    )

# Register API routes under /api
app.include_router(health.router, prefix="/api")
app.include_router(game.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "name": "ChessMate AI Backend",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
    }
