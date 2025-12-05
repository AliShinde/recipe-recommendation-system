# Setup Script for Recipe Recommendation System

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Recipe Recommendation System Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$ProjectRoot = "c:\Clemson\AI receptive\final_project"

# Step 1: Check Python
Write-Host "Step 1: Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Step 2: Check Node.js
Write-Host "`nStep 2: Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Step 3: Install Python dependencies
Write-Host "`nStep 3: Installing Python ML dependencies..." -ForegroundColor Yellow
Write-Host "This will download the pre-trained model (~90MB) on first run" -ForegroundColor Gray
Set-Location "$ProjectRoot\ml-model"
python -m pip install -r requirements.txt --user
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Python dependencies" -ForegroundColor Red
}

# Step 4: Install backend dependencies
Write-Host "`nStep 4: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\server"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
}

# Step 5: Install frontend dependencies
Write-Host "`nStep 5: Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\client"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
}

# Final message
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the application:" -ForegroundColor Yellow
Write-Host "1. Terminal 1 - Backend:  cd '$ProjectRoot\server' ; npm run dev" -ForegroundColor White
Write-Host "2. Terminal 2 - Frontend: cd '$ProjectRoot\client' ; npm start" -ForegroundColor White
Write-Host ""
Write-Host "The app will open at http://localhost:3000" -ForegroundColor Cyan

Set-Location $ProjectRoot
