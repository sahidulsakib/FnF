import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getProfile,
  getAllUsers,
  searchUsers,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// All Users
router.get("/", authMiddleware, getAllUsers);

// Search Users
router.get("/search", authMiddleware, searchUsers);

export default router;