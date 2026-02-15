# Quick Start Guide

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- [Git](https://git-scm.com/)

## Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ChatVibe
```

### 2. Setup Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux

# Edit .env with your configuration
# Required: MONGODB_URI, JWT_SECRET
```

**Important:** Update your `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatvibe  # or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_key_min_32_chars_recommended
NODE_ENV=development
```

### 3. Setup Frontend

```bash
# Open new terminal
cd client

# Install dependencies
npm install

# Create .env file
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

The default client `.env` should work:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB

If using local MongoDB:
```bash
# Windows (if installed as service)
# MongoDB should start automatically

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

If using MongoDB Atlas, ensure your connection string is in `server/.env`

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: ...
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Browser will open automatically at `http://localhost:3000`

## First Use

1. **Register an Account**
   - Open `http://localhost:3000`
   - Click "Sign up"
   - Fill in username, email, and password
   - Click "Sign up"

2. **Create Another User** (for testing)
   - Open incognito/private window
   - Register second user
   - This allows you to test real-time messaging

3. **Start Chatting**
   - Click the search icon or "+" button
   - Search for the other user
   - Click to start chat
   - Send messages in real-time!

## Verify Installation

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"ok","message":"ChatVibe server is running"}`

### Check Database Connection
Look for this in server terminal:
```
MongoDB Connected: cluster0-shard...
```

### Check Socket Connection
Open browser console, you should see:
```
Socket connected: <socket-id>
```

## Common Issues

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed
- Verify MongoDB is running
- Check connection string in `.env`
- For Atlas: whitelist your IP address

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Ensure both servers are running
- Check URLs in client `.env`
- Verify CORS settings in `server/server.js`

## Next Steps

- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for architecture details
- Review API documentation in README.md
- Explore the codebase
- Start building your features!

## Need Help?

- Check the [README.md](./README.md) for detailed information
- Review [DEVELOPMENT.md](./DEVELOPMENT.md) for technical details
- Check server logs for errors
- Check browser console for frontend errors

## Development Tips

1. **Code Changes**
   - Backend: Nodemon auto-restarts on changes
   - Frontend: React hot-reload updates automatically

2. **Database Management**
   - Use MongoDB Compass for GUI
   - Connect to: `mongodb://localhost:27017`

3. **Testing Multiple Users**
   - Use multiple browser profiles
   - Or use different browsers
   - Or use incognito mode

4. **Debug Mode**
   - Backend logs are verbose in development
   - Use browser DevTools for frontend
   - Check Network tab for API calls
   - Check Console for Socket events

Enjoy building with ChatVibe! 🚀
