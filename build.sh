#!/bin/bash
# Render deployment script for installing Python and ML dependencies
# This script runs during the build phase on Render

set -e  # Exit on any error

echo "=========================================="
echo "Starting Python and ML Model Setup"
echo "=========================================="

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✓ Python 3 found: $(python3 --version)"
else
    echo "✗ Python 3 not found!"
    exit 1
fi

# Check if pip is available
if command -v pip3 &> /dev/null; then
    echo "✓ pip3 found: $(pip3 --version)"
else
    echo "✗ pip3 not found, installing..."
    curl -sSL https://bootstrap.pypa.io/get-pip.py | python3
fi

# Upgrade pip
echo "Upgrading pip..."
python3 -m pip install --upgrade pip

# Navigate to ml-model directory
echo "Installing Python ML dependencies..."
cd ../ml-model

# Install Python dependencies
pip3 install --no-cache-dir -r requirements.txt

echo "✓ Python dependencies installed successfully"

# Check if recipe data exists
if [ -f "data/recipenlg_recipes.json" ]; then
    echo "✓ Recipe data found"
    
    # Check if embeddings cache exists
    if [ -f "data/recipenlg_recipes_embeddings.npy" ]; then
        echo "✓ Cached embeddings found - ready for fast startup!"
    else
        echo "⚠ No cached embeddings found - will compute on first request"
    fi
else
    echo "⚠ No recipe data found - will use fallback recipes"
fi

# Navigate back to server directory
cd ../server

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "=========================================="
echo "✓ Build completed successfully!"
echo "=========================================="
