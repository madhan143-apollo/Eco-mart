from pathlib import Path
from typing import Optional
import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

app = FastAPI(title="Eco Mart Local Waste Vision", version="1.0.0")
ALLOWED_CATEGORIES = {"Plastic", "Paper", "Cardboard", "Metal", "E-Waste", "Glass", "Textile", "Rubber", "Mixed Waste", "Other"}
MODEL_PATH = Path(os.getenv("WASTE_MODEL_PATH", "model/waste_classifier.pt"))
model = None
model_configured = False

try:
    from ultralytics import YOLO
    if MODEL_PATH.is_file():
        model = YOLO(str(MODEL_PATH))
        model_configured = True
except Exception:
    model = None
    model_configured = False


def fallback_result() -> dict:
    return {
        "modelConfigured": False,
        "modelNotConfigured": True,
        "material": "Unclassified waste",
        "category": "Other",
        "description": "No verified waste-specific model is configured. Add a trained model to ai-service/model/waste_classifier.pt for reliable classification.",
        "estimatedQuantity": None,
        "estimatedWeightKg": None,
        "confidence": 0.0,
    }


def classify_with_model(image: Image.Image) -> dict:
    result = model.predict(image, verbose=False)[0]
    probabilities = getattr(result, "probs", None)
    if probabilities is None:
        raise ValueError("The configured model is not a classification model")
    class_id = int(probabilities.top1)
    confidence = float(probabilities.top1conf)
    names = result.names if hasattr(result, "names") else {}
    label = str(names.get(class_id, "Other"))
    category = next((allowed for allowed in ALLOWED_CATEGORIES if allowed.lower().replace("-", "") == label.lower().replace("-", "")), "Other")
    return {
        "modelConfigured": True,
        "modelNotConfigured": False,
        "material": label,
        "category": category,
        "description": f"Waste material classified as {label}.",
        "estimatedQuantity": None,
        "estimatedWeightKg": None,
        "confidence": round(max(0.0, min(confidence, 1.0)), 4),
    }


@app.get("/health")
def health():
    return {"service": "eco-mart-local-ai", "modelConfigured": model_configured, "modelPath": str(MODEL_PATH)}


@app.post("/scan")
async def scan(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/jpg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are supported")
    try:
        image = Image.open(file.file).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Invalid image file")
    try:
        return classify_with_model(image) if model_configured else fallback_result()
    except Exception:
        raise HTTPException(status_code=502, detail="The configured local waste model could not analyze this image")
