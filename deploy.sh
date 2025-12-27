#!/bin/bash

# Deployment Helper Script for LearnApp
# This script provides step-by-step guidance for deploying to Render and Vercel

echo "🚀 LearnApp Deployment Helper"
echo "=============================="
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes!"
    echo ""
    read -p "Do you want to commit and push them now? (y/n): " commit_choice
    if [[ $commit_choice == "y" ]]; then
        read -p "Enter commit message: " commit_msg
        git add -A
        git commit -m "$commit_msg"
        git push origin main
        echo "✅ Changes committed and pushed!"
    else
        echo "⚠️  Proceeding without committing changes..."
    fi
else
    echo "✅ Git repository is clean"
    git push origin main 2>/dev/null || echo "Already up to date with remote"
fi

echo ""
echo "📦 DEPLOYMENT CHECKLIST"
echo "======================="
echo ""

# Backend Deployment
echo "🔧 BACKEND (Render/Railway):"
echo "----------------------------"
echo "1. ✅ Code is pushed to GitHub"
echo ""
echo "2. ⏳ Deploy to Render:"
echo "   → Go to: https://render.com/dashboard"
echo "   → Click: New + → Web Service"
echo "   → Select repository: LearnApp-Fullstack-"
echo "   → Root Directory: server"
echo "   → Environment: Node"
echo "   → Build Command: npm install"
echo "   → Start Command: npm start"
echo ""
read -p "Press Enter when backend service is created on Render..."

echo ""
echo "3. ⏳ Set Environment Variables on Render:"
echo "   Add these in the Render dashboard:"
echo ""
echo "   NODE_ENV=production"
echo "   PORT=10000"
read -p "   MONGODB_URI=? (Press Enter to continue): "
read -p "   JWT_SECRET=? (Press Enter to continue): "
read -p "   GEMINI_API_KEY=? (Press Enter to continue): "
read -p "   FRONTEND_URL=? (You'll get this from Vercel, add it later): "
echo ""
read -p "Press Enter when environment variables are set..."

echo ""
echo "4. ⏳ Deploy and get backend URL..."
read -p "Enter your Render backend URL (e.g., https://learnapp-backend.onrender.com): " backend_url

echo ""
echo "✅ Backend URL: $backend_url"
echo ""

# Frontend Deployment
echo "🎨 FRONTEND (Vercel):"
echo "---------------------"
echo "1. ⏳ Deploy to Vercel:"
echo "   → Go to: https://vercel.com/new"
echo "   → Import Git Repository: LearnApp-Fullstack-"
echo "   → Root Directory: client"
echo "   → Framework Preset: Vite"
echo "   → Build Command: npm run build"
echo "   → Output Directory: dist"
echo ""
read -p "Press Enter when project is imported on Vercel..."

echo ""
echo "2. ⏳ Set Environment Variables on Vercel:"
echo "   Add these in Project Settings → Environment Variables:"
echo ""
echo "   VITE_API_URL=$backend_url"
echo "   VITE_SOCKET_URL=$backend_url"
echo ""
read -p "Press Enter when environment variables are set..."

echo ""
echo "3. ⏳ Deploy and get frontend URL..."
read -p "Enter your Vercel frontend URL (e.g., https://learnapp.vercel.app): " frontend_url

echo ""
echo "✅ Frontend URL: $frontend_url"
echo ""

# Final steps
echo "🔄 FINAL STEPS:"
echo "---------------"
echo "1. ⏳ Update FRONTEND_URL on Render:"
echo "   Go back to Render → Your service → Environment"
echo "   Add/Update: FRONTEND_URL=$frontend_url"
echo ""
echo "2. ⏳ Redeploy backend on Render (to apply CORS update)"
echo ""
read -p "Press Enter when backend is redeployed..."

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "📝 Your deployed URLs:"
echo "   Frontend: $frontend_url"
echo "   Backend:  $backend_url"
echo ""
echo "🧪 Testing your deployment:"
echo "   1. Visit: $frontend_url"
echo "   2. Try logging in"
echo "   3. Check browser console for errors"
echo "   4. Verify API calls are working"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Happy coding!"
