# Starts the LightRAG HTTP server on 127.0.0.1:9004
# Prerequisites:
#   - `pip install lightrag-hku sentence-transformers torch fastapi uvicorn`
#   - Index built: `python tools/lightrag/index_codebase.py`

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

$storage = Join-Path $repoRoot "tools/lightrag/storage"
if (-not (Test-Path $storage)) {
    Write-Error "LightRAG storage not found at $storage. Run: python tools/lightrag/index_codebase.py"
    exit 2
}

$env:PYTHONIOENCODING = "utf-8"
python tools/lightrag/mcp_server.py
