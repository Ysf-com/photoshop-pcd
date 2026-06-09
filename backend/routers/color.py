from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from utils.image_utils import get_image_from_request, encode_image
import cv2
import numpy as np

router = APIRouter()

@router.post("/grayscale")
async def grayscale(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    result = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/channel-split")
async def channel_split(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    channel: str = Form("R")
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    b, g, r = cv2.split(img)
    blank = np.zeros_like(b)
    if channel == "R":
        result = cv2.merge([blank, blank, r])
    elif channel == "G":
        result = cv2.merge([blank, g, blank])
    else:
        result = cv2.merge([b, blank, blank])
    return {"image": encode_image(result)}

@router.post("/hue-saturation")
async def hue_saturation(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    hue: int = Form(0),
    saturation: int = Form(0)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.int32)
    # Hue adalah sudut melingkar (0-179 di OpenCV), gunakan modulo alih-alih clip agar transisi warna alami
    hsv[:, :, 0] = (hsv[:, :, 0] + hue) % 180
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] + saturation, 0, 255)
    hsv = hsv.astype(np.uint8)
    result = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    return {"image": encode_image(result)}

@router.post("/invert")
async def invert(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    # Manual pixel-by-pixel inversion using numpy vector operation
    result = 255 - img
    return {"image": encode_image(result)}

@router.post("/sepia")
async def sepia(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    
    # Manual sepia matrix formula:
    # R' = 0.393R + 0.769G + 0.189B
    # G' = 0.349R + 0.686G + 0.168B
    # B' = 0.272R + 0.534G + 0.131B
    img_f = img.astype(np.float32)
    b = img_f[:, :, 0]
    g = img_f[:, :, 1]
    r = img_f[:, :, 2]
    
    r_new = np.clip(0.393 * r + 0.769 * g + 0.189 * b, 0, 255)
    g_new = np.clip(0.349 * r + 0.686 * g + 0.168 * b, 0, 255)
    b_new = np.clip(0.272 * r + 0.534 * g + 0.131 * b, 0, 255)
    
    result = cv2.merge([b_new.astype(np.uint8), g_new.astype(np.uint8), r_new.astype(np.uint8)])
    return {"image": encode_image(result)}