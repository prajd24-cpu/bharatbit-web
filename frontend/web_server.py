from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

app = FastAPI()

# Path to the dist folder
DIST_PATH = Path("/app/frontend/dist")

# Mount static files
app.mount("/_expo", StaticFiles(directory=str(DIST_PATH / "_expo")), name="expo")
app.mount("/assets", StaticFiles(directory=str(DIST_PATH / "assets")), name="assets")

# Serve index.html for root
@app.get("/")
async def root():
    return FileResponse(str(DIST_PATH / "index.html"))

# Serve HTML files for routes
@app.get("/{path:path}")
async def serve_spa(path: str):
    # Check if it's a static file
    file_path = DIST_PATH / path
    if file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    
    # Check for HTML file
    html_path = DIST_PATH / f"{path}.html"
    if html_path.exists():
        return FileResponse(str(html_path))
    
    # Check for directory with index.html
    dir_index = DIST_PATH / path / "index.html"
    if dir_index.exists():
        return FileResponse(str(dir_index))
    
    # Fallback to index.html for SPA routing
    return FileResponse(str(DIST_PATH / "index.html"))
