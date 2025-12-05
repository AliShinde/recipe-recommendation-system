import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController';

const router = Router();
const recipeController = new RecipeController();

router.get('/', recipeController.getAllRecipes.bind(recipeController));
router.get('/:id', recipeController.getRecipeById.bind(recipeController));

export function setRecipeRoutes(app) {
    app.use('/api/recipes', router);
}