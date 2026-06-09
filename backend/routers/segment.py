from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from utils.image_utils import get_image_from_request, encode_image
import cv2
import numpy as np

router = APIRouter()

@router.post("/threshold")
async def threshold(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    thresh_value: int = Form(127)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, result = cv2.threshold(gray, thresh_value, 255, cv2.THRESH_BINARY)
    result = cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/otsu")
async def otsu_threshold(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, result = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    result = cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/edge-based")
async def edge_based_segmentation(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    result = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/region-based")
async def region_based_segmentation(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    pixel_values = img.reshape((-1, 3)).astype(np.float32)
    k = 3
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, labels, centers = cv2.kmeans(
        pixel_values, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS
    )
    centers = np.uint8(centers)
    result = centers[labels.flatten()].reshape(img.shape)
    return {"image": encode_image(result)}

@router.post("/morphology")
async def morphology(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    operation: str = Form("erode"),
    kernel_size: int = Form(5)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    if operation == "erode":
        result = cv2.erode(img, kernel, iterations=1)
    elif operation == "dilate":
        result = cv2.dilate(img, kernel, iterations=1)
    elif operation == "open":
        result = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)
    elif operation == "close":
        result = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)
    else:
        result = img
    return {"image": encode_image(result)}