import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";

const ChatBox = ({
  user,
  selectedUser,
  messages,
  handleSendMessage,
  onBack,
}) => {
  const messagesEndRef = useRef(null);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="card bg-base-100 shadow-md h-[500px] flex flex-col">
        <div className="card-body flex justify-center items-center">
          <p className="opacity-70 text-center">
            Select a user to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md h-[500px] flex flex-col">

      <div className="card-body flex flex-col h-full overflow-hidden">

        {/* Chat Header */}
        <div className="border-b pb-3 flex items-center gap-3">

          {/* Mobile Back Button */}
          <button
            className="btn btn-circle btn-sm md:hidden"
            onClick={onBack}
          >
            ←
          </button>

          <div>
            <h2 className="text-xl font-bold">
              {selectedUser.name}
            </h2>

            <p className="text-sm opacity-70">
              {selectedUser.email}
            </p>
          </div>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-2 min-h-0">

          {messages.length === 0 ? (
            <p className="text-center opacity-60 mt-10">
              No messages yet.
            </p>
          ) : (
            messages.map((msg) => {
              const senderId =
                typeof msg.sender === "string"
                  ? msg.sender
                  : msg.sender?._id;

              const isMe = senderId === user?._id;

              return (
                <div
                  key={msg._id}
                  className={`chat ${
                    isMe ? "chat-end" : "chat-start"
                  }`}
                >
                  <div
                    className={`chat-bubble ${
                      isMe
                        ? "chat-bubble-primary"
                        : "chat-bubble-neutral"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />

        </div>

        {/* Input */}
        <div className="border-t pt-4 mt-3 flex-shrink-0">
          <MessageInput
            handleSendMessage={handleSendMessage}
          />
        </div>

      </div>

    </div>
  );
};

export default ChatBox;