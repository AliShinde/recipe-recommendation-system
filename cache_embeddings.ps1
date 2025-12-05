# Pre-compute Recipe Embeddings
# Run this script after downloading or updating the recipe dataset
# This creates a cache file for faster recommendations

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Pre-computing Recipe Embeddings" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = "c:\Clemson\AI receptive\final_project"
$PythonExe = "C:/Clemson/AI receptive/final_project/.venv/Scripts/python.exe"

Set-Location "$ProjectRoot\ml-model"

Write-Host "Loading sentence-transformers model and computing embeddings..." -ForegroundColor Yellow
Write-Host "This may take 1-2 minutes for 5000 recipes..." -ForegroundColor Gray
Write-Host ""

& $PythonExe -c @"
import sys
sys.path.insert(0, 'src')
from predict import RecipeRecommender

print('Initializing model...')
recommender = RecipeRecommender(silent=False)
print('\nLoading recipes and computing embeddings...')
recommender.load_recipes()
print('\n✓ Done! Embeddings have been cached.')
print('The recommendation API will now be much faster!')
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Green
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Embeddings have been pre-computed and cached." -ForegroundColor White
    Write-Host "Your recipe recommendations will now be lightning fast!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Cache location: ml-model/data/recipenlg_recipes_embeddings.npy" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Failed to compute embeddings" -ForegroundColor Red
}

Set-Location $ProjectRoot
