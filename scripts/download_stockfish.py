"""Helper script to download official Stockfish binary for Windows/macOS/Linux."""

import io
import os
import platform
import stat
import sys
import urllib.request
import zipfile
import tarfile

def download_stockfish(target_dir: str = "backend/bin") -> str | None:
    os.makedirs(target_dir, exist_ok=True)
    system = platform.system().lower()
    machine = platform.machine().lower()

    print(f"Detected OS: {system}, Architecture: {machine}")
    
    # Check if stockfish already exists in target_dir
    possible_names = ["stockfish.exe", "stockfish", "stockfish-windows-x86-64.exe"]
    for name in possible_names:
        p = os.path.join(target_dir, name)
        if os.path.isfile(p):
            print(f"Stockfish already exists at: {p}")
            return os.path.abspath(p)

    url = None
    target_filename = "stockfish.exe" if system == "windows" else "stockfish"

    if system == "windows":
        url = "https://github.com/official-stockfish/Stockfish/releases/download/sf_19/stockfish-windows-x86-64-universal.zip"
    elif system == "darwin": # macOS
        url = "https://github.com/official-stockfish/Stockfish/releases/download/sf_19/stockfish-macos-x86-64-universal.tar"
    elif system == "linux":
        url = "https://github.com/official-stockfish/Stockfish/releases/download/sf_19/stockfish-ubuntu-x86-64-universal.tar"

    if not url:
        print(f"Automatic download not configured for {system}_{machine}. Please install manually.")
        return None

    print(f"Downloading Stockfish from {url}...")
    headers = {"User-Agent": "ChessMateAI-Installer"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            content = resp.read()
            print(f"Downloaded {len(content)} bytes. Extracting...")
            
            if url.endswith(".zip"):
                with zipfile.ZipFile(io.BytesIO(content)) as z:
                    for member in z.namelist():
                        if member.endswith(".exe"):
                            print(f"Extracting {member} -> {target_filename}")
                            data = z.read(member)
                            out_path = os.path.join(target_dir, target_filename)
                            with open(out_path, "wb") as f:
                                f.write(data)
                            print(f"Saved Stockfish to: {out_path}")
                            return os.path.abspath(out_path)
            elif url.endswith(".tar"):
                with tarfile.open(fileobj=io.BytesIO(content)) as t:
                    for member in t.getmembers():
                        if "stockfish" in member.name and not member.isdir():
                            f = t.extractfile(member)
                            if f:
                                out_path = os.path.join(target_dir, target_filename)
                                with open(out_path, "wb") as out_f:
                                    out_f.write(f.read())
                                os.chmod(out_path, os.stat(out_path).st_mode | stat.S_IEXEC)
                                print(f"Saved Stockfish to: {out_path}")
                                return os.path.abspath(out_path)
    except Exception as e:
        print(f"Failed to automatically download Stockfish: {e}")
        return None

if __name__ == "__main__":
    download_stockfish()
