import express from "express";
import {
  createConversation,
  getConversations,
} from "../controllers/conversationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user's conversation list
router.get("/", authMiddleware, getConversations);

// Create or get conversation
router.post("/", authMiddleware, createConversation);

export default router;