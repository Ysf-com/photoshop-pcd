from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from utils.image_utils import get_image_from_request, encode_image
import cv2
import numpy as np
import base64
import math

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

def simulate_huffman(img):
    # Flatten array
    pixels = img.flatten()
    total_pixels = len(pixels)
    if total_pixels == 0:
        return 0, 0
    
    # Frequencies
    from collections import Counter
    counts = Counter(pixels)
    
    # Build heap-based Huffman tree
    import heapq
    heap = [[weight, [val, ""]] for val, weight in counts.items()]
    if not heap:
        return 0, 0
    heapq.heapify(heap)
    while len(heap) > 1:
        lo = heapq.heappop(heap)
        hi = heapq.heappop(heap)
        for pair in lo[1:]:
            pair[1] = '0' + pair[1]
        for pair in hi[1:]:
            pair[1] = '1' + pair[1]
        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])
    
    huff_codes = heap[0][1:]
    code_lengths = {val: len(code) for val, code in huff_codes}
    if len(counts) == 1:
        code_lengths = {val: 1 for val in counts}
        
    total_bits = sum(counts[val] * code_lengths[val] for val in counts)
    original_bits = total_pixels * 8
    
    return original_bits, total_bits

def simulate_rle(img):
    pixels = img.flatten()
    if len(pixels) == 0:
        return 0, 0
        
    original_size = len(pixels)
    compressed_pairs = 0
    
    curr = pixels[0]
    count = 1
    for p in pixels[1:]:
        if p == curr:
            count += 1
            if count == 255:
                compressed_pairs += 1
                count = 0
        else:
            if count > 0:
                compressed_pairs += 1
            curr = p
            count = 1
    if count > 0:
        compressed_pairs += 1
        
    compressed_size = compressed_pairs * 2 # value and count
    return original_size, compressed_size

def simulate_arithmetic(img):
    pixels = img.flatten()
    total_pixels = len(pixels)
    if total_pixels == 0:
        return 0, 0
    from collections import Counter
    counts = Counter(pixels)
    entropy = 0.0
    for val, count in counts.items():
        p = count / total_pixels
        entropy -= p * math.log2(p)
    total_bits = math.ceil(total_pixels * entropy)
    original_bits = total_pixels * 8
    return original_bits, total_bits

def simulate_lzw(img):
    pixels = img.flatten()
    original_size = len(pixels)
    if original_size == 0:
        return 0, 0
    
    sample_size = min(original_size, 100000)
    sample_pixels = pixels[:sample_size]
    
    dictionary = {chr(i): i for i in range(256)}
    dict_size = 256
    w = ""
    result_size = 0
    
    for p in sample_pixels:
        c = chr(p)
        wc = w + c
        if wc in dictionary:
            w = wc
        else:
            result_size += 1
            if dict_size < 4096:
                dictionary[wc] = dict_size
                dict_size += 1
            w = c
    if w:
        result_size += 1
        
    compressed_sample_bytes = math.ceil(result_size * 1.5)
    compressed_bytes = math.ceil((compressed_sample_bytes / sample_size) * original_size)
    return original_size, compressed_bytes

def simulate_quantization(img, quality=50):
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()
        
    h, w = gray.shape
    h_pad = ((h + 7) // 8) * 8
    w_pad = ((w + 7) // 8) * 8
    padded = np.zeros((h_pad, w_pad), dtype=np.float32)
    padded[:h, :w] = gray.astype(np.float32) - 128.0
    
    Q50 = np.array([
        [16, 11, 10, 16, 24, 40, 51, 61],
        [12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56],
        [14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77],
        [24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101],
        [72, 92, 95, 98, 112, 100, 103, 99]
    ], dtype=np.float32)
    
    if quality < 50:
        S = 5000 / quality
    else:
        S = 200 - 2 * quality
    Q = np.floor((Q50 * S + 50) / 100)
    Q[Q < 1] = 1
    
    non_zero = 0
    r_step = 8
    c_step = 8
    total_blocks = (h_pad // 8) * (w_pad // 8)
    
    if total_blocks > 2000:
        step = math.ceil(math.sqrt(total_blocks / 2000))
        r_step = 8 * step
        c_step = 8 * step
        
    sampled_blocks = 0
    for r in range(0, h_pad, r_step):
        for c in range(0, w_pad, c_step):
            block = padded[r:r+8, c:c+8]
            if block.shape == (8, 8):
                dct_block = cv2.dct(block)
                quantized = np.round(dct_block / Q)
                non_zero += np.count_nonzero(quantized)
                sampled_blocks += 1
                
    if sampled_blocks > 0:
        avg_non_zero_per_block = non_zero / sampled_blocks
        estimated_non_zero = avg_non_zero_per_block * total_blocks
    else:
        estimated_non_zero = 0
        
    estimated_bytes = max(100, int(estimated_non_zero * 1.5))
    original_size = gray.size
    return original_size, min(original_size, estimated_bytes)

@router.post("/simulate")
async def simulate_compression(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None)
):
    file_bytes = await file.read() if file else None
    img = get_image_from_request(file_bytes, image_base64)
    
    orig_bits_h, huff_bits = simulate_huffman(img)
    orig_bytes_r, rle_bytes = simulate_rle(img)
    orig_bits_a, arith_bits = simulate_arithmetic(img)
    orig_bytes_l, lzw_bytes = simulate_lzw(img)
    orig_bytes_q, dct_bytes = simulate_quantization(img, 50)
    
    orig_kb = round(len(img.tobytes()) / 1024, 2)
    huff_kb = round((huff_bits / 8) / 1024, 2)
    rle_kb = round(rle_bytes / 1024, 2)
    arith_kb = round((arith_bits / 8) / 1024, 2)
    lzw_kb = round(lzw_bytes / 1024, 2)
    dct_kb = round(dct_bytes / 1024, 2)
    
    huff_savings = round((1 - (huff_bits / max(1, orig_bits_h))) * 100, 2)
    rle_savings = round((1 - (rle_bytes / max(1, orig_bytes_r))) * 100, 2)
    arith_savings = round((1 - (arith_bits / max(1, orig_bits_a))) * 100, 2)
    lzw_savings = round((1 - (lzw_bytes / max(1, orig_bytes_l))) * 100, 2)
    dct_savings = round((1 - (dct_bytes / max(1, orig_bytes_q))) * 100, 2)
    
    return {
        "original_size_kb": orig_kb,
        "huffman_size_kb": huff_kb,
        "huffman_savings_pct": huff_savings,
        "rle_size_kb": rle_kb,
        "rle_savings_pct": rle_savings,
        "arithmetic_size_kb": arith_kb,
        "arithmetic_savings_pct": arith_savings,
        "lzw_size_kb": lzw_kb,
        "lzw_savings_pct": lzw_savings,
        "quantization_size_kb": dct_kb,
        "quantization_savings_pct": dct_savings
    }