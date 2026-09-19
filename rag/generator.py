import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


# ============================================================
# ENVIRONMENT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

# Load project root .env
load_dotenv(PROJECT_ROOT / ".env")

# Also try backend/.env
load_dotenv(PROJECT_ROOT / "backend" / ".env")


GROQ_API_KEY = os.getenv("GROQ_API_KEY")


if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set in the environment."
    )


# ============================================================
# GROQ CLIENT
# ============================================================

client = Groq(
    api_key=GROQ_API_KEY
)


# Current Groq production model
MODEL = "openai/gpt-oss-120b"


# ============================================================
# RAG GENERATION
# ============================================================

def generate_answer(
    question: str,
    context: str,
) -> str:

    system_prompt = """
You are HASTKATHA, an AI assistant for Indian
traditional crafts and cultural heritage.

Your job is to answer questions using the
retrieved ODOP craft records supplied by the
application.

IMPORTANT RULES:

1. Use the retrieved context as your primary source.
2. Do not invent facts.
3. Do not make unsupported claims.
4. If the context does not contain enough information,
   clearly say that the available archive does not
   contain enough information.
5. Keep answers concise but informative.
6. Mention relevant state, district, category,
   material or GI status when available.
7. Keep the tone educational and human-friendly.

You are part of the HASTKATHA digital heritage
ecosystem.
"""

    user_prompt = f"""
USER QUESTION:
{question}

RETRIEVED ODOP CRAFT RECORDS:
{context}

Using the retrieved records above, answer the
user's question.

Do not introduce facts that are not supported
by the retrieved records.
"""

    try:

        response = client.chat.completions.create(
            model=MODEL,

            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],

            temperature=0.2,

            max_tokens=700,
        )

        answer = (
            response
            .choices[0]
            .message
            .content
        )

        if not answer:
            raise RuntimeError(
                "Groq returned an empty response."
            )

        return answer.strip()

    except Exception as e:

        print(
            f"[Groq] Generation failed: {e}"
        )

        raise RuntimeError(
            f"RAG generation failed: {e}"
        )