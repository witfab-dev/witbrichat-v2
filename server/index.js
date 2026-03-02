import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// --- 1. MIDDLEWARES ---
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  credentials: true
}));

// Increase limits for Base64 Image Uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// --- 2. DATABASE POOL ---
let db; // Declare db variable

async function initializeDatabase() {
  try {
    // Try to connect to MySQL
    db = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "witbri_db",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully!");
    connection.release();
    
    // Create tables if they don't exist
    await createTables();
    
    // Add test user if none exists
    await addTestUser();
    
    console.log("✅ Database tables initialized!");
    return true;
    
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    console.log("⚠️  Using in-memory storage for development...");
    console.log("⚠️  To fix MySQL:");
    console.log("   1. Install/start MySQL");
    console.log("   2. Create database: CREATE DATABASE witbri_db;");
    console.log("   3. Check .env file credentials");
    
    // Create mock database for development
    db = createMockDatabase();
    return false;
  }
}

async function createTables() {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar TEXT,
        bio TEXT,
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Posts table (with Base64 support)
    await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        content TEXT,
        image_url LONGTEXT,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        room_name VARCHAR(255) NOT NULL,
        sender_name VARCHAR(50) NOT NULL,
        message_text TEXT NOT NULL,
        message_type ENUM('text', 'image', 'file', 'voice') DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (room_name)
      )
    `);
  } catch (error) {
    console.error("Table creation error:", error.message);
  }
}

async function addTestUser() {
  try {
    const [users] = await db.query("SELECT COUNT(*) as count FROM users");
    if (users[0].count === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        ["testuser", "test@example.com", hashedPassword]
      );
      console.log("✅ Created test user: testuser / password123");
    }
  } catch (error) {
    console.error("Test user creation error:", error.message);
  }
}

function createMockDatabase() {
  // Create test users for development
  const testUsers = [
    {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMye/.Z5c9v8WU5.8.6XpXc7b3JhC4JQq6y", // password123
      avatar: null,
      bio: "Test user for development",
      full_name: "Test User"
    },
    {
      id: 2,
      username: "john",
      email: "john@example.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMye/.Z5c9v8WU5.8.6XpXc7b3JhC4JQq6y",
      avatar: null,
      bio: "Hello, I'm John!",
      full_name: "John Doe"
    },
    {
      id: 3,
      username: "jane",
      email: "jane@example.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMye/.Z5c9v8WU5.8.6XpXc7b3JhC4JQq6y",
      avatar: null,
      bio: "Frontend developer",
      full_name: "Jane Smith"
    }
  ];

  const mockPosts = [];
  const mockMessages = [];
  
  return {
    query: async (sql, params = []) => {
      console.log(`📝 Mock DB: ${sql.substring(0, 80)}...`);
      
      // Handle user queries
      if (sql.includes("SELECT * FROM users WHERE username = ?")) {
        const username = params[0];
        const user = testUsers.find(u => u.username === username);
        return user ? [[user]] : [[]];
      }
      
      if (sql.includes("SELECT COUNT(*) as count FROM users")) {
        return [[{ count: testUsers.length }]];
      }
      
      if (sql.includes("SELECT id FROM users WHERE username = ?")) {
        const username = params[0];
        const user = testUsers.find(u => u.username === username);
        return user ? [[{ id: user.id }]] : [[]];
      }
      
      if (sql.includes("INSERT INTO users")) {
        const newId = testUsers.length + 1;
        const newUser = {
          id: newId,
          username: params[0],
          password: params[1],
          email: params[2] || null,
          avatar: null,
          bio: null,
          full_name: null
        };
        testUsers.push(newUser);
        return [{ insertId: newId }];
      }
      
      if (sql.includes("SELECT id, username, avatar, bio FROM users WHERE id !=")) {
        const currentUserId = params[0];
        const otherUsers = testUsers.filter(u => u.id !== currentUserId)
          .map(u => ({
            id: u.id,
            username: u.username,
            avatar: u.avatar,
            bio: u.bio
          }));
        return [otherUsers];
      }
      
      if (sql.includes("SELECT id, username, email, avatar, bio, full_name FROM users WHERE id = ?")) {
        const userId = params[0];
        const user = testUsers.find(u => u.id === userId);
        return user ? [[user]] : [[]];
      }
      
      // Handle post queries
      if (sql.includes("INSERT INTO posts")) {
        const newId = mockPosts.length + 1;
        const newPost = {
          id: newId,
          user_id: params[0],
          content: params[1] || "",
          image_url: params[2] || "",
          likes: 0,
          created_at: new Date()
        };
        mockPosts.push(newPost);
        return [{ insertId: newId }];
      }
      
      if (sql.includes("SELECT posts.*, users.username, users.avatar FROM posts")) {
        const postsWithUsers = mockPosts.map(post => ({
          ...post,
          username: testUsers.find(u => u.id === post.user_id)?.username || "unknown",
          avatar: testUsers.find(u => u.id === post.user_id)?.avatar || null,
          created_at: post.created_at
        }));
        return [postsWithUsers];
      }
      
      // Handle message queries
      if (sql.includes("INSERT INTO messages")) {
        const newId = mockMessages.length + 1;
        const newMessage = {
          id: newId,
          room_name: params[0],
          sender_name: params[1],
          message_text: params[2],
          created_at: new Date()
        };
        mockMessages.push(newMessage);
        return [{ insertId: newId }];
      }
      
      if (sql.includes("SELECT sender_name as user, message_text as message, created_at as time FROM messages")) {
        const room = params[0];
        const roomMessages = mockMessages
          .filter(m => m.room_name === room)
          .map(m => ({
            user: m.sender_name,
            message: m.message_text,
            time: m.created_at
          }));
        return [roomMessages];
      }
      
      // Default empty result
      return [[]];
    },
    
    getConnection: async () => {
      return {
        release: () => {}
      };
    },
    
    end: async () => {
      console.log("Mock database closed");
    }
  };
}

// Initialize database (won't crash if MySQL isn't available)
initializeDatabase();

// --- 3. AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// --- 4. ROUTES ---

// Test endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "WitbriChat API is running!",
    version: "1.0.0",
    database: db && db.getConnection ? "MySQL (Connected)" : "In-memory (Development Mode)",
    endpoints: {
      auth: ["POST /register", "POST /login"],
      users: ["GET /users"],
      posts: ["GET /api/posts", "POST /api/posts", "GET /api/posts/user/:username"],
      messages: ["GET /messages/:room"]
    }
  });
});

// AUTH (Register/Login)
app.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // Check if user exists
    const [existingUsers] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)", 
      [username, hashedPassword, email]
    );
    
    const token = jwt.sign(
      { id: result.insertId, username }, 
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );
    
    res.status(201).json({ 
      message: "User created successfully", 
      token, 
      username, 
      userId: result.insertId 
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    console.log("Querying database for user:", username);
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    
    if (users.length === 0) {
      console.log("User not found:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = users[0];
    console.log("User found, comparing passwords");
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log("Invalid password for user:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );
    
    console.log("Login successful for:", username);
    res.json({ 
      token, 
      username: user.username, 
      userId: user.id,
      avatar: user.avatar,
      bio: user.bio
    });
  } catch (err) {
    console.error("Login error details:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// USERS
app.get("/users", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, avatar, bio FROM users WHERE id != ? ORDER BY username",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// User profile
app.get("/users/profile", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, email, avatar, bio, full_name FROM users WHERE id = ?",
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.put("/users/profile", authenticateToken, async (req, res) => {
  try {
    const { bio, avatar, full_name } = req.body;
    const updates = [];
    const values = [];
    
    if (bio !== undefined) {
      updates.push("bio = ?");
      values.push(bio);
    }
    
    if (avatar !== undefined) {
      updates.push("avatar = ?");
      values.push(avatar);
    }
    
    if (full_name !== undefined) {
      updates.push("full_name = ?");
      values.push(full_name);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    values.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    
    await db.query(query, values);
    
    // Get updated user
    const [updatedUser] = await db.query(
      "SELECT id, username, email, avatar, bio, full_name FROM users WHERE id = ?",
      [req.user.id]
    );
    
    res.json(updatedUser[0]);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// --- POSTS API ---
app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    const { caption, image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }
    
    // Optional: Validate base64 image
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: "Invalid image format. Please upload a valid image." });
    }
    
    const [result] = await db.query(
      "INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)",
      [req.user.id, caption || "", image]
    );
    
    // Get the created post with user info
    const [posts] = await db.query(`
      SELECT posts.*, users.username, users.avatar 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.id = ?
    `, [result.insertId]);
    
    if (posts.length === 0) {
      return res.status(500).json({ error: "Failed to retrieve created post" });
    }
    
    const newPost = {
      ...posts[0],
      id: result.insertId,
      likes: 0,
      comments: [],
      createdAt: posts[0].created_at
    };
    
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Post creation error:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT posts.*, users.username, users.avatar 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY posts.created_at DESC
      LIMIT 20
    `);
    
    res.json(posts.map(post => ({
      ...post,
      createdAt: post.created_at
    })));
  } catch (err) {
    console.error("Posts fetch error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get("/api/posts/user/:username", async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT posts.*, users.username, users.avatar 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE users.username = ? 
      ORDER BY posts.created_at DESC
    `, [req.params.username]);
    
    res.json(posts.map(post => ({
      ...post,
      createdAt: post.created_at
    })));
  } catch (err) {
    console.error("User posts fetch error:", err);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
});

// --- MESSAGES API ---
app.get("/messages/:room", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT sender_name as user, message_text as message, created_at as time FROM messages WHERE room_name = ? ORDER BY created_at ASC",
      [req.params.room]
    );
    
    res.json(rows.map(row => ({
      ...row,
      time: row.time
    })));
  } catch (err) {
    console.error("Messages fetch error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.get("/messages/last", authenticateToken, async (req, res) => {
  try {
    // Get last message for each conversation involving current user
    const [rows] = await db.query(`
      SELECT m1.* 
      FROM messages m1
      INNER JOIN (
        SELECT room_name, MAX(created_at) as max_time
        FROM messages
        WHERE room_name LIKE ?
        GROUP BY room_name
      ) m2 ON m1.room_name = m2.room_name AND m1.created_at = m2.max_time
      ORDER BY m1.created_at DESC
    `, [`%${req.user.username}%`]);
    
    // Convert to object format for easier lookup
    const lastMessages = {};
    rows.forEach(row => {
      lastMessages[row.room_name] = row.message_text;
    });
    
    res.json(rows);
  } catch (err) {
    console.error("Last messages fetch error:", err);
    res.status(500).json({ error: "Failed to fetch last messages" });
  }
});

// --- 5. SOCKET.IO SETUP ---
const io = new Server(httpServer, { 
  cors: { 
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  } 
});

// Store online users with socket ID mapping
const onlineUsers = new Map(); // socket.id -> username

io.on("connection", (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);
  
  socket.on("join_app", (data) => {
    const username = data?.username || data;
    if (username) {
      onlineUsers.set(socket.id, username);
      console.log(`👤 ${username} joined (socket: ${socket.id})`);
      
      // Broadcast updated user list to all clients
      const uniqueUsers = Array.from(new Set(onlineUsers.values()));
      io.emit("user_list", uniqueUsers);
    }
  });
  
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
  
  socket.on("send_message", async (data) => {
    try {
      const { room, user, message } = data;
      
      await db.query(
        "INSERT INTO messages (room_name, sender_name, message_text) VALUES (?, ?, ?)",
        [room, user, message]
      );
      
      // Emit to everyone in the room including sender
      io.to(room).emit("receive_message", {
        ...data,
        time: new Date().toISOString()
      });
      
      // Also emit to sender for optimistic update confirmation
      socket.emit("message_sent", { success: true });
    } catch (err) {
      console.error("Message save error:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });
  
  socket.on("typing", (data) => {
    const { room, user, isTyping } = data;
    socket.to(room).emit("user_typing", { user, room, isTyping });
  });
  
  socket.on("user_update", (userData) => {
    // Broadcast user update to all clients
    io.emit("user_updated", userData);
  });
  
  socket.on("user_logout", (username) => {
    console.log(`👋 ${username} logged out`);
    // User logout handled in disconnect event
  });
  
  socket.on("disconnect", () => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      onlineUsers.delete(socket.id);
      console.log(`🔌 ${username} disconnected (socket: ${socket.id})`);
      
      // Broadcast updated user list
      const uniqueUsers = Array.from(new Set(onlineUsers.values()));
      io.emit("user_list", uniqueUsers);
    }
  });
  
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// --- 6. START SERVER ---
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 WitbriChat Server Started Successfully!         ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║   📡 Server URL: http://localhost:${PORT}              ${PORT < 1000 ? " " : ""}║
║   🔌 WebSocket: ws://localhost:${PORT}                 ${PORT < 1000 ? " " : ""}║
║   🌐 Frontend:  http://localhost:5173                ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║   🔑 Test Credentials:                               ║
║      • Username: testuser                            ║
║      • Password: password123                         ║
║                                                      ║
║   📋 Other test users: john / jane                   ║
║      (password: password123)                         ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
`);

  console.log(`\n📋 API Endpoints:`);
  console.log(`   GET  /                    - API status`);
  console.log(`   POST /register            - Register new user`);
  console.log(`   POST /login               - Login`);
  console.log(`   GET  /users               - Get all users (requires token)`);
  console.log(`   GET  /users/profile       - Get user profile (requires token)`);
  console.log(`   PUT  /users/profile       - Update profile (requires token)`);
  console.log(`   GET  /api/posts           - Get all posts`);
  console.log(`   POST /api/posts           - Create post (requires token)`);
  console.log(`   GET  /api/posts/user/:id  - Get user's posts`);
  console.log(`   GET  /messages/:room      - Get messages for room`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (db && db.end) {
    await db.end();
  }
  httpServer.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});