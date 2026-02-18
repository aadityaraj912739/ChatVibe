# Deployment Guide for ChatVibe

## Architecture
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render.com (supports WebSocket/Socket.io)

## Prerequisites
1. GitHub account
2. Vercel account (https://vercel.com)
3. Render account (https://render.com)
4. MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

---

## Step 1: Deploy Backend to Render

### 1.1 Create MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/chatvibe`)

### 1.2 Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `aadityaraj912739/ChatVibe`
4. Configure:
   - **Name**: `chatvibe-server`
   - **Region**: Choose closest to your location
   - **Branch**: `master`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLOUDINARY_UPLOAD_PRESET=your_cloudinary_preset
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://chatvibe-server.onrender.com`

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `aadityaraj912739/ChatVibe`
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://chatvibe-server.onrender.com
   REACT_APP_SOCKET_URL=https://chatvibe-server.onrender.com
   ```

6. Click **"Deploy"**
7. Wait for deployment (2-5 minutes)
8. Your app will be live at: `https://chatvibe.vercel.app`

### 2.3 Update Backend CLIENT_URL
Go back to Render and update the `CLIENT_URL` environment variable with your Vercel URL:
```
CLIENT_URL=https://chatvibe.vercel.app
```

---

## Step 3: Configure Environment Files

### Backend (.env)
Create `server/.env` locally:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=https://chatvibe.vercel.app

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=your_cloudinary_preset
```

### Frontend (.env)
Create `client/.env` locally:
```env
REACT_APP_API_URL=https://chatvibe-server.onrender.com
REACT_APP_SOCKET_URL=https://chatvibe-server.onrender.com
```

---

## Quick Deploy Commands

### Deploy Frontend (Vercel CLI)
```bash
cd client
vercel --prod
```

### Redeploy Backend (Push to GitHub)
```bash
git add .
git commit -m "Update configuration"
git push origin master
```
Render will automatically redeploy on push.

---

## Testing Your Deployment

1. Visit your Vercel URL: `https://chatvibe.vercel.app`
2. Register a new account
3. Test real-time messaging
4. Open in multiple browsers to test live chat

---

## Troubleshooting

### Frontend can't connect to backend
- Check CORS settings in `server/server.js`
- Verify environment variables in Vercel
- Check browser console for errors

### WebSocket connection failed
- Ensure Render service is running (not sleeping)
- Check Socket.io configuration
- Verify SOCKET_URL environment variable

### Database connection error
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for Render)
- Ensure database user has read/write permissions

---

## Important Notes

1. **Render Free Tier**: Service may sleep after 15 minutes of inactivity
2. **MongoDB Free Tier**: 512MB storage limit
3. **Vercel Free Tier**: 
   - 100GB bandwidth/month
   - Unlimited projects
   - Automatic HTTPS

---

## Alternative Backend Hosting Options

If Render doesn't work, consider:
- **Railway.app** (supports WebSockets)
- **Fly.io** (supports WebSockets)
- **Heroku** ($5/month, no free tier)
- **AWS EC2** or **DigitalOcean** (VPS options)

---

## Monitoring

- **Vercel**: Check deployment logs in dashboard
- **Render**: View logs in service dashboard
- **MongoDB**: Monitor usage in Atlas dashboard
