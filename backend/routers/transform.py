from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from utils.image_utils import get_image_from_request, encode_image
import cv2
import numpy as np

router = APIRouter()

@router.post("/rotate")
async def rotate(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    angle: float = Form(90.0)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    
    # Dapatkan matriks rotasi awal
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    
    # Hitung nilai absolut sinus dan kosinus sudut rotasi
    cos = np.abs(matrix[0, 0])
    sin = np.abs(matrix[0, 1])
    
    # Hitung dimensi baru canvas agar menampung seluruh gambar hasil rotasi
    nW = int((h * sin) + (w * cos))
    nH = int((h * cos) + (w * sin))
    
    # Sesuaikan pergeseran matriks rotasi agar titik pusat gambar tetap di tengah canvas baru
    matrix[0, 2] += (nW / 2) - center[0]
    matrix[1, 2] += (nH / 2) - center[1]
    
    # Warp gambar ke canvas baru tanpa memotong bagian gambar
    result = cv2.warpAffine(img, matrix, (nW, nH))
    return {"image": encode_image(result)}

@router.post("/flip")
async def flip(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    direction: int = Form(1)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    result = cv2.flip(img, direction)
    return {"image": encode_image(result)}

@router.post("/resize")
async def resize(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    width: int = Form(300),
    height: int = Form(300),
    interpolation: str = Form("bilinear")
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    interp = cv2.INTER_NEAREST if interpolation == "nearest" else cv2.INTER_LINEAR
    result = cv2.resize(img, (width, height), interpolation=interp)
    return {"image": encode_image(result)}

@router.post("/crop")
async def crop(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    x: int = Form(0),
    y: int = Form(0),
    w: int = Form(100),
    h: int = Form(100)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    img_h, img_w = img.shape[:2]
    x = max(0, min(x, img_w))
    y = max(0, min(y, img_h))
    w = max(1, min(w, img_w - x))
    h = max(1, min(h, img_h - y))
    result = img[y:y+h, x:x+w]
    return {"image": encode_image(result)}

@router.post("/translate")
async def translate(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    tx: int = Form(50),
    ty: int = Form(50)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    h, w = img.shape[:2]
    matrix = np.float32([[1, 0, tx], [0, 1, ty]])
    result = cv2.warpAffine(img, matrix, (w, h))
    return {"image": encode_image(result)}

@router.post("/affine")
async def affine_transform(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    shear_x: float = Form(0.2),
    shear_y: float = Form(0.0)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    h, w = img.shape[:2]
    matrix = np.float32([[1, shear_x, 0], [shear_y, 1, 0]])
    result = cv2.warpAffine(img, matrix, (w, h))
    return {"image": encode_image(result)}