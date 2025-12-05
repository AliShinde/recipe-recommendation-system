# Recipe Recommendation System

An AI-powered full-stack web application that recommends recipes based on available ingredients using Hugging Face's pre-trained sentence-transformers model.

## 🌟 Features

-   **AI-Powered Recommendations**: Uses `sentence-transformers/all-MiniLM-L6-v2` from Hugging Face for semantic similarity matching
-   **Large Recipe Database**: Access to 5,000+ real recipes from the All-Recipes dataset via Hugging Face
-   **Real-time Search**: Instant recipe recommendations based on ingredient input
-   **Smart Matching**: Provides both semantic match scores and ingredient coverage percentages
-   **User-Friendly Interface**: Clean, responsive React UI with loading states and error handling
-   **Robust Backend**: TypeScript Express server with comprehensive error handling
-   **Edge Case Handling**: Gracefully handles null values, empty lists, API timeouts, and network errors
-   **Expandable Dataset**: Easy integration with RecipeNLG (2M+ recipes) or custom recipe sources

## 🏗️ Architecture

```
recipe-recommendation-system/
├── client/                 # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # API integration
│   │   └── types/         # TypeScript definitions
│   └── public/
├── server/                # Express backend (TypeScript)
│   └── src/
│       ├── controllers/   # Request handlers
│       ├── services/      # Business logic
│       ├── routes/        # API routes
│       └── types/         # TypeScript definitions
└── ml-model/              # Python ML model
    ├── data/              # Recipe database
    └── src/               # Model implementation
```

## 🚀 Getting Started

### Prerequisites

-   **Node.js** 16+ and npm
-   **Python** 3.8+ (Python 3.10-3.13 recommended)
-   **Git**

### Quick Installation (Windows)

Run the automated setup script:

```powershell
cd "c:\Clemson\AI receptive\final_project"
.\setup.ps1
```

### Manual Installation

#### 1. Navigate to project directory

```bash
cd "c:\Clemson\AI receptive\final_project"
```

#### 2. Set up the ML Model (Python)

**IMPORTANT**: If you have a virtual environment in the project root (`.venv`), the system will automatically use it. Otherwise:

```bash
cd ml-model

# Install dependencies directly (will use your active Python/venv)
pip install -r requirements.txt
```

**Note**:

-   First run will download the pre-trained model (~90MB) from Hugging Face
-   If you get TensorFlow/Keras errors, the code automatically handles them
-   Compatible with Python 3.8-3.13

#### 3. Set up the Backend (Node.js)

```bash
cd ../server

# Install dependencies
npm install

# Build TypeScript
npm run build
```

#### 4. Set up the Frontend (React)

```bash
cd ../client

# Install dependencies
npm install
```

#### 5. Download Recipe Dataset (Optional but Recommended)

The system comes with 10 sample recipes by default. To use 5,000+ real recipes:

```powershell
# Download 5,000 recipes (~5 MB, takes 2-3 minutes)
cd "c:\Clemson\AI receptive\final_project"
.\download_recipes.ps1

# Or download manually with custom size:
cd ml-model
python src/recipenlg_loader.py --size 5000

# For 10,000 recipes:
python src/recipenlg_loader.py --size 10000

# For ALL 2+ million recipes (takes longer, ~500+ MB):
python src/recipenlg_loader.py --all
```

The system will automatically use the downloaded dataset if available, otherwise it falls back to the 10 sample recipes.

**Important**: After downloading recipes, the first API request will take 1-2 minutes to compute embeddings. Subsequent requests will be fast (~2 seconds) as embeddings are cached. To pre-compute embeddings:

```powershell
# Pre-compute embeddings (recommended after downloading recipes)
.\cache_embeddings.ps1
```

## 🎮 Running the Application

You need to run three components:

### Terminal 1: Python ML Model (if testing directly)

```bash
cd ml-model
python src/predict.py
```

### Terminal 2: Backend Server

```bash
cd server

# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

Server runs on `http://localhost:5000`

### Terminal 3: Frontend

```bash
cd client
npm start
```

Frontend runs on `http://localhost:3000`

## 🧪 Testing the System

### Test the Python Model Directly

```bash
cd ml-model
python src/predict.py
```

This will run example queries and show results in the console.

### Test the Backend API

```bash
# Health check
curl http://localhost:5000/api/recommendations/health

# Get recommendations
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["chicken", "rice", "soy sauce"], "top_k": 5}'
```

### Test the Full Application

1. Open `http://localhost:3000` in your browser
2. Enter ingredients (e.g., "chicken", "tomatoes", "mozzarella")
3. Click "Find Recipes"
4. View recommended recipes with match scores

## 📊 How It Works

### 1. **Ingredient Input** (Frontend)

-   User enters available ingredients
-   Validation ensures no empty/null values
-   Duplicates are automatically removed

### 2. **API Request** (Frontend → Backend)

-   React app sends POST request with ingredients
-   Retry logic handles temporary network failures
-   Timeout prevents hanging requests (30s limit)

### 3. **Recommendation Engine** (Backend)

-   Express server validates input
-   Spawns Python process to run ML model
-   Handles process errors and timeouts

### 4. **ML Model Processing** (Python)

```python
# Load pre-trained model from Hugging Face
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Encode user ingredients
user_embedding = model.encode("chicken, rice, soy sauce")

# Encode all recipe ingredients
recipe_embeddings = model.encode(all_recipe_ingredients)

# Calculate cosine similarity
similarities = cosine_similarity(user_embedding, recipe_embeddings)

# Return top K matches
```

### 5. **Response & Display** (Backend → Frontend)

