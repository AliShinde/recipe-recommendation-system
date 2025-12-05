import { Router } from 'express';
import RecommendationController from '../controllers/recommendationController';

const router = Router();
const recommendationController = new RecommendationController();

router.post('/recommend', recommendationController.getRecommendations);

export default function setRecommendationRoutes(app) {
    app.use('/api/recommendations', router);
}