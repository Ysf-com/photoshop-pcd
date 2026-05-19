from fastapi import APIRouter, UploadFile, File
from utils.image_utils import decode_image
import cv2
import numpy as np

router = APIRouter()

try:
    import tensorflow as tf
    from PIL import Image
    model = tf.keras.applications.MobileNetV2(weights='imagenet')
    CNN_AVAILABLE = True
except Exception:
    CNN_AVAILABLE = False

@router.post("/recognize")
async def recognize_object(file: UploadFile = File(...)):
    if not CNN_AVAILABLE:
        return {
            "predictions": [],
            "error": "TensorFlow belum tersedia."
        }

    img_cv2 = decode_image(await file.read())
    img_rgb = cv2.cvtColor(img_cv2, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)

    img_resized = img_pil.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img_resized)
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array, verbose=0)
    decoded = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=5)[0]

    results = []
    for _, label, confidence in decoded:
        results.append({
            "label": label.replace("_", " "),
            "confidence": round(float(confidence) * 100, 2)
        })

    return {"predictions": results}