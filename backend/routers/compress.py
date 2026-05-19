from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from utils.image_utils import get_image_from_request, encode_image
import cv2
import numpy as np
import base64

router = APIRouter()

@router.post("/jpeg-quality")
async def jpeg_quality(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    quality: int = Form(50)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, quality])
    compressed_b64 = base64.b64encode(buffer).decode('utf-8')
    return {
        "image": compressed_b64,
        "compressed_size_kb": round(len(buffer) / 1024, 2)
    }