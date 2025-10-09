import React from "react";
import { useNavigate } from "react-router-dom"; 
import "../Styles/friends.css";

export default function Friends() {
  const navigate = useNavigate(); 

  const friends = [
    { name: "friend1", img: "/images/3d_avatar_1.png" },
    { name: "friend2", img: "/images/3d_avatar_13.png" },
    { name: "friend3", img: "/images/3d_avatar_16.png" }
  ];

  const goToFriend1Messages = () => {
    navigate("/messages", { state: { friend: "friend1", img: "/images/3d_avatar_1.png" } });
  };

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
          {/* ✅ Friend1 clickable */}
          <div className="dm" onClick={goToFriend1Messages} role="button">
            <img src="/images/3d_avatar_1.png" alt="friend1" />
            <span>friend1</span>
          </div>

          {/* Other friends not clickable */}
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
          {friends.map((f) => (
            <div className="friend-card" key={f.name}>
              <img src={f.img} alt={f.name} />
              <span>{f.name}</span>

              {/* ✅ Only friend1 navigates to Messages */}
              <button
                className="chat-btn"
                aria-label={`Chat with ${f.name}`}
                onClick={() => {
                  if (f.name === "friend1") goToFriend1Messages();
                }}
              >
                💬
              </button>

              <button
                className="options-btn"
                aria-label={`Options for ${f.name}`}
              >
                ⋮
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
