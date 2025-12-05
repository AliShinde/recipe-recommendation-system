"""
RecipeNLG Dataset Loader
Downloads and processes recipes from the RecipeNLG dataset on Hugging Face
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Optional
import warnings

warnings.filterwarnings('ignore')


def download_recipenlg(
    output_path: str = "data/recipenlg_recipes.json",
    sample_size: int = 5000,
    silent: bool = False
) -> List[Dict]:
    """
    Download RecipeNLG dataset from Hugging Face and convert to our format
    
    Args:
        output_path: Where to save the processed recipes
        sample_size: Number of recipes to include (None for all ~2M recipes)
        silent: Suppress output messages
    
    Returns:
        List of recipe dictionaries
    """
    try:
        from datasets import load_dataset
        
        if not silent:
            print(f"Downloading RecipeNLG dataset from Hugging Face...", file=sys.stderr)
            print(f"This may take a few minutes on first run...", file=sys.stderr)
        
        # Load the dataset - using mbien/recipe_nlg which is in parquet format
        # Alternative: "recipe1m" dataset
        try:
            dataset = load_dataset("mbien/recipe_nlg", split="train")
        except:
            # Fallback to a different recipe dataset
            if not silent:
                print("Trying alternative dataset: corbt/all-recipes...", file=sys.stderr)
            dataset = load_dataset("corbt/all-recipes", split="train")
        
        if not silent:
            print(f"Total recipes available: {len(dataset):,}", file=sys.stderr)
        
        # Convert to our format
        recipes = []
        
        # Take a sample if specified
        if sample_size and sample_size < len(dataset):
            import random
            indices = random.sample(range(len(dataset)), sample_size)
            dataset = dataset.select(indices)
            if not silent:
                print(f"Processing {sample_size:,} random recipes...", file=sys.stderr)
        
        for idx, item in enumerate(dataset):
            try:
                # Parse the text format recipe
                recipe_text = item.get('input', '')
                if not recipe_text:
                    continue
                
                # Split into sections
                lines = recipe_text.split('\n')
                title = lines[0].strip() if lines else "Untitled Recipe"
                
                # Extract ingredients
                ingredients = []
                directions = []
                current_section = None
                
                for line in lines[1:]:
                    line = line.strip()
                    if not line:
                        continue
                    
                    if 'Ingredients:' in line or 'ingredients:' in line.lower():
                        current_section = 'ingredients'
                        continue
                    elif 'Directions:' in line or 'directions:' in line.lower() or 'Instructions:' in line:
                        current_section = 'directions'
                        continue
                    
                    if current_section == 'ingredients':
                        # Remove leading dashes, numbers, etc.
                        cleaned = line.lstrip('- ').lstrip('0123456789.').lstrip(')').strip()
                        if cleaned and len(cleaned) > 2:
                            ingredients.append(cleaned)
                    elif current_section == 'directions':
                        # Remove leading dashes, numbers, etc.
                        cleaned = line.lstrip('- ').lstrip('0123456789.').lstrip(')').strip()
                        if cleaned and len(cleaned) > 5:
                            directions.append(cleaned)
                
                # Skip recipes with insufficient data
                if not title or len(ingredients) < 3:
                    continue
                
                recipe = {
                    "id": len(recipes) + 1,
                    "name": title,
                    "ingredients": ingredients[:20],  # Limit to 20 ingredients for performance
                    "description": directions[0][:250] + "..." if directions and directions[0] else "Delicious recipe from All-Recipes database",
                    "cookingTime": estimate_cooking_time(directions),
                    "difficulty": estimate_difficulty(ingredients),
                    "cuisine": detect_cuisine(title, ingredients),
                    "directions": directions[:10],  # Limit to 10 steps
                    "source": "All-Recipes"
                }
                
                recipes.append(recipe)
                
                # Progress indicator
                if not silent and (len(recipes) % 500 == 0):
                    print(f"Processed {len(recipes):,} recipes...", file=sys.stderr)
                
            except Exception as e:
                # Skip problematic recipes
                continue
        
        # Save to JSON
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(recipes, f, indent=2, ensure_ascii=False)
        
        file_size_mb = output_file.stat().st_size / (1024 * 1024)
        
        if not silent:
            print(f"\n✓ Successfully saved {len(recipes):,} recipes to {output_path}", file=sys.stderr)
            print(f"File size: {file_size_mb:.2f} MB", file=sys.stderr)
        
        return recipes
        
    except ImportError:
        error_msg = "Error: 'datasets' library not installed. Run: pip install datasets"
        if not silent:
            print(error_msg, file=sys.stderr)
        raise ImportError(error_msg)
    except Exception as e:
        error_msg = f"Error downloading dataset: {e}"
        if not silent:
            print(error_msg, file=sys.stderr)
        raise RuntimeError(error_msg)


def estimate_cooking_time(directions: List[str]) -> int:
    """Estimate cooking time based on number of directions"""
    total_steps = len(directions)
    if total_steps <= 3:
        return 15
    elif total_steps <= 6:
        return 30
    elif total_steps <= 10:
        return 45
    else:
        return 60


def estimate_difficulty(ingredients: List[str]) -> str:
    """Estimate difficulty based on number of ingredients"""
    num_ingredients = len(ingredients)
    if num_ingredients <= 5:
        return "easy"
    elif num_ingredients <= 10:
        return "medium"
    else:
        return "hard"


def detect_cuisine(title: str, ingredients: List[str]) -> str:
    """Detect cuisine type based on title and ingredients"""
    title_lower = title.lower()
    ingredients_str = " ".join(ingredients).lower()
    
    # Cuisine keywords
    if any(word in title_lower or word in ingredients_str for word in ['pasta', 'italian', 'pizza', 'parmesan', 'mozzarella', 'basil']):
        return "Italian"
    elif any(word in title_lower or word in ingredients_str for word in ['curry', 'indian', 'garam masala', 'turmeric', 'naan']):
        return "Indian"
    elif any(word in title_lower or word in ingredients_str for word in ['taco', 'mexican', 'tortilla', 'salsa', 'cilantro', 'jalapeño']):
        return "Mexican"
    elif any(word in title_lower or word in ingredients_str for word in ['soy sauce', 'asian', 'stir fry', 'wok', 'ginger', 'sesame']):
        return "Asian"
    elif any(word in title_lower or word in ingredients_str for word in ['greek', 'feta', 'mediterranean', 'olive']):
        return "Greek"
    elif any(word in title_lower or word in ingredients_str for word in ['french', 'baguette', 'croissant', 'brie']):
        return "French"
    elif any(word in title_lower or word in ingredients_str for word in ['thai', 'coconut milk', 'lemongrass', 'fish sauce']):
        return "Thai"
    else:
        return "American"


def check_dataset_exists(data_path: str = "data/recipenlg_recipes.json") -> bool:
    """Check if RecipeNLG dataset has already been downloaded"""
    return os.path.exists(data_path) and os.path.getsize(data_path) > 1000


if __name__ == "__main__":
    """Command line interface for downloading the dataset"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Download RecipeNLG dataset")
    parser.add_argument("--size", type=int, default=5000, help="Number of recipes to download (default: 5000)")
    parser.add_argument("--output", type=str, default="data/recipenlg_recipes.json", help="Output file path")
    parser.add_argument("--all", action="store_true", help="Download all recipes (~2M, may take a while)")
    
    args = parser.parse_args()
    
    sample_size = None if args.all else args.size
    
    print(f"Starting RecipeNLG download...")
    print(f"Sample size: {'All (~2M recipes)' if sample_size is None else f'{sample_size:,} recipes'}")
    
    recipes = download_recipenlg(
        output_path=args.output,
        sample_size=sample_size,
        silent=False
    )
    
    print(f"\n✓ Download complete!")
    print(f"\nSample recipe:")
    if recipes:
        print(json.dumps(recipes[0], indent=2))
