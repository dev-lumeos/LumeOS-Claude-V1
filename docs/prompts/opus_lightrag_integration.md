# LUMEOS — LightRAG Integration in den Workflow
# Ziel: LightRAG als Codebase Knowledge Graph für den Brain Layer

---

## Kontext

LightRAG ist ein Knowledge Graph + Vector Search System das den Codebase-Kontext
für Claude Code verfügbar macht. Es ergänzt Repomix (statischer XML Dump) mit
semantischer Suche und Graph-Traversal.

Repomix Output bereits vorhanden: `tools/repomix/codebase-context.xml` (331 files, 92K tokens)

Stack: Python, NetworkX (kein Neo4j nötig), lokale Embeddings via Ollama oder
direkt via OpenAI-kompatibler API (Spark A/B können Embeddings generieren).

---

## AUFGABE: LightRAG Setup + Workflow Integration

### WO-LR-1: LightRAG installieren und konfigurieren

Installiere LightRAG auf dem Threadripper (Python):

```bash
pip install lightrag-hku
pip install networkx
pip install ollama  # für lokale Embeddings
```

Erstelle `tools/lightrag/setup.py`:
```python
# LightRAG Setup für LumeOS Codebase
# Nutzt NetworkX als Graph Backend (kein Neo4j nötig)
# Embeddings via Ollama (lokal) oder Spark A (OpenAI-kompatibel)
```

Erstelle `tools/lightrag/config.yaml` (update bestehende):
```yaml
working_dir: tools/lightrag/storage
graph_backend: networkx
embedding_backend: ollama  # oder spark_a
embedding_model: nomic-embed-text
llm_backend: spark_a
llm_endpoint: http://192.168.0.128:8001/v1
llm_model: qwen3.6-35b
chunk_size: 1200
chunk_overlap: 100
```

**Acceptance:** `pip install lightrag-hku` erfolgreich, config vorhanden

---

### WO-LR-2: Codebase in LightRAG indexieren

Erstelle `tools/lightrag/index_codebase.py`:

```python
#!/usr/bin/env python3
"""
LumeOS Codebase Indexer für LightRAG
Liest alle TypeScript/Markdown Files aus dem Repo
und indexiert sie in LightRAG (NetworkX + Vector Store)
"""

import os
import asyncio
from pathlib import Path
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import openai_complete_if_cache, openai_embed

WORKSPACE_ROOT = Path(__file__).parent.parent.parent
STORAGE_DIR = Path(__file__).parent / "storage"

INCLUDE_EXTENSIONS = ['.ts', '.md', '.json', '.yaml', '.yml', '.sql']
EXCLUDE_DIRS = ['node_modules', 'dist', '.next', '.turbo', 'pnpm-lock.yaml']

async def index_codebase():
    rag = LightRAG(
        working_dir=str(STORAGE_DIR),
        # LLM via Spark A (OpenAI-kompatibel)
        llm_model_func=openai_complete_if_cache,
        llm_model_name="qwen3.6-35b",
        llm_model_kwargs={
            "base_url": "http://192.168.0.128:8001/v1",
            "api_key": "not-needed"
        },
        # Embeddings - Spark A auch
        embedding_func=openai_embed,
        embedding_model="qwen3.6-35b",  # oder nomic-embed wenn verfügbar
        embedding_kwargs={
            "base_url": "http://192.168.0.128:8001/v1",
            "api_key": "not-needed"
        }
    )

    # Alle relevanten Files sammeln
    files = []
    for ext in INCLUDE_EXTENSIONS:
        for f in WORKSPACE_ROOT.rglob(f'*{ext}'):
            skip = False
            for excl in EXCLUDE_DIRS:
                if excl in str(f):
                    skip = True
                    break
            if not skip:
                files.append(f)

    print(f"Indexing {len(files)} files...")

    for i, f in enumerate(files):
        try:
            content = f.read_text(encoding='utf-8', errors='ignore')
            if len(content) > 100:  # Skip leere Files
                rel_path = f.relative_to(WORKSPACE_ROOT)
                doc = f"# File: {rel_path}\n\n{content}"
                await rag.ainsert(doc)
                if i % 10 == 0:
                    print(f"  [{i}/{len(files)}] {rel_path}")
        except Exception as e:
            print(f"  Skip {f}: {e}")

    print("Indexing complete!")
    return rag

if __name__ == "__main__":
    asyncio.run(index_codebase())
```

**Acceptance:** Script läuft ohne Fehler, `tools/lightrag/storage/` wird gefüllt

---

### WO-LR-3: LightRAG Query Interface

Erstelle `tools/lightrag/query.py`:

