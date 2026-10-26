"""Application configuration and environment settings."""

import os
import shutil
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Engine configuration
    stockfish_path: Optional[str] = "./bin/stockfish.exe"
    default_analysis_time: float = 1.0
    max_analysis_time: float = 5.0
    default_analysis_depth: int = 18
    max_analysis_depth: int = 25
    engine_threads: int = 2
    engine_hash_mb: int = 64

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    def resolve_stockfish_path(self) -> Optional[str]:
        """Resolves the Stockfish binary path across common locations."""
        candidates = []
        
        # 1. Specified path from env / setting
        if self.stockfish_path:
            p = Path(self.stockfish_path)
            candidates.append(p)
            backend_dir = Path(__file__).resolve().parent.parent
            candidates.append(backend_dir / self.stockfish_path)
            candidates.append(backend_dir.parent / self.stockfish_path)

        # 2. Local bin directory candidates
        backend_dir = Path(__file__).resolve().parent.parent
        candidates.append(backend_dir / "bin" / "stockfish.exe")
        candidates.append(backend_dir / "bin" / "stockfish")
        candidates.append(backend_dir.parent / "backend" / "bin" / "stockfish.exe")

        # 3. Check candidate paths
        for cand in candidates:
            try:
                resolved = cand.resolve()
                if resolved.is_file() and os.access(resolved, os.X_OK | os.R_OK):
                    return str(resolved)
            except Exception:
                continue

        # 4. Check system PATH
        which_path = shutil.which("stockfish") or shutil.which("stockfish.exe")
        if which_path:
            return str(Path(which_path).resolve())

        # 5. Common OS paths
        common_paths = [
            "/usr/games/stockfish",
            "/usr/local/bin/stockfish",
            "/usr/bin/stockfish",
            "/opt/homebrew/bin/stockfish",
            r"C:\Program Files\Stockfish\stockfish.exe",
        ]
        for cp in common_paths:
            p = Path(cp)
            if p.is_file():
                return str(p.resolve())

        return None

settings = Settings()
