#!/bin/bash
# Render deployment script for installing Python and ML dependencies
# This script runs from the server directory on Render

set -e  # Exit on any error

echo "=========================================="
echo "Starting Python and ML Model Setup"
echo "=========================================="
echo "Current directory: $(pwd)"

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

# Check if we're in server directory or repo root
if [ -d "../ml-model" ]; then
    ML_DIR="../ml-model"
    echo "Found ml-model at ../ml-model"
elif [ -d "ml-model" ]; then
    ML_DIR="ml-model"
    echo "Found ml-model at ./ml-model"
else
    echo "✗ Cannot find ml-model directory!"
    echo "Continuing without Python dependencies - API will fail"
    ML_DIR=""
fi

# Install Python dependencies if ml-model found
if [ -n "$ML_DIR" ]; then
    echo "Installing Python ML dependencies from $ML_DIR..."
    pip3 install --no-cache-dir -r "$ML_DIR/requirements.txt"
    echo "✓ Python dependencies installed successfully"
    
    # Check if recipe data exists
    if [ -f "$ML_DIR/data/recipenlg_recipes.json" ]; then
        echo "✓ Recipe data found"
        
        # Check if embeddings cache exists
        if [ -f "$ML_DIR/data/recipenlg_recipes_embeddings.npy" ]; then
            echo "✓ Cached embeddings found - ready for fast startup!"
        else
            echo "⚠ No cached embeddings found - will compute on first request"
        fi
    else
        echo "⚠ No recipe data found - will use fallback recipes"
    fi
fi

# Install Node.js dependencies (from current directory)
echo "Installing Node.js dependencies..."
npm install

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "=========================================="
echo "✓ Build completed successfully!"
echo "=========================================="
