from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

import sys
from pathlib import Path


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# RAG IMPORTS
# ============================================================

from rag.retriever import retrieve_crafts
from rag.generator import generate_answer


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/rag",
    tags=["RAG"]
)


# ============================================================
# REQUEST MODEL
# ============================================================

class RAGRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        max_length=1000
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10
    )


# ============================================================
# PARSE DOCUMENT
# ============================================================

def parse_document(document: str):

    data = {}

    if not document:
        return data

    for line in document.splitlines():

        line = line.strip()

        if not line or ":" not in line:
            continue

        key, value = line.split(":", 1)

        key = key.strip()
        value = value.strip()

        data[key] = value

    return data


# ============================================================
# BUILD CONTEXT
# ============================================================

def build_context(results):

    context_parts = []
    sources = []

    if not results:
        return "", []

    for item in results:

        if not isinstance(item, dict):
            continue

        # ----------------------------------------------------
        # Actual retrieve_crafts() structure:
        #
        # {
        #   "document": "...",
        #   "metadata": {...},
        #   "distance": ...
        # }
        # ----------------------------------------------------

        document = item.get("document", "")
        metadata = item.get("metadata", {})

        if not isinstance(metadata, dict):
            metadata = {}

        distance = item.get("distance")

        # ----------------------------------------------------
        # Parse information from document
        # ----------------------------------------------------

        parsed = parse_document(document)

        # ----------------------------------------------------
        # Metadata first, document as fallback
        # ----------------------------------------------------

        craft_name = (
            parsed.get("Craft Name")
            or parsed.get("Product")
            or parsed.get("Craft")
            or metadata.get("product")
            or metadata.get("craft_name")
            or "Craft record"
        )

        state = (
            metadata.get("state")
            or parsed.get("State")
            or ""
        )

        district = (
            metadata.get("district")
            or parsed.get("District")
            or ""
        )

        category = (
            metadata.get("category")
            or parsed.get("Category")
            or ""
        )

        sector = (
            metadata.get("sector")
            or parsed.get("Sector")
            or ""
        )

        gi_status = (
            metadata.get("gi_status")
            or parsed.get("GI Status")
            or ""
        )

        description = (
            parsed.get("Description")
            or ""
        )

        ministry = (
            parsed.get("Ministry / Department")
            or ""
        )

        # ----------------------------------------------------
        # Build clean LLM context
        # ----------------------------------------------------

        context_parts.append(
            f"""
Craft Name: {craft_name}
State: {state}
District: {district}
Category: {category}
Sector: {sector}
GI Status: {gi_status}
Ministry / Department: {ministry}
Description: {description}
""".strip()
        )

        # ----------------------------------------------------
        # Build frontend source
        # ----------------------------------------------------

        sources.append({
            "craft_name": craft_name,
            "state": state,
            "district": district,
            "category": category,
            "gi_status": gi_status,
            "distance": distance
        })

    return "\n\n---\n\n".join(context_parts), sources


# ============================================================
# RAG ENDPOINT
# ============================================================

@router.post("/ask")
def ask_rag(request: RAGRequest):

    try:

        # ====================================================
        # STEP 1 — SEMANTIC RETRIEVAL
        # ====================================================

        retrieved = retrieve_crafts(
            request.question,
            top_k=request.top_k
        )

        print(
            f"[RAG] Retrieved {len(retrieved)} craft records"
        )

        # ====================================================
        # STEP 2 — BUILD CONTEXT
        # ====================================================

        context, sources = build_context(retrieved)

        if not context.strip():

            return {
                "success": True,
                "answer": (
                    "I could not find enough relevant craft "
                    "records in the HASTKATHA archive to answer "
                    "this question."
                ),
                "sources": []
            }

        print("\n[RAG CONTEXT]")
        print(context)

        # ====================================================
        # STEP 3 — GROQ GENERATION
        # ====================================================

        answer = generate_answer(
            question=request.question,
            context=context
        )

        # ====================================================
        # STEP 4 — RESPONSE
        # ====================================================

        return {
            "success": True,
            "answer": answer,
            "sources": sources
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        print(f"[RAG ERROR] {e}")

        raise HTTPException(
            status_code=500,
            detail=f"RAG generation failed: {str(e)}"
        )