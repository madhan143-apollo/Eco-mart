# Eco Mart Local AI Service

This service runs on `http://127.0.0.1:8001` and is called only by the Node backend.

## Development fallback

The service starts without a model and returns `modelNotConfigured: true`, category `Other`, confidence `0`, and no estimated weight. It does not pretend that a generic model can identify waste.

## Add a real waste model

Place a waste-specific Ultralytics classification model at:

```text
ai-service/model/waste_classifier.pt
```

The model's class names should match one of: Plastic, Paper, Cardboard, Metal, E-Waste, Glass, Textile, Rubber, Mixed Waste, Other. The service loads the model once at startup.

## Run

```powershell
cd "D:\Eco Mart (final)\ECO-MART\ai-service"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8001
```
