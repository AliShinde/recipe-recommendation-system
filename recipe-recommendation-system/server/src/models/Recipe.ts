export class Recipe {
    title: string;
    ingredients: string[];
    instructions: string;

    constructor(title: string, ingredients: string[], instructions: string) {
        this.title = title;
        this.ingredients = ingredients;
        this.instructions = instructions;
    }
}