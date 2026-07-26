import MessageInput from "./MessageInput";

const ChatBox = ({
  user,
  selectedUser,
  messages,
  handleSendMessage,
}) => {
  if (!selectedUser) {
    return (
      <div className="card bg-base-100 shadow-md min-h-[500px]">
        <div className="card-body flex justify-center items-center">
          <p className="opacity-70">
            Select a user to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md min-h-[500px]">
      <div className="card-body">

        {/* Chat Header */}
        <div className="border-b pb-3">
          <h2 className="text-xl font-bold">
            {selectedUser.name}
          </h2>

          <p className="text-sm opacity-70">
            {selectedUser.email}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 mt-4 space-y-3 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="opacity-60">
              No messages yet.
            </p>
          ) : (
            messages.map((msg) => {
              // sender string অথবা object - দুইটাই handle করবে
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
                      isMe ? "chat-bubble-primary" : ""
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <MessageInput
          handleSendMessage={handleSendMessage}
        />

      </div>
    </div>
  );
};

export default ChatBox;