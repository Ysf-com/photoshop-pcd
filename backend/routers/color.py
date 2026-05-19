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
    hsv[:, :, 0] = np.clip(hsv[:, :, 0] + hue, 0, 179)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] + saturation, 0, 255)
    hsv = hsv.astype(np.uint8)
    result = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    return {"image": encode_image(result)}