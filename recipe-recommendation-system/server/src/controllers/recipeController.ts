export class RecipeController {
    private recipes: any[]; // Replace 'any' with a specific type if available

    constructor() {
        this.recipes = []; // Initialize with an empty array or fetch from a database
    }

    public getAllRecipes(req: any, res: any): void {
        res.json(this.recipes);
    }

    public addRecipe(req: any, res: any): void {
        const newRecipe = req.body;
        this.recipes.push(newRecipe);
        res.status(201).json(newRecipe);
    }

    public getRecipeById(req: any, res: any): void {
        const recipeId = req.params.id;
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    }
}