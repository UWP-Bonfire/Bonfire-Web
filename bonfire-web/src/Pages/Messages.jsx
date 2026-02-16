import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import useChat from "./hooks/useChat";
import useFriends from "./hooks/useFriends";
import "../Styles/messages.css";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase.js";

const DEFAULT_PFP = "/images/Default PFP.jpg";
const SEND_ICON = "/images/arrow.png";
const ATTACH_ICON = "/images/message.png";
const BACK_ICON = "/images/right-arrow.png";
const GLOBAL_ICON = "/images/icon11.png";

const safeName = (obj) => obj?.name || obj?.username || obj?.displayName || "Anonymous";
const safeAvatar = (obj) => obj?.avatar || obj?.profileImage || DEFAULT_PFP;

/* =========================
   Message Input
========================= */
const MessageInput = ({ onSendMessage }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text) return;
    onSendMessage(text);
    setNewMessage("");
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />

      <div className="icon-group">
        <button className="icon-btn attach-btn" type="button">
          <img src={ATTACH_ICON} alt="Add" />
        </button>

        <button className="icon-btn send-btn" type="submit">
          <img src={SEND_ICON} alt="Send" />
        </button>
      </div>
    </form>
  );
};

/* =========================
   Message Row
========================= */
const MessageRow = ({ message, user, userProfiles, myAvatar, isLast, isGlobalChat }) => {
  const isSent = message.senderId === user.uid;

  const senderProfile = userProfiles?.[message.senderId];
  const senderName = safeName(senderProfile);
  const senderAvatar = safeAvatar(senderProfile);

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`message-row ${isSent ? "sent" : "received"}`}>
      <img
        src={isSent ? myAvatar : senderAvatar}
        alt={senderName}
        className="msg-avatar"
        onError={(e) => (e.currentTarget.src = DEFAULT_PFP)}
      />

      <div className="message-bubble">
        <span className="msg-name">{isSent ? (user.displayName || "You") : senderName}</span>
        <div className="message-text">{message.text}</div>

        <span className="msg-time">
          {formatTime(message.timestamp)}

          {/* ✅ Read receipt: ✓ (sent) then ✓✓ (read) */}
          {!isGlobalChat && isSent && isLast && (
            <>
              {message.read ? (
                <span className="check blue"> ✓✓ </span>
              ) : (
                <span className="check gray"> ✓ </span>
              )}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default function Messages() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { friends, loading: friendsLoading } = useFriends();

  const myAvatar = userProfile?.avatar || user?.photoURL || DEFAULT_PFP;

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  const normalizedFriends = useMemo(
    () =>
      (friends || []).map((f) => ({
        ...f,
        id: f.id || f.uid,
        name: safeName(f),
        avatar: safeAvatar(f),
      })),
    [friends]
  );

  useEffect(() => {
    if (!user || normalizedFriends.length === 0) return;

    const unsubscribes = normalizedFriends.map((friend) => {
      if (friend.isMuted) return () => {};

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

    return () => unsubscribes.forEach((u) => u());
  }, [normalizedFriends, user]);

  const handleBack = () => navigate("/friends");

  const ChatView = ({ friend }) => {
    const isGlobalChat = friend.id === "global";

    const { messages, loading: messagesLoading, sendMessage, userProfiles, markMessageAsRead } =
      useChat(friend.id);

    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });

      // ✅ IMPORTANT: mark unread incoming messages as read using the correct id
      if (messages?.length) {
        messages.forEach((m) => {
          if (m.senderId !== user.uid && !m.read) {
            const idToMark = m.id || m.docId || m.messageId;
            if (idToMark) markMessageAsRead(idToMark);
          }
        });
      }
    }, [messages, user?.uid, markMessageAsRead]);

    return (
      <>
        <div className="chat-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={friend.avatar}
              alt={friend.name}
              className="chat-header-avatar"
              onError={(e) => (e.currentTarget.src = DEFAULT_PFP)}
            />
            <span>{isGlobalChat ? "Global Chat Room" : `Chat with ${friend.name}`}</span>
          </div>

          <button className="back-btn" onClick={handleBack}>
            <img src={BACK_ICON} alt="Back" />
          </button>
        </div>

        <div className="chat-body">
          {messagesLoading && (!messages || messages.length === 0) ? (
            <div>Loading messages...</div>
          ) : (
            messages.map((message, index) => (
              <MessageRow
                key={message.id || message.docId || message.messageId || index}
                message={message}
                user={user}
                userProfiles={userProfiles}
                myAvatar={myAvatar}
                isLast={index === messages.length - 1}
                isGlobalChat={isGlobalChat}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-box">
          <MessageInput onSendMessage={sendMessage} />
        </div>
      </>
    );
  };

  return (
    <div className="messages-container">
      <aside className="sidebar">
        <h2>Messages</h2>

        <div className="dm-list">
          {friendsLoading ? (
            <div>Loading friends...</div>
          ) : (
            normalizedFriends.map((friend) => (
              <div
                className={`dm ${selectedFriend?.id === friend.id ? "active" : ""}`}
                key={friend.id}
                onClick={() => setSelectedFriend(friend)}
              >
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  onError={(e) => (e.currentTarget.src = DEFAULT_PFP)}
                />
                <span>{friend.name}</span>

                {unreadCounts[friend.id] > 0 && !friend.isMuted && (
                  <span className="unread-count">{unreadCounts[friend.id]}</span>
                )}
              </div>
            ))
          )}
        </div>

        <button className="create-group">+ Create Group Chat</button>

        <button
          className="create-group"
          onClick={() =>
            setSelectedFriend({
              id: "global",
              name: "Global Chat Room",
              avatar: GLOBAL_ICON,
            })
          }
        >
          Global Chat Room
        </button>
      </aside>

      <main className="chat-area">
        {selectedFriend ? (
          <ChatView key={selectedFriend.id} friend={selectedFriend} />
        ) : (
          <div className="no-chat-selected">
            <h2>Select a friend to start a conversation</h2>
          </div>
        )}
      </main>
    </div>
  );
}
