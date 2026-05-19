from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from utils.image_utils import get_image_from_request
import cv2
import numpy as np

router = APIRouter()

@router.post("/analyze")
async def analyze_histogram(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)

    histogram_data = {}
    for i, color in enumerate(['b', 'g', 'r']):
        hist = cv2.calcHist([img], [i], None, [256], [0, 256])
        histogram_data[color] = hist.flatten().tolist()

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    histogram_data['gray'] = gray_hist.flatten().tolist()

    return {"histogram": histogram_data}