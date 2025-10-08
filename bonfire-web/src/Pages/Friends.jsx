import React from "react";
import "../Styles/friends.css";

export default function Friends() {
  return (
    <div className="container">
      {/* Left vertical icon bar */}
      <div className="icon-bar">
        <div className="icons-top">
          <div className="icon-circle"><img src="/icons/chat_bubble.svg" alt="Chat" /></div>
          <div className="icon-circle"><img src="/icons/Settings.svg" alt="Settings" /></div>
          <div className="icon-circle"><img src="/icons/Users.svg" alt="Groups" /></div>
          <div className="icon-circle"><img src="/icons/mail.svg" alt="Messages" /></div>
        </div>
        <div className="icons-bottom">
          <div className="icon-circle"><img src="/icons/User.svg" alt="Profile" /></div>
        </div>
      </div>

      {/* Sidebar with DMs */}
      <div className="sidebar">
        <h2>Direct Messages</h2>
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
        <div className="user">
          <img src="/icons/User.svg" alt="User" />
          <span>User123</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="main">
        <div className="main-header">
          <img src="/images/bonfire.png" alt="Logo" className="logo" />
          <h1>Friends</h1>
          <button className="add-friend">Add Friend</button>
        </div>

        <div className="friends-container">
          <div className="friend-card">
            <img src="/images/3d_avatar_1.png" alt="friend1" />
            <span>friend1</span>
            <button className="chat-btn" aria-label="Chat with friend1">💬</button>
            <button className="options-btn" aria-label="Options for friend1">⋮</button>
          </div>
          <div className="friend-card">
            <img src="/images/3d_avatar_13.png" alt="friend2" />
            <span>friend2</span>
            <button className="chat-btn" aria-label="Chat with friend2">💬</button>
            <button className="options-btn" aria-label="Options for friend2">⋮</button>
          </div>
          <div className="friend-card">
            <img src="/images/3d_avatar_16.png" alt="friend3" />
            <span>friend3</span>
            <button className="chat-btn" aria-label="Chat with friend3">💬</button>
            <button className="options-btn" aria-label="Options for friend3">⋮</button>
          </div>
        </div>
      </div>
    </div>
  );
}
