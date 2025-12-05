import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchRecommendations = async (ingredients: string[]) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/recommendations`, { ingredients });
        return response.data;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
};

export const fetchAllRecipes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/recipes`);
        return response.data;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw error;
    }
};