from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    status,
)

from app.services.ai_listing_service import (
    generate_product_listing,
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Listing"],
)


# ============================================================
# GENERATE PRODUCT LISTING
# ============================================================

@router.post("/generate-listing")
async def generate_listing(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    if not file.content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type missing",
        )

    if not file.content_type.startswith(
        "image/"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed",
        )

    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    image_bytes = await file.read()

    # 10 MB limit
    if len(image_bytes) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be smaller than 10 MB",
        )

    # --------------------------------------------------------
    # Temporary directory
    # --------------------------------------------------------

    project_root = Path(
        __file__
    ).resolve().parents[2]

    temp_dir = (
        project_root
        / "uploads"
        / "ai_temp"
    )

    temp_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Safe filename
    # --------------------------------------------------------

    filename = Path(
        file.filename or "product.jpg"
    ).name

    temp_path = (
        temp_dir
        / filename
    )

    # --------------------------------------------------------
    # Save temporarily
    # --------------------------------------------------------

    with open(
        temp_path,
        "wb"
    ) as output:

        output.write(
            image_bytes
        )

    # --------------------------------------------------------
    # AI generation
    # --------------------------------------------------------

    try:

        listing = generate_product_listing(
            str(temp_path)
        )

        return {
            "success": True,
            "data": listing,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:

        # Delete temporary file
        if temp_path.exists():
            temp_path.unlink()