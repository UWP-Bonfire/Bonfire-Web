import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "./hooks/useAuth";
import useBlockUser from "./hooks/useBlockUser";
import "../Styles/settings.css";


const BlockedUsers = () => {
  const { blockedUsers, unblockUser } = useBlockUser();

  if (!blockedUsers || blockedUsers.length === 0) {
    return <p>No blocked users.</p>;
  }

  return (
    <div className="blocked-users-container">
      <h2>Blocked Users</h2>

      <div className="friends-container">
        {blockedUsers.map((user) => (
          <div className="friend-card" key={user.id}>
            <div className="friend-info">
              <span className="friend-name">{user.name}</span>
            </div>

            <div className="friend-actions">
              <button type="button" onClick={() => unblockUser(user.id)}>
                Unblock
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (userProfile?.stylePreference) {
      setTheme(userProfile.stylePreference);
    } else {
      setTheme("light");
    }
  }, [userProfile]);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);

  const handleBack = () => {
    navigate("/friends");
  };

  const handleThemeToggle = async () => {
    const newPreference = theme === "dark" ? "light" : "dark";
    setTheme(newPreference);

    if (user?.uid) {
      try {
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, { stylePreference: newPreference });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="settings-bg-gradient">
      <div className="settings-container">
        <h2>Settings</h2>
        <button type="button" onClick={handleBack} className="back-btn">
          <span>Back to Friends</span>
        </button>

        <div className="settings-section theme-section">
          <h2>Theme Preference</h2>
          <p>Toggle between light and dark mode. Your choice is saved to your profile.</p>
          <div className="theme-toggle-row">
            <span>Light</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isDark}
                onChange={handleThemeToggle}
                disabled={!user}
              />
              <span className="slider round" />
            </label>
            <span>Dark</span>
          </div>
        </div>

        <BlockedUsers />
      </div>
    </div>
  );
};

export default Settings;