#!/usr/bin/env python3
"""
LumeOS Codebase Indexer für LightRAG (naive / vector-only mode)

- Graph Backend: NetworkX (lokal, kein Neo4j)
- Embeddings: sentence-transformers all-MiniLM-L6-v2 (dim=384, lokal)
- LLM: STUBBED during indexing — no entity extraction, no Spark A calls.
  Query-time LLM (see query.py) is separate.

Aufruf:  python tools/lightrag/index_codebase.py
         python tools/lightrag/index_codebase.py --dry-run   # zählt Files, indexiert nicht
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

import numpy as np
from lightrag import LightRAG
from lightrag.utils import EmbeddingFunc
from sentence_transformers import SentenceTransformer

WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
STORAGE_DIR = Path(__file__).resolve().parent / "storage"

INCLUDE_EXTENSIONS = {".ts", ".tsx", ".md", ".json", ".yaml", ".yml", ".sql", ".py"}
EXCLUDE_DIR_NAMES = {
    "node_modules",
    "dist",
    ".next",
    ".turbo",
    ".git",
    "storage",
    ".venv",
    "venv",
    "__pycache__",
}
EXCLUDE_FILE_NAMES = {
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "codebase-context.xml",
}
MIN_CONTENT_BYTES = 100
MAX_CONTENT_BYTES = 200_000

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384
# Dummy name; no LLM is actually called during indexing.
LLM_MODEL_NAME = "noop-indexer"


def build_embedding_func() -> EmbeddingFunc:
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    async def embed(texts: list[str]) -> np.ndarray:
        # sentence-transformers encode is sync; offload to a thread so we don't block the loop.
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


async def noop_llm_func(
    prompt: str,
    system_prompt: str | None = None,
    history_messages: list[dict] | None = None,
    **kwargs,
) -> str:
    # Returning empty string makes LightRAG's entity extractor find 0 entities
    # and 0 relations per chunk, so phases 1/2/3 become no-ops. Chunks are
    # still embedded and stored in the vector DB.
    return ""


def collect_files() -> list[Path]:
    files: list[Path] = []
    for path in WORKSPACE_ROOT.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in INCLUDE_EXTENSIONS:
            continue
        if any(part in EXCLUDE_DIR_NAMES for part in path.parts):
            continue
        if path.name in EXCLUDE_FILE_NAMES:
            continue
        if path.name.endswith((".test.ts", ".spec.ts", ".test.tsx", ".spec.tsx")):
            continue
        try:
            size = path.stat().st_size
        except OSError:
            continue
        if size < MIN_CONTENT_BYTES or size > MAX_CONTENT_BYTES:
            continue
        files.append(path)
    return files


async def index_codebase(dry_run: bool = False) -> None:
    files = collect_files()
    print(f"Found {len(files)} indexable files under {WORKSPACE_ROOT}")
    if dry_run:
        for f in files[:20]:
            print(f"  {f.relative_to(WORKSPACE_ROOT)}")
        if len(files) > 20:
            print(f"  ... (+{len(files) - 20} more)")
        return

    STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    rag = LightRAG(
        working_dir=str(STORAGE_DIR),
        graph_storage="NetworkXStorage",
        embedding_func=build_embedding_func(),
        llm_model_func=noop_llm_func,
        llm_model_name=LLM_MODEL_NAME,
        chunk_token_size=1200,
        chunk_overlap_token_size=100,
        enable_llm_cache_for_entity_extract=False,
    )

    await rag.initialize_storages()
    try:
        for i, f in enumerate(files):
            try:
                content = f.read_text(encoding="utf-8", errors="ignore")
            except OSError as e:
                print(f"  skip {f}: {e}")
                continue
            if len(content) < MIN_CONTENT_BYTES:
                continue
            rel_path = f.relative_to(WORKSPACE_ROOT).as_posix()
            doc = f"# File: {rel_path}\n\n{content}"
            try:
                await rag.ainsert(doc, ids=[rel_path], file_paths=[rel_path])
            except TypeError:
                # older LightRAG versions do not accept ids/file_paths kwargs
                await rag.ainsert(doc)
            if i % 10 == 0:
                print(f"  [{i + 1}/{len(files)}] {rel_path}")
        print(f"Indexing complete: {len(files)} files -> {STORAGE_DIR}")
    finally:
        await rag.finalize_storages()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Index LumeOS codebase into LightRAG")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="list files that would be indexed without running the indexer",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    try:
        asyncio.run(index_codebase(dry_run=args.dry_run))
    except KeyboardInterrupt:
        print("\nInterrupted.", file=sys.stderr)
        sys.exit(130)
