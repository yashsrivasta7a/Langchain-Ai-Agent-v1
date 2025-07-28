import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const LOCAL_STORAGE_KEY = "vectorKnowledgeChatHistory";

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input.trim();
    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/api/chat", {
        question,
        history: messages, 
      });

      const aiMessage = {
        role: "ai",
        text: res.data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error talking to backend:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong!" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chatbot-container">
      <div className="chatbot-header">
        <p className="sub-heading">Vector Knowledge Bank</p>
      </div>

      <div
        className="chatbot-conversation-container"
        id="chatbot-conversation-container"
        ref={containerRef}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`speech ${
              msg.role === "user" ? "speech-human" : "speech-ai"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="speech speech-ai typing-indicator">
            <em>Bot is typing...</em>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chatbot-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </form>
    </section>
  );
}

export default Chatbot;
