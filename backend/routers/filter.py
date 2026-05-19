from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from utils.image_utils import get_image_from_request, encode_image
import cv2
import numpy as np

router = APIRouter()

@router.post("/gaussian-blur")
async def gaussian_blur(
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

@router.post("/median-filter")
async def median_filter(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    kernel_size: int = Form(5)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    if kernel_size % 2 == 0:
        kernel_size += 1
    result = cv2.medianBlur(img, kernel_size)
    return {"image": encode_image(result)}

@router.post("/noise-removal")
async def noise_removal(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    result = cv2.medianBlur(img, 5)
    return {"image": encode_image(result)}

@router.post("/edge-canny")
async def edge_canny(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    threshold1: int = Form(100),
    threshold2: int = Form(200)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, threshold1, threshold2)
    result = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/edge-sobel")
async def edge_sobel(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    result = cv2.magnitude(sobelx, sobely)
    result = np.uint8(np.clip(result, 0, 255))
    result = cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/edge-prewitt")
async def edge_prewitt(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float64)
    kernel_x = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]])
    kernel_y = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]])
    prewitt_x = cv2.filter2D(gray, -1, kernel_x)
    prewitt_y = cv2.filter2D(gray, -1, kernel_y)
    result = np.sqrt(prewitt_x**2 + prewitt_y**2)
    result = np.uint8(np.clip(result, 0, 255))
    result = cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/edge-robert")
async def edge_robert(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float64)
    kernel_x = np.array([[1, 0], [0, -1]])
    kernel_y = np.array([[0, 1], [-1, 0]])
    robert_x = cv2.filter2D(gray, -1, kernel_x)
    robert_y = cv2.filter2D(gray, -1, kernel_y)
    result = np.sqrt(robert_x**2 + robert_y**2)
    result = np.uint8(np.clip(result, 0, 255))
    result = cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/edge-laplacian")
async def edge_laplacian(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    result = np.uint8(np.clip(np.abs(laplacian), 0, 255))
    result = cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}

@router.post("/edge-log")
async def edge_log(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    log = cv2.Laplacian(blurred, cv2.CV_64F)
    result = np.uint8(np.clip(np.abs(log), 0, 255))
    result = cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)
    return {"image": encode_image(result)}