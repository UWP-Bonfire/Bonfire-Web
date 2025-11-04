import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/personalization.css";

export default function Personalization() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("User12");
  const [bio, setBio] = useState("Welcome to Bonfire!");
  const [avatar, setAvatar] = useState("/Profile Images/IMG_1843.png");
  const [usernameColor, setUsernameColor] = useState("#c84848");
  const [bgColor, setBgColor] = useState("#ffd9ba");

  const presetAvatars = [
    "Profile Images/IMG_1843.png",
    "Profile Images/IMG_1844.png",
    "Profile Images/IMG_1845.png",
    "Profile Images/IMG_1846.png",
    "Profile Images/IMG_1847.png",
    "Profile Images/IMG_1848.png",
    "Profile Images/IMG_1849.png",
    "Profile Images/IMG_1850.png",
    "Profile Images/IMG_1851.png",
    "Profile Images/IMG_1852.png",
    "Profile Images/IMG_1853.png",
    "Profile Images/IMG_1854.png",
    "Profile Images/IMG_1855.png",
    "Profile Images/IMG_1856.png",
    "Profile Images/IMG_1857.png",
  ];

  const handleSave = () => {
    alert(`Saved customizations for ${displayName}!`);
  };

  return (
    <div className="personalization-container">
      {/*Back Button */}
      <button
        className="back-btn"
        onClick={() => navigate("/account")}
        aria-label="Go back to Account"
      >
        ← Back to Account
      </button>

      <h1 className="personalization-title">Account Personalization</h1>

      {/* ✅ Profile Card Preview (now at the top) */}
      <div className="top-preview-card" style={{ backgroundColor: bgColor }}>
        <img src={avatar} alt="Avatar" className="top-avatar" />
        <h3 style={{ color: usernameColor }}>{displayName}</h3>
        <p>{bio}</p>
      </div>

      {/* Settings below */}
      <div className="personalization-card">
        {/* Profile Picture Selection */}
        <div className="section">
          <h2>Choose Your Profile Picture</h2>
          <div className="avatar-options">
            {presetAvatars.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Avatar ${index + 1}`}
                className={`avatar-choice ${
                  avatar === img ? "selected-avatar" : ""
                }`}
                onClick={() => setAvatar(img)}
              />
            ))}
          </div>
        </div>

        {/* Display Name */}
        <div className="section">
          <h2>Display Name</h2>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ color: usernameColor }}
          />
        </div>

        {/* Username Color */}
        <div className="section">
          <h2>Username Color</h2>
          <input
            type="color"
            value={usernameColor}
            onChange={(e) => setUsernameColor(e.target.value)}
          />
        </div>

        {/* Background Color */}
        <div className="section">
          <h2>Profile Background Color</h2>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>

        {/* Bio */}
        <div className="section">
          <h2>Bio</h2>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
          />
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
