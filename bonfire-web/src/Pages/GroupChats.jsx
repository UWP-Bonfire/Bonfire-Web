import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/groupchats.css"; 

export default function GroupChats() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Bonfire Team",
      members: ["friend1", "friend2", "friend3"],
      lastMessage: "UI looks great, let's finalize soon!",
    },
    {
      id: 2,
      name: "Gaming Squad",
      members: ["friend4", "friend5", "friend6"],
      lastMessage: "That match last night was insane 😂",
    },
  ]);

  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  // 🔹 Simulated messages with read receipts
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "friend2",
      text: "How’s the site looking?",
      type: "received",
      time: "11:01 AM",
    },
    {
      id: 2,
      sender: "friend3",
      text: "Finished up the CSS sheet!",
      type: "received",
      time: "11:02 AM",
    },
    {
      id: 3,
      sender: "you",
      text: "UI looks great, let's finalize soon!",
      type: "sent",
      time: "11:03 AM",
      status: "sent", // can be sent → delivered → read
    },
  ]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.type === "sent" ? { ...m, status: "delivered" } : m
        )
      );
    }, 2000);

    const timer2 = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.type === "sent" ? { ...m, status: "read" } : m
        )
      );
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const friends = [
    "friend1",
    "friend2",
    "friend3",
    "friend4",
    "friend5",
    "friend6",
    "friend7",
    "friend8",
  ];

  const toggleFriend = (name) => {
    setSelectedFriends((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert("⚠️ Please enter a group name.");
      return;
    }
    if (selectedFriends.length < 2) {
      alert("⚠️ Select at least 2 friends.");
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: groupName.trim(),
      members: selectedFriends,
      lastMessage: "Group created 🎉",
    };

    setGroups((g) => [newGroup, ...g]);
    setSelectedGroup(newGroup);
    setShowModal(false);
    setGroupName("");
    setSearch("");
    setSelectedFriends([]);
  };

  return (
    <div className="groupchats-container">
      {/* Sidebar */}
      <aside className="groupchats-sidebar">
        <div className="sidebar-header">
          <h2>Group Chats</h2>
        </div>

        <div className="groupchats-dm-list">
          {groups.map((group) => (
            <div
              className={`groupchats-dm ${
                selectedGroup.id === group.id ? "unread" : ""
              }`}
              key={group.id}
              onClick={() => setSelectedGroup(group)}
            >
              <img
                src="/Profile Images/IMG_1843.png"
                alt="group"
                className="group-avatar"
              />
              <div className="group-info">
                <span className="group-name">{group.name}</span>
                <p className="group-preview">{group.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          className="groupchats-back-btn"
          onClick={() => navigate("/messages")}
        >
          ← Back to Messages
        </button>
      </aside>

      {/* Main Chat Area */}
      <main className="groupchats-chat-area">
        <div className="groupchats-chat-header">
          <div className="chat-header-info">
            <img
              src="/Profile Images/IMG_1843.png"
              alt="group"
              className="chat-header-avatar"
            />
            <div>
              <span className="chat-group-name">{selectedGroup.name}</span>
              <p className="chat-members">
                {selectedGroup.members.join(", ")}
              </p>
            </div>
          </div>

          <div className="chat-header-actions">
            <button
              className="create-group"
              onClick={() => setShowModal(true)}
            >
              + Create Group Chat
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="groupchats-chat-body">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${
                msg.type === "sent" ? "sent" : "received"
              }`}
            >
              <img
                src={
                  msg.type === "sent"
                    ? "images/bonfire.png"
                    : "/Profile Images/IMG_1844.png"
                }
                alt={msg.sender}
                className="msg-avatar"
              />
              <div className="message-bubble">
                <span className="msg-name">{msg.sender}</span>
                <div className="message-text">{msg.text}</div>

                {/* Read Receipt */}
                {msg.type === "sent" && (
                  <span className="msg-time">
                    {msg.time}{" "}
                    {msg.status === "sent" && (
                      <span className="check gray">✓</span>
                    )}
                    {msg.status === "delivered" && (
                      <span className="check gray">✓✓</span>
                    )}
                    {msg.status === "read" && (
                      <span className="check blue">✓✓</span>
                    )}
                  </span>
                )}

                {msg.type === "received" && (
                  <span className="msg-time">{msg.time}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="groupchats-input-box">
          <div className="chat-input">
            <input type="text" placeholder="Type a message to the group..." />
            <div className="icon-group">
              <button className="icon-btn attach-btn" aria-label="Add image">
                <img src="/images/message.png" alt="Add" />
              </button>
              <button className="icon-btn send-btn" aria-label="Send message">
                <img src="/images/arrow.png" alt="Send" />
              </button>
            </div>
          </div>
        </div>

        {/* Create Group Chat Screen */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2>Create Group Chat</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <p className="mini-sub">
                Select friends to add{" "}
                <strong>({selectedFriends.length}/9)</strong>
              </p>

              <input
                type="text"
                placeholder="Enter group name..."
                className="modal-input"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Search friends..."
                className="modal-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="modal-friends">
                {friends
                  .filter((f) =>
                    f.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((f, i) => {
                    const selected = selectedFriends.includes(f);
                    return (
                      <div
                        key={i}
                        className={`modal-friend ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => {
                          if (!selected && selectedFriends.length >= 9) return;
                          toggleFriend(f);
                        }}
                      >
                        <img
                          src={`/Profile Images/IMG_184${(i % 8) + 3}.png`}
                          alt={f}
                        />
                        <span>{f}</span>
                        {selected && <span className="checkmark">✓</span>}
                      </div>
                    );
                  })}
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handleCreateGroup}>
                  Create Group ({selectedFriends.length}/9)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
