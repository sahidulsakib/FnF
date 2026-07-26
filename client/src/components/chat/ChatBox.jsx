import {
  useEffect,
  useRef,
  useState,
} from "react";

import MessageInput from "./MessageInput";

// ==========================
// User Avatar
// ==========================
const UserAvatar = ({
  profilePic,
  name,
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
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-base-300">
      {showImage ? (
        <img
          src={profilePic}
          alt={name || "User"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg font-bold">
          {firstLetter}
        </div>
      )}
    </div>
  );
};

// ==========================
// Message Time
// ==========================
const formatMessageTime = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChatBox = ({
  user,
  selectedUser,
  messages = [],
  handleSendMessage,
  sendingMessage = false,
  onBack,
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // ==========================
  // Auto Scroll
  // ==========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // ==========================
  // No User Selected
  // ==========================
  if (!selectedUser) {
    return (
      <div className="flex h-[500px] flex-col rounded-2xl bg-base-100 shadow-sm">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-3 text-5xl">
              💬
            </div>

            <h2 className="text-xl font-semibold">
              Select a conversation
            </h2>

            <p className="mt-2 opacity-60">
              Choose a user to start chatting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedUserContact =
    selectedUser.email ||
    selectedUser.phone ||
    selectedUser.bio ||
    "Start a conversation";

  return (
    <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl bg-base-100 shadow-sm md:h-[600px]">
      {/* Chat Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-base-300 px-4 py-3">
        {/* Mobile Back Button */}
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm md:hidden"
          onClick={onBack}
          aria-label="Back to chats"
        >
          ←
        </button>

        <UserAvatar
          profilePic={selectedUser.profilePic}
          name={selectedUser.name}
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold md:text-xl">
            {selectedUser.name || "User"}
          </h2>

          <p className="truncate text-sm opacity-60">
            {selectedUserContact}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <UserAvatar
                profilePic={
                  selectedUser.profilePic
                }
                name={selectedUser.name}
              />

              <h3 className="mt-3 text-lg font-semibold">
                {selectedUser.name}
              </h3>

              <p className="mt-1 text-sm opacity-60">
                No messages yet. Send the first
                message to start this conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map(
              (message, index) => {
                const senderId =
                  typeof message.sender ===
                  "string"
                    ? message.sender
                    : message.sender?._id;

                const isMe =
                  senderId?.toString() ===
                  user?._id?.toString();

                const messageKey =
                  message._id ||
                  `${senderId}-${message.createdAt}-${index}`;

                const messageTime =
                  formatMessageTime(
                    message.createdAt
                  );

                return (
                  <div
                    key={messageKey}
                    className={`chat ${
                      isMe
                        ? "chat-end"
                        : "chat-start"
                    }`}
                  >
                    <div
                      className={`chat-bubble max-w-[82%] whitespace-pre-wrap break-words ${
                        isMe
                          ? "chat-bubble-primary"
                          : "chat-bubble-neutral"
                      }`}
                    >
                      {message.text}
                    </div>

                    {messageTime && (
                      <div className="chat-footer mt-1 text-xs opacity-50">
                        {messageTime}
                      </div>
                    )}
                  </div>
                );
              }
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="shrink-0 border-t border-base-300 p-3">
        <MessageInput
          handleSendMessage={
            handleSendMessage
          }
          sendingMessage={
            sendingMessage
          }
        />
      </div>
    </div>
  );
};

export default ChatBox;