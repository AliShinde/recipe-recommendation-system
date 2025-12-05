export class RecommendationController {
    private recommendationEngine: any;

    constructor(recommendationEngine: any) {
        this.recommendationEngine = recommendationEngine;
    }

    public async getRecommendations(req: any, res: any) {
        const { ingredients } = req.body;

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({ error: 'No ingredients provided' });
        }

        try {
            const recommendations = await this.recommendationEngine.getRecommendations(ingredients);
            return res.status(200).json(recommendations);
        } catch (error) {
            return res.status(500).json({ error: 'An error occurred while fetching recommendations' });
        }
    }
}