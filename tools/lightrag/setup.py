#!/usr/bin/env python3
# LightRAG Setup für LumeOS Codebase
# Nutzt NetworkX als Graph Backend (kein Neo4j nötig)
# Embeddings via sentence-transformers (lokal, CUDA wenn verfügbar)
# LLM via Spark A (OpenAI-kompatibel)
#
# Reads tools/lightrag/config.yaml and constructs a LightRAG instance
# used by index_codebase.py (WO-LR-2) and query.py (WO-LR-3).

from __future__ import annotations

from pathlib import Path

import yaml

CONFIG_PATH = Path(__file__).parent / "config.yaml"


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


if __name__ == "__main__":
    cfg = load_config()
    print("LightRAG config loaded:")
    for key, value in cfg.items():
        print(f"  {key}: {value}")
