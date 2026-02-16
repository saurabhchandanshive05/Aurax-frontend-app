# Aurax PaddleOCR Service

FastAPI microservice for extracting text from Meta Ad Library screenshots using PaddleOCR.

## Features

- 🔍 High-accuracy OCR using PaddleOCR
- 📝 Optimized for ad text, CTAs, and metadata extraction
- ⚡ Fast processing with angle detection for rotated text
- 🌐 RESTful API with automatic documentation
- 🔄 Batch processing support

## Installation

### Prerequisites

- Python 3.8 or higher
- pip

### Setup

1. **Install Python dependencies:**

```bash
cd aurax-ocr-service
pip install -r requirements.txt
```

2. **Download PaddleOCR models (automatic on first run):**

The first time you run the service, PaddleOCR will automatically download the English language models (~100MB). This may take a few minutes.

## Running the Service

### Development Mode

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 7001 --reload
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 7001 --workers 4
```

The service will be available at:
- **API:** http://localhost:7001
- **Docs:** http://localhost:7001/docs
- **Health Check:** http://localhost:7001/health

## API Endpoints

### POST /ocr/url

Extract text from a single image URL.

**Request:**
```json
{
  "image_url": "https://example.com/screenshot.png"
}
```

**Response:**
```json
{
  "success": true,
  "text": "Full extracted text...",
  "lines": ["Line 1", "Line 2", "..."],
  "detailed_lines": [
    {
      "text": "Line 1",
      "confidence": 0.95,
      "bbox": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    }
  ],
  "avg_confidence": 0.89,
  "total_lines": 25,
  "metadata": {
    "image_size": "1920x1080",
    "format": "PNG"
  }
}
```

### POST /ocr/batch

Process multiple images in batch.

**Request:**
```json
[
  "https://example.com/screenshot1.png",
  "https://example.com/screenshot2.png"
]
```

### GET /health

Check service health status.

**Response:**
```json
{
  "status": "healthy",
  "ocr_engine": "initialized"
}
```

## Integration with Backend

The Node.js backend connects to this service via the `paddleOCR.service.js` file:

```javascript
const paddleOCRService = require('./services/paddleOCR.service');

// Extract text from image
const result = await paddleOCRService.extractTextFromUrl(imageUrl);
console.log(result.text);
```

Backend endpoint: `POST /api/brand-intelligence/ocr-extract`

## Environment Variables

Add to your backend `.env` file:

```env
PADDLE_OCR_URL=http://localhost:7001
```

## Performance Tips

1. **Enable GPU acceleration** (if CUDA available):
   - Edit `main.py`: Change `use_gpu=False` to `use_gpu=True`
   - Requires CUDA-enabled PaddlePaddle installation

2. **Batch processing**:
   - Use `/ocr/batch` endpoint for multiple images
   - Reduces overhead from repeated HTTP requests

3. **Confidence threshold**:
   - Results include per-line confidence scores
   - Filter low-confidence text (< 0.6) if needed

## Troubleshooting

### Service won't start

**Error:** `ModuleNotFoundError: No module named 'paddleocr'`

**Solution:**
```bash
pip install -r requirements.txt
```

### Model download fails

**Error:** Network timeout during first run

**Solution:**
- Ensure stable internet connection
- Models are cached in `~/.paddleocr/`
- Retry after download completes

### Low OCR accuracy

**Possible causes:**
- Low image resolution (< 720p)
- Heavy compression artifacts
- Non-English text (change `lang='en'` in main.py)

**Solutions:**
- Upload higher resolution screenshots
- Use PNG instead of JPEG (lossless)
- Check `avg_confidence` score in response

### Port already in use

**Error:** `Address already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :7001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:7001 | xargs kill -9
```

## Testing

Test the service with curl:

```bash
# Health check
curl http://localhost:7001/health

# OCR extraction
curl -X POST http://localhost:7001/ocr/url \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/screenshot.png"}'
```

Or use the interactive docs at http://localhost:7001/docs

## Architecture

```
Frontend (React)
    ↓ Upload screenshots
Backend (Node.js:5002)
    ↓ POST /api/brand-intelligence/ocr-extract
    ↓ Call PaddleOCR service
OCR Service (FastAPI:7001)
    ↓ POST /ocr/url
PaddleOCR Library
    ↓ Extract text
    ↓ Return with confidence scores
Parse Utility
    ↓ Extract: Library ID, dates, CTAs, ad copy
Database (MongoDB)
```

## License

Part of the Aurax platform - Internal use only
