# Deployment Guide

## Backend Deployment (Render/Railway)

### Prerequisites
- MongoDB Atlas account (free tier available)
- Render or Railway account
- Environment variables ready

### Steps for Render:

1. **Push your code to GitHub** (already done)

2. **Create a new Web Service on Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `/server` directory as the root

3. **Configure the service:**
   - Name: `learnapp-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-a-strong-secret>
   GEMINI_API_KEY=<your-gemini-api-key>
   FIREBASE_SERVICE_ACCOUNT=<your-firebase-json-string>
   ```

5. **Deploy** and copy the backend URL (e.g., `https://learnapp-backend.onrender.com`)

### Steps for Railway:

1. **Go to Railway.app**
2. **New Project** → **Deploy from GitHub repo**
3. **Select repository** and configure:
   - Root Directory: `/server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add environment variables** (same as above)
5. **Generate domain** and copy URL

---

## Frontend Deployment (Vercel)

### Steps:

1. **Go to Vercel.com** and sign in with GitHub

2. **Import your repository**
   - Click "Add New" → "Project"
   - Select your LearnApp repository
   - Root Directory: `client`

3. **Configure Project:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variable:**
   ```
   VITE_API_URL=<your-backend-url>
   VITE_SOCKET_URL=<your-backend-url>
   ```
   Example:
   ```
   VITE_API_URL=https://learnapp-backend.onrender.com
   VITE_SOCKET_URL=https://learnapp-backend.onrender.com
   ```

5. **Deploy** and copy the frontend URL

---

## Post-Deployment

### Update CORS in Backend

Add your Vercel frontend URL to the CORS whitelist in `server/server.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}
```

Then redeploy the backend.

### Test the Deployment

1. Visit your Vercel URL
2. Try logging in
3. Check browser console for any errors
4. Verify API calls are going to the correct backend URL

---

## MongoDB Atlas Setup

1. **Create free cluster** at https://cloud.mongodb.com
2. **Database Access** → Create a user with password
3. **Network Access** → Allow access from anywhere (0.0.0.0/0)
4. **Connect** → Get connection string
5. Replace `<password>` and `<dbname>` in the URI

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/learnapp?retryWrites=true&w=majority
```

---

## Troubleshooting

### Backend Issues:
- Check Render/Railway logs for errors
- Verify all environment variables are set
- Test MongoDB connection

### Frontend Issues:
- Check browser console for CORS errors
- Verify `VITE_API_URL` is set correctly
- Clear cache and rebuild

### Common Errors:
- **CORS errors**: Update backend CORS config
- **API 404**: Check VITE_API_URL includes protocol (https://)
- **MongoDB connection failed**: Check whitelist IPs in Atlas

---

## Quick Deploy Commands

### Commit and push changes:
```bash
git add -A
git commit -m "feat: Configure for deployment"
git push origin main
```

This will trigger automatic redeployment on both Render and Vercel if auto-deploy is enabled.
