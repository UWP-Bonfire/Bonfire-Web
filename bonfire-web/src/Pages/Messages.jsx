import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/messages.css";

export default function Messages() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "friend1",
      text: "Hey! How are you?",
      type: "received",
      time: "10:24 AM"
    },
    {
      id: 2,
      sender: "user",
      text: "Doing great, thanks! You?",
      type: "sent",
      time: "10:25 AM",
      status: "sent"
    },
  ]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.type === "sent" ? { ...m, status: "delivered" } : m
        )
      );
    });

    const timer2 = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.type === "sent" ? { ...m, status: "read" } : m
        )
      );
    });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleBack = () => {
    navigate("/friends");// Goes back to the Friends page
  };

  return (
    <div className="messages-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
        </div>

        <div className="sidebar-icons">
          <div className="dm-list">
            <div className="dm">
              <img src="Profile Images/IMG_1843.png" alt="friend1" />
              <span>friend1</span>
            </div>
            <div className="dm">
              <img src="Profile Images/IMG_1844.png" alt="friend2" />
              <span>friend2</span>
            </div>
            <div className="dm">
              <img src="Profile Images/IMG_1845.png" alt="friend3" />
              <span>friend3</span>
            </div>
          </div>
        </div>

        <button
          className="create-group"
          onClick={() => navigate("/groupchats")}>
          Group Chats
        </button>
      </aside>

      {/* Chat Section */}
      <main className="chat-area">
        <div className="chat-header">
          <img
            src="Profile Images/IMG_1843.png"
            alt="friend1"
            className="chat-header-avatar"
          />
          <span>Chat with Friend</span>
          <button className="back-btn" onClick={handleBack} aria-label="Go back">
            <img src="/images/right-arrow.png" alt="Back" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="chat-body">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.type === "sent" ? "sent" : "received"
                }`}
            >
              <img
                src={
                  msg.type === "sent"
                    ? "images/bonfire.png"
                    : "Profile Images/IMG_1843.png"
                }
                alt={msg.sender}
                className="msg-avatar"
              />
              <div className="message-bubble">
                <span className="msg-name">{msg.sender}</span>
                <div className="message-text">{msg.text}</div>

                {/*read receipt */}
                <span className="msg-time">
                  {msg.time}
                  {msg.type === "sent" && (
                    <>
                      {msg.status === "sent" && (
                        <span className="check gray"> ✓ </span>
                      )}
                      {msg.status === "delivered" && (
                        <span className="check gray"> ✓✓ </span>
                      )}
                      {msg.status === "read" && (
                        <span className="check blue"> ✓✓ </span>
                      )}
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Section */}
        <div className="input-box">
          <div className="chat-input">
            <input type="text" placeholder="Type a message..." />
            <div className="icon-group">
              <button className="icon-btn attach-btn" aria-label="Add image">
                <img src="/images/message.png" alt="Add" />
              </button>
              <button className="icon-btn send-btn" aria-label="Send message">
                <img src="/images/arrow.png" alt="Send" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
