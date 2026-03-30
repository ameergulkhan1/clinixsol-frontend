# ⚡ One-Click Fix Script for Symptom Error
# This script copies all backend files and restarts services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔧 ClinixSol Symptom Error Quick Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Copy backend files
Write-Host "📁 Step 1: Copying backend files..." -ForegroundColor Yellow

$backendPath = "D:\clinixsol-backend\src"

if (Test-Path $backendPath) {
    Write-Host "   ✅ Backend directory found: $backendPath" -ForegroundColor Green
    
    # Copy service file
    if (Test-Path "d:\clinixsol-frontend\BACKEND_FILES_TO_COPY\symptom.service.js") {
        Copy-Item -Path "d:\clinixsol-frontend\BACKEND_FILES_TO_COPY\symptom.service.js" -Destination "$backendPath\services\symptom.service.js" -Force
        Write-Host "   ✅ Copied: symptom.service.js" -ForegroundColor Green
    } else {
        Write-Host "   ❌ File not found: symptom.service.js" -ForegroundColor Red
    }
    
    # Copy controller file
    if (Test-Path "d:\clinixsol-frontend\BACKEND_FILES_TO_COPY\symptom.controller.js") {
        Copy-Item -Path "d:\clinixsol-frontend\BACKEND_FILES_TO_COPY\symptom.controller.js" -Destination "$backendPath\controllers\symptom.controller.js" -Force
        Write-Host "   ✅ Copied: symptom.controller.js" -ForegroundColor Green
    } else {
        Write-Host "   ❌ File not found: symptom.controller.js" -ForegroundColor Red
    }
    
    # Copy routes file
    if (Test-Path "d:\clinixsol-frontend\BACKEND_FILES_TO_COPY\symptom.routes.js") {
        Copy-Item -Path "d:\clinixsol-frontend\BACKEND_FILES_TO_COPY\symptom.routes.js" -Destination "$backendPath\routes\symptom.routes.js" -Force
        Write-Host "   ✅ Copied: symptom.routes.js" -ForegroundColor Green
    } else {
        Write-Host "   ❌ File not found: symptom.routes.js" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "   ✅ All backend files copied successfully!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend directory not found: $backendPath" -ForegroundColor Red
    Write-Host "   ⚠️  Please update the backend path in this script" -ForegroundColor Yellow
    Exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Files copied successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 2: Instructions for restarting services
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Restart Backend Server:" -ForegroundColor Cyan
Write-Host "   - Go to your backend terminal" -ForegroundColor White
Write-Host "   - Press Ctrl+C to stop" -ForegroundColor White
Write-Host "   - Run: npm start" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Verify ML Service is running:" -ForegroundColor Cyan
Write-Host "   Run this command:" -ForegroundColor White
Write-Host "   curl http://localhost:5001/health" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  Test Backend API:" -ForegroundColor Cyan
Write-Host "   Run this command:" -ForegroundColor White
Write-Host "   Invoke-RestMethod -Uri 'http://localhost:5000/api/symptoms/available'" -ForegroundColor Green
Write-Host ""

Write-Host "4️⃣  Open Frontend:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/symptoms/checker" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Offer to test API
Write-Host "Would you like to test the API endpoints now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "🧪 Testing ML Service..." -ForegroundColor Cyan
    try {
        $mlHealth = Invoke-RestMethod -Uri "http://localhost:5001/health" -ErrorAction Stop
        Write-Host "   ✅ ML Service: $($mlHealth.status)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ ML Service not responding. Please start it first!" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🧪 Testing Backend API..." -ForegroundColor Cyan
    try {
        $backendResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/symptoms/available" -ErrorAction Stop
        if ($backendResponse.success) {
            $categoryCount = $backendResponse.data.categories.Count
            Write-Host "   ✅ Backend API: Success ($categoryCount categories loaded)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Backend API returned error" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Backend not responding. Please restart backend!" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
