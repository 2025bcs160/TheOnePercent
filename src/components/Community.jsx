import { useState } from "react";
import { Send, Smile, Image } from "lucide-react";

export default function Community() {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      username: "TraderPro",
      text: "Anyone trading EURUSD today?",
      timestamp: "10:30 AM",
      avatar: "TP",
    },
    {
      id: 2,
      username: "ForexMaster",
      text: "Looking bullish on GBPUSD. What's your analysis?",
      timestamp: "10:32 AM",
      avatar: "FM",
    },
    {
      id: 3,
      username: "ScalpKing",
      text: "Just closed a profitable trade on XAUUSD. +150 pips!",
      timestamp: "10:35 AM",
      avatar: "SK",
    },
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        username: "You",
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        avatar: "YOU",
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      setShowEmoji(false);
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
  };

  const emojis = ["😀", "😂", "😍", "🚀", "💰", "📈", "🎯", "✅", "⚠️", "🔥"];

  return (
    <div className="page-section community-page">
      <section className="card community-chat">
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className="chat-message">
                <div className="message-avatar">{msg.avatar}</div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="username">{msg.username}</span>
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                  <p className="message-text">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input-wrapper">
            {showEmoji && (
              <div className="emoji-picker">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    className="emoji-btn"
                    onClick={() => addEmoji(emoji)}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div className="chat-input">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Share your trading insights..."
              />
              <button
                className="icon-button emoji-toggle"
                onClick={() => setShowEmoji(!showEmoji)}
                type="button"
                title="Add emoji"
              >
                <Smile size={20} />
              </button>
              <button
                className="icon-button"
                type="button"
                title="Upload image"
              >
                <Image size={20} />
              </button>
              <button
                className="send-button"
                onClick={sendMessage}
                type="button"
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}