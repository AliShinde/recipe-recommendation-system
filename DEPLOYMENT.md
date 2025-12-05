# Deployment Guide - Recipe Recommendation System on Render

This guide walks you through deploying the Recipe Recommendation System to Render's free tier.

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at https://render.com (free)
3. **Completed Application** - All three components (frontend, backend, ML model) working locally

## 🏗️ Architecture on Render

We'll deploy three services:
1. **Web Service** (Backend) - Express/Node.js API
2. **Static Site** (Frontend) - React application
3. **Background Worker** (Optional) - For ML model preprocessing

## 📦 Pre-Deployment Setup

### Step 1: Prepare Your Repository

First, ensure your code is pushed to GitHub:

```powershell
cd "c:\Clemson\AI receptive\final_project"

# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Render deployment"

# Create GitHub repo and push
# Follow GitHub instructions to create a new repo, then:
git remote add origin https://github.com/YOUR_USERNAME/recipe-recommendation-system.git
git branch -M main
git push -u origin main
```

### Step 2: Create Environment Configuration Files

#### Backend Environment Variables (.env.production)

Create `server/.env.production`:
```env
NODE_ENV=production
PORT=10000
PYTHON_PATH=python3
CLIENT_URL=https://your-frontend-url.onrender.com
```

#### Frontend Environment Variables

Create `client/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### Step 3: Update Backend for Production

Update `server/src/app.ts` to handle production URLs:

```typescript
// Add after dotenv.config()
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
    cors({
        origin: clientUrl,
        credentials: true,
    })
);
```

### Step 4: Add Build Scripts

Update `server/package.json`:
```json
{
  "scripts": {
    "start": "node dist/app.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "postinstall": "npm run build"
  }
}
```

Update `client/package.json`:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### Step 5: Create Render Configuration Files

#### For Backend (render-backend.yaml)

Create `render-backend.yaml` in the root:
```yaml
services:
  - type: web
    name: recipe-recommendation-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && npm start
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: PYTHON_PATH
        value: python3
      - key: CLIENT_URL
        sync: false
    disk:
      name: ml-data
      mountPath: /opt/render/project/src/ml-model/data
      sizeGB: 1
```

#### For Frontend (render-frontend.yaml)

Create `render-frontend.yaml` in the root:
```yaml
services:
  - type: web
    name: recipe-recommendation-frontend
    env: static
    region: oregon
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/build
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: REACT_APP_API_URL
        sync: false
```

### Step 6: Add Requirements for Python

Ensure `ml-model/requirements.txt` is production-ready:
```txt
sentence-transformers>=3.0.0
numpy>=1.26.0
scikit-learn>=1.4.0
datasets>=2.14.0
```

### Step 7: Create Startup Script for ML Model

Create `ml-model/setup_production.sh`:
```bash
#!/bin/bash
echo "Setting up ML model for production..."
cd /opt/render/project/src/ml-model
pip install -r requirements.txt
python src/recipenlg_loader.py --size 1000
python -c "from src.predict import RecipeRecommender; r = RecipeRecommender(silent=False); r.load_recipes()"
echo "ML model setup complete!"
```

Make it executable:
```powershell
git add ml-model/setup_production.sh
git update-index --chmod=+x ml-model/setup_production.sh
```

## 🚀 Deployment Steps

### Part 1: Deploy Backend

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select your repository

3. **Configure Backend Service**
   - **Name**: `recipe-recommendation-backend`
   - **Region**: Choose closest to you (e.g., Oregon)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   ```
   NODE_ENV = production
   PORT = 10000
   PYTHON_PATH = python3
   CLIENT_URL = (leave blank for now, will update after frontend deploy)
   ```

5. **Add Python Support**
   - In "Advanced" → "Add Build Command":
   ```bash
   cd ../ml-model && pip install -r requirements.txt && python src/recipenlg_loader.py --size 1000
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy the backend URL (e.g., `https://recipe-recommendation-backend.onrender.com`)

### Part 2: Deploy Frontend

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Select your repository

2. **Configure Frontend**
   - **Name**: `recipe-recommendation-frontend`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

