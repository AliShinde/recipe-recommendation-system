# Quick Start Guide - Recipe Recommendation System

## ✅ Installation Complete!

All dependencies have been successfully installed.

## 🚀 Running the Application

You need to run **2 terminals** simultaneously:

### Terminal 1: Backend Server

```powershell
cd "c:\Clemson\AI receptive\final_project\server"
npm run dev
```

**Expected output:**

```
Server is running on port 5000
Environment: development
```

### Terminal 2: Frontend Client

```powershell
cd "c:\Clemson\AI receptive\final_project\client"
npm start
```

**Expected output:**

```
Compiled successfully!
Local:            http://localhost:3000
```

Your browser will automatically open to `http://localhost:3000`

## 🧪 Testing the System

1. **Frontend**: The browser should open automatically
2. **Add Ingredients**: Type ingredients like "chicken", "rice", "tomatoes"
3. **Click "Find Recipes"**: The system will:
    - Send request to backend (port 5000)
    - Backend calls Python ML model
    - Model uses Hugging Face sentence-transformers
    - Returns ranked recipe recommendations

## 📊 What Happens Behind the Scenes

```
User Input (Frontend)
    ↓
React App (localhost:3000)
    ↓
Express API (localhost:5000)
    ↓
Python ML Model (.venv/Scripts/python.exe)
    ↓
Hugging Face Model (sentence-transformers/all-MiniLM-L6-v2)
    ↓
Recipe Rankings
    ↓
Display Results
```

## 🔧 Troubleshooting

### Backend won't start

-   Check if port 5000 is already in use
-   Verify `.env` file exists in `server/` directory
-   Ensure Python virtual environment is accessible

### Frontend won't connect to backend

-   Ensure backend is running on port 5000
-   Check CORS settings in `server/src/app.ts`
-   Verify `REACT_APP_API_URL` in client

### Python model errors

-   First run downloads ~90MB model (one-time)
-   Verify virtual environment: `.venv/Scripts/python.exe`
-   Check `ml-model/src/predict.py` has environment variables set

### No recipes returned

-   Model is working but no matches found
-   Try common ingredients: "chicken", "tomatoes", "rice"
-   Check console for error messages

## 📝 API Endpoints

Once the backend is running, you can test directly:

```powershell
# Health check
curl http://localhost:5000/api/recommendations/health

# Get recommendations
curl -X POST http://localhost:5000/api/recommendations `
  -H "Content-Type: application/json" `
  -d '{"ingredients": ["chicken", "rice"], "top_k": 5}'
```

## 🎯 Key Features

-   ✅ Real-time ingredient input with validation
-   ✅ AI-powered semantic matching (not keyword matching)
-   ✅ Match scores showing relevance
-   ✅ Ingredient coverage percentages
-   ✅ Error handling for edge cases
-   ✅ Responsive design
-   ✅ Loading states and feedback

## 📦 Technologies Used

-   **Frontend**: React 18, TypeScript 4.9
-   **Backend**: Express, TypeScript 5.3, Node.js
-   **ML Model**: Python 3.13, sentence-transformers 5.1
-   **AI Model**: Hugging Face `all-MiniLM-L6-v2`

## 🎉 You're Ready!

Run both terminals and start recommending recipes! 🍳
