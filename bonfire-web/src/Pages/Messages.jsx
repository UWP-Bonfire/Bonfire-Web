import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/messages.css";

export default function Messages() {
  const navigate = useNavigate();

  const handleBack = () => {
   navigate("/friends");// Goes back to the Friends page
  };

  return (
    <div className="messages-container">
      {/* Sidebar */}
      <aside className="sidebar">
  <div className="sidebar-header">
    <button className="back-btn" onClick={handleBack} aria-label="Go back">
      <img src="/images/right-arrow.png" alt="Back" />
    </button>
    <h2>Messages</h2>
  </div>

        <div className="sidebar-icons">
         <div className="dm-list">
          <div className="dm">
            <img src="/images/3d_avatar_1.png" alt="friend1" />
            <span>friend1</span>
          </div>
          <div className="dm">
            <img src="/images/3d_avatar_13.png" alt="friend2" />
            <span>friend2</span>
          </div>
          <div className="dm">
            <img src="/images/3d_avatar_16.png" alt="friend3" />
            <span>friend3</span>
          </div>
        </div>
        </div>
        <button className="create-group">+ Create Group Chat</button>
      </aside>

      {/* Chat Section */}
      <main className="chat-area">
        <div className="chat-header">
          <img
            src="/images/3d_avatar_1.png"
            alt="friend1"
            className="chat-header-avatar"
          />
          <span>Chat with Friend</span>
        </div>

        {/* Chat Body */}
        <div className="chat-body">
          {/* Received message */}
          <div className="message-row received">
            <img
              src="/images/3d_avatar_1.png"
              alt="friend1"
              className="msg-avatar"
            />
            <div className="message-bubble">
              <span className="msg-name">friend1</span>
              <div className="message-text">Hey! How are you?</div>
            </div>
          </div>

          {/* Sent message */}
          <div className="message-row sent">
            <img
              src="/images/3d_avatar_16.png"
              alt="user"
              className="msg-avatar"
            />
            <div className="message-bubble">
              <span className="msg-name">user</span>
              <div className="message-text">Doing great, thanks! You?</div>
            </div>
          </div>
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
