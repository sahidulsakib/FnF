import express from "express";
import {
  sendMessage,
  getMessages,
} from "../controllers/messageController.js";

const router = express.Router();

// Send Message
router.post("/", sendMessage);

// Get Messages of a Conversation
router.get("/:conversationId", getMessages);

export default router;