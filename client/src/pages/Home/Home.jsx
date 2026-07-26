import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getConversations,
  getMessages,
  sendMessage,
} from "../../services/messageService";

import { useAuth } from "../../context/AuthContext";
import SearchUser from "../../components/chat/SearchUser";
import ChatBox from "../../components/chat/ChatBox";

import socket from "../../socket";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const [chatUsers, setChatUsers] = useState([]);
  const [conversationsLoading, setConversationsLoading] =
    useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const token = localStorage.getItem("token");

  // ==========================
  // Logout
  // ==========================
  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // ==========================
  // Fetch Conversation List
  // ==========================
  const fetchConversations = useCallback(async () => {
    if (!token) {
      handleLogout();
      return;
    }

    try {
      setConversationsLoading(true);

      const res = await getConversations(token);

      setChatUsers(res.data.conversations || []);
    } catch (error) {
      console.error(
        "Fetch conversations error:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setConversationsLoading(false);
    }
  }, [token, handleLogout]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ==========================
  // Register Socket User
  // ==========================
  useEffect(() => {
    if (!user?._id) return;

    const registerSocketUser = () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("addUser", user._id);
    };

    if (socket.connected) {
      registerSocketUser();
    }

    socket.on("connect", registerSocketUser);

    return () => {
      socket.off("connect", registerSocketUser);
    };
  }, [user?._id]);

  // ==========================
  // Receive Message
  // ==========================
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const incomingConversationId =
        message.conversationId?._id ||
        message.conversationId;

      const incomingSenderId =
        message.sender?._id ||
        message.sender;

      const sameConversation =
        conversation?._id &&
        incomingConversationId?.toString() ===
          conversation._id.toString();

      const firstMessageFromSelectedUser =
        !conversation?._id &&
        selectedUser?._id &&
        incomingSenderId?.toString() ===
          selectedUser._id.toString();

      if (
        sameConversation ||
        firstMessageFromSelectedUser
      ) {
        setMessages((previousMessages) => [
          ...previousMessages,
          message,
        ]);

        if (!conversation?._id && incomingConversationId) {
          setConversation({
            _id: incomingConversationId,
          });
        }
      }

      fetchConversations();
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );
    };
  }, [
    conversation?._id,
    selectedUser?._id,
    fetchConversations,
  ]);

  // ==========================
  // Online Users
  // ==========================
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    socket.on(
      "getOnlineUsers",
      handleOnlineUsers
    );

    return () => {
      socket.off(
        "getOnlineUsers",
        handleOnlineUsers
      );
    };
  }, []);

  // ==========================
  // Check Online Status
  // ==========================
  const isUserOnline = (userId) => {
    return onlineUsers.some((onlineUser) => {
      const onlineUserId =
        onlineUser.userId ||
        onlineUser._id ||
        onlineUser;

      return (
        onlineUserId?.toString() ===
        userId?.toString()
      );
    });
  };

  // ==========================
  // Select User From Search
  // No conversation created here
  // ==========================
  const handleSelectUser = (receiver) => {
    if (!receiver?._id) return;

    setSelectedUser(receiver);

    // প্রথম message পাঠানোর আগে
    // conversation থাকবে না
    setConversation(null);
    setMessages([]);

    setShowChat(true);
  };

  // ==========================
  // Select Existing Chat
  // ==========================
  const handleSelectChat = async (chatItem) => {
    if (
      !chatItem?._id ||
      !chatItem?.user?._id ||
      !token
    ) {
      return;
    }

    try {
      setMessagesLoading(true);

      setSelectedUser(chatItem.user);
      setConversation(chatItem);

      const messageRes = await getMessages(
        chatItem._id,
        token
      );

      setMessages(
        messageRes.data.messages || []
      );

      setShowChat(true);
    } catch (error) {
      console.error(
        "Open chat error:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  // ==========================
  // Send Message
  // ==========================
  const handleSendMessage = async (text) => {
    const trimmedText = text?.trim();

    if (
      !trimmedText ||
      !selectedUser?._id ||
      !token
    ) {
      return;
    }

    try {
      const messageData = {
        receiverId: selectedUser._id,
        text: trimmedText,
      };

      // Existing chat হলে conversationId যাবে
      if (conversation?._id) {
        messageData.conversationId =
          conversation._id;
      }

      const res = await sendMessage(
        messageData,
        token
      );

      const newMessage = res.data.message;
      const returnedConversation =
        res.data.conversation;

      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);

      // প্রথম message পাঠানোর পরে
      // backend conversation return করবে
      if (returnedConversation?._id) {
        setConversation(
          returnedConversation
        );
      }

      socket.emit("sendMessage", {
        receiverId: selectedUser._id,
        message: newMessage,
      });

      // এখন user Chats list-এ যোগ হবে
      await fetchConversations();
    } catch (error) {
      console.error(
        "Send message error:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome {user?.name} 👋
          </h1>

          <p className="opacity-70">
            {user?.email || user?.phone}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-error btn-sm md:btn-md"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid items-start gap-6 md:grid-cols-2">
        {/* Left Side */}
        <div
          className={
            showChat
              ? "hidden md:block"
              : "block"
          }
        >
          {/* Search */}
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-semibold">
              Search Users
            </h2>

            <SearchUser
              token={token}
              handleSelectUser={
                handleSelectUser
              }
            />
          </div>

          {/* Chats List */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Chats
            </h2>

            {conversationsLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md" />
              </div>
            ) : chatUsers.length === 0 ? (
              <div className="rounded-xl bg-base-200 p-6 text-center opacity-70">
                No conversations yet.
                <br />
                Search for a user and send a
                message.
              </div>
            ) : (
              <div className="space-y-3">
                {chatUsers.map((chatItem) => {
                  const chatUser =
                    chatItem.user;

                  if (!chatUser) return null;

                  const online =
                    isUserOnline(
                      chatUser._id
                    );

                  const isSelected =
                    conversation?._id ===
                    chatItem._id;

                  return (
                    <button
                      key={chatItem._id}
                      type="button"
                      onClick={() =>
                        handleSelectChat(
                          chatItem
                        )
                      }
                      className={`flex w-full items-center gap-4 rounded-xl p-4 text-left shadow transition hover:bg-base-200 ${
                        isSelected
                          ? "bg-base-200"
                          : "bg-base-100"
                      }`}
                    >
                      {/* Profile Picture */}
                      <div className="avatar">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-base-300">
                          {chatUser.profilePic ? (
                            <img
                              src={
                                chatUser.profilePic
                              }
                              alt={
                                chatUser.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-bold">
                              {chatUser.name
                                ?.charAt(0)
                                .toUpperCase() ||
                                "U"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Information */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold">
                          {chatUser.name}
                        </h3>

                        <p
                          className={`text-sm ${
                            online
                              ? "text-success"
                              : "opacity-60"
                          }`}
                        >
                          {online
                            ? "Online"
                            : "Offline"}
                        </p>
                      </div>

                      {online && (
                        <span className="h-3 w-3 rounded-full bg-success" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div
          className={
            showChat
              ? "block"
              : "hidden md:block"
          }
        >
          {messagesLoading ? (
            <div className="flex min-h-[500px] items-center justify-center rounded-xl bg-base-200">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <ChatBox
              user={user}
              selectedUser={selectedUser}
              messages={messages}
              handleSendMessage={
                handleSendMessage
              }
              onBack={() =>
                setShowChat(false)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;