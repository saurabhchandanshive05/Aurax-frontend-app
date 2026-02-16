"""
PaddleOCR Microservice for Meta Ad Library Screenshot Text Extraction

This FastAPI service provides OCR capabilities using PaddleOCR for extracting
text from Meta Ad Library screenshots. Optimized for ad text, CTAs, and metadata.

Run with: uvicorn main:app --host 0.0.0.0 --port 7001 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
import httpx
from paddleocr import PaddleOCR
import numpy as np
from PIL import Image
from io import BytesIO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Aurax PaddleOCR Service",
    description="Text extraction service for Meta Ad Library screenshots",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR (done once at startup)
# use_angle_cls=True enables text angle detection (rotated text)
# lang='en' specifies English language model
ocr_engine = None

@app.on_event("startup")
async def startup_event():
    """Initialize OCR engine on startup"""
    global ocr_engine
    logger.info("Initializing PaddleOCR engine...")
    # PaddleOCR 3.x has simplified initialization
    ocr_engine = PaddleOCR(lang='en')
    logger.info("PaddleOCR engine initialized successfully")

# Request/Response Models
class OCRRequest(BaseModel):
    image_url: HttpUrl

class OCRLine(BaseModel):
    text: str
    confidence: float
    bbox: List[List[int]]  # Bounding box coordinates

class OCRResponse(BaseModel):
    success: bool
    text: str
    lines: List[str]
    detailed_lines: List[OCRLine]
    avg_confidence: float
    total_lines: int
    metadata: dict

# Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Aurax PaddleOCR",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "ocr_engine": "initialized" if ocr_engine else "not_initialized"
    }

@app.post("/ocr/url", response_model=OCRResponse)
async def extract_text_from_url(request: OCRRequest):
    """
    Extract text from an image URL using PaddleOCR
    
    Args:
        request: OCRRequest with image_url
        
    Returns:
        OCRResponse with extracted text and confidence scores
    """
    try:
        image_url_str = str(request.image_url)
        logger.info(f"Processing image: {image_url_str}")
        logger.info(f"URL length: {len(image_url_str)}")
        logger.info(f"URL scheme: {request.image_url.scheme}")
        
        # Download image from URL
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            logger.info(f"Downloading image from: {image_url_str}")
            response = await client.get(image_url_str)
            response.raise_for_status()
            image_bytes = response.content
            logger.info(f"Downloaded {len(image_bytes)} bytes")
        
        # Convert to PIL Image
        logger.info("Converting to PIL Image...")
        image = Image.open(BytesIO(image_bytes))
        logger.info(f"Image size: {image.width}x{image.height}, format: {image.format}")
        
        # Convert to numpy array (required by PaddleOCR)
        image_np = np.array(image)
        
        # Run OCR
        logger.info("Running OCR...")
        result = ocr_engine.ocr(image_np, cls=True)
        
        if not result or not result[0]:
            logger.warning("No text detected in image")
            return OCRResponse(
                success=True,
                text="",
                lines=[],
                detailed_lines=[],
                avg_confidence=0.0,
                total_lines=0,
                metadata={"warning": "No text detected"}
            )
        
        # Process results
        lines = []
        detailed_lines = []
        confidences = []
        
        for line_data in result[0]:
            bbox = line_data[0]  # Bounding box coordinates
            text_info = line_data[1]  # (text, confidence)
            text = text_info[0]
            confidence = text_info[1]
            
            lines.append(text)
            confidences.append(confidence)
            
            # Convert bbox to integers for JSON serialization
            bbox_int = [[int(x), int(y)] for x, y in bbox]
            
            detailed_lines.append(OCRLine(
                text=text,
                confidence=float(confidence),
                bbox=bbox_int
            ))
        
        # Calculate average confidence
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        # Combine all text
        full_text = "\n".join(lines)
        
        logger.info(f"OCR completed. Lines: {len(lines)}, Avg confidence: {avg_confidence:.2f}")
        
        return OCRResponse(
            success=True,
            text=full_text,
            lines=lines,
            detailed_lines=detailed_lines,
            avg_confidence=float(avg_confidence),
            total_lines=len(lines),
            metadata={
                "image_size": f"{image.width}x{image.height}",
                "format": image.format
            }
        )
        
    except httpx.HTTPError as e:
        logger.error(f"Failed to download image: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download image: {str(e)}"
        )
    except Exception as e:
        logger.error(f"OCR processing error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}"
        )

@app.post("/ocr/batch")
async def extract_text_from_batch(image_urls: List[HttpUrl]):
    """
    Process multiple images in batch
    
    Args:
        image_urls: List of image URLs
        
    Returns:
        List of OCR results
    """
    results = []
    
    for url in image_urls:
        try:
            result = await extract_text_from_url(OCRRequest(image_url=url))
            results.append({
                "url": str(url),
                "success": True,
                "data": result
            })
        except Exception as e:
            results.append({
                "url": str(url),
                "success": False,
                "error": str(e)
            })
    
    return {
        "total": len(image_urls),
        "processed": len(results),
        "results": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7001)
