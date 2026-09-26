import os
import base64
import json
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


# ============================================================
# ENV
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT / "backend" / ".env")


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured."
    )


client = Groq(
    api_key=GROQ_API_KEY
)


# Current Groq multimodal model
MODEL = "qwen/qwen3.8-27b"


# ============================================================
# IMAGE ENCODER
# ============================================================

def encode_image(image_path: str) -> str:

    with open(image_path, "rb") as image_file:
        return base64.b64encode(
            image_file.read()
        ).decode("utf-8")


# ============================================================
# AI LISTING GENERATOR
# ============================================================

def generate_product_listing(
    image_path: str
) -> dict:

    image_data = encode_image(
        image_path
    )

    prompt = """
You are HASTKATHA, an AI assistant helping
Indian artisans create marketplace listings.

Analyze the uploaded handmade product image.

Your job is to generate a useful product listing
from visual evidence only.

IMPORTANT:

1. Do not invent facts.
2. If something cannot be confidently identified,
   use null or "Unknown".
3. Do not falsely claim a GI registration.
4. Do not invent an artisan name.
5. Do not invent a precise geographic origin.
6. If text is visible in the image, extract it.
7. Describe only what can reasonably be inferred.
8. The description should be suitable for an Indian
   handicraft marketplace.
9. Keep the language simple and professional.

Return ONLY valid JSON.

Required JSON structure:

{
  "product_name": "...",
  "description": "...",
  "material": "...",
  "product_type": "...",
  "craft_name": "...",
  "region": "...",
  "state": "...",
  "ocr_text": "...",
  "tags": ["...", "..."],
  "visual_features": ["...", "..."],
  "confidence": "high | medium | low"
}

For confidence:

high = product/material is visually clear

medium = reasonable identification but some
details are uncertain

low = image does not provide enough information
for reliable identification
"""

    try:

        response = client.chat.completions.create(
            model=MODEL,

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You generate grounded "
                        "Indian handicraft marketplace "
                        "listings."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": (
                                    "data:image/jpeg;base64,"
                                    + image_data
                                )
                            },
                        },
                    ],
                },
            ],

            temperature=0.2,

            max_completion_tokens=1200,

            response_format={
                "type": "json_object"
            },
        )

        content = (
            response
            .choices[0]
            .message
            .content
        )

        if not content:
            raise RuntimeError(
                "AI returned an empty response."
            )

        return json.loads(content)

    except Exception as e:

        print(
            f"[AI LISTING] Generation failed: {e}"
        )

        raise RuntimeError(
            f"AI listing generation failed: {e}"
        )