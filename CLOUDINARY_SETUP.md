# Cloudinary Setup Guide

## 🔐 Important Security Note

**NEVER push your .env file to GitHub!** Your credentials are sensitive and must remain private.

Your `.gitignore` already blocks the `.env` file ✅

## 📋 What You Need to Do

### 1. **GitHub Repository** 
❌ **DO NOT** push `.env` file  
✅ **DO** push code changes without sensitive data

### 2. **Render Deployment (Backend)**

When deploying on Render, add these environment variables in the Render Dashboard:

```
CLOUDINARY_CLOUD_NAME=druby0m5y
CLOUDINARY_API_KEY=834384727736755
CLOUDINARY_API_SECRET=Yc_ga3Yc0SS9nfG17myNiMVEzn8
CLOUDINARY_UPLOAD_PRESET=Cloudinary_Setup
```

**Steps:**
1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `chatvibe-server` service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add each Cloudinary variable one by one
6. Click **"Save Changes"**
7. Render will automatically redeploy

### 3. **Vercel Deployment (Frontend)** - If Needed

If your frontend also needs Cloudinary access:

```
REACT_APP_CLOUDINARY_CLOUD_NAME=druby0m5y
REACT_APP_CLOUDINARY_UPLOAD_PRESET=Cloudinary_Setup
```

**Note:** Frontend usually doesn't need API_KEY and API_SECRET (those should stay on backend only!)

**Steps:**
1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add variables
5. Redeploy

## 📤 Complete Deployment Checklist

### For Render (Backend):
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `MONGODB_URI=mongodb+srv://ar912739_db_user:fDxL4EmBHCK3j3xb@cluster0.zlhn4sd.mongodb.net/chatvibe?retryWrites=true&w=majority&appName=Cluster0`
- [ ] `JWT_SECRET=ChatVibe_2026_SecureJWT_ar912739_fDxL4EmBHCK3j3xb_SuperSecret`
- [ ] `CLIENT_URL=https://your-frontend-url.vercel.app`
- [ ] `CLOUDINARY_CLOUD_NAME=druby0m5y`
- [ ] `CLOUDINARY_API_KEY=834384727736755`
- [ ] `CLOUDINARY_API_SECRET=Yc_ga3Yc0SS9nfG17myNiMVEzn8`
- [ ] `CLOUDINARY_UPLOAD_PRESET=Cloudinary_Setup`

### For Vercel (Frontend):
- [ ] `REACT_APP_API_URL=https://your-backend.onrender.com`
- [ ] `REACT_APP_SOCKET_URL=https://your-backend.onrender.com`

## 🚀 Git Commands to Update Repository

```bash
# Stage all changes
git add .

# Commit changes
git commit -m "Updated deployment configuration with Cloudinary support"

# Push to GitHub
git push origin master
```

## ✅ Verification

After deployment:
1. Check Render logs to ensure no errors
2. Test image upload functionality
3. Verify images are stored in your Cloudinary dashboard

## 📞 Cloudinary Dashboard

Check your uploads at: https://console.cloudinary.com/console/media_library

---

**Summary:**
- ❌ `.env` file GitHub पर push नहीं करना
- ✅ Render dashboard में manually सभी environment variables add करने होंगे
- ✅ Code changes को freely push कर सकते हो
