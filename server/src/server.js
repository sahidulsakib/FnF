import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ========================
// Database
// ========================
connectDB();

// ========================
// Middlewares
// ========================
app.use(cors());
app.use(express.json());

// ========================
// Routes
// ========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// ========================
// Test Route
// ========================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FamilyConnect API is running 🚀",
  });
});

// ========================
// Socket.IO
// ========================

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  // Register User
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    console.log("User Added:", userId);
    console.log("Online Users:", onlineUsers);
  });

  // Send Message
  socket.on("sendMessage", ({ receiverId, message }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        break;
      }
    }

    console.log("🔴 User Disconnected:", socket.id);
    console.log("Online Users:", onlineUsers);
  });
});

// ========================
// Start Server
// ========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});