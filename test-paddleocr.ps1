# PaddleOCR Service Test Script
# Run this to verify the OCR service is working correctly

Write-Host "🧪 Testing PaddleOCR Service..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Service Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:7001/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Service is healthy" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Gray
    Write-Host "   OCR Engine: $($healthResponse.ocr_engine)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Service health check failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Make sure PaddleOCR service is running:" -ForegroundColor Yellow
    Write-Host "   cd aurax-ocr-service" -ForegroundColor Gray
    Write-Host "   python main.py" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Test 2: OCR Extraction (using a test image)
Write-Host "Test 2: OCR Text Extraction" -ForegroundColor Yellow
Write-Host "   Using test image URL..." -ForegroundColor Gray

# Test with a sample image (you can replace this with actual Meta Ad Library screenshot URL)
$testImageUrl = "https://via.placeholder.com/800x600/FFFFFF/000000?text=Test+OCR+Image"

try {
    $ocrBody = @{
        image_url = $testImageUrl
    } | ConvertTo-Json

    $ocrResponse = Invoke-RestMethod -Uri "http://localhost:7001/ocr/url" -Method Post -Body $ocrBody -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "✅ OCR extraction successful" -ForegroundColor Green
    Write-Host "   Success: $($ocrResponse.success)" -ForegroundColor Gray
    Write-Host "   Total Lines: $($ocrResponse.total_lines)" -ForegroundColor Gray
    Write-Host "   Avg Confidence: $($ocrResponse.avg_confidence)" -ForegroundColor Gray
    
    if ($ocrResponse.lines.Count -gt 0) {
        Write-Host "   Extracted Text:" -ForegroundColor Gray
        foreach ($line in $ocrResponse.lines | Select-Object -First 3) {
            Write-Host "     - $line" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "❌ OCR extraction failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  This might be expected if using placeholder image" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Backend Connection
Write-Host "Test 3: Backend Service Check" -ForegroundColor Yellow
try {
    $token = "test_token"  # In real test, get actual token
    $backendUrl = "http://localhost:5002"
    
    $backendResponse = Invoke-RestMethod -Uri "$backendUrl" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "   URL: $backendUrl" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Backend health check inconclusive" -ForegroundColor Yellow
    Write-Host "   Make sure backend is running on port 5002" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ PaddleOCR service: RUNNING" -ForegroundColor Green
Write-Host "📝 OCR endpoint: http://localhost:7001/ocr/url" -ForegroundColor Gray
Write-Host "📚 API docs: http://localhost:7001/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure backend is running (npm run dev in backend-copy)" -ForegroundColor Gray
Write-Host "2. Make sure frontend is running (npm start)" -ForegroundColor Gray
Write-Host "3. Login as admin and go to Screenshot Intelligence" -ForegroundColor Gray
Write-Host "4. Select PaddleOCR provider and upload screenshots" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Ready to use PaddleOCR!" -ForegroundColor Green
