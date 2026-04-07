/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useMemo } from "react";
import DefaultPFP from "../assets/images/3d_avatar_16.png";
import ArrowIcon from "../assets/images/arrow.png";
import BackIcon from "../assets/images/right-arrow.png";
import GlobalIcon from "../assets/images/3d_avatar_1.png";
import HappyMarsh from "../assets/images/Happy Marsh.png";
import SadMarsh from "../assets/images/sad Marsh.png";
import TiredMarsh from "../assets/images/tired marsh.png";
import YaaayyyMarsh from "../assets/images/YAAAYYY MARSH.png";
import BonfireEmoji from "../assets/images/bonfire.png";
import BonfireRainEmoji from "../assets/images/bonfire_rain.png";
import BonfirePoutEmoji from "../assets/images/bonfire_pout.png";
import BonfireNomEmoji from "../assets/images/bonfire_nom.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import useBlockUser from "./hooks/useBlockUser";
import useChat from "./hooks/useChat";
import useFriends from "./hooks/useFriends";
import "../Styles/messages.css";
import useImageUpload from "./hooks/useImageUpload.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../firebase.js";

const DEFAULT_PFP = DefaultPFP;
const SEND_ICON = ArrowIcon;
const BACK_ICON = BackIcon;
const GLOBAL_ICON = GlobalIcon;

const safeName = (obj) => obj?.name || obj?.username || obj?.displayName || "Anonymous";
const safeAvatar = (obj) => obj?.avatar || obj?.profileImage || DEFAULT_PFP;

function handleUnreadSnapshot(friend, setUnreadCounts) {
  return function (snapshot) {
    setUnreadCounts((prev) => ({
      ...prev,
      [friend.id]: snapshot.size,
    }));
  };
}

