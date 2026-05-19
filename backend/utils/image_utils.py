import cv2
import numpy as np
import base64
from PIL import Image
from io import BytesIO

def decode_image(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def decode_base64_image(base64_str: str):
    img_bytes = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def encode_image(cv2_img):
    _, buffer = cv2.imencode('.png', cv2_img)
    return base64.b64encode(buffer).decode('utf-8')

def get_image_from_request(file_bytes=None, image_base64=None):
    """Helper: ambil gambar dari file atau base64"""
    if image_base64:
        return decode_base64_image(image_base64)
    elif file_bytes:
        return decode_image(file_bytes)
    else:
        raise ValueError("No image provided")