3. **Add Environment Variables**
   ```
   REACT_APP_API_URL = https://recipe-recommendation-backend.onrender.com
   ```
   *(Use the actual backend URL from Part 1)*

4. **Deploy**
   - Click "Create Static Site"
   - Wait 5-10 minutes for deployment
   - Copy the frontend URL (e.g., `https://recipe-recommendation-frontend.onrender.com`)

### Part 3: Update CORS Settings

1. **Update Backend Environment Variable**
   - Go to backend service in Render dashboard
   - Navigate to "Environment"
   - Update `CLIENT_URL` to your frontend URL
   - Click "Save Changes"
   - Service will auto-redeploy

## 🔧 Post-Deployment Configuration

### Test Your Deployment

1. **Visit Frontend URL**
   - Open `https://your-frontend-url.onrender.com`
   - Should see the ingredient input interface

2. **Test API Connection**
   - Enter ingredients like "chicken, rice, tomatoes"
   - Click "Find Recipes"
   - Should return recommendations within 5-10 seconds

3. **Check Backend Logs**
   - In Render dashboard → Backend service → "Logs"
   - Look for successful startup messages

### Common Issues & Solutions

#### Issue 1: Backend Times Out
**Solution**: Free tier services sleep after 15 minutes of inactivity. First request takes 30-60 seconds to wake up.
- Add a health check endpoint
- Consider upgrading to paid tier for instant responses

#### Issue 2: ML Model Not Found
**Solution**: Ensure Python dependencies are installed:
```bash
# In Render Shell (backend service)
cd ml-model
pip install -r requirements.txt
python src/recipenlg_loader.py --size 1000
```

#### Issue 3: CORS Errors
**Solution**: Verify CLIENT_URL is set correctly in backend environment variables

#### Issue 4: Out of Memory
**Solution**: Reduce recipe dataset size:
```bash
python src/recipenlg_loader.py --size 500
```

## 📊 Free Tier Limitations

**Render Free Tier Includes:**
- ✅ 750 hours/month of runtime
- ✅ Automatic HTTPS
- ✅ Continuous deployment from Git
- ✅ 512 MB RAM per service
- ❌ Services spin down after 15 min inactivity
- ❌ 500 GB bandwidth/month

**Recommendations for Free Tier:**
1. Use 500-1000 recipes (not 5000) to fit in memory
2. Expect 30-60 second cold start times
3. Consider deploying backend only, use localhost for development

## 🎯 Alternative: Deploy Backend Only

If you want to keep frontend running locally:

1. **Deploy only backend to Render** (follow Part 1 above)

2. **Update local frontend** `.env.development`:
   ```env
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

3. **Run frontend locally**:
   ```powershell
   cd client
   npm start
   ```

This approach:
- ✅ Saves deployment costs
- ✅ Faster development iteration
- ✅ Better debugging experience
- ❌ Need local development server running

## 📝 Monitoring & Maintenance

### View Logs
```
Render Dashboard → Your Service → Logs tab
```

### Redeploy
```
Render Dashboard → Your Service → Manual Deploy → "Deploy latest commit"
```

### Update Environment Variables
```
Render Dashboard → Your Service → Environment → Edit → Save Changes
```

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:

```powershell
cd "c:\Clemson\AI receptive\final_project"
git add .
git commit -m "Update feature"
git push origin main
# Render auto-deploys within 5 minutes
```

## 💡 Tips for Production

1. **Enable Health Checks**: Add `/health` endpoint to backend
2. **Use Environment Variables**: Never commit sensitive data
3. **Monitor Logs**: Check Render logs regularly for errors
4. **Cache Embeddings**: Pre-compute and commit embeddings to repo
5. **Optimize Bundle**: Run `npm run build` locally to check size
6. **Add Loading States**: Handle cold start delays gracefully

## 🎉 Your App is Live!

Once deployed, share your app:
- Frontend: `https://recipe-recommendation-frontend.onrender.com`
- Backend API: `https://recipe-recommendation-backend.onrender.com`

Users can now access your AI-powered recipe recommendation system from anywhere! 🍳
