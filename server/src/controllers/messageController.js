import mongoose from "mongoose";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

// ==========================
// Send Message
// ==========================
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;

    const {
      conversationId,
      receiverId,
      text,
    } = req.body;

    const trimmedText = text?.trim();

    // Message text validation
    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    let conversation;

    // ==========================
    // Existing Conversation
    // ==========================
    if (conversationId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          conversationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
      }

      conversation =
        await Conversation.findById(
          conversationId
        );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      // Logged-in user conversation member কি না
      const isMember =
        conversation.members.some(
          (memberId) =>
            memberId.toString() ===
            senderId.toString()
        );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to send messages in this conversation",
        });
      }
    }

    // ==========================
    // First Message / New Conversation
    // ==========================
    else {
      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: "Receiver ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          receiverId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid receiver ID",
        });
      }

      if (
        senderId.toString() ===
        receiverId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot send a message to yourself",
        });
      }

      // আগে conversation আছে কি না
      conversation =
        await Conversation.findOne({
          members: {
            $all: [senderId, receiverId],
          },
        });

      // না থাকলে first message-এর সময় তৈরি হবে
      if (!conversation) {
        conversation =
          await Conversation.create({
            members: [
              senderId,
              receiverId,
            ],
          });
      }
    }

    // ==========================
    // Create Message
    // ==========================
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      text: trimmedText,
    });

    // Latest message অনুযায়ী conversation-এর
    // updatedAt পরিবর্তন করার জন্য
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage =
      await Message.findById(
        message._id
      ).populate(
        "sender",
        "name profilePic"
      );

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversation,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================
// Get Messages of Conversation
// ==========================
export const getMessages = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        conversationId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // অন্য কারো conversation-এর message
    // দেখা বন্ধ করবে
    const isMember =
      conversation.members.some(
        (memberId) =>
          memberId.toString() ===
          userId.toString()
      );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view these messages",
      });
    }

    const messages = await Message.find({
      conversationId,
    })
      .populate(
        "sender",
        "name profilePic"
      )
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};