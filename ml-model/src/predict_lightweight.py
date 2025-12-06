"""
Lightweight Recipe Recommendation Engine
Uses simple keyword matching instead of ML models for Render free tier
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any

def load_recipes(recipes_path: str) -> List[Dict[str, Any]]:
    """Load recipes from JSON file"""
    with open(recipes_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def calculate_match_score(user_ingredients: List[str], recipe_ingredients: List[str]) -> float:
    """
    Calculate match score using simple keyword matching
    Returns a score between 0 and 1
    """
    # Normalize ingredients to lowercase
    user_set = set(ing.lower().strip() for ing in user_ingredients)
    recipe_set = set(ing.lower().strip() for ing in recipe_ingredients)
    
    # Calculate intersection
    matches = user_set.intersection(recipe_set)
    
    if len(recipe_set) == 0:
        return 0.0
    
    # Score based on percentage of recipe ingredients matched
    match_percentage = len(matches) / len(recipe_set)
    
    # Bonus for matching more user ingredients
    user_coverage = len(matches) / len(user_set) if len(user_set) > 0 else 0
    
    # Weighted average
    score = (match_percentage * 0.7) + (user_coverage * 0.3)
    
    return min(score, 1.0)

def get_recommendations(
    ingredients: List[str],
    recipes: List[Dict[str, Any]],
    top_k: int = 5,
    min_score: float = 0.0
) -> List[Dict[str, Any]]:
    """
    Get recipe recommendations using lightweight keyword matching
    """
    scored_recipes = []
    
    for recipe in recipes:
        recipe_ingredients = recipe.get('ingredients', [])
        score = calculate_match_score(ingredients, recipe_ingredients)
        
        if score >= min_score:
            # Calculate coverage percentage
            user_set = set(ing.lower().strip() for ing in ingredients)
            recipe_set = set(ing.lower().strip() for ing in recipe_ingredients)
            matches = user_set.intersection(recipe_set)
            coverage = (len(matches) / len(user_set) * 100) if len(user_set) > 0 else 0
            
            scored_recipes.append({
                'recipe': recipe,
                'match_score': score,
                'ingredient_match_percentage': coverage
            })
    
    # Sort by score descending
    scored_recipes.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Return top K
    return scored_recipes[:top_k]

def main():
    """Main entry point for the recommendation engine"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        ingredients = input_data.get('ingredients', [])
        top_k = input_data.get('top_k', 5)
        min_score = input_data.get('min_score', 0.0)
        
        # Load recipes
        script_dir = Path(__file__).parent
        recipes_path = script_dir.parent / 'data' / 'recipes.json'
        recipes = load_recipes(str(recipes_path))
        
        # Get recommendations
        recommendations = get_recommendations(ingredients, recipes, top_k, min_score)
        
        # Format output
        result = {
            'success': True,
            'count': len(recommendations),
            'recommendations': [
                {
                    **rec['recipe'],
                    'match_score': rec['match_score'],
                    'ingredient_match_percentage': rec['ingredient_match_percentage']
                }
                for rec in recommendations
            ],
            'query': ingredients
        }
        
        # Write to stdout
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'count': 0,
            'recommendations': [],
            'query': []
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()
