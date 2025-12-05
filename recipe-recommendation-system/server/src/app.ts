import express from 'express';
import bodyParser from 'body-parser';
import { setRecipeRoutes } from './routes/recipes';
import { setRecommendationRoutes } from './routes/recommendations';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

setRecipeRoutes(app);
setRecommendationRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});