import express from "express";
import {
  sendMessage,
  getMessages,
} from "../controllers/messageController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Send Message
router.post(
  "/",
  authMiddleware,
  sendMessage
);

// Get Messages of a Conversation
router.get(
  "/:conversationId",
  authMiddleware,
  getMessages
);

export default router;