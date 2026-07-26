import Message from "../models/Message.js";

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body;

    if (!conversationId || !sender || !text) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const message = await Message.create({
      conversationId,
      sender,
      text,
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Messages of a Conversation
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate("sender", "name email");

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};