import React, { useState } from "react";
import "../Styles/personalization.css";

export default function Personalization() {
  const [displayName, setDisplayName] = useState("User123");
  const [bio, setBio] = useState("Welcome to Bonfire!");
  const [avatar, setAvatar] = useState("/images/3d_avatar_1.png");
  const [usernameColor, setUsernameColor] = useState("#c84848");
  const [bgColor, setBgColor] = useState("#ffd9ba");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const handleSave = () => {
    alert(`Saved customizations for ${displayName}!`);
  };

  return (
    <div className="personalization-container">
      <h1 className="personalization-title">Account Personalization</h1>

      <div className="personalization-card">
        <div className="section">
          <h2>Profile Picture</h2>
          <img src={avatar} alt="Avatar" className="avatar-preview" />
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="upload-input"
          />
        </div>

        <div className="section">
          <h2>Display Name</h2>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ color: usernameColor }}
          />
        </div>

        <div className="section">
          <h2>Username Color</h2>
          <input
            type="color"
            value={usernameColor}
            onChange={(e) => setUsernameColor(e.target.value)}
          />
        </div>

        <div className="section">
          <h2>Profile Background Color</h2>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>

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

      <div className="preview-card" style={{ backgroundColor: bgColor }}>
        <img src={avatar} alt="Preview Avatar" className="preview-avatar" />
        <h3 style={{ color: usernameColor }}>{displayName}</h3>
        <p>{bio}</p>
      </div>
    </div>
  );
}
