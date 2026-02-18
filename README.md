# ChatVibe 💬

A modern, real-time chat application built with the MERN stack and Socket.IO.

## Features ✨

- 🔐 User authentication (Register/Login) with JWT
- 💬 Real-time messaging with Socket.IO
- 👥 One-on-one private chats
- 🏠 Chat rooms/channels
- 📊 Online/offline status indicators
- ⌨️ Typing indicators
- ✅ Message read receipts
- 📜 Persistent message history
- 🔔 Unread message count
- 👤 User profiles with avatars
- 🔍 Search users
- 📱 Fully responsive design
- 🔊 Sound notifications
- ⏱️ Message timestamps
- 📥 Auto-scroll to latest messages

## Tech Stack 🛠️

**Frontend:**
- React.js
- Socket.IO Client
- Axios
- Tailwind CSS
- React Router

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- Bcrypt
- Cloudinary (Image uploads)

## Documentation 📚

- 📖 [Quick Start Guide](QUICKSTART.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md) - Deploy to Vercel & Render
- ☁️ [Cloudinary Setup](CLOUDINARY_SETUP.md) - Configure image uploads
- 👥 [Group Chat Guide](GROUP_CHAT_GUIDE.md)
- ✨ [Features Documentation](FEATURES.md)

## Project Structure 📁

```
ChatVibe/
├── client/          # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
├── server/          # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   └── package.json
└── README.md
```

## Installation & Setup 🚀

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=your_cloudinary_preset
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the React app:
```bash
npm start
```

## Usage 📖

1. Register a new account or login with existing credentials
2. Search for users to start a conversation
3. Join or create chat rooms
4. Send messages in real-time
5. See who's online and typing
6. Receive notifications for new messages

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Messages
- `GET /api/messages/:chatId` - Get messages for a chat
- `POST /api/messages` - Send a new message
- `PUT /api/messages/:id/read` - Mark message as read

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat by ID

## Socket Events 🔌

### Client → Server
- `join` - Join a chat room
- `sendMessage` - Send a message
- `typing` - User is typing
- `stopTyping` - User stopped typing

### Server → Client
- `message` - New message received
- `userOnline` - User came online
- `userOffline` - User went offline
- `typing` - Someone is typing
- `stopTyping` - Someone stopped typing
- `messageRead` - Message was read

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License.

## Author 👨‍💻

Built with ❤️ by ChatVibe Team
