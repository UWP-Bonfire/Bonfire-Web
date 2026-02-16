import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useFriends from "./hooks/useFriends";
import useFriendRequests from "./hooks/useFriendRequests";
import { useAuth } from "./hooks/useAuth";
import useNotifications from "./hooks/useNotifications";

import { auth, firestore } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// ✅ keep your CSS file
import "../Styles/friends.css";

export default function Friends() {
  const navigate = useNavigate();

  const { friends, loading, error } = useFriends();
  const { user } = useAuth();

  const { requestPermission } = useNotifications();

  const { requests: friendRequests } = useFriendRequests();

  const [unreadCounts, setUnreadCounts] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // unread message dots in sidebar
  useEffect(() => {
    if (!user || friends.length === 0) return;

    const unsubscribes = friends.map((friend) => {
      const chatId = [user.uid, friend.id].sort().join("_");
      const messagesRef = collection(firestore, "chats", chatId, "messages");
      const q = query(
        messagesRef,
        where("read", "==", false),
        where("senderId", "==", friend.id)
      );

      return onSnapshot(q, (snapshot) => {
        setUnreadCounts((prev) => ({
          ...prev,
          [friend.id]: snapshot.size,
        }));
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [friends, user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (loading) return <div>Loading friends...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Direct Messages</h2>

        <div className="dm-list">
          {friends.map((friend) => (
            <div
              className="dm"
              key={friend.id}
              onClick={() => navigate("/messages")}
            >
              <div className="dm-avatar">
                <img
                  src={friend.avatar || "/images/default-avatar.png"}
                  alt={friend.name}
                  onError={(e) =>
                    (e.currentTarget.src = "/images/default-avatar.png")
                  }
                />
                {unreadCounts[friend.id] > 0 && (
                  <span className="unread-dot"></span>
                )}
              </div>

              <span className="dm-name">{friend.name}</span>
            </div>
          ))}
        </div>

        <div className="bottom-section">
          <div className="settings-btn" onClick={() => navigate("/account")}>
            <img src="/icons/Settings.svg" alt="Settings" />
          </div>

          <div className="user" onClick={() => navigate("/account")}>
            <img src="/images/bonfire.png" alt="User" />
            <span>{user?.displayName}</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        <div className="main-header">
          <h1>Friends Page</h1>

          <div className="header-right">
            {/* Bell notifications kept */}
            <div className="notif-container">
              <button
                className="notif-btn"
                onClick={() => setShowNotifications((s) => !s)}
              >
                <img src="/icons/Bell.png" alt="Notifications" />
                {friendRequests.length > 0 && (
                  <span className="notif-dot"></span>
                )}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <h3>Notifications</h3>
                  <ul>
                    {friendRequests.length === 0 ? (
                      <li>No new notifications</li>
                    ) : (
                      friendRequests.map((req) => (
                        <li key={req.id}>
                          New friend request from {req.fromName || "Someone"}
                        </li>
                      ))
                    )}
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

            <button className="sign-out-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Friends list */}
        <div className="friends-container">
          {friends.map((friend) => (
            <div className="friend-card" key={friend.id}>
              <img
                src={friend.avatar || "/images/default-avatar.png"}
                alt={friend.name}
                onError={(e) =>
                  (e.currentTarget.src = "/images/default-avatar.png")
                }
              />

              <span>{friend.name}</span>

              <button className="chat-btn" onClick={() => navigate("/messages")}>
                💬
              </button>

              <div className="options-wrapper">
                <button className="options-btn">⋮</button>
                <div className="context-menu">
                  <button className="menu-item">Mute Chat</button>
                  <hr />
                  <button className="menu-item danger">Remove Friend</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
