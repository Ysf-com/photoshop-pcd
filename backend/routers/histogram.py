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

@router.post("/stretch")
async def stretch_histogram(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    
    # Min-max Stretching on Y channel of YUV space to preserve hue/colors
    img_yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    y = img_yuv[:, :, 0]
    ymin, ymax = y.min(), y.max()
    if ymax > ymin:
        img_yuv[:, :, 0] = np.clip((y - ymin) * (255.0 / (ymax - ymin)), 0, 255).astype(np.uint8)
    
    result = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2BGR)
    return {"image": encode_image(result)}

def match_histogram_channel(source, template):
    oldshape = source.shape
    source_flat = source.ravel()
    template_flat = template.ravel()
    
    s_values, bin_idx, s_counts = np.unique(source_flat, return_inverse=True, return_counts=True)
    t_values, t_counts = np.unique(template_flat, return_counts=True)
    
    s_quantiles = np.cumsum(s_counts).astype(np.float64)
    s_quantiles /= s_quantiles[-1]
    
    t_quantiles = np.cumsum(t_counts).astype(np.float64)
    t_quantiles /= t_quantiles[-1]
    
    interp_t_values = np.interp(s_quantiles, t_quantiles, t_values)
    return interp_t_values[bin_idx].reshape(oldshape).astype(np.uint8)

@router.post("/specify")
async def specify_histogram(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    target_dist: str = Form("normal")
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    
    h, w, c = img.shape
    total_pixels = h * w
    
    # Generate mathematically modeled target distribution values
    if target_dist == "normal":
        vals = np.random.normal(127, 40, total_pixels)
    elif target_dist == "dark":
        vals = np.random.normal(60, 25, total_pixels)
    elif target_dist == "bright":
        vals = np.random.normal(195, 25, total_pixels)
    else:  # uniform
        vals = np.random.uniform(0, 255, total_pixels)
        
    template = np.clip(vals, 0, 255).astype(np.uint8)
    
    # Perform channel-by-channel matching
    b = match_histogram_channel(img[:, :, 0], template)
    g = match_histogram_channel(img[:, :, 1], template)
    r = match_histogram_channel(img[:, :, 2], template)
    
    result = cv2.merge([b, g, r])
    return {"image": encode_image(result)}