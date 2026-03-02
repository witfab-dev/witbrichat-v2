📱 WitbriChat - A Modern Social Messaging Platform
https://via.placeholder.com/200x200/0095f6/ffffff?text=WitbriChat

🌟 Overview
WitbriChat is a full-stack social messaging platform inspired by Instagram and WhatsApp, built with modern web technologies. It combines real-time messaging, social media features, and a beautiful, responsive UI.

✨ Key Features
🔐 Authentication System - Secure login/register with JWT

💬 Real-time Messaging - Instant chat with Socket.io

📸 Social Posts - Create, like, and comment on posts

👥 Group Chats - Multi-user conversations

📊 Polls - Create and vote in polls

🎤 Voice Messages - Record and send voice notes

📁 File Sharing - Share documents and images

🌓 Dark/Light Mode - Theme switching with persistence

📱 Responsive Design - Mobile-first approach

🔔 Notifications - Real-time alerts and desktop notifications

👤 User Profiles - Customizable bios and avatars

🔍 Search - Find users and conversations

⌨️ Keyboard Shortcuts - Power user navigation

🚀 Tech Stack
Frontend
React 18 - UI library

React Router - Navigation

Socket.io-client - Real-time communication

Axios - HTTP client

React Icons - Icon library

CSS3 - Styling with CSS variables for theming

Backend
Node.js - Runtime environment

Express - Web framework

Socket.io - WebSocket server

MySQL - Database

JWT - Authentication

Bcrypt - Password hashing

Multer - File uploads

📋 Prerequisites
Node.js (v14 or higher)

MySQL (v5.7 or higher)

npm or yarn package manager

Modern web browser (Chrome, Firefox, Safari, Edge)

🛠️ Installation
1. Clone the Repository
bash
git clone https://github.com/yourusername/witbrichat.git
cd witbrichat
2. Database Setup
Create a MySQL database:

sql
CREATE DATABASE witbri_db;
USE witbri_db;
The tables will be created automatically when you start the server.

3. Backend Setup
bash
cd backend
npm install
Create a .env file in the backend directory:

env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=witbri_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=3001
Start the backend server:

bash
npm start
# or for development with auto-reload
npm run dev
4. Frontend Setup
Open a new terminal:

bash
cd frontend
npm install
npm run dev
The frontend will start at http://localhost:5173

🎯 Usage
Test Credentials
After starting the app, you can use these test credentials:

Username: testuser

Password: password123

Or register a new account.

Keyboard Shortcuts
Shortcut	Action
Ctrl/Cmd + K	Open search
Ctrl/Cmd + N	Create new post
Ctrl/Cmd + M	Go to messages
Ctrl/Cmd + P	Go to profile
Escape	Close modals
Features Guide
💬 Messaging
Click on a user to start chatting

Send text messages, emojis, files, and voice notes

See typing indicators and online status

Create group chats with multiple users

Create polls in conversations

📸 Posts
Create posts with images and captions

Like and comment on posts

View posts in feed or profile

Double-click images to like

👤 Profile
Edit your bio and profile picture

View your posts in a grid

See follower/following counts

Switch between posts and saved tabs

🔔 Notifications
Get notified of likes, comments, and messages

Desktop notifications when app is in background

Filter notifications by type

Mark notifications as read

📁 Project Structure
text
witbrichat/
├── backend/
│   ├── server.js                 # Main server file
│   ├── .env                      # Environment variables
│   └── uploads/                   # File uploads directory
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx           # Authentication component
│   │   │   ├── Navigation.jsx      # Sidebar navigation
│   │   │   ├── ChatLayout.jsx      # Main chat layout
│   │   │   ├── ChatWindow.jsx      # Chat interface
│   │   │   ├── HomeFeed.jsx        # Posts feed
│   │   │   ├── Profile.jsx         # User profile
│   │   │   ├── CreatePost.jsx      # Post creation modal
│   │   │   ├── Search.jsx          # Search panel
│   │   │   ├── Notifications.jsx   # Notifications panel
│   │   │   ├── Stories.jsx         # Stories component
│   │   │   ├── Explore.jsx         # Explore page
│   │   │   ├── GroupChat.jsx       # Group chat creation
│   │   │   ├── CreatePoll.jsx      # Poll creation
│   │   │   ├── VoiceMessage.jsx    # Voice message recorder
│   │   │   └── ThemeToggle.jsx     # Dark/light mode toggle
│   │   │
│   │   ├── config/
│   │   │   └── constants.js        # App constants
│   │   │
│   │   ├── utils/
│   │   │   └── toast.js            # Toast notifications
│   │   │
│   │   ├── App.jsx                 # Main app component
│   │   ├── App.css                  # Global styles
│   │   └── main.jsx                 # Entry point
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
🔧 Configuration
Frontend Constants (frontend/src/config/constants.js)
javascript
export const API_BASE_URL = "http://localhost:3001";
export const SOCKET_URL = "http://127.0.0.1:3001";
export const APP_TITLE = "WitbriChat";
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const POLLING_INTERVAL = 30000; // 30 seconds
Backend Environment Variables
Variable	Description	Default
DB_HOST	Database host	localhost
DB_USER	Database user	root
DB_PASSWORD	Database password	(empty)
DB_NAME	Database name	witbri_db
JWT_SECRET	JWT signing secret	(required)
PORT	Server port	3001
🚦 API Endpoints
Authentication
POST /register - Register new user

