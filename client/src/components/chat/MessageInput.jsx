import {
  useRef,
  useState,
} from "react";

const MessageInput = ({
  handleSendMessage,
  sendingMessage = false,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // ==========================
  // Submit Message
  // ==========================
  const onSubmit = async (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (
      !trimmedText ||
      sendingMessage
    ) {
      return;
    }

    try {
      await handleSendMessage(
        trimmedText
      );

      setText("");

      textareaRef.current?.focus();
    } catch (error) {
      console.error(
        "Message submit error:",
        error
      );
    }
  };

  // ==========================
  // Enter / Shift + Enter
  // ==========================
  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (
        text.trim() &&
        !sendingMessage
      ) {
        onSubmit(event);
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-2"
    >
      <textarea
        ref={textareaRef}
        name="message"
        rows={1}
        placeholder="Type a message..."
        className="textarea textarea-bordered min-h-12 max-h-32 flex-1 resize-none"
        value={text}
        onChange={(event) =>
          setText(event.target.value)
        }
        onKeyDown={handleKeyDown}
        disabled={sendingMessage}
        maxLength={2000}
      />

      <button
        type="submit"
        className="btn btn-primary min-h-12"
        disabled={
          sendingMessage ||
          !text.trim()
        }
      >
        {sendingMessage ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            <span className="hidden sm:inline">
              Sending
            </span>
          </>
        ) : (
          "Send"
        )}
      </button>
    </form>
  );
};

export default MessageInput;