/* =========================
   Message Input (TEXT + IMAGE + VOICE)
========================= */
const MessageInput = ({ onSendMessage, onSendImage, onSendVoice }) => {
  const [newMessage, setNewMessage] = useState("");
  const [showMarshPicker, setShowMarshPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingNotification, setRecordingNotification] = useState("");
  const { uploadImage } = useImageUpload();
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const marshList = [
    { id: "marsh1", src: HappyMarsh, label: "Happy Marsh" },
    { id: "marsh2", src: SadMarsh, label: "Sad Marsh" },
    { id: "marsh3", src: TiredMarsh, label: "Tired Marsh" },
    { id: "marsh4", src: YaaayyyMarsh, label: "YAAAYYY Marsh" },
    { id: "bonfire1", src: BonfireEmoji, label: "Bonfire" },
    { id: "bonfire2", src: BonfireRainEmoji, label: "Bonfire Rain" },
    { id: "bonfire3", src: BonfirePoutEmoji, label: "Bonfire Pout" },
    { id: "bonfire4", src: BonfireNomEmoji, label: "Bonfire Nom" },
  ];

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

    if (text) {
      onSendMessage(text);
      setNewMessage("");
      return;
    }

    fileRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

    await onSendImage(file);
    e.target.value = "";
  };

  const handleMarshClick = async (marsh) => {
    if (typeof onSendImage !== "function") {
      console.error("onSendImage is not a function");
      return;
    }

    try {
      const response = await fetch(marsh.src);
      const blob = await response.blob();
      const file = new File([blob], `${marsh.label}.png`, { type: "image/png" });
      await onSendImage(file);
      setShowMarshPicker(false);
    } catch (err) {
      console.error("Failed to send marsh image", err);
    }
  };

  const stopTracks = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  return (
    <div className="message-input-wrapper">
      {recordingNotification && (
        <div style={{ color: "#ff5252", marginBottom: 8, fontWeight: 600 }}>
          {recordingNotification}
        </div>
      )}

      {showMarshPicker && (
        <div className="marsh-picker">
          {marshList.map((marsh) => (
            <button
              key={marsh.id}
              type="button"
              className="marsh-option"
              onClick={() => handleMarshClick(marsh)}
              title={marsh.label}
            >
              <img src={marsh.src} alt={marsh.label} style={{ width: 32, height: 32 }} />
            </button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={handleSend} style={{ display: "flex", alignItems: "center" }}>
        <button
          type="button"
          className="icon-btn marsh-btn"
          onClick={() => setShowMarshPicker((prev) => !prev)}
          aria-label="Open marsh images"
        >
          <img src={HappyMarsh} alt="Marsh" style={{ width: 24, height: 24 }} />
        </button>

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

        <div className="icon-group" style={{ display: "flex", alignItems: "center" }}>
          <button className="icon-btn send-btn" type="submit">
            <img src={SEND_ICON} alt="Send" />
          </button>

          <button
            type="button"
            className="voice-btn"
            style={{
              marginLeft: "8px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: isRecording ? "#ff5252" : "#eee",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isRecording ? "0 0 8px #ff5252" : "0 0 4px #aaa",
              cursor: "pointer",
            }}
            aria-label="Record voice message"
            onClick={async () => {
              if (!isRecording) {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  audioStreamRef.current = stream;

                  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm";

                  const recorder = new window.MediaRecorder(stream, { mimeType });
                  audioChunksRef.current = [];
                  setMediaRecorder(recorder);

                  recorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                      audioChunksRef.current.push(e.data);
                    }
                  };

                  recorder.onstart = () => {
                    setRecordingNotification("Recording voice message...");
                    setIsRecording(true);
                  };

                  recorder.onstop = async () => {
                    setRecordingNotification("");
                    setIsRecording(false);

                    if (audioChunksRef.current.length === 0) {
                      audioChunksRef.current = [];
                      stopTracks();
                      return;
                    }

                    const shouldSend = window.confirm("Send this voice message?");
                    if (!shouldSend) {
                      audioChunksRef.current = [];
                      stopTracks();
                      return;
                    }

                    try {
                      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                      const audioFile = new File([audioBlob], "voice-message.webm", {
                        type: "audio/webm",
                      });

                      const audioUrl = await uploadImage(audioFile, "Voice_Messages");

                      if (audioUrl && typeof onSendVoice === "function") {
                        await onSendVoice({
                          audioUrl,
                          audioName: "voice-message.webm",
                          audioType: "audio/webm",
                        });
                      } else {
                        alert("Failed to upload voice message.");
                      }
                    } catch (err) {
                      console.error("Error uploading voice message:", err);
                      alert("Error uploading voice message.");
                    } finally {
                      audioChunksRef.current = [];
                      stopTracks();
                    }
                  };

                  recorder.start();
                } catch (err) {
                  console.error(err);
                  setRecordingNotification("Microphone access denied or unavailable.");
                }
              } else {
                if (mediaRecorder && mediaRecorder.state !== "inactive") {
                  mediaRecorder.stop();
                }
              }
            }}
          >
            <span style={{ fontSize: "22px", color: isRecording ? "white" : "#333" }}>
              🎤
            </span>
          </button>
        </div>
      </form>
    </div>
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

      <div className={`message-bubble ${message.audioUrl ? "audio-message-bubble" : ""}`}>
        <span className="msg-name">{isSent ? user.displayName || "You" : senderName}</span>

        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Sent"
            className="message-image"
          />
        )}

          {message.audioUrl && (
            <div className="message-audio big-audio-bubble">
              <audio
                controls
                preload="metadata"
                className="voice-player"
                src={message.audioUrl}
              />
            </div>
          )}

        {message.emoji && (
          <div className="message-emoji">{message.emoji}</div>
        )}

        {message.text && (
          <div className="message-text">{message.text}</div>
        )}

        <span className="msg-time">
          {formatTime(message.timestamp)}

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
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const { blockedUsers } = useBlockUser();
  const { friends, loading: friendsLoading } = useFriends();

  const myAvatar = userProfile?.avatar || user?.photoURL || DEFAULT_PFP;
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  const blockedIds = useMemo(() => new Set((blockedUsers || []).map((u) => u.id)), [blockedUsers]);

  const normalizedFriends = useMemo(
    () =>
      (friends || [])
        .map((f) => ({
          ...f,
          id: f.id || f.uid,
          name: safeName(f),
          avatar: safeAvatar(f),
        }))
        .filter((f) => !blockedIds.has(f.id)),
    [friends, blockedIds]
  );

  useEffect(() => {
    if (!selectedFriend && location.state?.friendId && normalizedFriends.length > 0) {
      const friendId = location.state.friendId;
      const found = normalizedFriends.find((f) => f.id === friendId);
      if (found) setSelectedFriend(found);
    }
  }, [normalizedFriends, selectedFriend, location.state]);

  // Clear the selected friend if they become blocked
  useEffect(() => {
    if (selectedFriend && blockedIds.has(selectedFriend.id)) {
      setSelectedFriend(null);
    }
  }, [selectedFriend, blockedIds]);

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

      return onSnapshot(q, handleUnreadSnapshot(friend, setUnreadCounts));
    });

    return () => unsubscribes.forEach((u) => u());
  }, [normalizedFriends, user]);

  const handleBack = () => navigate("/friends");

  function markUnreadMessages(messages, user, markMessageAsRead) {
    if (!messages?.length) return;

    messages.forEach((m) => {
      if (m.senderId !== user.uid && !m.read) {
        const idToMark = m.id || m.docId || m.messageId;
        if (idToMark) markMessageAsRead(idToMark);
      }
    });
  }

  const ChatView = ({ friend }) => {
    const isGlobalChat = friend.id === "global";

    const {
      messages,
      loading: messagesLoading,
      sendMessage,
      userProfiles,
      markMessageAsRead,
    } = useChat(friend.id);

    const { uploadImage, isUploading, error } = useImageUpload();

    const chatId = [user.uid, friend.id].sort().join("_");

    const sendImageOnly = async (file) => {
      if (!file || !user || !friend?.id) return;
      if (!file.type?.startsWith("image/")) return;

      const messagesPath = isGlobalChat
        ? "messages"
        : `chats/${getChatId(user.uid, friend.id)}/messages`;

      try {
        const imageUrl = await uploadImage(file);
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

    const sendVoiceOnly = async ({ audioUrl, audioName, audioType }) => {
      if (!audioUrl || !user || !friend?.id) return;

      const messagesPath = isGlobalChat
        ? "messages"
        : `chats/${getChatId(user.uid, friend.id)}/messages`;

      try {
        const messagesRef = collection(firestore, messagesPath);

        await addDoc(messagesRef, {
          text: "",
          audioUrl,
          audioName: audioName || "voice-message.webm",
          audioType: audioType || "audio/webm",
          timestamp: serverTimestamp(),
          senderId: user.uid,
          displayName: userProfile?.name || user?.displayName || "Anonymous",
          photoURL: userProfile?.avatar || user?.photoURL || DEFAULT_PFP,
          read: false,
        });
      } catch (err) {
        console.error("Error sending voice message:", err);
      }
    };

    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      markUnreadMessages(messages, user, markMessageAsRead);
    }, [messages, user?.uid, markMessageAsRead]);

    return (
      <>
        <div className="chat-header" style={{ justifyContent: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={friend.avatar}
              alt={friend.name}
              className="chat-header-avatar"
              onError={(e) => (e.currentTarget.src = DEFAULT_PFP)}
            />
            <span>{isGlobalChat ? "Global Chat Room" : `Chat with ${friend.name}`}</span>
          </div>
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
          <MessageInput
            onSendMessage={sendMessage}
            onSendImage={sendImageOnly}
            onSendVoice={sendVoiceOnly}
          />
        </div>
      </>
    );
  };

  return (
    <div className="messages-container">
      <aside className="sidebar">
        <button className="messages-back-btn" onClick={handleBack} style={{marginBottom: 8, marginTop: 8}}>
          <img src={BACK_ICON} alt="Back" />
        </button>
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
                tabIndex={0}
                role="button"
                aria-label={`Open chat with ${friend.name}`}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedFriend(friend);
                  }
                }}
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