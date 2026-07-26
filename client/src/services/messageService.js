import axios from "axios";

const API = "http://localhost:5000/api";

// ==========================
// Create/Get Conversation
// ==========================
export const createConversation = (receiverId, token) =>
  axios.post(
    `${API}/conversations`,
    {
      receiverId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// ==========================
// Get Conversation List
// ==========================
export const getConversations = (token) =>
  axios.get(`${API}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ==========================
// Send Message
// ==========================
export const sendMessage = (data, token) =>
  axios.post(`${API}/messages`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ==========================
// Get Messages
// ==========================
export const getMessages = (conversationId, token) =>
  axios.get(`${API}/messages/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });