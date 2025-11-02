import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/friends.css";

export default function Friends() {
  const navigate = useNavigate();

  const friends = [
    { name: "friend1", img: "Profile Images/IMG_1843.png" },
    { name: "friend2", img: "Profile Images/IMG_1844.png" },
    { name: "friend3", img: "Profile Images/IMG_1845.png" },
  ];

  const [unread, setUnread] = useState(friends.map((f) => f.name));
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null); 

  const dummyNotifications = [
    { id: 1, text: "✅ Friend1 added you back." },
    { id: 2, text: "👋 User2 wants to be your friend." },
    { id: 3, text: "💬 New message received from Friend3." },
  ];

  const handleOpenChat = (name) => {
    setUnread(unread.filter((f) => f !== name));
    navigate("/messages");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setHasNewNotifications(false);
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Direct Messages</h2>

        <div className="dm-list">
          {friends.map((friend, index) => (
            <div
              className={`dm ${unread.includes(friend.name) ? "unread" : ""}`}
              key={index}
              onClick={() => handleOpenChat(friend.name)}
            >
              <div className="dm-avatar">
                <img src={friend.img} alt={friend.name} />
                {unread.includes(friend.name) && (
                  <span className="unread-dot"></span>
                )}
              </div>
              <span>{friend.name}</span>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="settings-btn" onClick={() => navigate("/account")}>
            <img src="/icons/Settings.svg" alt="Settings" />
          </div>
          <div className="user" onClick={() => navigate("/account")}>
            <img src="/icons/User.svg" alt="User" />
            <span>User123</span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="main">
        <div className="main-header">
          <h1>Friends Page</h1>

          <div className="header-right">
            {/* 🔔 Notification Bell */}
            <div className="notif-container">
              <button className="notif-btn" onClick={toggleNotifications}>
                <img src="/icons/Bell.png" alt="Notifications" />
                {hasNewNotifications && <span className="notif-dot"></span>}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <h3>Notifications</h3>
                  <ul>
                    {dummyNotifications.map((note) => (
                      <li key={note.id}>{note.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              className="add-friend"
              onClick={() => navigate("/addfriends")}
            >
              Add Friend
            </button>
          </div>
        </div>

        {/*Friend Cards  */}
        <div className="friends-container">
          {friends.map((friend, index) => (
            <div className="friend-card" key={index}>
              <img src={friend.img} alt={friend.name} />
              <span>{friend.name}</span>

              <button
                className="chat-btn"
                onClick={() => navigate("/messages")}
              >
                💬
              </button>

              <div
                className="options-wrapper"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <button className="options-btn">⋮</button>

                {/* Show on hover */}
                {hoverIndex === index && (
                  <div className="context-menu">
                   
                    <button className="menu-item">Mute Chat</button>
                    <hr />
                    <button className="menu-item danger">Remove Friend</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
