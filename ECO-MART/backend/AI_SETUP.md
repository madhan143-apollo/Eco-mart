# AI scanner setup

The scanner sends uploaded images from the backend to an OpenAI-compatible vision API. The API key must never be placed in React or Vite files.

1. Create `backend/.env` by copying `backend/.env.example`.
2. Set one private key variable:

```env
AI_API_KEY=your_key_here
```

`OPENAI_API_KEY` is also accepted.

3. Restart the backend after changing `.env`:

```powershell
cd "D:\Eco Mart (final)\ECO-MART\backend"
npm start
```

# Local AI scanner setup

The React app calls Node only. Node forwards the image to the local FastAPI service at `http://127.0.0.1:8001/scan`; no cloud API key is required.

## Start the local AI service

```powershell
cd "D:\Eco Mart (final)\ECO-MART\ai-service"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8001
```

## Reliable classification model

Without a verified waste-specific model, the service returns `modelNotConfigured: true`, confidence `0`, category `Other`, and no weight. This is intentional: a generic ImageNet/COCO model must not be presented as a waste classifier.

To enable classification, place a trained Ultralytics classification model here:

```text
ai-service/model/waste_classifier.pt
```

Its class names should match `Plastic`, `Paper`, `Cardboard`, `Metal`, `E-Waste`, `Glass`, `Textile`, `Rubber`, `Mixed Waste`, or `Other`. Restart the Python service after adding the model. The model estimates the category and confidence; the seller must enter physical weight before Node calculates the final price.