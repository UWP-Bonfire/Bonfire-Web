import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import useChat from "./hooks/useChat";
import useFriends from "./hooks/useFriends";
import "../Styles/messages.css";
import useImageUpload from "./hooks/useImageUpload";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase.js";

const DEFAULT_PFP = "/images/Default PFP.jpg";
const SEND_ICON = "/images/arrow.png";
//const ATTACH_ICON = "/images/message.png";
const BACK_ICON = "/images/right-arrow.png";
const GLOBAL_ICON = "/images/icon11.png";

const safeName = (obj) => obj?.name || obj?.username || obj?.displayName || "Anonymous";
const safeAvatar = (obj) => obj?.avatar || obj?.profileImage || DEFAULT_PFP;

/* =========================
   Message Input (TEXT + IMAGE)
========================= */
const MessageInput = ({ onSendMessage, onSendImage }) => {
  const [newMessage, setNewMessage] = useState("");
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    autoGrow();
  }, [newMessage]);

  const handleSend = (e) => {
    if (e) e.preventDefault();

    const text = typeof newMessage === "string" ? newMessage.trim() : "";

    // ✅ If text exists → send text
    if (text) {
      onSendMessage(text);
      setNewMessage("");
      return;
    }

    // ✅ If no text → open image picker
    fileRef.current?.click();
  };

  // ✅ Enter = send, Shift+Enter = new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(); // send text or open image picker
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      e.target.value = "";
      return;
    }

    if (typeof onSendImage !== "function") {
      console.error("onSendImage is not a function");
      e.target.value = "";
      return;
    }

    await onSendImage(file); // send image separately
    e.target.value = "";
  };

  return (
    <form className="chat-input" onSubmit={handleSend}>
      <textarea
        ref={textareaRef}
        className="chat-textarea"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onInput={autoGrow}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="icon-group">
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
        {message.imageUrl && (
  <img
    src={message.imageUrl}
    alt="Sent"
    className="message-image"
  />
)}

{message.text && (
  <div className="message-text">{message.text}</div>
)}

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


    const { messages, loading: messagesLoading, sendMessage, sendImage, userProfiles, markMessageAsRead } =
  useChat(friend.id);

  const { uploadImage, isUploading, error } = useImageUpload();

const getChatId = (uid1, uid2) => [uid1, uid2].sort().join("_");

const sendImageOnly = async (file) => {
  if (!file || !user || !friend?.id) return;
  if (!file.type?.startsWith("image/")) return;

  console.log("Picked file:", file.name, file.type);

  const isGlobalChat = friend.id === "global";
  const messagesPath = isGlobalChat
    ? "messages"
    : `chats/${getChatId(user.uid, friend.id)}/messages`;

  try {
    const imageUrl = await uploadImage(file);
    console.log("Uploaded URL:", imageUrl);
    if (!imageUrl) return;

    const messagesRef = collection(firestore, messagesPath);

    await addDoc(messagesRef, {
      text: "",
      imageUrl,
      timestamp: serverTimestamp(),
      senderId: user.uid,
      displayName: userProfile?.name || user?.displayName || "Anonymous",
      photoURL: userProfile?.avatar || user?.photoURL || DEFAULT_PFP,
      read: false,
    });
  } catch (err) {
    console.error("Error sending image:", err);
  }
};

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

            {error && <div style={{ color: "brown", padding: "6px 0" }}>{error}</div>}
{isUploading && <div style={{ padding: "6px 0" }}>Uploading image...</div>}

        <div className="input-box">
          <MessageInput onSendMessage={sendMessage} onSendImage={sendImageOnly} />

          
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
