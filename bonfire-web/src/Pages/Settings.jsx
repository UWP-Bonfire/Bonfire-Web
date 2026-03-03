import { useNavigate } from "react-router-dom";
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
        {blockedUsers.map((userId) => (
          <div className="friend-card" key={userId}>
            <div className="friend-info">
              <span className="friend-name">{userId}</span>
            </div>

            <div className="friend-actions">
              <button type="button" onClick={() => unblockUser(userId)}>
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

  const handleBack = () => {
    navigate("/friends");
  };

  return (
    <div className="settings-bg-gradient">
      <div className="settings-container">
        <h2>Settings</h2>
        <button type="button" onClick={handleBack} className="back-btn">
          <span>Back to Friends</span>
        </button>
        <BlockedUsers />
      </div>
    </div>
  );
};

export default Settings;