# ChatVibe Development Guide

## Architecture Overview

ChatVibe is built with a modern MERN stack architecture with real-time capabilities:

### Backend Architecture
- **Express.js** - RESTful API server
- **MongoDB** - Document database for persistence
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Token-based authentication

### Frontend Architecture
- **React** - Component-based UI
- **Context API** - State management
- **Socket.IO Client** - Real-time updates
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing

## Project Structure Explained

### Server Structure
```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── chatController.js     # Chat operations
│   ├── messageController.js  # Message operations
│   └── userController.js     # User operations
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema
│   ├── Chat.js              # Chat schema
│   └── Message.js           # Message schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── chatRoutes.js        # Chat endpoints
│   ├── messageRoutes.js     # Message endpoints
│   └── userRoutes.js        # User endpoints
├── socket/
│   └── socketHandler.js     # Socket.IO event handlers
└── server.js                # Entry point
```

### Client Structure
```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChatList.js       # List of chats
│   │   ├── ChatWindow.js     # Main chat interface
│   │   ├── MessageInput.js   # Message input field
│   │   ├── MessageList.js    # Message display
│   │   ├── PrivateRoute.js   # Route protection
│   │   ├── Sidebar.js        # Chat sidebar
│   │   └── UserSearch.js     # User search modal
│   ├── context/
│   │   ├── AuthContext.js    # Authentication state
│   │   └── SocketContext.js  # Socket connection state
│   ├── pages/
│   │   ├── Chat.js           # Chat page
│   │   ├── Login.js          # Login page
│   │   └── Register.js       # Register page
│   ├── services/
│   │   ├── api.js            # HTTP API client
│   │   └── socket.js         # Socket.IO client
│   ├── App.js                # Main app component
│   ├── index.js              # Entry point
│   └── index.css             # Global styles
└── package.json
```

## Key Features Implementation

### 1. Real-Time Messaging
Messages are sent through Socket.IO for instant delivery:
- Client emits `sendMessage` event
- Server broadcasts to chat participants
- Clients receive and display message immediately

### 2. Online/Offline Status
- Socket connection updates user's `isOnline` status
- Disconnection triggers offline status
- Status broadcast to all connected clients

### 3. Typing Indicators
- Input changes emit `typing` event
- Timeout clears typing status after 1 second
- Other participants see typing notification

### 4. Read Receipts
- Messages include `readBy` array
- Socket event marks messages as read
- Double checkmark shows when message is read

### 5. Unread Count
- Chat model tracks unread per user
- Incremented on new message
- Decremented when message read

## API Endpoints

### Authentication
```
POST   /api/auth/register  - Register new user
POST   /api/auth/login     - Login user
GET    /api/auth/me        - Get current user
POST   /api/auth/logout    - Logout user
```

### Users
```
GET    /api/users          - Get all users (search)
GET    /api/users/:id      - Get user by ID
PUT    /api/users/:id      - Update user profile
```

### Chats
```
POST   /api/chats          - Create/get one-on-one chat
GET    /api/chats          - Get user's chats
GET    /api/chats/:id      - Get chat by ID
POST   /api/chats/group    - Create group chat
```

### Messages
```
GET    /api/messages/:chatId           - Get messages
POST   /api/messages                   - Send message
PUT    /api/messages/:id/read          - Mark message as read
PUT    /api/messages/chat/:chatId/read - Mark all in chat as read
```

## Socket.IO Events

### Client → Server
- `joinChats` - Join multiple chat rooms
- `joinChat` - Join single chat room
- `leaveChat` - Leave chat room
- `sendMessage` - Send new message
- `typing` - User is typing
- `stopTyping` - User stopped typing
- `messageRead` - Mark message as read
- `markChatAsRead` - Mark all messages as read

### Server → Client
- `message` - New message received
- `userOnline` - User came online
- `userOffline` - User went offline
- `typing` - Someone is typing
- `stopTyping` - Someone stopped typing
- `messageRead` - Message was read
- `chatUpdated` - Chat metadata updated
- `chatRead` - All messages marked as read

## State Management

### AuthContext
Manages user authentication state:
- `user` - Current user data
- `token` - JWT token
- `login()` - Login function
- `register()` - Register function
- `logout()` - Logout function
- `updateUser()` - Update user data
- `isAuthenticated` - Auth status

### SocketContext
Manages Socket.IO connection:
- `socket` - Socket instance
- `socketService` - Socket service methods
- `onlineUsers` - Array of online user IDs
- `isUserOnline()` - Check if user is online
- `typingUsers` - Object of typing users by chat
- `getTypingUsers()` - Get typing users for chat

## Security

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for stateless auth
- Token expiration: 30 days
- Tokens stored in localStorage

### Authorization
- Middleware verifies JWT on protected routes
- User ID from token validates ownership
- Socket.IO authenticated via token
- Participants verified for chat access

## Performance Optimizations

1. **Message Pagination**
   - Load 50 messages at a time
   - Implement infinite scroll for history

2. **Socket Room Management**
   - Users join only their chat rooms
   - Targeted message delivery

3. **Indexes**
   - MongoDB indexes on frequently queried fields
   - Chat participants index
   - Message chat + createdAt compound index

4. **Debouncing**
   - User search debounced (300ms)
   - Typing indicator timeout (1000ms)

## Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## Deployment

### Backend Deployment (Heroku example)
```bash
cd server
heroku create chatvibe-api
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

### Frontend Deployment (Vercel example)
```bash
cd client
vercel --prod
```

### Environment Variables

**Server (.env)**
```
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret_key
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.com
```

**Client (.env)**
```
REACT_APP_API_URL=https://your-api-url.com
REACT_APP_SOCKET_URL=https://your-api-url.com
```

## Future Enhancements

1. **File Sharing**
   - Image upload and preview
   - File attachments
   - Media gallery

2. **Voice/Video Calls**
   - WebRTC integration
   - One-on-one calls
   - Group calls

3. **Message Features**
   - Message editing
   - Message deletion
   - Reply to message
   - Message reactions
   - Message forwarding

4. **Chat Features**
   - Pin important chats
   - Archive chats
   - Mute notifications
   - Chat themes
   - Custom backgrounds

5. **Group Chat Enhancements**
   - Add/remove members
   - Admin controls
   - Group settings
   - Member roles

6. **Notifications**
   - Desktop notifications
   - Email notifications
   - Push notifications (PWA)

7. **Search**
   - Search messages
   - Search media
   - Advanced filters

8. **User Presence**
   - Last seen time
   - Custom status messages
   - Do not disturb mode

## Troubleshooting

### Socket Connection Issues
- Check CORS settings
- Verify token is being sent
- Check firewall/proxy settings

### Messages Not Sending
- Verify socket connection
- Check authentication
- Review server logs

### Database Issues
- Verify MongoDB connection string
- Check network access in MongoDB Atlas
- Review indexes

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License

MIT License - see LICENSE file for details
