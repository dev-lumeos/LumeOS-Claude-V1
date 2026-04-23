# LightRAG Setup

LightRAG erstellt einen Knowledge Graph für die LumeOS Codebase.

## Installation

```bash
# Via pip
pip install lightrag-hku

# Oder via Docker
docker pull hkuds/lightrag:latest
```

## Konfiguration

```python
from lightrag import LightRAG

rag = LightRAG(
    working_dir="./lightrag_workdir",
    llm_model_func=llm_model_func,  # vLLM endpoint
    embedding_func=embedding_func,
)
```

## Verwendung mit LumeOS

1. **Codebase indexieren**: Repomix Output → LightRAG
2. **Query**: Natürliche Sprache → Graph Traversal → Code Context
3. **Integration**: MCP Server für Claude Code Zugriff

## Knowledge Graph Struktur

```
LumeOS Codebase
├── Modules (12)
│   ├── nutrition
│   ├── training
│   └── ...
├── Services
│   ├── orchestrator-api
│   ├── scheduler-api
│   └── ...
├── Packages
│   ├── wo-core
│   ├── graph-core
│   └── ...
└── System
    ├── workorders
    ├── decomposition
    └── policies
```

## Referenzen

- [LightRAG GitHub](https://github.com/HKUDS/LightRAG)
- [LightRAG Docs](https://lightrag.github.io/)
