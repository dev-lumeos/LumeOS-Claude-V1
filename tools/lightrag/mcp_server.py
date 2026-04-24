#!/usr/bin/env python3
"""
LightRAG HTTP Server for Claude Code (and anything else HTTP)

Port:       9004
Endpoints:
    GET  /health              -> {status, service}
    POST /query               -> {answer, mode}
        body: {"question": "...", "mode": "hybrid"}

Note: this is a plain HTTP service, not a stdio MCP server. The .claude/mcp.json
entry under the same name lets Claude Code reach it via spawn, but real stdio
MCP would require the `mcp` SDK — for now, POST directly to /query.
"""

from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import openai_complete_if_cache
from lightrag.utils import EmbeddingFunc
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

STORAGE_DIR = Path(__file__).resolve().parent / "storage"

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384
LLM_MODEL_NAME = "qwen3.6-35b-fp8"
LLM_BASE_URL = "http://192.168.0.128:8001/v1"
LLM_API_KEY = os.environ.get("SPARK_A_API_KEY", "not-needed")

HOST = os.environ.get("LIGHTRAG_HOST", "127.0.0.1")
PORT = int(os.environ.get("LIGHTRAG_PORT", "9004"))


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


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not STORAGE_DIR.exists():
        raise RuntimeError(
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
    app.state.rag = rag
    try:
        yield
    finally:
        await rag.finalize_storages()


app = FastAPI(title="LumeOS LightRAG", version="0.1.0", lifespan=lifespan)


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1)
    mode: Literal["hybrid", "local", "global", "naive", "mix"] = "hybrid"


class QueryResponse(BaseModel):
    answer: str
    mode: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "lightrag"}


@app.post("/query", response_model=QueryResponse)
async def query_codebase(req: QueryRequest) -> QueryResponse:
    rag: LightRAG = app.state.rag
    try:
        result = await rag.aquery(req.question, param=QueryParam(mode=req.mode))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"query failed: {e}") from e
    if not isinstance(result, str):
        # stream=False by default; unexpected iterator -> collect
        collected = []
        async for chunk in result:
            collected.append(chunk)
        result = "".join(collected)
    return QueryResponse(answer=result, mode=req.mode)


if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)