POST /login - Login user

Users
GET /users - Get all users (requires token)

GET /users/profile - Get current user profile

PUT /users/profile - Update profile

Posts
GET /api/posts - Get all posts

POST /api/posts - Create new post (requires token)

GET /api/posts/user/:username - Get user's posts

Messages
GET /messages/:room - Get messages for room

GET /messages/last - Get last messages (requires token)

🧪 Testing
Manual Testing
Authentication Flow

Register a new account

Login with credentials

Logout and login again

Messaging

Start a conversation with another user

Send text messages

Send files and voice messages

Create a group chat

Create and vote in polls

Posts

Create a post with image

Like your own post

Comment on posts

View posts in feed

Profile

Update bio

Change profile picture

View your posts

Logout

Performance Testing
Test with multiple concurrent users

Monitor database query performance

Check WebSocket connection stability

Verify offline functionality

🐛 Troubleshooting
Common Issues
1. Database Connection Error
text
Error: connect ECONNREFUSED 127.0.0.1:3306
Ensure MySQL is running: mysql.server start (Mac) or start MySQL service (Windows)

Check credentials in .env file

Create database: CREATE DATABASE witbri_db;

2. Socket Connection Failed
text
WebSocket connection to 'ws://127.0.0.1:3001/' failed
Ensure backend server is running on port 3001

Check CORS configuration

Verify network connectivity

3. JWT Token Error
text
Invalid or expired token
Clear localStorage: localStorage.removeItem('witbriUser')

Login again

Check JWT_SECRET in .env matches

4. Image Upload Failed
text
Request entity too large
Adjust limit in express.json() middleware

Check MAX_FILE_SIZE in constants

Ensure image is valid Base64

Debug Mode
Add to .env:

env
DEBUG=true
Then restart the server for verbose logging.

📈 Performance Optimizations
Lazy Loading - Components load on demand

Image Optimization - Base64 compression

Database Indexing - Optimized queries

Socket Connection Pooling - Efficient connections

React Memo - Prevent unnecessary re-renders

Debounced Search - Reduce API calls

Request Caching - Cache frequent requests

Compression - Gzip for responses

🔒 Security Features
JWT Authentication - Secure token-based auth

Password Hashing - bcrypt with salt rounds

Input Validation - Sanitize user input

CORS Protection - Restrict API access

SQL Injection Prevention - Parameterized queries

XSS Protection - Escape user content

Rate Limiting - Prevent abuse

Secure Headers - Helmet.js integration

🎨 Customization
Theming
Modify CSS variables in App.css:

css
:root {
  --primary-color: #0095f6;
  --secondary-color: #8e8e8e;
  --background-color: #fafafa;
  --text-color: #262626;
  --border-color: #dbdbdb;
}
Adding New Features
Create component in src/components/

Add to App.jsx with proper state management

Update navigation if needed

Add backend routes if required

Update database schema if needed

📦 Deployment
Production Build
bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
Docker Deployment
Create a Dockerfile:

dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
Environment Variables for Production
env
NODE_ENV=production
DB_HOST=production-db-host
DB_USER=prod_user
DB_PASSWORD=secure_password
DB_NAME=witbri_prod
JWT_SECRET=very_secure_long_random_string
PORT=3001
🤝 Contributing
Fork the repository

Create a feature branch: git checkout -b feature/amazing-feature

Commit changes: git commit -m 'Add amazing feature'

Push to branch: git push origin feature/amazing-feature

Open a Pull Request

Coding Standards
Use functional components with hooks

Follow existing code style

Add comments for complex logic

Write meaningful commit messages

Test before submitting

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Inspired by Instagram and WhatsApp

React Icons for beautiful icons

Socket.io for real-time capabilities

MySQL community for database support

All contributors and testers

📧 Contact
Project Link: https://github.com/witfab-dev/witbrichat-v2

Email: your.email@example.com

Twitter: @yourhandle

🚀 Roadmap
Version 2.0 (Planned)
End-to-end encryption

Video calls

Stories (24h disappearing content)

Reels (short videos)

Advanced search with filters

Message reactions (emojis)

Read receipts

Online/offline status

Typing indicators

Message search within chat

Push notifications (PWA)

Mobile app (React Native)

Version 1.0 (Current)
✅ Authentication system

✅ Real-time messaging

✅ Posts feed

✅ User profiles

✅ Group chats

✅ Voice messages

✅ File sharing

✅ Dark/light mode

✅ Notifications

✅ Search functionality

Made with ❤️ by Your Team
