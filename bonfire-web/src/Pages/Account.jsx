import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 
import { useAuth } from "./hooks/useAuth";
import "../Styles/account.css"; 

export default function Account() {
  const navigate = useNavigate();
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="account-container">Loading Profile...</div>;
  }

  if (!userProfile) {
    return (
      <div className="account-container">
        Could not load user profile. Please log in again.
      </div>
    );
  }

  const displayName = userProfile.displayName || "User12";
  const email = userProfile.email || auth?.currentUser?.email || "No email";
  const bio = userProfile.bio || "Welcome to Bonfire!";

  const avatar =
    userProfile.avatar?.startsWith("/") // already a public path
      ? userProfile.avatar
      : "/icons/User.svg"; // fallback (public/icons/User.svg)

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      sessionStorage.clear();
      localStorage.clear();
      navigate("/");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <div className="account-container">
      <h1 className="title">User Account</h1>

      <div className="account-card">
        <div className="left-section">
          <img
            src={avatar}
            alt="Profile"
            className="account-avatar"
            onError={(e) => {
              // if avatar path is broken, fall back automatically
              e.currentTarget.src = "/icons/User.svg";
            }}
          />
        </div>

        <div className="right-section">
          <label>Username</label>
          <input type="text" value={displayName} readOnly />

          <label>Email</label>
          <input type="text" value={email} readOnly />

          <label>Bio</label>
          <textarea value={bio} readOnly />
        </div>
      </div>

      <div className="account-buttons">
        {/* ✅ choose ONE routing style based on your app */}
        <button className="btn back" onClick={() => navigate("/friends")}>
          ← Back to Friends
        </button>

        <button className="btn edit" onClick={() => navigate("/personalization")}>
          ✎ Edit Profile
        </button>

        <button className="btn logout" onClick={handleLogout}>
          🚪 Log Out
        </button>
      </div>
    </div>
  );
}
