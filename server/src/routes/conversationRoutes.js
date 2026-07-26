import express from "express";
import { createConversation } from "../controllers/conversationController.js";

const router = express.Router();

// Create or Get Conversation
router.post("/", createConversation);

export default router;