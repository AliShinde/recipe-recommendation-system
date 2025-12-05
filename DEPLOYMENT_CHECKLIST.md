# Pre-Deployment Checklist

Before deploying to Render, complete these steps:

## ✅ Code Preparation

-   [ ] All code tested locally and working
-   [ ] Frontend connects to backend successfully
-   [ ] ML model returns recommendations
-   [ ] Recipe modal displays directions correctly
-   [ ] No console errors in browser
-   [ ] Backend logs show no errors

## ✅ Repository Setup

-   [ ] Code pushed to GitHub repository
-   [ ] `.gitignore` file added (excludes node_modules, .env, etc.)
-   [ ] `render.yaml` file in root directory
-   [ ] README.md is up to date
-   [ ] DEPLOYMENT.md guide included

## ✅ Configuration Files

-   [ ] `server/.env.production` created
-   [ ] `client/.env.production` created
-   [ ] `client/.env.development` created
-   [ ] CORS configured in `server/src/app.ts`
-   [ ] API URL configured for environment variables

## ✅ Dependencies

-   [ ] `server/package.json` has "build" and "start" scripts
-   [ ] `client/package.json` has "build" script
-   [ ] `ml-model/requirements.txt` is complete
-   [ ] All npm packages installed locally
-   [ ] All pip packages installed locally

## ✅ Recipe Dataset

-   [ ] RecipeNLG dataset downloaded (1000-5000 recipes)
-   [ ] Embeddings cached locally
-   [ ] Dataset file size reasonable (<10MB)
-   [ ] Consider committing small dataset to repo

## ✅ Performance Optimization

-   [ ] Embeddings caching implemented
-   [ ] Frontend build size checked (<5MB ideal)
-   [ ] Backend timeout set appropriately
-   [ ] Loading states added for slow requests

## 🚀 Deployment Steps

### 1. Push to GitHub

```powershell
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Create Render Account

-   Visit https://render.com
-   Sign up with GitHub

### 3. Deploy Backend

-   New Web Service
-   Connect repo
-   Use settings from DEPLOYMENT.md
-   Copy backend URL

### 4. Deploy Frontend

-   New Static Site
-   Connect repo
-   Add backend URL to env vars
-   Copy frontend URL

### 5. Update CORS

-   Update backend CLIENT_URL env var
-   Trigger redeploy

### 6. Test Live App

-   Visit frontend URL
-   Search for recipes
-   Click recipe to view directions
-   Check browser console for errors

## 🔍 Post-Deployment Verification

-   [ ] Frontend loads without errors
-   [ ] API connection works
-   [ ] Recipes are returned
-   [ ] Modal opens with directions
-   [ ] Match scores display correctly
-   [ ] No CORS errors
-   [ ] Backend logs show successful requests

## 📊 Monitor

-   [ ] Check Render logs regularly
-   [ ] Monitor response times
-   [ ] Watch for errors
-   [ ] Note cold start times

## 🐛 Common Issues

| Issue           | Solution                                |
| --------------- | --------------------------------------- |
| CORS error      | Update CLIENT_URL in backend            |
| API not found   | Check REACT_APP_API_URL in frontend     |
| Timeout         | Reduce dataset size to 500-1000 recipes |
| Out of memory   | Use smaller dataset or upgrade plan     |
| Cold start slow | Free tier limitation, wait 30-60s       |

## 📝 After Deployment

Share your live app:

-   Frontend: `https://your-app.onrender.com`
-   Backend API: `https://your-api.onrender.com`
-   GitHub Repo: `https://github.com/YOUR_USERNAME/recipe-recommendation-system`

## 💡 Optional Enhancements

-   [ ] Add custom domain
-   [ ] Set up monitoring/alerts
-   [ ] Add analytics
-   [ ] Create API documentation
-   [ ] Add rate limiting
-   [ ] Implement caching strategies
-   [ ] Set up CI/CD pipeline

---

**Ready to deploy?** Follow the detailed steps in `DEPLOYMENT.md`!
