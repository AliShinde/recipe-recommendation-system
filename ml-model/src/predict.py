"""
Recipe Recommendation Engine using Sentence Transformers
This module uses pre-trained sentence-transformers model from Hugging Face
to recommend recipes based on available ingredients using semantic similarity.
"""

# Set environment variables to avoid TensorFlow conflicts
import os
import sys
import warnings

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['USE_TF'] = '0'
os.environ['TRANSFORMERS_VERBOSITY'] = 'error'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

# Suppress all warnings
warnings.filterwarnings('ignore')

# Try to import ML dependencies, fallback to lightweight version if not available
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("Warning: sentence_transformers not available, using lightweight mode", file=sys.stderr)

import numpy as np
import json
from typing import List, Dict, Optional, Union
from pathlib import Path


class RecipeRecommender:
    """
    A recipe recommendation system using sentence embeddings for semantic matching.
    Uses Hugging Face's sentence-transformers for ingredient-to-recipe matching.
    """
    
    def __init__(self, model_name: str = 'sentence-transformers/all-MiniLM-L6-v2', silent: bool = False):
        """
        Initialize the recommender with a pre-trained sentence transformer model.
        
        Args:
            model_name: Name of the Hugging Face model to use
                       Default: 'sentence-transformers/all-MiniLM-L6-v2'
                       This is a lightweight, fast model good for similarity matching
            silent: If True, suppress all print statements (for API use)
        """
        self.silent = silent
        try:
            # Load the pre-trained model from Hugging Face
            if not self.silent:
                print(f"Loading model: {model_name}", file=sys.stderr)
            self.model = SentenceTransformer(model_name)
            self.recipes = []
            self.recipe_embeddings = None
            if not self.silent:
                print("Model loaded successfully", file=sys.stderr)
        except Exception as e:
            raise RuntimeError(f"Failed to load model {model_name}: {str(e)}")
    
    def load_recipes(self, recipe_file_path: Optional[str] = None, use_recipenlg: bool = True) -> None:
        """
        Load recipes from a JSON file and pre-compute their embeddings.
        
        Args:
            recipe_file_path: Path to the recipes JSON file
                             If None, uses default path relative to this file
            use_recipenlg: If True, try to use RecipeNLG dataset first
        
        Raises:
            FileNotFoundError: If recipe file doesn't exist
            ValueError: If recipe data is invalid or empty
        """
        # Default path handling - Always use recipes.json (now has 30 recipes)
        if recipe_file_path is None:
            current_dir = Path(__file__).parent.parent
            recipe_file_path = current_dir / 'data' / 'recipes.json'
            if not self.silent:
                print("Using recipes.json dataset", file=sys.stderr)
        
        # Validate file exists
        if not os.path.exists(recipe_file_path):
            raise FileNotFoundError(f"Recipe file not found: {recipe_file_path}")
        
        try:
            # Load recipe data
            with open(recipe_file_path, 'r', encoding='utf-8') as f:
                self.recipes = json.load(f)
            
            # Validate loaded data
            if not self.recipes or not isinstance(self.recipes, list):
                raise ValueError("Recipe data is empty or invalid format")
            
            # Validate each recipe has required fields
            for idx, recipe in enumerate(self.recipes):
                if 'ingredients' not in recipe or not recipe['ingredients']:
                    raise ValueError(f"Recipe at index {idx} missing 'ingredients' field")
            
            if not self.silent:
                print(f"Loaded {len(self.recipes)} recipes", file=sys.stderr)
            
            # Pre-compute embeddings for all recipes (with caching)
            # This improves performance by avoiding re-computation on each query
            self._compute_recipe_embeddings(recipe_file_path)
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in recipe file: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Error loading recipes: {str(e)}")
    
    def _compute_recipe_embeddings(self, recipe_file_path: str) -> None:
        """
        Pre-compute embeddings for all recipes in the database.
        Uses caching to avoid recomputation on subsequent runs.
        
        Args:
            recipe_file_path: Path to the recipe file (used for cache filename)
        """
        try:
            # Generate cache filename based on recipe file
            cache_file = Path(recipe_file_path).parent / f"{Path(recipe_file_path).stem}_embeddings.npy"
            
            # Check if cached embeddings exist and are valid
            if cache_file.exists():
                try:
                    if not self.silent:
                        print(f"Loading cached embeddings from {cache_file.name}...", file=sys.stderr)
                    self.recipe_embeddings = np.load(cache_file)
                    
                    # Verify cache matches current recipe count
                    if len(self.recipe_embeddings) == len(self.recipes):
                        if not self.silent:
                            print("✓ Cached embeddings loaded successfully", file=sys.stderr)
                        return
                    else:
                        if not self.silent:
                            print("Cache size mismatch, recomputing...", file=sys.stderr)
                except Exception as e:
                    if not self.silent:
                        print(f"Failed to load cache: {e}, recomputing...", file=sys.stderr)
            
            # Convert ingredient lists to comma-separated strings
            recipe_texts = [
                ", ".join(recipe['ingredients']) 
                for recipe in self.recipes
            ]
            
            # Compute embeddings for all recipes at once (batch processing)
            if not self.silent:
                print("Computing recipe embeddings (this may take a minute)...", file=sys.stderr)
            self.recipe_embeddings = self.model.encode(
                recipe_texts,
                show_progress_bar=(not self.silent),
                convert_to_numpy=True,
                batch_size=32  # Process in batches for better performance
            )
            
            # Save embeddings to cache
            try:
                np.save(cache_file, self.recipe_embeddings)
                if not self.silent:
                    print(f"✓ Embeddings cached to {cache_file.name}", file=sys.stderr)
            except Exception as e:
                if not self.silent:
                    print(f"Warning: Failed to save cache: {e}", file=sys.stderr)
            
            if not self.silent:
                print("Recipe embeddings computed successfully", file=sys.stderr)
            
        except Exception as e:
            raise RuntimeError(f"Error computing embeddings: {str(e)}")
    
    def recommend_recipes(
        self,
        available_ingredients: Union[List[str], str],
        top_k: int = 5,
        min_match_score: float = 0.0
    ) -> List[Dict]:
        """
        Recommend recipes based on available ingredients using semantic similarity.
        
        Args:
            available_ingredients: List of ingredient strings or comma-separated string
                                  Example: ["chicken", "rice", "soy sauce"]
                                  or "chicken, rice, soy sauce"
            top_k: Number of top recommendations to return (default: 5)
            min_match_score: Minimum similarity score (0-1) for recommendations
                           Recipes below this threshold are filtered out
        
        Returns:
            List of recipe dictionaries with added 'match_score' field,
            sorted by relevance (highest match first)
        
        Raises:
            ValueError: If inputs are invalid (empty ingredients, invalid top_k)
            RuntimeError: If recipes haven't been loaded yet
        """
        # Input validation
        if not available_ingredients:
            raise ValueError("available_ingredients cannot be empty")
        
        if top_k <= 0:
            raise ValueError("top_k must be a positive integer")
        
        if not 0 <= min_match_score <= 1:
            raise ValueError("min_match_score must be between 0 and 1")
        
        # Check if recipes are loaded
        if not self.recipes or self.recipe_embeddings is None:
            raise RuntimeError("Recipes not loaded. Call load_recipes() first")
        
        try:
            # Normalize input: convert to list if string
            if isinstance(available_ingredients, str):
                available_ingredients = [
                    ing.strip() 
                    for ing in available_ingredients.split(',')
                    if ing.strip()
                ]
            
            # Handle empty list after normalization
            if not available_ingredients:
                raise ValueError("No valid ingredients provided after parsing")
            
            # Create ingredient string for encoding
            user_ingredients = ", ".join(available_ingredients).lower()
            
            # Encode user's ingredients
            user_embedding = self.model.encode(
                user_ingredients,
                convert_to_numpy=True
            )
            
            # Calculate cosine similarity between user ingredients and all recipes
            # Cosine similarity ranges from -1 to 1, where 1 means identical
            similarities = self._calculate_cosine_similarity(
                user_embedding,
                self.recipe_embeddings
            )
            
            # Filter by minimum match score
            valid_indices = np.where(similarities >= min_match_score)[0]
            
            if len(valid_indices) == 0:
                return []  # No recipes meet the minimum threshold
            
            # Get top K indices sorted by similarity (descending)
            # We limit to available valid indices
            k = min(top_k, len(valid_indices))
            top_indices = valid_indices[
                np.argsort(similarities[valid_indices])[-k:][::-1]
            ]
            
            # Build result with match scores
            recommendations = []
            for idx in top_indices:
                recipe = self.recipes[idx].copy()  # Create copy to avoid modifying original
                recipe['match_score'] = float(similarities[idx])
                
                # Calculate ingredient match percentage
                recipe['ingredient_match_percentage'] = self._calculate_ingredient_match(
                    available_ingredients,
                    recipe['ingredients']
                )
                
                recommendations.append(recipe)
            
            return recommendations
            
        except Exception as e:
            raise RuntimeError(f"Error during recommendation: {str(e)}")
    
    def _calculate_cosine_similarity(
        self,
        vector1: np.ndarray,
        vector2: np.ndarray
    ) -> np.ndarray:
        """
        Calculate cosine similarity between vectors.
        
        Args:
            vector1: Query embedding (1D array)
            vector2: Recipe embeddings (2D array, one row per recipe)
        
        Returns:
            Array of similarity scores (one per recipe)
        """
        # Normalize vectors for cosine similarity
        # cosine_sim = dot(A, B) / (||A|| * ||B||)
        vector1_norm = vector1 / np.linalg.norm(vector1)
        vector2_norm = vector2 / np.linalg.norm(vector2, axis=1, keepdims=True)
        
        # Calculate dot product (equivalent to cosine similarity after normalization)
        return np.dot(vector2_norm, vector1_norm)
    
    def _calculate_ingredient_match(
        self,
        user_ingredients: List[str],
        recipe_ingredients: List[str]
    ) -> float:
        """
        Calculate percentage of recipe ingredients that user has.
        This is a simple exact-match metric (not semantic).
        
        Args:
            user_ingredients: List of ingredients user has
            recipe_ingredients: List of ingredients in recipe
        
        Returns:
            Percentage (0-100) of recipe ingredients user has
        """
        if not recipe_ingredients:
            return 0.0
        
        # Normalize to lowercase for comparison
        user_set = set(ing.lower().strip() for ing in user_ingredients)
        recipe_set = set(ing.lower().strip() for ing in recipe_ingredients)
        
        # Calculate overlap
        matched = len(user_set.intersection(recipe_set))
        total = len(recipe_set)
        
        return round((matched / total) * 100, 2)


