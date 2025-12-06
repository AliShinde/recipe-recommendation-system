# Recipe Recommendation System - Quick Start Guide

Get the project running locally in **5 minutes**! ⚡

---

## 🚀 Quick Setup (3 Steps)

### 1️⃣ Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/AliShinde/recipe-recommendation-system.git
cd recipe-recommendation-system

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Install Python ML dependencies
cd ../ml-model
pip install -r requirements.txt
```

### 2️⃣ Start Backend Server

```bash
# From project root
cd server
npm run dev
```

✅ Backend running at: **http://localhost:5000**

### 3️⃣ Start Frontend (New Terminal)

```bash
# Open a new terminal, from project root
cd client
npm start
```

✅ Frontend opens automatically at: **http://localhost:3000**

---

## 🎉 That's It!

-   Enter ingredients: `chicken, bacon, cheese`
-   Click **"Find Recipes"**
-   See AI-powered recommendations!

---

## 📋 Detailed Setup Instructions

### Prerequisites

Before you begin, ensure you have:

-   **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
-   **Python** (v3.8 or higher) - [Download](https://www.python.org/)
-   **npm** (comes with Node.js)
-   **Git** - [Download](https://git-scm.com/)

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/AliShinde/recipe-recommendation-system.git
cd recipe-recommendation-system
```

#### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Build TypeScript (optional for dev mode)
npm run build
```

#### 3. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd ../client

# Install dependencies
npm install
```

#### 4. Python ML Model Setup

```bash
# Navigate to ml-model directory (from project root)
cd ../ml-model

# Install Python dependencies
pip install -r requirements.txt

# OR if you have pip3
pip3 install -r requirements.txt

# OR if you prefer virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## ▶️ Running the Application

### Option 1: Run Both Services Separately (Recommended for Development)

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm start
```

### Option 2: Run Production Build

**Backend (serves both frontend and API):**

```bash
# Build frontend
cd client
npm run build

# Start backend (serves frontend + API)
cd ../server
npm run build
npm start
```

Access at: **http://localhost:5000**

---

## 🌐 Available Scripts

### Backend (server/)

```bash
npm run dev       # Development mode with auto-reload
npm run build     # Compile TypeScript to JavaScript
npm start         # Production mode
npm test          # Run tests (if available)
```

### Frontend (client/)

```bash
npm start         # Development mode (opens browser)
npm run build     # Production build
npm test          # Run tests
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env in server/)

Create `server/.env` file:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PYTHON_PATH=python3  # or 'python' on Windows
```

#### Frontend (.env.development in client/)

Already configured:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ✅ Verify Installation

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Test recommendation
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"ingredients":["chicken","bacon","cheese"],"top_k":5}'
```

**Expected response:** JSON with recipe recommendations

### Test Frontend

1. Open browser: **http://localhost:3000**
2. You should see the Recipe Recommendation System UI
3. Enter ingredients: `tomatoes, basil, mozzarella`
4. Click **"Find Recipes"**
5. See results!

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `Cannot find module 'express'`

```bash
cd server
npm install
```

**Error:** `Port 5000 already in use`

```bash
# Change port in server/.env
PORT=5001
```

### Frontend won't start

**Error:** `npm: command not found`

-   Install Node.js from nodejs.org

**Error:** `Port 3000 already in use`

-   Frontend will automatically suggest port 3001

### Python errors

**Error:** `No module named 'sentence_transformers'`

```bash
cd ml-model
pip install -r requirements.txt
```

**Error:** `python: command not found`

-   Install Python from python.org
-   Or use `python3` instead

### CORS errors in browser

-   Make sure backend is running on port 5000
-   Check `client/.env.development` has correct API URL
-   Restart both frontend and backend

---

## 📁 Project Structure

```
recipe-recommendation-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # API integration
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── package.json
│
├── ml-model/              # Python ML engine
│   ├── src/
│   │   └── predict.py     # Recommendation engine
│   ├── data/
│   │   └── recipes.json   # Recipe database (10 recipes)
│   └── requirements.txt
│
└── README.md
```

---

## 🎯 Quick Test

Once everything is running:

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:5000/api/health
3. **Test ingredients:** chicken, bacon, cheese
4. **Expected:** 5 recipe recommendations with match scores

---

## 📚 Additional Resources

-   **Full Documentation:** [DEPLOYMENT.md](./DEPLOYMENT.md)
-   **Project Report:** [PROJECT_REPORT.md](./PROJECT_REPORT.md)
-   **API Documentation:** Check `/api/health` endpoint
-   **Issues:** [GitHub Issues](https://github.com/AliShinde/recipe-recommendation-system/issues)

---

## 💡 Tips

-   **First API request** takes 5-10 seconds (ML model loading)
-   **Subsequent requests** are fast (1-2 seconds)
-   **Use VS Code** for best development experience
-   **Enable auto-save** for hot-reloading

---

## 🆘 Still Having Issues?

1. Check all prerequisites are installed
2. Ensure no other apps using ports 3000 or 5000
3. Try restarting terminals
4. Clear npm cache: `npm cache clean --force`
5. Delete `node_modules` and run `npm install` again

---

**Happy Coding! 🚀**
