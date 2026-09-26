from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile, status


router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


# backend/uploads/products
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "products"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


@router.post("/product-image")
async def upload_product_image(
    file: UploadFile = File(...)
):
    # ---------------------------------------------
    # Validate file type
    # ---------------------------------------------

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG and WEBP images are allowed.",
        )

    # ---------------------------------------------
    # Read file
    # ---------------------------------------------

    contents = await file.read()

    # 10 MB limit
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be smaller than 10 MB.",
        )

    # ---------------------------------------------
    # Generate unique filename
    # ---------------------------------------------

    extension = ALLOWED_TYPES[file.content_type]

    filename = f"{uuid4().hex}{extension}"

    file_path = UPLOAD_DIR / filename

    # ---------------------------------------------
    # Save image
    # ---------------------------------------------

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    return {
        "success": True,
        "filename": filename,
        "image_url": f"/uploads/products/{filename}",
        "message": "Product image uploaded successfully.",
    }