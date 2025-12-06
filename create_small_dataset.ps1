# Quick Start Script - Create smaller dataset for Render deployment
# This reduces the recipe count to work within free tier memory limits

Write-Host "Creating smaller dataset for Render deployment..." -ForegroundColor Cyan

$ProjectRoot = "c:\Clemson\AI receptive\final_project"
$PythonExe = "C:/Clemson/AI receptive/final_project/.venv/Scripts/python.exe"

Set-Location "$ProjectRoot\ml-model"

# Download smaller dataset (500 recipes instead of 5000)
Write-Host "`nDownloading 500 recipes..." -ForegroundColor Yellow
& $PythonExe src/recipenlg_loader.py --size 500

# Pre-compute embeddings
Write-Host "`nPre-computing embeddings..." -ForegroundColor Yellow
& $PythonExe -c @"
import sys
sys.path.insert(0, 'src')
from predict import RecipeRecommender
print('Loading model and computing embeddings...')
recommender = RecipeRecommender(silent=False)
recommender.load_recipes()
print('Done!')
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Success! Smaller dataset ready for deployment" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. git add ml-model/data/*.json ml-model/data/*.npy" -ForegroundColor White
    Write-Host "2. git commit -m 'Use smaller 500-recipe dataset for Render free tier'" -ForegroundColor White
    Write-Host "3. git push origin main" -ForegroundColor White
} else {
    Write-Host "`n✗ Failed to create smaller dataset" -ForegroundColor Red
}

Set-Location $ProjectRoot
