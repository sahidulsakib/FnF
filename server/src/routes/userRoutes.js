import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getProfile,
  getAllUsers,
} from "../controllers/userController.js";
const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.get("/", authMiddleware, getAllUsers);
export default router;