-   Results include match scores and ingredient coverage
-   Frontend displays recipes ranked by relevance
-   Error states handled gracefully

## 🔧 Configuration

### Environment Variables

Create `.env` files if needed:

**Backend** (`server/.env`):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PYTHON_PATH=python  # or python3 on macOS/Linux
```

**Frontend** (`client/.env`):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📝 API Documentation

### POST `/api/recommendations`

Get recipe recommendations based on ingredients.

**Request Body:**

```json
{
	"ingredients": ["chicken", "rice", "soy sauce"],
	"top_k": 5, // optional, default: 5
	"min_score": 0.0 // optional, default: 0.0 (range: 0-1)
}
```

**Response:**

```json
{
  "success": true,
  "count": 5,
  "recommendations": [
    {
      "id": 2,
      "name": "Chicken Stir Fry",
      "ingredients": ["chicken breast", "soy sauce", ...],
      "description": "Quick and healthy Asian-inspired stir fry",
      "cookingTime": 15,
      "difficulty": "easy",
      "cuisine": "Asian",
      "match_score": 0.847,
      "ingredient_match_percentage": 62.5
    }
  ],
  "query": ["chicken", "rice", "soy sauce"]
}
```

### GET `/api/recommendations/health`

Health check endpoint.

**Response:**

```json
{
	"status": "ok",
	"message": "Recommendation service is healthy",
	"timestamp": "2025-12-04T10:30:00.000Z"
}
```

## 🎨 Component Documentation

### IngredientInput Component

**Purpose**: Manages user ingredient input with validation

**Props:**

-   `onIngredientsChange`: Callback when ingredients change
-   `onSearch`: Callback to trigger search
-   `isLoading`: Boolean for loading state

**Features:**

-   Add ingredients via button or Enter key
-   Remove individual ingredients
-   Clear all ingredients
-   Duplicate detection
-   Empty string validation

### RecipeCard Component

**Purpose**: Displays individual recipe with match scores

**Props:**

-   `recipe`: Recipe object with all details
-   `rank`: Optional ranking number

**Features:**

-   Match score visualization with color coding
-   Ingredient coverage percentage
-   Cooking time and difficulty display
-   Complete ingredient list

### RecommendationList Component

**Purpose**: Manages display of recipe list and states

**Props:**

-   `recipes`: Array of recipe objects
-   `isLoading`: Boolean for loading state
-   `error`: Error message string
-   `hasSearched`: Boolean tracking if search occurred

**States:**

-   Loading: Shows spinner
-   Error: Shows error message
-   Empty: Shows "no results" message
-   Initial: Shows welcome message
-   Results: Shows recipe cards

## 🐛 Error Handling

The system handles various edge cases:

### Frontend

-   Empty ingredient lists
-   Null/undefined values
-   Network timeouts (30s)
-   API connection failures
-   Invalid JSON responses

### Backend

-   Invalid request bodies
-   Empty ingredient arrays
-   Python process failures
-   Model loading errors
-   Process timeouts

### Python Model

-   Missing recipe files
-   Invalid JSON data
-   Empty recipe databases
-   Model download failures
-   Encoding errors

## 🚀 Deployment

### Backend (Node.js)

```bash
cd server
npm run build
npm start
```

Set environment variables:

-   `PORT`: Server port
-   `NODE_ENV`: production
-   `PYTHON_PATH`: Path to Python executable

### Frontend (React)

```bash
cd client
npm run build
```

Deploy the `build/` folder to a static hosting service (Netlify, Vercel, etc.)

### Python Model

Ensure Python and dependencies are installed on the server:

```bash
pip install -r ml-model/requirements.txt
```

## 📦 Dependencies

### Python

-   `sentence-transformers`: Pre-trained models from Hugging Face
-   `numpy`: Numerical computations
-   `scikit-learn`: ML utilities
-   `flask`: API server (optional)

### Backend

-   `express`: Web framework
-   `cors`: CORS middleware
-   `typescript`: Type safety

### Frontend

-   `react`: UI library
-   `typescript`: Type safety

## 🤖 About the Model

**Model**: `sentence-transformers/all-MiniLM-L6-v2`

**Why this model?**

-   Lightweight (~80MB)
-   Fast inference
-   Good for semantic similarity tasks
-   Pre-trained on large text corpus
-   No fine-tuning required

**How it works**:

-   Converts text to 384-dimensional vectors
-   Semantically similar text gets similar vectors
-   Cosine similarity measures relevance

## 🎯 Future Enhancements

-   [ ] User accounts and saved recipes
-   [ ] Dietary restrictions and allergies filtering
-   [ ] Recipe ratings and reviews
-   [ ] Cooking instructions step-by-step
-   [ ] Shopping list generation
-   [ ] Nutritional information
-   [ ] Image recognition for ingredients
-   [ ] Multi-language support

## 📄 License

MIT License - Feel free to use for your projects!

## 👥 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Troubleshooting

### Model download fails

```bash
# Manually download model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
```

### Backend can't find Python

Set the `PYTHON_PATH` environment variable:

```bash
# Windows
set PYTHON_PATH=C:\Path\To\Python\python.exe

# Linux/macOS
export PYTHON_PATH=/usr/bin/python3
```

### CORS errors

Ensure `CLIENT_URL` in backend `.env` matches frontend URL

### Port already in use

Change ports in configuration files or kill the process using the port

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review error messages in browser console
3. Check backend logs for detailed errors
4. Ensure all dependencies are installed

---

**Built with ❤️ using React, TypeScript, Express, Python, and Hugging Face Transformers**
