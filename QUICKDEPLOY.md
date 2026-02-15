# Quick Deploy Script for ChatVibe

## Prerequisites Setup

### 1. MongoDB Atlas (Database)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Get connection string
5. Whitelist all IPs (0.0.0.0/0) for Render

### 2. GitHub (Already Done ✓)
- Repository: https://github.com/aadityaraj912739/ChatVibe

---

## Deploy Backend (Render.com)

### Option A: One-Click Deploy
1. Go to https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select repository: `aadityaraj912739/ChatVibe`
5. Fill in:
   ```
   Name: chatvibe-server
   Root Directory: server
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
6. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Any random secure string (e.g., `my-super-secret-jwt-key-2024`)
   - `CLIENT_URL`: Will update after Vercel deploy
   - `NODE_ENV`: production

7. Click "Create Web Service"
8. **Save your Render URL**: `https://chatvibe-server.onrender.com`

---

## Deploy Frontend (Vercel)

### Option A: Vercel Dashboard (Easiest)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import: `aadityaraj912739/ChatVibe`
5. Configure:
   - Framework: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (auto-detected)
6. Add Environment Variables:
   - `REACT_APP_API_URL`: Your Render URL (e.g., https://chatvibe-server.onrender.com)
   - `REACT_APP_SOCKET_URL`: Your Render URL (same as above)
7. Click "Deploy"
8. **Save your Vercel URL**: `https://chatvibe-xxxxx.vercel.app`

### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
cd "C:\Users\ar912\OneDrive\Desktop\PROJECT_RESUME\ChatVibe"
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? chatvibe
# - Which directory? client
# - Auto-detected settings? Yes

# Add environment variables
vercel env add REACT_APP_API_URL production
# Enter your Render URL when prompted

vercel env add REACT_APP_SOCKET_URL production
# Enter your Render URL when prompted

# Deploy to production
vercel --prod
```

---

## Final Step: Update Backend CORS

1. Go back to your Render dashboard
2. Open your `chatvibe-server` service  
3. Go to "Environment" tab
4. Update `CLIENT_URL` with your Vercel URL
5. Save changes (will auto-redeploy)

---

## Test Your Deployment

1. Open your Vercel URL
2. Register a new account
3. Open in incognito/another browser
4. Register another account
5. Test sending messages between accounts
6. Verify real-time message delivery

---

## Troubleshooting

### "Unable to connect to server"
- Check if Render service is running (may sleep after 15 min on free tier)
- Visit your Render URL directly: `https://chatvibe-server.onrender.com/api/health`
- Should see: `{"status":"ok","message":"ChatVibe server is running"}`

### "CORS error"
- Verify `CLIENT_URL` in Render matches your Vercel URL exactly
- No trailing slash in URLs
- Redeploy backend after changing environment variables

### "Database connection failed"
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Verify connection string is correct
- Check database user permissions

### WebSocket connection issues
- Ensure using HTTPS URLs (not HTTP) in production
- Check browser console for specific errors
- Verify Socket.io client and server versions match

---

## First-Time Wake Up

**Important**: Render free tier services sleep after 15 minutes of inactivity.
- First request may take 30-60 seconds to wake up
- Subsequent requests will be fast
- Consider upgrading to paid plan for production use

---

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatvibe
JWT_SECRET=your-secret-key-here
CLIENT_URL=https://chatvibe-xxxxx.vercel.app
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://chatvibe-server.onrender.com
REACT_APP_SOCKET_URL=https://chatvibe-server.onrender.com
```

---

## Done! 🎉

Your app is now live:
- Frontend: https://chatvibe-xxxxx.vercel.app
- Backend: https://chatvibe-server.onrender.com
- GitHub: https://github.com/aadityaraj912739/ChatVibe

Share your frontend URL with others to test!
