import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import useChat from "./hooks/useChat";
import useFriends from "./hooks/useFriends";
import "../Styles/messages.css";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase.js";

// ✅ public/ icons/images (no imports)
const SEND_ICON = "/icons/Message circle.svg";     // or "/icons/chat_bubble.svg"
const BACK_ICON = "/icons/Users.svg";             // pick one you like, or add a back icon
const DEFAULT_PFP = "/images/Default PFP.jpg";    // make sure this exists in public/images
const GLOBAL_ICON = "/images/icon11.png";         // make sure this exists in public/images

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
      <button type="submit" className="icon-btn send-btn" aria-label="Send message">
        <img src={SEND_ICON} alt="Send" />
      </button>
    </form>
  );
};

const safeName = (obj) => obj?.name || obj?.username || obj?.displayName || "Anonymous";
const safeAvatar = (obj) => obj?.avatar || obj?.profileImage || DEFAULT_PFP;

const MessageRow = ({ message, user, userProfiles, isLast, isGlobalChat }) => {
  const isSent = message.senderId === user.uid;

  const formatTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const senderProfile = userProfiles?.[message.senderId];

  return (
    <div className={`message-row ${isSent ? "sent" : "received"}`}>
      <img
        src={safeAvatar(senderProfile)}
        alt={safeName(senderProfile)}
        className="msg-avatar"
        onError={(e) => (e.currentTarget.src = DEFAULT_PFP)}
      />

      <div className="message-bubble">
        <span className="msg-name">{safeName(senderProfile)}</span>

        <div className="message-text">{message.text}</div>

        <div className="message-meta">
          <span className="timestamp">{formatTimestamp(message.timestamp)}</span>

          {!isGlobalChat && isSent && isLast && (
            <div className={`read-receipt ${message.read ? "read" : "unread"}`}>
              {message.read ? "✓✓" : "✓"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends, loading: friendsLoading } = useFriends();

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // ✅ normalize friend shape so UI works whether you store name/avatar as name/avatar or username/profileImage
  const normalizedFriends = useMemo(
    () =>
      (friends || []).map((f) => ({
        ...f,
        id: f.id || f.uid, // just in case
        name: safeName(f),
        avatar: safeAvatar(f),
      })),
    [friends]
  );

  useEffect(() => {
    if (!user || normalizedFriends.length === 0) return;

    const unsubscribes = normalizedFriends.map((friend) => {
      if (friend.isMuted) {
        setUnreadCounts((prev) => {
          const next = { ...prev };
          delete next[friend.id];
          return next;
        });
        return () => {};
      }

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
  }, [normalizedFriends, user]);

  const handleBack = () => {
    // ✅ pick the route your app actually uses
    navigate("/friends"); // change to "/app/friends" if needed
  };

  const handleFriendClick = (friend) => setSelectedFriend(friend);

  const ChatView = ({ friend }) => {
    // ✅ useChat expects an id
    const { messages, loading: messagesLoading, sendMessage, userProfiles, markMessageAsRead } =
      useChat(friend.id);

    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });

      // mark unread incoming messages as read
      if (messages?.length) {
        messages.forEach((m) => {
          if (m.senderId !== user.uid && !m.read) {
            markMessageAsRead(m.id);
          }
        });
      }
    }, [messages, user?.uid, markMessageAsRead]);

    const isGlobalChat = friend.id === "global";

    return (
      <>
        <div className="chat-header">
          <img
            src={friend.avatar}
            alt={friend.name}
            className="chat-header-avatar"
            onError={(e) => (e.currentTarget.src = DEFAULT_PFP)}
          />
          <span>{isGlobalChat ? "Global Chat Room" : `Chat with ${friend.name}`}</span>
        </div>

        <div className="chat-body">
          {messagesLoading && (!messages || messages.length === 0) ? (
            <div className="loading-messages">Loading messages...</div>
          ) : (
            messages.map((message, index) => (
              <MessageRow
                key={message.id}
                message={message}
                user={user}
                userProfiles={userProfiles}
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
        <div className="sidebar-header">
          <button className="back-btn" onClick={handleBack} aria-label="Go back">
            <img src={BACK_ICON} alt="Back" />
          </button>
          <h2>Messages</h2>
        </div>

        <div className="sidebar-icons">
          <div className="dm-list">
            {friendsLoading ? (
              <div className="loading-friends">Loading friends...</div>
            ) : (
              normalizedFriends.map((friend) => (
                <div
                  className={`dm ${selectedFriend?.id === friend.id ? "active" : ""}`}
                  key={friend.id}
                  onClick={() => handleFriendClick(friend)}
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
        </div>

        <div className="sidebar-bottom-buttons">
          <button
            className="create-group"
            onClick={() =>
              handleFriendClick({ id: "global", name: "Global Chat Room", avatar: GLOBAL_ICON })
            }
          >
            Global Chat Room
          </button>
          <button className="create-group">+ Create Group Chat</button>
        </div>
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
