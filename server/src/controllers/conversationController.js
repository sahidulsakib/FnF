import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
// ==========================
// Create or Get Conversation
// ==========================
export const createConversation = async (req, res) => {
  try {
    // Logged-in user will always be the sender
    const senderId = req.user.id;
    const { receiverId } = req.body;

    // Receiver ID validation
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID",
      });
    }

    // Prevent chatting with yourself
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a conversation with yourself",
      });
    }

    // Check whether receiver exists
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      members: {
        $all: [senderId, receiverId],
      },
    }).populate("members", "name profilePic");

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversation: existingConversation,
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      members: [senderId, receiverId],
    });

    const populatedConversation = await Conversation.findById(
      conversation._id
    ).populate("members", "name profilePic");

    res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      conversation: populatedConversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================
// Get Logged-in User Conversations
// ==========================
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations =
      await Conversation.find({
        members: userId,
      })
        .populate(
          "members",
          "name profilePic"
        )
        .sort({ updatedAt: -1 });

    const conversationIds =
      conversations.map(
        (conversation) =>
          conversation._id
      );

    // যেসব conversation-এ অন্তত
    // একটি message আছে
    const conversationsWithMessages =
      await Message.distinct(
        "conversationId",
        {
          conversationId: {
            $in: conversationIds,
          },
        }
      );

    const validConversationIds =
      new Set(
        conversationsWithMessages.map(
          (id) => id.toString()
        )
      );

    const formattedConversations =
      conversations
        .filter((conversation) =>
          validConversationIds.has(
            conversation._id.toString()
          )
        )
        .map((conversation) => {
          const otherUser =
            conversation.members.find(
              (member) =>
                member._id.toString() !==
                userId.toString()
            );

          return {
            _id: conversation._id,
            user: otherUser,
            createdAt:
              conversation.createdAt,
            updatedAt:
              conversation.updatedAt,
          };
        });

    res.status(200).json({
      success: true,
      conversations:
        formattedConversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};