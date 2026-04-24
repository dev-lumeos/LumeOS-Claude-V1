#!/usr/bin/env python3
"""
LumeOS LightRAG Query Interface

Usage:
    python tools/lightrag/query.py "Wie ist der SAT-Check implementiert?"
    python tools/lightrag/query.py --mode global "Was ist die Brain Layer Rolle?"

Modes:
    hybrid  (default) — Kombination aus KG + Vector, gut für die meisten Fragen
    local             — Exakte Code-Details, spezifische Implementierungen
    global            — Übergreifende Architektur-Fragen
    naive             — Einfache Vector-Suche ohne Graph
    mix               — KG + Vector integriert (LightRAG-Default)
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

import numpy as np
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import openai_complete_if_cache
from lightrag.utils import EmbeddingFunc
from sentence_transformers import SentenceTransformer

STORAGE_DIR = Path(__file__).resolve().parent / "storage"

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384
LLM_MODEL_NAME = "qwen3.6-35b-fp8"
LLM_BASE_URL = "http://192.168.0.128:8001/v1"
LLM_API_KEY = os.environ.get("SPARK_A_API_KEY", "not-needed")

VALID_MODES = {"hybrid", "local", "global", "naive", "mix"}


def build_embedding_func() -> EmbeddingFunc:
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    async def embed(texts: list[str]) -> np.ndarray:
        return await asyncio.to_thread(
            model.encode,
            texts,
            convert_to_numpy=True,
            show_progress_bar=False,
            normalize_embeddings=True,
        )

    return EmbeddingFunc(
        embedding_dim=EMBEDDING_DIM,
        max_token_size=512,
        func=embed,
        model_name=EMBEDDING_MODEL_NAME,
    )


async def llm_model_func(
    prompt: str,
    system_prompt: str | None = None,
    history_messages: list[dict] | None = None,
    **kwargs,
) -> str:
    return await openai_complete_if_cache(
        model=LLM_MODEL_NAME,
        prompt=prompt,
        system_prompt=system_prompt,
        history_messages=history_messages or [],
        base_url=LLM_BASE_URL,
        api_key=LLM_API_KEY,
        **kwargs,
    )


async def run_query(question: str, mode: str) -> str:
    if not STORAGE_DIR.exists():
        raise FileNotFoundError(
            f"LightRAG storage not found at {STORAGE_DIR}. "
            f"Run `python tools/lightrag/index_codebase.py` first."
        )

    rag = LightRAG(
        working_dir=str(STORAGE_DIR),
        graph_storage="NetworkXStorage",
        embedding_func=build_embedding_func(),
        llm_model_func=llm_model_func,
        llm_model_name=LLM_MODEL_NAME,
        chunk_token_size=1200,
        chunk_overlap_token_size=100,
    )

    await rag.initialize_storages()
    try:
        return await rag.aquery(question, param=QueryParam(mode=mode))
    finally:
        await rag.finalize_storages()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Query the LumeOS codebase via LightRAG",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("question", nargs="+", help="Natural-language question")
    parser.add_argument(
        "--mode",
        choices=sorted(VALID_MODES),
        default="hybrid",
        help="Retrieval mode (default: hybrid)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    question = " ".join(args.question)

    print(f"Query: {question}")
    print(f"Mode:  {args.mode}\n")

    try:
        result = asyncio.run(run_query(question, args.mode))
    except KeyboardInterrupt:
        print("\nInterrupted.", file=sys.stderr)
        return 130
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 2

    print(result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
