import {
  useCallback,
  useEffect,
  useState,
} from "react";

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

// ==========================
// Avatar Component
// ==========================
const UserAvatar = ({
  profilePic,
  name,
  sizeClass = "h-14 w-14",
  textClass = "text-xl",
}) => {
  const [imageError, setImageError] =
    useState(false);

  useEffect(() => {
    setImageError(false);
  }, [profilePic]);

  const firstLetter =
    name?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  const showImage =
    Boolean(profilePic?.trim()) &&
    !imageError;

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full bg-base-300 shadow`}
    >
      {showImage ? (
        <img
          src={profilePic}
          alt={name || "User"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-bold ${textClass}`}
        >
          {firstLetter}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();

  const {
    user,
    loading,
    logout,
  } = useAuth();

  const token =
    localStorage.getItem("token");

  const [chatUsers, setChatUsers] =
    useState([]);

  const [
    conversationsLoading,
    setConversationsLoading,
  ] = useState(true);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  const [
    conversation,
    setConversation,
  ] = useState(null);

  const [messages, setMessages] =
    useState([]);

  const [
    messagesLoading,
    setMessagesLoading,
  ] = useState(false);

  const [
    sendingMessage,
    setSendingMessage,
  ] = useState(false);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [showChat, setShowChat] =
    useState(false);

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
  const fetchConversations =
    useCallback(async () => {
      if (!token) {
        handleLogout();
        return;
      }

      try {
        setConversationsLoading(true);

        const res =
          await getConversations(token);

        setChatUsers(
          res.data.conversations || []
        );
      } catch (error) {
        console.error(
          "Fetch conversations error:",
          error.response?.data || error
        );

        if (
          error.response?.status === 401
        ) {
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
    if (!user?._id) return undefined;

    const registerSocketUser = () => {
      socket.emit("addUser", user._id);
    };

    if (socket.connected) {
      registerSocketUser();
    }

    socket.on(
      "connect",
      registerSocketUser
    );

    return () => {
      socket.off(
        "connect",
        registerSocketUser
      );
    };
  }, [user?._id]);

  // ==========================
  // Receive Message
  // ==========================
  useEffect(() => {
    const handleReceiveMessage = (
      message
    ) => {
      const incomingConversationId =
        message?.conversationId?._id ||
        message?.conversationId;

      const incomingSenderId =
        message?.sender?._id ||
        message?.sender;

      const currentConversationId =
        conversation?._id;

      const sameConversation =
        currentConversationId &&
        incomingConversationId &&
        incomingConversationId.toString() ===
          currentConversationId.toString();

      const firstMessageFromSelectedUser =
        !currentConversationId &&
        selectedUser?._id &&
        incomingSenderId &&
        incomingSenderId.toString() ===
          selectedUser._id.toString();

      if (
        sameConversation ||
        firstMessageFromSelectedUser
      ) {
        setMessages(
          (previousMessages) => {
            const alreadyExists =
              previousMessages.some(
                (existingMessage) =>
                  existingMessage._id ===
                  message._id
              );

            if (alreadyExists) {
              return previousMessages;
            }

            return [
              ...previousMessages,
              message,
            ];
          }
        );

        if (
          !currentConversationId &&
          incomingConversationId
        ) {
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
    const handleOnlineUsers = (
      users
    ) => {
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
    if (!userId) return false;

    return onlineUsers.some(
      (onlineUser) => {
        const onlineUserId =
          onlineUser?.userId ||
          onlineUser?._id ||
          onlineUser;

        return (
          onlineUserId?.toString() ===
          userId.toString()
        );
      }
    );
  };

  // ==========================
  // Select User From Search
  // Conversation তৈরি হবে না
  // ==========================
  const handleSelectUser = (
    receiver
  ) => {
    if (!receiver?._id) return;

    const existingChat =
      chatUsers.find(
        (chatItem) =>
          chatItem.user?._id?.toString() ===
          receiver._id.toString()
      );

    /*
      Search result-এর user-এর সঙ্গে
      আগে থেকেই conversation থাকলে
      existing chat open করবে।
    */
    if (existingChat) {
      handleSelectChat(existingChat);
      return;
    }

    setSelectedUser(receiver);
    setConversation(null);
    setMessages([]);
    setMessagesLoading(false);
    setShowChat(true);
  };

  // ==========================
  // Select Existing Chat
  // ==========================
  const handleSelectChat = async (
    chatItem
  ) => {
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
      setMessages([]);
      setShowChat(true);

      const messageRes =
        await getMessages(
          chatItem._id,
          token
        );

      setMessages(
        messageRes.data.messages || []
      );
    } catch (error) {
      console.error(
        "Open chat error:",
        error.response?.data || error
      );

      if (
        error.response?.status === 401
      ) {
        handleLogout();
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  // ==========================
  // Send Message
  // ==========================
  const handleSendMessage = async (
    text
  ) => {
    const trimmedText =
      text?.trim();

    if (
      !trimmedText ||
      !selectedUser?._id ||
      !token ||
      sendingMessage
    ) {
      return;
    }

    try {
      setSendingMessage(true);

      const messageData = {
        receiverId:
          selectedUser._id,
        text: trimmedText,
      };

      if (conversation?._id) {
        messageData.conversationId =
          conversation._id;
      }

      const res = await sendMessage(
        messageData,
        token
      );

      const newMessage =
        res.data.message;

      const returnedConversation =
        res.data.conversation;

      setMessages(
        (previousMessages) => {
          const alreadyExists =
            previousMessages.some(
              (existingMessage) =>
                existingMessage._id ===
                newMessage._id
            );

          if (alreadyExists) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            newMessage,
          ];
        }
      );

      if (
        returnedConversation?._id
      ) {
        setConversation(
          returnedConversation
        );
      }

      socket.emit("sendMessage", {
        receiverId:
          selectedUser._id,
        message: newMessage,
      });

      await fetchConversations();
    } catch (error) {
      console.error(
        "Send message error:",
        error.response?.data || error
      );

      if (
        error.response?.status === 401
      ) {
        handleLogout();
      }
      throw error;
    } finally {
      setSendingMessage(false);
    }
  };

  // ==========================
  // Mobile Back Button
  // ==========================
  const handleBackToChats = () => {
    setShowChat(false);
  };

  // ==========================
  // Auth Loading
  // ==========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        {/* Header */}
        <header className="mb-6 rounded-2xl bg-base-100 p-3 shadow-sm md:mb-8 md:p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Clickable Profile */}
            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left transition hover:bg-base-200"
            >
              <UserAvatar
                profilePic={
                  user?.profilePic
                }
                name={user?.name}
                sizeClass="h-12 w-12 md:h-14 md:w-14"
                textClass="text-lg md:text-xl"
              />

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold md:text-2xl">
                  {user?.name ||
                    "User"}
                </h1>

                <p className="truncate text-xs opacity-60 md:text-sm">
                  {user?.email ||
                    user?.phone ||
                    "View profile"}
                </p>
              </div>
            </button>

            {/* Header Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm hidden sm:inline-flex"
                onClick={() =>
                  navigate("/profile")
                }
              >
                Profile
              </button>

              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <main className="grid items-start gap-6 md:grid-cols-2">
          {/* Left Side */}
          <section
            className={
              showChat
                ? "hidden md:block"
                : "block"
            }
          >
            <div className="rounded-2xl bg-base-100 p-4 shadow-sm md:p-5">
              {/* Search */}
              <div className="mb-7">
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
                  <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-md" />
                  </div>
                ) : chatUsers.length ===
                  0 ? (
                  <div className="rounded-xl bg-base-200 p-6 text-center opacity-70">
                    No conversations yet.
                    <br />
                    Search for a user and
                    send a message.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatUsers.map(
                      (chatItem) => {
                        const chatUser =
                          chatItem.user;

                        if (!chatUser) {
                          return null;
                        }

                        const online =
                          isUserOnline(
                            chatUser._id
                          );

                        const isSelected =
                          conversation?._id
                            ?.toString() ===
                          chatItem._id?.toString();

                        return (
                          <button
                            key={
                              chatItem._id
                            }
                            type="button"
                            onClick={() =>
                              handleSelectChat(
                                chatItem
                              )
                            }
                            className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition md:p-4 ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-transparent bg-base-100 hover:bg-base-200"
                            }`}
                          >
                            {/* Chat Avatar */}
                            <div className="relative shrink-0">
                              <UserAvatar
                                profilePic={
                                  chatUser.profilePic
                                }
                                name={
                                  chatUser.name
                                }
                              />

                              {online && (
                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-base-100 bg-success" />
                              )}
                            </div>

                            {/* Chat Information */}
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-base font-semibold md:text-lg">
                                {
                                  chatUser.name
                                }
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
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right Side / Chat */}
          <section
            className={
              showChat
                ? "block"
                : "hidden md:block"
            }
          >
            {messagesLoading ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl bg-base-100 shadow-sm">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : (
              <ChatBox
                user={user}
                selectedUser={
                  selectedUser
                }
                messages={messages}
                handleSendMessage={
                  handleSendMessage
                }
                sendingMessage={
                  sendingMessage
                }
                onBack={
                  handleBackToChats
                }
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;