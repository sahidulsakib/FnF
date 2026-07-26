import { useState } from "react";

const MessageInput = ({ handleSendMessage }) => {
  const [text, setText] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    handleSendMessage(text);

    setText("");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-2 mt-4"
    >
      <input
        type="text"
        placeholder="Type a message..."
        className="input input-bordered flex-1"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        type="submit"
        className="btn btn-primary"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;