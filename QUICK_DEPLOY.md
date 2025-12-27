# 🚀 Quick Deployment Guide

## Prerequisites
- ✅ Code pushed to GitHub: https://github.com/24-Harshdeep/LearnApp-Fullstack-
- MongoDB Atlas account (free)
- Render account (free)
- Vercel account (free)

## 🔧 Backend Deployment (Render)

### Step 1: Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect GitHub repository: `24-Harshdeep/LearnApp-Fullstack-`
4. Configure:
   - **Name**: `learnapp-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 2: Environment Variables
Add these in Render Environment section:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<generate-random-32-char-string>
GEMINI_API_KEY=<your-gemini-api-key>
```

Optional:
```env
FIREBASE_SERVICE_ACCOUNT=<firebase-json-as-string>
OPENAI_API_KEY=<your-openai-key>
```

### Step 3: Deploy
- Click **Create Web Service**
- Wait for deployment (5-10 minutes)
- Copy your backend URL: `https://learnapp-backend.onrender.com`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Import Project
1. Go to [Vercel](https://vercel.com/new)
2. Import repository: `24-Harshdeep/LearnApp-Fullstack-`
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Environment Variables
Add in Project Settings → Environment Variables:

```env
VITE_API_URL=https://learnapp-backend.onrender.com
VITE_SOCKET_URL=https://learnapp-backend.onrender.com
```

### Step 3: Deploy
- Click **Deploy**
- Wait for deployment (2-5 minutes)
- Copy your frontend URL: `https://learnapp.vercel.app`

---

## 🔄 Post-Deployment

### Update Backend CORS
1. Go to Render → Your backend service → Environment
2. Add new variable:
   ```env
   FRONTEND_URL=https://learnapp.vercel.app
   ```
3. Click **Save Changes** (auto-redeploys)

---

## 📊 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free cluster (M0)
3. **Database Access** → Create user with password
4. **Network Access** → Add IP: `0.0.0.0/0` (allow from anywhere)
5. **Databases** → Connect → Drivers → Copy connection string
6. Replace `<password>` and set database name to `learnapp`

Example URI:
```
mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/learnapp?retryWrites=true&w=majority
```

---

## ✅ Verify Deployment

### Test Checklist:
- [ ] Visit frontend URL
- [ ] Check browser console (no CORS errors)
- [ ] Try creating account
- [ ] Try logging in
- [ ] Verify XP/coins updating
- [ ] Test AI features
- [ ] Check backend logs on Render

### Common Issues:

**CORS Errors:**
- Verify `FRONTEND_URL` is set on backend
- Check URL has no trailing slash
- Redeploy backend after CORS update

**API 404 Errors:**
- Verify `VITE_API_URL` in Vercel (no `/api` suffix)
- Check backend is deployed and healthy

**MongoDB Connection Failed:**
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check connection string format
- Ensure user has read/write permissions

**Build Failures:**
- Check build logs on Render/Vercel
- Verify all dependencies in package.json
- Test build locally first: `npm run build`

---

## 🔗 Quick Links

### Dashboards:
- **Backend**: https://dashboard.render.com/
- **Frontend**: https://vercel.com/dashboard
- **Database**: https://cloud.mongodb.com/

### Logs:
- **Backend Logs**: Render Dashboard → Your Service → Logs
- **Frontend Logs**: Vercel Dashboard → Your Project → Deployments → Logs
- **Database**: Atlas Dashboard → Metrics

---

## 🎯 Your Deployed URLs

Once deployed, update these:

```
🌐 Frontend: https://your-app.vercel.app
🔧 Backend:  https://your-backend.onrender.com
📊 Database: MongoDB Atlas Cluster
```

---

## 📚 Additional Resources

- Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Render documentation: https://render.com/docs
- Vercel documentation: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/

---

## 🎉 Success!

Your LearnApp is now deployed and accessible worldwide! 🌍

**Share your deployment:**
```
Frontend: [Your Vercel URL]
Backend:  [Your Render URL]
```

Happy learning! 📚✨
