import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/account.css";

export default function Account() {
  const navigate = useNavigate();

  const user = {
    username: "User123",
    email: "user123@email.com",
    bio: "Welcome to Bonfire",
    avatar: "/icons/User.svg",
  };

  const handleLogout = () => {
    alert("You have been logged out.");
    navigate("/"); // redirect to login or home page
  };

  return (
    <div className="account-container">
      <h1 className="title">User Account</h1>

      <div className="account-card">
        <div className="left-section">
          <img src={user.avatar} alt="Profile" className="account-avatar" />
        </div>

        <div className="right-section">
          <label>Username</label>
          <input type="text" value={user.username} readOnly />

          <label>Email</label>
          <input type="text" value={user.email} readOnly />

          <label>Bio</label>
          <textarea value={user.bio} readOnly />
        </div>
      </div>

      {/* Account Buttons */}
      <div className="account-buttons">
        <button className="btn back" onClick={() => navigate("/friends")}>
          ← Back to Friends
        </button>

        <button className="btn edit" onClick={() => navigate("/personalization")}>
          ✎ Edit Profile
        </button>

        <button className="btn info" onClick={() => navigate("/accountinfo")}>
          ⚙️ Change User Info
        </button>

        <button className="btn logout" onClick={handleLogout}>
          🚪 Log Out
        </button>
      </div>
    </div>
  );
}