```python
#!/usr/bin/env python3
"""
LumeOS LightRAG Query Interface
Nutzung: python tools/lightrag/query.py "Wie ist der SAT-Check implementiert?"
"""

import sys
import asyncio
from pathlib import Path
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import openai_complete_if_cache, openai_embed

STORAGE_DIR = Path(__file__).parent / "storage"

QUERY_MODES = {
    "local": "Exakte Code-Details, spezifische Implementierungen",
    "global": "Übergreifende Architektur-Fragen",
    "hybrid": "Kombination — am besten für die meisten Fragen",
    "naive": "Einfache Vector-Suche ohne Graph"
}

async def query(question: str, mode: str = "hybrid"):
    rag = LightRAG(
        working_dir=str(STORAGE_DIR),
        llm_model_func=openai_complete_if_cache,
        llm_model_name="qwen3.6-35b",
        llm_model_kwargs={
            "base_url": "http://192.168.0.128:8001/v1",
            "api_key": "not-needed"
        },
        embedding_func=openai_embed,
        embedding_model="qwen3.6-35b",
        embedding_kwargs={
            "base_url": "http://192.168.0.128:8001/v1",
            "api_key": "not-needed"
        }
    )

    result = await rag.aquery(question, param=QueryParam(mode=mode))
    return result

if __name__ == "__main__":
    question = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "What is the overall architecture?"
    mode = "hybrid"
    print(f"Query: {question}")
    print(f"Mode: {mode}\n")
    result = asyncio.run(query(question, mode))
    print(result)
```

**Acceptance:** `python tools/lightrag/query.py "Wie funktioniert der Governance Compiler?"` gibt sinnvolle Antwort

---

### WO-LR-4: LightRAG als MCP Server einbinden

Erstelle `tools/lightrag/mcp_server.py` — ein einfacher HTTP Server
der LightRAG queries über MCP verfügbar macht:

```python
#!/usr/bin/env python3
"""
LightRAG MCP Server für Claude Code
Port: 9004
Endpoint: POST /query { question, mode }
"""
from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
import uvicorn

app = FastAPI()

class QueryRequest(BaseModel):
    question: str
    mode: str = "hybrid"

@app.post("/query")
async def query_codebase(req: QueryRequest):
    # LightRAG query
    ...
    return {"answer": result, "mode": req.mode}

@app.get("/health")
def health():
    return {"status": "ok", "service": "lightrag"}
```

Füge zu `.claude/mcp.json` hinzu:
```json
"lightrag": {
    "command": "python",
    "args": ["tools/lightrag/mcp_server.py"],
    "env": { "WORKSPACE_ROOT": "." }
}
```

**Acceptance:** `curl http://localhost:9004/health` antwortet mit ok

---

### WO-LR-5: CLAUDE.md updaten

Update `CLAUDE.md` mit LightRAG Usage Sektion:

```markdown
## LightRAG — Codebase Knowledge Graph

Für Architektur-Fragen und Code-Navigation nutze LightRAG:

\`\`\`bash
# Query ausführen
python tools/lightrag/query.py "Wie ist der WO Lifecycle definiert?"

# Oder via MCP (wenn Server läuft auf Port 9004):
# POST http://localhost:9004/query
# { "question": "...", "mode": "hybrid" }
\`\`\`

Query Modes:
- hybrid: Beste Ergebnisse für die meisten Fragen (Standard)
- local:  Spezifische Code-Details
- global: Übergreifende Architektur-Fragen
- naive:  Schnelle Vector-Suche

Index neu aufbauen wenn sich viel geändert hat:
\`\`\`bash
python tools/lightrag/index_codebase.py
\`\`\`
```

---

### WO-LR-6: Startup Script

Erstelle `tools/scripts/start-lightrag.ps1`:
```powershell
# Startet LightRAG MCP Server auf Port 9004
Set-Location D:\GitHub\LumeOS-Claude-V1
python tools/lightrag/mcp_server.py
```

---

## REIHENFOLGE

```
WO-LR-1: pip install + config          ← zuerst
WO-LR-2: Index Script                  ← schreiben (noch nicht ausführen)
WO-LR-3: Query Interface               ← schreiben
WO-LR-4: MCP Server                    ← schreiben + .claude/mcp.json updaten
WO-LR-5: CLAUDE.md Update              ← dokumentieren
WO-LR-6: Startup Script                ← letztes
```

## WICHTIG

- Embeddings: Prüfe zuerst ob Spark A Embeddings unterstützt:
  `curl http://192.168.0.128:8001/v1/models`
  Falls nicht → nutze `pip install sentence-transformers` als Fallback
  mit lokalem Modell `all-MiniLM-L6-v2`

- Index NICHT sofort ausführen — erst Script schreiben und reviewed werden
  Das Indexieren dauert lange und kostet Spark A Tokens

- Storage in `tools/lightrag/storage/` — diese Ordner in .gitignore aufnehmen
  (können mehrere GB groß werden)

- Python läuft auf dem Threadripper — alle Befehle im Windows Terminal ausführen

Starte mit WO-LR-1 und frage wenn unklar.
