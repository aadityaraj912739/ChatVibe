# ChatVibe - Installation & Troubleshooting

## System Requirements

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MongoDB**: v4.4 or higher (local) OR MongoDB Atlas account
- **RAM**: Minimum 4GB
- **Disk Space**: 500MB for dependencies

## Detailed Installation Guide

### Step 1: Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v14+

# Check npm version
npm --version   # Should be v6+

# Check MongoDB (if local)
mongod --version
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

**Dependencies installed:**
- express: Web framework
- mongoose: MongoDB ODM
- socket.io: Real-time communication
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- cors: Cross-origin resource sharing
- dotenv: Environment variables
- validator: Input validation

### Step 3: Install Frontend Dependencies

```bash
cd client
npm install
```

**Dependencies installed:**
- react: UI library
- react-router-dom: Routing
- socket.io-client: Socket connection
- axios: HTTP client
- tailwindcss: CSS framework
- @heroicons/react: Icon library
- date-fns: Date formatting

### Step 4: Configure Environment Variables

#### Server Configuration

Create `server/.env`:
```env
# Server Port
PORT=5000

# MongoDB Configuration
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/chatvibe

# Option 2: MongoDB Atlas (replace with your connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatvibe?retryWrites=true&w=majority

# JWT Secret (IMPORTANT: Use a strong secret in production)
JWT_SECRET=chatvibe_super_secret_key_change_this_in_production_min_32_chars

# Environment
NODE_ENV=development

# Client URL (for CORS in production)
# CLIENT_URL=https://your-frontend-domain.com
```

#### Client Configuration

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## MongoDB Setup

### Option 1: Local MongoDB

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Install and run as service
# Or manually start:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**Mac (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your password
7. Add to `server/.env` as `MONGODB_URI`

**Important:** Whitelist your IP address in Atlas Network Access

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Expected output:
```
Server running on port 5000
Environment: development
MongoDB Connected: localhost/chatvibe
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Expected output:
```
Compiled successfully!

You can now view chatvibe-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

### Production Mode

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
# Serve the build folder with a static server
```

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error:** `MongooseError: Failed to connect to MongoDB`

**Solutions:**
```bash
# Check if MongoDB is running
# Windows
tasklist | findstr mongod

# Mac/Linux
ps aux | grep mongod

# Start MongoDB
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Verify connection string in .env
# Check MONGODB_URI format
```

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux - Kill process on port
lsof -ti:5000 | xargs kill -9

# Or change port in server/.env
PORT=5001
```

### Issue 3: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. Verify both servers are running
2. Check URLs in `client/.env`
3. Ensure CORS is configured in `server/server.js`
4. Try clearing browser cache

### Issue 4: Socket Connection Failed

**Error:** `WebSocket connection failed` or `Socket connection error`

**Solutions:**
1. Verify backend is running
2. Check `REACT_APP_SOCKET_URL` in `client/.env`
3. Check browser console for errors
4. Verify token is being sent
5. Try different browser

### Issue 5: JWT Token Invalid

**Error:** `Not authorized, token failed`

**Solutions:**
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check JWT_SECRET in `server/.env`
4. Verify token expiration (30 days default)

### Issue 6: Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solutions:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci
```

### Issue 7: React Build Fails

**Error:** Various build errors

**Solutions:**
```bash
# Clear cache
rm -rf node_modules .cache build
npm install
npm start

# Or
npm run build
```

## Testing the Application

### Test Checklist

1. **Registration:**
   - [ ] Create new account
   - [ ] Verify input validation
   - [ ] Check success redirect

2. **Login:**
   - [ ] Login with credentials
   - [ ] Test wrong password
   - [ ] Verify token storage

3. **Search Users:**
   - [ ] Search by username
   - [ ] Search by email
   - [ ] Test no results

4. **Create Chat:**
   - [ ] Start new conversation
   - [ ] Verify chat appears in list

5. **Send Messages:**
   - [ ] Send text message
   - [ ] Verify real-time delivery
   - [ ] Check message persistence

6. **Real-Time Features:**
   - [ ] Online status updates
   - [ ] Typing indicators
   - [ ] Read receipts

7. **Multiple Users:**
   - [ ] Open in two browsers
   - [ ] Chat between users
   - [ ] Test all features

## Performance Tips

1. **Database Indexes:**
   - Already configured in models
   - Check with: `db.collection.getIndexes()`

2. **Memory Usage:**
   - Monitor with: `node --max-old-space-size=4096 server.js`

3. **Socket Connections:**
   - Limit concurrent connections
   - Implement connection pooling

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable CORS only for trusted origins
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated

## Getting Help

1. **Check Logs:**
   - Server: Terminal running backend
   - Client: Browser Developer Console
   - MongoDB: MongoDB logs

2. **Debug Mode:**
   ```bash
   # Backend with debug
   DEBUG=* npm run dev
   
   # Check MongoDB connection
   mongo --eval "db.adminCommand('ping')"
   ```

3. **Common Commands:**
   ```bash
   # Check server health
   curl http://localhost:5000/api/health
   
   # Test MongoDB connection
   mongo chatvibe --eval "db.stats()"
   
   # View running processes
   npm list -g --depth=0
   ```

## Additional Resources

- [Node.js Docs](https://nodejs.org/docs)
- [React Docs](https://react.dev)
- [MongoDB Docs](https://docs.mongodb.com)
- [Socket.IO Docs](https://socket.io/docs)
- [Express Docs](https://expressjs.com)

## Support

For issues not covered here:
1. Check [DEVELOPMENT.md](./DEVELOPMENT.md)
2. Review [README.md](./README.md)
3. Search error messages online
4. Check server/browser console logs

---

**Remember:** Most issues are related to:
- Environment variables not set correctly
- MongoDB not running
- Port conflicts
- CORS misconfiguration
- Missing dependencies

Double-check these first! 🔍
