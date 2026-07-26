import Conversation from "../models/Conversation.js";

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversation: existingConversation,
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      members: [senderId, receiverId],
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};