import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "./hooks/useAuth";
import "../Styles/account.css";

const DEFAULT_AVATAR = "/icons/User.svg"; 

export default function Account() {
  const navigate = useNavigate();
  const { userProfile, loading } = useAuth();

  if (loading) return <div className="account-container">Loading Profile...</div>;

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
  const avatar = userProfile.avatar || auth?.currentUser?.photoURL || DEFAULT_AVATAR;

  const handleBack = () => navigate("/friends");
  const handleEdit = () => navigate("/personalization");
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
            onError={e => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="right-section">
          <label htmlFor="account-username">Username</label>
          <input id="account-username" type="text" value={displayName} readOnly />

          <label htmlFor="account-email">Email</label>
          <input id="account-email" type="text" value={email} readOnly />

          <label htmlFor="account-bio">Bio</label>
          <textarea id="account-bio" value={bio} readOnly />
        </div>
      </div>
      <div className="account-buttons">
        <button className="btn back" onClick={handleBack}>
          ← Back to Friends
        </button>
        <button className="btn edit" onClick={handleEdit}>
          ✎ Edit Profile
        </button>
        <button className="btn logout" onClick={handleLogout}>
          🚪 Log Out
        </button>
      </div>
    </div>
  );
}
