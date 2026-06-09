import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Helper buat FormData dari file atau base64
function buildForm(fileOrBase64, params = {}) {
  const form = new FormData();
  if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
    form.append('file', fileOrBase64, fileOrBase64.name || 'image.png');
  } else if (typeof fileOrBase64 === 'string') {
    let bstr;
    let mime = 'image/png';
    if (fileOrBase64.startsWith('data:')) {
      const arr = fileOrBase64.split(',');
      mime = arr[0].match(/:(.*?);/)[1];
      bstr = atob(arr[1]);
    } else {
      bstr = atob(fileOrBase64);
    }
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    form.append('file', blob, 'image.png');
  }
  Object.entries(params).forEach(([k, v]) => form.append(k, v));
  return form;
}

// ─── Enhancement ───────────────────────────────
export async function applyBrightnessContrast(file, brightness, contrast) {
  const res = await axios.post(`${BASE_URL}/enhance/brightness-contrast`,
    buildForm(file, { brightness, contrast }));
  return res.data.image;
}

export async function applyHistogramEqualization(file) {
  const res = await axios.post(`${BASE_URL}/enhance/histogram-equalization`, buildForm(file));
  return res.data.image;
}

export async function applySharpen(file) {
  const res = await axios.post(`${BASE_URL}/enhance/sharpen`, buildForm(file));
  return res.data.image;
}

export async function applySmooth(file, kernelSize) {
  const res = await axios.post(`${BASE_URL}/enhance/smooth`,
    buildForm(file, { kernel_size: kernelSize }));
  return res.data.image;
}

// ─── Transform ─────────────────────────────────
export async function applyRotate(file, angle) {
  const res = await axios.post(`${BASE_URL}/transform/rotate`,
    buildForm(file, { angle }));
  return res.data.image;
}

export async function applyFlip(file, direction) {
  const res = await axios.post(`${BASE_URL}/transform/flip`,
    buildForm(file, { direction }));
  return res.data.image;
}

export async function applyResize(file, width, height, interpolation = "bilinear") {
  const res = await axios.post(`${BASE_URL}/transform/resize`,
    buildForm(file, { width, height, interpolation }));
  return res.data.image;
}

export async function applyCrop(file, x, y, w, h) {
  const res = await axios.post(`${BASE_URL}/transform/crop`,
    buildForm(file, { x, y, w, h }));
  return res.data.image;
}

export async function applyTranslate(file, tx, ty) {
  const res = await axios.post(`${BASE_URL}/transform/translate`,
    buildForm(file, { tx, ty }));
  return res.data.image;
}

export async function applyAffine(file, shearX, shearY) {
  const res = await axios.post(`${BASE_URL}/transform/affine`,
    buildForm(file, { shear_x: shearX, shear_y: shearY }));
  return res.data.image;
}

// ─── Filter ────────────────────────────────────
export async function applyGaussianBlur(file, kernelSize) {
  const res = await axios.post(`${BASE_URL}/filter/gaussian-blur`,
    buildForm(file, { kernel_size: kernelSize }));
  return res.data.image;
}

export async function applyMedianFilter(file, kernelSize) {
  const res = await axios.post(`${BASE_URL}/filter/median-filter`,
    buildForm(file, { kernel_size: kernelSize }));
  return res.data.image;
}

export async function applyNoiseRemoval(file) {
  const res = await axios.post(`${BASE_URL}/filter/noise-removal`, buildForm(file));
  return res.data.image;
}

export async function applyEdgeCanny(file, t1, t2) {
  const res = await axios.post(`${BASE_URL}/filter/edge-canny`,
    buildForm(file, { threshold1: t1, threshold2: t2 }));
  return res.data.image;
}

export async function applyEdgeSobel(file) {
  const res = await axios.post(`${BASE_URL}/filter/edge-sobel`, buildForm(file));
  return res.data.image;
}

export async function applyEdgePrewitt(file) {
  const res = await axios.post(`${BASE_URL}/filter/edge-prewitt`, buildForm(file));
  return res.data.image;
}

export async function applyEdgeRobert(file) {
  const res = await axios.post(`${BASE_URL}/filter/edge-robert`, buildForm(file));
  return res.data.image;
}

export async function applyEdgeLaplacian(file) {
  const res = await axios.post(`${BASE_URL}/filter/edge-laplacian`, buildForm(file));
  return res.data.image;
}

export async function applyEdgeLoG(file) {
  const res = await axios.post(`${BASE_URL}/filter/edge-log`, buildForm(file));
  return res.data.image;
}

// ─── Color ─────────────────────────────────────
export async function applyGrayscale(file) {
  const res = await axios.post(`${BASE_URL}/color/grayscale`, buildForm(file));
  return res.data.image;
}

export async function applyChannelSplit(file, channel) {
  const res = await axios.post(`${BASE_URL}/color/channel-split`,
    buildForm(file, { channel }));
  return res.data.image;
}

export async function applyHueSaturation(file, hue, saturation) {
  const res = await axios.post(`${BASE_URL}/color/hue-saturation`,
    buildForm(file, { hue, saturation }));
  return res.data.image;
}

// ─── Segmentation ──────────────────────────────
export async function applyThreshold(file, threshValue) {
  const res = await axios.post(`${BASE_URL}/segment/threshold`,
    buildForm(file, { thresh_value: threshValue }));
  return res.data.image;
}

export async function applyOtsu(file) {
  const res = await axios.post(`${BASE_URL}/segment/otsu`, buildForm(file));
  return res.data.image;
}

export async function applySegmentEdge(file) {
  const res = await axios.post(`${BASE_URL}/segment/edge-based`, buildForm(file));
  return res.data.image;
}

export async function applySegmentRegion(file) {
  const res = await axios.post(`${BASE_URL}/segment/region-based`, buildForm(file));
  return res.data.image;
}

export async function applyMorphology(file, operation, kernelSize) {
  const res = await axios.post(`${BASE_URL}/segment/morphology`,
    buildForm(file, { operation, kernel_size: kernelSize }));
  return res.data.image;
}

// ─── Compression ───────────────────────────────
export async function applyJpegQuality(file, quality) {
  const res = await axios.post(`${BASE_URL}/compress/jpeg-quality`,
    buildForm(file, { quality }));
  return res.data;
}

export async function simulateCompression(file) {
  const res = await axios.post(`${BASE_URL}/compress/simulate`, buildForm(file));
  return res.data;
}


// ─── Histogram ─────────────────────────────────
export async function getHistogram(file) {
  const res = await axios.post(`${BASE_URL}/histogram/analyze`, buildForm(file));
  return res.data.histogram;
}

// ─── CNN ───────────────────────────────────────
export async function runCNNRecognition(file) {
  const res = await axios.post(`${BASE_URL}/cnn/recognize`, buildForm(file));
  if (res.data.error) {
    throw new Error(res.data.error);
  }
  return res.data.predictions;
}
