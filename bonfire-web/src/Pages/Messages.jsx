import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import useChat from "./hooks/useChat";
import useFriends from "./hooks/useFriends";
import "../Styles/messages.css"; 

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase.js";

const DEFAULT_PFP = "/images/Default PFP.jpg";
const USER_PFP = "/images/bonfire.png";
const SEND_ICON = "/images/arrow.png";
const ATTACH_ICON = "/images/message.png";
const BACK_ICON = "/images/right-arrow.png";
const GLOBAL_ICON = "/images/icon11.png";

const safeName = (obj) => obj?.name || obj?.username || obj?.displayName || "Anonymous";
const safeAvatar = (obj) => obj?.avatar || obj?.profileImage || DEFAULT_PFP;

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
        <button className="icon-btn attach-btn" type="button" aria-label="Add image">
          <img src={ATTACH_ICON} alt="Add" />
        </button>

        <button className="icon-btn send-btn" type="submit" aria-label="Send message">
          <img src={SEND_ICON} alt="Send" />
        </button>
      </div>
    </form>
  );
};

const MessageRow = ({ message, user, userProfiles, isLast, isGlobalChat }) => {
  const isSent = message.senderId === user.uid;

  const senderProfile = userProfiles?.[message.senderId];
  const senderName = safeName(senderProfile);
  const senderAvatar = safeAvatar(senderProfile);

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const status = message.read ? "read" : "delivered";

  return (
    <div className={`message-row ${isSent ? "sent" : "received"}`}>
      <img
        src={isSent ? USER_PFP : senderAvatar}
        alt={senderName}
        className="msg-avatar"
        onError={(e) => (e.currentTarget.src = DEFAULT_PFP)}
      />

      <div className="message-bubble">
        <span className="msg-name">{senderName}</span>
        <div className="message-text">{message.text}</div>

        <span className="msg-time">
          {formatTime(message.timestamp)}
          {!isGlobalChat && isSent && isLast && (
            <>
              {status === "delivered" && <span className="check gray"> ✓✓ </span>}
              {status === "read" && <span className="check blue"> ✓✓ </span>}
            </>
          )}
        </span>
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

      // mark unread incoming messages as read
      if (messages?.length) {
        messages.forEach((m) => {
          if (m.senderId !== user.uid && !m.read) {
            markMessageAsRead(m.id);
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

          <button className="back-btn" onClick={handleBack} aria-label="Go back">
            <img src={BACK_ICON} alt="Back" />
          </button>
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
      {/* Sidebar */}
      <aside className="sidebar">
  <div className="sidebar-header">
    <button className="back-btn" onClick={handleBack} aria-label="Go back">
      <img src="/images/right-arrow.png" alt="Back" />
    </button>
    <h2>Messages</h2>
  </div>

        <div className="sidebar-icons">
         <div className="dm-list">
          <div className="dm">
            <img src="/images/3d_avatar_1.png" alt="friend1" />
            <span>friend1</span>
          </div>
          <div className="dm">
            <img src="/images/3d_avatar_13.png" alt="friend2" />
            <span>friend2</span>
          </div>
          <div className="dm">
            <img src="/images/3d_avatar_16.png" alt="friend3" />
            <span>friend3</span>
          </div>
        </div>
        </div>
        <button className="create-group">+ Create Group Chat</button>
      </aside>

      {/* Chat Section */}
      <main className="chat-area">
        <div className="chat-header">
          <img
            src="/images/3d_avatar_1.png"
            alt="friend1"
            className="chat-header-avatar"
          />
          <span>Chat with Friend</span>
        </div>

        {/* Chat Body */}
        <div className="chat-body">
          {/* Received message */}
          <div className="message-row received">
            <img
              src="/images/3d_avatar_1.png"
              alt="friend1"
              className="msg-avatar"
            />
            <div className="message-bubble">
              <span className="msg-name">friend1</span>
              <div className="message-text">Hey! How are you?</div>
            </div>
          </div>

          {/* Sent message */}
          <div className="message-row sent">
            <img
              src="/images/3d_avatar_16.png"
              alt="user"
              className="msg-avatar"
            />
            <div className="message-bubble">
              <span className="msg-name">user</span>
              <div className="message-text">Doing great, thanks! You?</div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-box">
          <div className="chat-input">
            <input type="text" placeholder="Type a message..." />

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
      </main>
    </div>
  );
}
