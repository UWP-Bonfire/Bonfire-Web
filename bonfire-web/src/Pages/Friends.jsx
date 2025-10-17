import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/friends.css";

export default function Friends() {
  const navigate = useNavigate();

  const friends = [
    { name: "friend1", img: "/images/3d_avatar_1.png" },
    { name: "friend2", img: "/images/3d_avatar_13.png" },
    { name: "friend3", img: "/images/3d_avatar_16.png" },
  ];

  return (
    <div className="container">
      {/* Sidebar (Direct Messages Only) */}
      <div className="sidebar">
        <h2>Direct Messages</h2>

        <div className="dm-list">
          {friends.map((friend, index) => (
            <div
              className="dm"
              key={index}
              onClick={() => navigate("/messages")} // 👈 goes to messages page
            >
              <img src={friend.img} alt={friend.name} />
              <span>{friend.name}</span>
            </div>
          ))}
        </div>

        <div className="bottom-section">
          <div className="settings-btn" onClick={() => navigate("/account")}>
            <img src="/icons/Settings.svg" alt="Settings" />
            </div>

          <div className="user" onClick={() => navigate("/profile")}>
            <img src="/icons/User.svg" alt="User" />
            <span>User123</span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="main">
        <div className="main-header">
          <h1>Friends Page</h1>
          <button className="add-friend" onClick={() => navigate("/signin")}>
            Add Friend
          </button>
        </div>

        <div className="friends-container">
          {friends.map((friend, index) => (
            <div className="friend-card" key={index}>
              <img src={friend.img} alt={friend.name} />
              <span>{friend.name}</span>
              <button className="chat-btn" onClick={() => navigate("/messages")}>
                💬
              </button>
              <button className="options-btn">⋮</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
