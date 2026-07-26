import axios from "axios";

const API = "http://localhost:5000/api";

// Create/Get Conversation
export const createConversation = (data) =>
  axios.post(`${API}/conversations`, data);

// Send Message
export const sendMessage = (data) =>
  axios.post(`${API}/messages`, data);

// Get Messages
export const getMessages = (conversationId) =>
  axios.get(`${API}/messages/${conversationId}`);