from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from utils.image_utils import get_image_from_request, encode_image
import cv2
import numpy as np

router = APIRouter()

@router.post("/brightness-contrast")
async def brightness_contrast(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    brightness: int = Form(0),
    contrast: float = Form(1.0)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    # Gunakan np.clip alih-alih cv2.convertScaleAbs agar penyesuaian kecerahan negatif tidak membalikkan warna
    result = np.clip(img.astype(np.float32) * contrast + brightness, 0, 255).astype(np.uint8)
    return {"image": encode_image(result)}

@router.post("/histogram-equalization")
async def histogram_equalization(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    img_yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    img_yuv[:, :, 0] = cv2.equalizeHist(img_yuv[:, :, 0])
    result = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2BGR)
    return {"image": encode_image(result)}

@router.post("/sharpen")
async def sharpen(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    result = cv2.filter2D(img, -1, kernel)
    return {"image": encode_image(result)}

@router.post("/smooth")
async def smooth(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    kernel_size: int = Form(5)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    if kernel_size % 2 == 0:
        kernel_size += 1
    result = cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)
    return {"image": encode_image(result)}

@router.post("/gamma")
async def gamma_correction(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    gamma: float = Form(1.0)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    # Manual Gamma Correction using OpenCV Look-Up Table (LUT) mapping
    # V_out = (V_in / 255) ^ (1 / gamma) * 255
    inv_gamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype(np.uint8)
    result = cv2.LUT(img, table)
    return {"image": encode_image(result)}