def predict_recipes(
    ingredients: Union[List[str], str],
    top_k: int = 5,
    min_score: float = 0.0,
    silent: bool = True
) -> Dict:
    """
    Standalone function to get recipe recommendations.
    This is the main entry point for the API.
    
    Args:
        ingredients: List of available ingredients or comma-separated string
        top_k: Number of recommendations to return
        min_score: Minimum match score threshold
        silent: If True, suppress all print statements (default for API)
    
    Returns:
        Dictionary with 'recommendations' list and metadata
    
    Example:
        >>> result = predict_recipes(["chicken", "rice", "soy sauce"], top_k=3)
        >>> print(result['recommendations'][0]['name'])
    """
    try:
        # Initialize recommender with silent mode for API calls
        recommender = RecipeRecommender(silent=silent)
        
        # Load recipes from default location
        recommender.load_recipes()
        
        # Get recommendations
        recommendations = recommender.recommend_recipes(
            available_ingredients=ingredients,
            top_k=top_k,
            min_match_score=min_score
        )
        
        return {
            'success': True,
            'count': len(recommendations),
            'recommendations': recommendations,
            'query': ingredients if isinstance(ingredients, list) else ingredients.split(',')
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'recommendations': []
        }


# Example usage and testing
if __name__ == "__main__":
    # Example 1: Using the class directly
    print("=" * 50)
    print("Example 1: Chicken-based recipes")
    print("=" * 50)
    
    recommender = RecipeRecommender(silent=False)  # Enable output for testing
    recommender.load_recipes()
    
    user_ingredients = ["chicken", "soy sauce", "rice"]
    results = recommender.recommend_recipes(user_ingredients, top_k=3)
    
    for i, recipe in enumerate(results, 1):
        print(f"\n{i}. {recipe['name']}")
        print(f"   Match Score: {recipe['match_score']:.3f}")
        print(f"   Ingredient Match: {recipe['ingredient_match_percentage']:.1f}%")
        print(f"   Ingredients: {', '.join(recipe['ingredients'][:5])}...")
    
    # Example 2: Using the standalone function
    print("\n" + "=" * 50)
    print("Example 2: Italian ingredients")
    print("=" * 50)
    
    result = predict_recipes("tomatoes, mozzarella, basil, olive oil", top_k=3, silent=False)
    
    if result['success']:
        print(f"\nFound {result['count']} recommendations:")
        for recipe in result['recommendations']:
            print(f"- {recipe['name']} (Score: {recipe['match_score']:.3f})")
