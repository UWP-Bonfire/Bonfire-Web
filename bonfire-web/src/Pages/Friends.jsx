import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFriends from "./hooks/useFriends";
import { auth, firestore } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "./hooks/useAuth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import useNotifications from "./hooks/useNotifications";
import useFriendRequests from "./hooks/useFriendRequests";

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
                {/* ✅ public/images/bonfire.png */}
                <img src="/images/bonfire.png" alt={friend.username} />
                {unreadCounts[friend.id] > 0 && (
                  <span className="unread-dot"></span>
                )}
              </div>
              <span>{friend.username}</span>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="settings-btn" onClick={() => navigate("/account")}>
            {/* ✅ public/icons/Settings.svg */}
            <img src="/icons/Settings.svg" alt="Settings" />
          </div>

          <div className="user" onClick={() => navigate("/account")}>
            <img src="/images/bonfire.png" alt="User" />
            <span>{user?.displayName}</span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="main">
        <div className="main-header">
          <h1>Friends Page</h1>

          <div className="header-right">
            {/* Notification Bell */}
            <div className="notif-container">
              <button
                className="notif-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {/* ✅ public/icons/Bell.png */}
                <img src="/icons/Bell.png" alt="Notifications" />
                {friendRequests.length > 0 && (
                  <span className="notif-dot"></span>
                )}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <h3>Notifications</h3>
                  <ul>
                    {friendRequests.map((req) => (
                      <li key={req.id}>
                        New friend request from {req.fromName || "Someone"}
                      </li>
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

            <button className="sign-out-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Friend Cards */}
        <div className="friends-container">
          {friends.map((friend) => (
            <div className="friend-card" key={friend.id}>
              <img src="/images/bonfire.png" alt={friend.username} />

              <span>{friend.username}</span>

              <button
                className="chat-btn"
                onClick={() => navigate("/messages")}
              >
                {/* ✅ you have chat_bubble.svg in public/icons */}
                <img src="/icons/chat_bubble.svg" alt="Chat" />
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
