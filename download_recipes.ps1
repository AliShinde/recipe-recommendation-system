# Download RecipeNLG Dataset
# This script downloads a sample of recipes from the RecipeNLG dataset

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "RecipeNLG Dataset Downloader" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = "c:\Clemson\AI receptive\final_project"
$PythonExe = "C:/Clemson/AI receptive/final_project/.venv/Scripts/python.exe"

Write-Host "Downloading RecipeNLG dataset..." -ForegroundColor Yellow
Write-Host "This will download 5,000 recipes (~10-15 MB)" -ForegroundColor Gray
Write-Host "First run may take 2-3 minutes to download from Hugging Face..." -ForegroundColor Gray
Write-Host ""

Set-Location "$ProjectRoot\ml-model"

# Download the dataset
& $PythonExe src/recipenlg_loader.py --size 5000

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Green
    Write-Host "✓ Download Complete!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The RecipeNLG dataset has been saved to:" -ForegroundColor White
    Write-Host "  ml-model/data/recipenlg_recipes.json" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your recommendation system will now use 5,000 real recipes!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To download more recipes, run:" -ForegroundColor White
    Write-Host "  python src/recipenlg_loader.py --size 10000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To download ALL recipes (~2M, takes longer):" -ForegroundColor White
    Write-Host "  python src/recipenlg_loader.py --all" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Download failed" -ForegroundColor Red
    Write-Host "The system will fall back to the default 10 recipes" -ForegroundColor Yellow
}

Set-Location $ProjectRoot
