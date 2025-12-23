# Vercel Deployment Guide

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create a Vercel account at https://vercel.com

## Deployment Steps

### 1. Backend Deployment (API)

1. Navigate to the Study directory:
   ```bash
   cd /home/sama/LearnApp/Study
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the backend:
   ```bash
   vercel --prod
   ```

4. Set environment variables in Vercel Dashboard:
   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Add the following variables:
     - `MONGODB_URI` - Your MongoDB connection string
     - `JWT_SECRET` - Your JWT secret key
     - `GEMINI_API_KEY` - Your Google Gemini API key
     - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
     - `FIREBASE_SERVICE_ACCOUNT` - Your Firebase service account JSON (optional)
     - `NODE_ENV` - Set to `production`

### 2. Frontend Deployment

1. Update the API URL in client/.env:
   ```bash
   cd client
   echo "VITE_API_URL=https://your-backend-url.vercel.app/api" > .env.production
   ```

2. Deploy the frontend:
   ```bash
   cd /home/sama/LearnApp/Study
   vercel --prod
   ```

### 3. Post-Deployment Configuration

1. **Update CORS in backend:**
   - Add your frontend URL to the CORS whitelist in `server/server.js`

2. **Update Firebase configuration:**
   - Add your Vercel domain to Firebase authorized domains

3. **Test the deployment:**
   - Visit your frontend URL
   - Test login functionality
   - Submit a task and verify it persists after refresh

## Troubleshooting

### Socket.IO Issues
- Vercel serverless functions don't support persistent WebSocket connections
- Consider using Vercel's Edge Functions or deploy Socket.IO separately on Railway/Render

### Environment Variables
- Make sure all environment variables are set in Vercel Dashboard
- Redeploy after adding new variables

### API Routes
- All API routes should start with `/api/`
- Frontend should use the full Vercel backend URL

## Alternative: Separate Deployments

### Backend on Railway/Render
1. Create a new project on Railway.app or Render.com
2. Connect your GitHub repository
3. Set environment variables
4. Deploy the `server` directory

### Frontend on Vercel
1. Deploy only the `client` directory
2. Set `VITE_API_URL` to your Railway/Render backend URL

## Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs

# List deployments
vercel list

# Remove deployment
vercel remove
```
