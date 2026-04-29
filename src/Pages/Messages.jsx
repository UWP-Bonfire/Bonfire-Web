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
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../firebase.js";

const DEFAULT_PFP = DefaultPFP;
const SEND_ICON = ArrowIcon;
const BACK_ICON = BackIcon;
const GLOBAL_ICON = GlobalIcon;
const DEFAULT_GROUP_ICON = 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a';
const CHAT_TYPES = {
  DIRECT: "direct",
  GROUP: "group",
  GLOBAL: "global",
};

const safeName = (obj) => obj?.name || obj?.username || obj?.displayName || "Anonymous";
const safeAvatar = (obj) => obj?.avatar || obj?.profileImage || DEFAULT_PFP;
const getDirectChatId = (uid1, uid2) => [uid1, uid2].sort((left, right) => left.localeCompare(right)).join("_");
const resolveChatType = (target) => {
  if (typeof target !== "string") {
    return target?.type || CHAT_TYPES.DIRECT;
  }

  if (target === CHAT_TYPES.GLOBAL) {
    return CHAT_TYPES.GLOBAL;
  }

  return CHAT_TYPES.DIRECT;
};
const getMessagesPath = (userId, target) => {
  const targetId = typeof target === "string" ? target : target?.id;
  const targetType = resolveChatType(target);

  if (!targetId) return null;
  if (targetType === CHAT_TYPES.GLOBAL || targetId === CHAT_TYPES.GLOBAL) return "messages";
  if (targetType === CHAT_TYPES.GROUP) return `groupChats/${targetId}/messages`;
  return `chats/${getDirectChatId(userId, targetId)}/messages`;
};

function handleUnreadSnapshot(friend, setUnreadCounts) {
  return function (snapshot) {
    setUnreadCounts((prev) => ({
      ...prev,
      [friend.id]: snapshot.size,
    }));
  };
}


const CreateGroupChatModal = ({ friends, onClose, onCreate, isCreating, createError }) => {
  const { userProfile } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [is18Plus, setIs18Plus] = useState(false);
  const [show18PlusPrompt, setShow18PlusPrompt] = useState(false);

  const filteredFriends = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return friends;
    return friends.filter((friend) => friend.name.toLowerCase().includes(normalizedSearch));
  }, [friends, searchValue]);

  const toggleFriend = (friendId) => {
    setSelectedFriendIds((prev) => (
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    ));
  };

  const trimmedGroupName = groupName.trim();
  const canCreate = trimmedGroupName.length > 0 && selectedFriendIds.length >= 2 && !isCreating;

  const handleCreateClick = async () => {
    setHasSubmitted(true);
    if (!canCreate) return;
    const created = await onCreate({
      name: trimmedGroupName,
      memberIds: selectedFriendIds,
      is18Plus,
    });
    if (created) {
      setGroupName("");
      setSearchValue("");
      setSelectedFriendIds([]);
      setIs18Plus(false);
      setHasSubmitted(false);
    }
  };

  const handle18PlusToggle = (e) => {
    if (!is18Plus && e.target.checked) {
      setShow18PlusPrompt(true);
    } else {
      setIs18Plus(false);
    }
  };

  const confirm18Plus = () => {
    setIs18Plus(true);
    setShow18PlusPrompt(false);
  };
  const cancel18Plus = () => {
    setIs18Plus(false);
    setShow18PlusPrompt(false);
  };

  return (
    <div className="group-chat-modal-overlay">
      <dialog className="group-chat-modal" open aria-labelledby="group-chat-modal-title">
        <div className="group-chat-modal-header">
          <div>
            <h2 id="group-chat-modal-title">Create Group Chat</h2>
            <p>Choose people from your friends list and set up the group layout.</p>
          </div>
          <button
            type="button"
            className="group-chat-modal-close"
            onClick={onClose}
            aria-label="Close create group chat modal"
          >
            ×
          </button>
        </div>


        <div className="group-chat-modal-body">
          {/* 18+ Group Chat Option (only for 18+ users) - moved to top */}
          {userProfile?.isOver18 && (
            <div className="modal-18plus-option modal-18plus-top">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={is18Plus}
                  onChange={handle18PlusToggle}
                />
                Create 18+ groupchat
              </label>
            </div>
          )}
          <label className="group-chat-modal-label" htmlFor="group-chat-name">
            Group Name
          </label>
          <input
            id="group-chat-name"
            className="group-chat-modal-input"
            type="text"
            placeholder="Enter a group name"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
          {hasSubmitted && !trimmedGroupName && (
            <p className="group-chat-modal-error">A group name is required.</p>
          )}
          <label className="group-chat-modal-label" htmlFor="group-chat-search">
            Add Friends
          </label>
          <input
            id="group-chat-search"
            className="group-chat-modal-input"
            type="text"
            placeholder="Search your friends"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />

          <div className="group-chat-modal-summary">
            <span>{selectedFriendIds.length} selected</span>
            <span>{friends.length} available</span>
          </div>

          <div className="group-chat-friend-list">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => {
                const isSelected = selectedFriendIds.includes(friend.id);
                return (
                  <label
                    key={friend.id}
                    className={`group-chat-friend-card ${isSelected ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFriend(friend.id)}
                    />
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_PFP;
                      }}
                    />
                    <span>{friend.name}</span>
                  </label>
                );
              })
            ) : (
              <div className="group-chat-empty-state">No friends match that search.</div>
            )}
          </div>
          {hasSubmitted && selectedFriendIds.length < 2 && (
            <p className="group-chat-modal-error">Choose at least two friends for this group chat.</p>
          )}
          {createError && <p className="group-chat-modal-error">{createError}</p>}
        </div>

        <div className="group-chat-modal-actions">
          <button type="button" className="group-chat-secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="group-chat-primary-btn" disabled={!canCreate} onClick={handleCreateClick}>
            {isCreating ? "Creating..." : "Create Group Chat"}
          </button>
        </div>

        {/* 18+ Prompt Dialog */}
        {show18PlusPrompt && (
          <div className="modal-18plus-warning-overlay">
            <div className="modal-18plus-warning-box">
              <h3>18+ Group Chat</h3>
              <p>
                You are designating this group chat for mature content. Anyone under the age of 18 will be removed upon attempting to open the chat. Are you sure you want to enable 18+ mode?
              </p>
              <div className="modal-18plus-warning-actions">
                <button onClick={confirm18Plus} className="confirm-btn">Yes, Enable 18+ Mode</button>
                <button onClick={cancel18Plus} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
};

/* =========================
   Message Input (TEXT + IMAGE + VOICE)
========================= */
const MessageInput = ({ onSendMessage, onSendImage, onSendVoice }) => {
  const [newMessage, setNewMessage] = useState("");
  const [showMarshPicker, setShowMarshPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingNotification, setRecordingNotification] = useState("");
  const [showSpoilerToggle, setShowSpoilerToggle] = useState(false);
  const [spoilerChecked, setSpoilerChecked] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
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
      setShowSpoilerToggle(false);
      setImagePreviewUrl("");
      return;
    }

    setShowSpoilerToggle(true);
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    // Store file in ref for sending after toggle
    fileRef.current.fileToSend = file;
  };

  const handleSendImageWithSpoiler = async () => {
    const file = fileRef.current.fileToSend;
    if (!file) return;
    if (typeof onSendImage !== "function") {
      console.error("onSendImage is not a function");
      setShowSpoilerToggle(false);
      fileRef.current.value = "";
      setImagePreviewUrl("");
      return;
    }
    await onSendImage(file, spoilerChecked);
    setShowSpoilerToggle(false);
    setSpoilerChecked(false);
    fileRef.current.value = "";
    fileRef.current.fileToSend = null;
    setImagePreviewUrl("");
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
        <div className="recording-notification">{recordingNotification}</div>
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

      <form className="chat-input" onSubmit={handleSend}>
        <button
          type="button"
          className="icon-btn marsh-btn"
          onClick={() => setShowMarshPicker((prev) => !prev)}
          aria-label="Open marsh images"
        >
          <img src={HappyMarsh} alt="Marsh" className="marsh-btn-img" />
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
        {showSpoilerToggle && (
          <div className="spoiler-toggle-modal">
            {imagePreviewUrl && (
              <div className="spoiler-preview-wrapper">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className={spoilerChecked ? "message-image spoiler-blur" : "message-image"}
                />
                {spoilerChecked && (
                  <div className="spoiler-overlay">
                    <span>This image will be sent as a spoiler</span>
                  </div>
                )}
              </div>
            )}
            <label className="spoiler-checkbox-label">
              <input
                type="checkbox"
                checked={spoilerChecked}
                onChange={e => setSpoilerChecked(e.target.checked)}
              />
              Mark image as spoiler
            </label>
            <button type="button" className="spoiler-send-btn" onClick={handleSendImageWithSpoiler}>
              Send Image
            </button>
            <button type="button" className="spoiler-cancel-btn" onClick={() => { setShowSpoilerToggle(false); setSpoilerChecked(false); fileRef.current.value = ""; fileRef.current.fileToSend = null; setImagePreviewUrl(""); }}>
              Cancel
            </button>
          </div>
        )}

        <div className="icon-group">
          <button className="icon-btn send-btn" type="submit">
            <img src={SEND_ICON} alt="Send" />
          </button>

          <button
            type="button"
            className={isRecording ? "voice-btn recording" : "voice-btn"}
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
  const [showSpoiler, setShowSpoiler] = useState(() => message.spoiler ? true : false);

  useEffect(() => {
    // Reset spoiler state if message changes (e.g., new message sent)
    setShowSpoiler(message.spoiler ? true : false);
  }, [message.imageUrl, message.spoiler]);

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

        {message.imageUrl && message.spoiler ? (
          <div className="spoiler-image-wrapper">
            <img
              src={message.imageUrl}
              alt="Spoiler"
              className={showSpoiler ? "message-image spoiler-blur" : "message-image"}
            />
            {showSpoiler && (
              <div className="spoiler-overlay">
                <span>This image is marked as a spoiler</span>
                <button className="spoiler-reveal-btn" onClick={() => setShowSpoiler(false)}>
                  Reveal
                </button>
              </div>
            )}
          </div>
        ) : message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt="Sent"
            className="message-image"
          />
        ) : null}

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
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupChats, setGroupChats] = useState([]);
  const [groupChatsLoading, setGroupChatsLoading] = useState(true);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupCreateError, setGroupCreateError] = useState("");
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [groupDeleteError, setGroupDeleteError] = useState("");

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
    if (!user) {
      setGroupChats([]);
      setGroupChatsLoading(false);
      return;
    }

    setGroupChatsLoading(true);

    const groupChatsQuery = query(
      collection(firestore, "groupChats"),
      where("memberIds", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      groupChatsQuery,
      (snapshot) => {
        const nextGroups = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            type: CHAT_TYPES.GROUP,
            avatar: docSnap.data().avatar || DEFAULT_GROUP_ICON,
            ...docSnap.data(),
          }))
          .sort((left, right) => (right.createdAt?.seconds || 0) - (left.createdAt?.seconds || 0));

        setGroupChats(nextGroups);
        setGroupChatsLoading(false);
      },
      (error) => {
        console.error("Error loading group chats:", error);
        setGroupChatsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

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

  const handleCreateGroupChat = async ({ name, memberIds, is18Plus }) => {
    if (!user) return false;
    if (!name.trim()) {
      setGroupCreateError("A group name is required.");
      return false;
    }
    if (memberIds.length < 2) {
      setGroupCreateError("Choose at least two friends for this group chat.");
      return false;
    }
    setIsCreatingGroup(true);
    setGroupCreateError("");
    try {
      const uniqueMemberIds = Array.from(new Set([user.uid, ...memberIds]));
      const docRef = await addDoc(collection(firestore, "groupChats"), {
        name: name.trim(),
        memberIds: uniqueMemberIds,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        avatar: DEFAULT_GROUP_ICON,
        type: CHAT_TYPES.GROUP,
        is18Plus: !!is18Plus,
      });
      setSelectedFriend({
        id: docRef.id,
        type: CHAT_TYPES.GROUP,
        name: name.trim(),
        memberIds: uniqueMemberIds,
        avatar: DEFAULT_GROUP_ICON,
        is18Plus: !!is18Plus,
      });
      setShowCreateGroupModal(false);
      return true;
    } catch (error) {
      console.error("Error creating group chat:", error);
      setGroupCreateError("Failed to create the group chat.");
      return false;
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleDeleteGroupChat = async (group) => {
    if (!user || !group?.id || group.type !== CHAT_TYPES.GROUP) {
      return;
    }

    if (group.createdBy !== user.uid) {
      return;
    }

    const shouldDelete = globalThis.confirm(`Delete group chat "${group.name}"? This cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    setIsDeletingGroup(true);
    setGroupDeleteError("");

    try {
      const messagesRef = collection(firestore, "groupChats", group.id, "messages");
      const messagesSnapshot = await getDocs(messagesRef);

      await Promise.all(messagesSnapshot.docs.map((messageDoc) => deleteDoc(messageDoc.ref)));
      await deleteDoc(doc(firestore, "groupChats", group.id));

      if (selectedFriend?.id === group.id) {
        setSelectedFriend(null);
      }
    } catch (error) {
      console.error("Error deleting group chat:", error);
      setGroupDeleteError("Failed to delete the group chat.");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  useEffect(() => {
    if (!user || normalizedFriends.length === 0) return;

    const unsubscribes = normalizedFriends.map((friend) => {
      if (friend.isMuted) return () => {};

      const chatId = getDirectChatId(user.uid, friend.id);
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

  const [hasSeen18PlusWarning, setHasSeen18PlusWarning] = useState({});
  const [showMinor18PlusBlock, setShowMinor18PlusBlock] = useState(false);
  const [pendingRemoveGroupId, setPendingRemoveGroupId] = useState(null);

  const removeUserFromGroup = async (groupId) => {
    if (!user) return;
    try {
      const groupRef = doc(firestore, "groupChats", groupId);
      await updateDoc(groupRef, {
        memberIds: groupChats.find(g => g.id === groupId)?.memberIds?.filter(id => id !== user.uid) || [],
      });
    } catch (err) {
      console.error("Failed to remove user from 18+ group chat", err);
    }
  };

  const ChatView = ({ friend }) => {
    const isGlobalChat = friend.id === CHAT_TYPES.GLOBAL || friend.type === CHAT_TYPES.GLOBAL;
    const isGroupChat = friend.type === CHAT_TYPES.GROUP;
    const is18PlusGroup = isGroupChat && friend.is18Plus;
    const canDeleteGroup = isGroupChat && friend.createdBy === user?.uid;
    let chatType = CHAT_TYPES.DIRECT;
    if (isGlobalChat) {
      chatType = CHAT_TYPES.GLOBAL;
    } else if (isGroupChat) {
      chatType = CHAT_TYPES.GROUP;
    }
    const chatTarget = {
      id: friend.id,
      type: chatType,
    };

    const {
      messages,
      loading: messagesLoading,
      sendMessage,
      userProfiles,
      markMessageAsRead,
    } = useChat(chatTarget);

    const { uploadImage, isUploading, error } = useImageUpload();
    const memberCount = isGroupChat ? Math.max((friend.memberIds?.length || 1) - 1, 0) : 0;

    const sendImageOnly = async (file, spoiler = false) => {
      if (!file || !user || !friend?.id) return;
      if (!file.type?.startsWith("image/")) return;

      const messagesPath = getMessagesPath(user.uid, chatTarget);
      if (!messagesPath) return;

      try {
        const imageUrl = await uploadImage(file);
        if (!imageUrl) return;

        const messagesRef = collection(firestore, messagesPath);

        await addDoc(messagesRef, {
          text: "",
          imageUrl,
          spoiler: !!spoiler,
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

      const messagesPath = getMessagesPath(user.uid, chatTarget);
      if (!messagesPath) return;

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
    const [isPinned, setIsPinned] = useState(false);

    useEffect(() => {
      if (!user || !friend?.id || isGlobalChat || isGroupChat) {
        setIsPinned(false);
        return;
      }

      const chatId = getDirectChatId(user.uid, friend.id);
      const chatRef = doc(firestore, "chats", chatId);
      const unsubscribe = onSnapshot(chatRef, (chatSnap) => {
        setIsPinned(chatSnap.exists() && chatSnap.data()?.pinned === true);
      });

      return () => unsubscribe();
    }, [user, friend?.id, isGroupChat, isGlobalChat]);

    const togglePinnedChat = async () => {
      if (!user || !friend?.id || isGlobalChat || isGroupChat) return;

      const chatId = getDirectChatId(user.uid, friend.id);
      const chatRef = doc(firestore, "chats", chatId);

      try {
        const chatSnap = await getDoc(chatRef);
        const nextPinned = !isPinned;

        if (!chatSnap.exists()) {
          await setDoc(
            chatRef,
            {
              users: [user.uid, friend.id],
              consecutiveUnread: { [user.uid]: 0, [friend.id]: 0 },
              pinned: nextPinned,
            },
            { merge: true }
          );
        } else {
          await updateDoc(chatRef, { pinned: nextPinned });
        }
      } catch (err) {
        console.error("Error toggling favorite chat:", err);
      }
    };



    // 18+ group chat entry logic
    useEffect(() => {
      if (!is18PlusGroup) return;
      if (!userProfile) return;

      // Under 18: always block and show overlay, then remove
      if (!userProfile.isOver18) {
        setShowMinor18PlusBlock(true);
        setPendingRemoveGroupId(friend.id);
        return;
      }

      // Over 18: only show warning once per group
      if (hasSeen18PlusWarning[friend.id]) return;
      const proceed = window.confirm("This group chat is designated for mature content (18+). Do you wish to proceed? If you decline, you will be removed from this chat.");
      if (proceed) {
        setHasSeen18PlusWarning((prev) => ({ ...prev, [friend.id]: true }));
      } else {
        removeUserFromGroup(friend.id);
        setSelectedFriend(null);
        setHasSeen18PlusWarning((prev) => ({ ...prev, [friend.id]: true }));
      }
    }, [is18PlusGroup, userProfile, friend.id]);

    // Remove minor from group after showing overlay
    useEffect(() => {
      if (showMinor18PlusBlock && pendingRemoveGroupId) {
        const timer = setTimeout(() => {
          removeUserFromGroup(pendingRemoveGroupId);
          setSelectedFriend(null);
          setHasSeen18PlusWarning((prev) => ({ ...prev, [pendingRemoveGroupId]: true }));
          setShowMinor18PlusBlock(false);
          setPendingRemoveGroupId(null);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }, [showMinor18PlusBlock, pendingRemoveGroupId]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      markUnreadMessages(messages, user, markMessageAsRead);
    }, [messages, user?.uid, markMessageAsRead]);

    return (
      <>
        {showMinor18PlusBlock && (
          <div className="modal-18plus-warning-overlay">
            <div className="modal-18plus-warning-box">
              <h3>18+ Group Chat</h3>
              <p>This group chat is designated for mature content. You are under 18 and will be removed from this chat.</p>
            </div>
          </div>
        )}
        <div className={showMinor18PlusBlock ? "chat-header chat-header-row blur-on-18plus" : "chat-header chat-header-row"}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={friend.avatar}
              alt={friend.name}
              className="chat-header-avatar"
              onError={(e) => (e.currentTarget.src = DEFAULT_PFP)}
            />
            <div className="chat-header-copy">
              <span>{isGlobalChat ? "Global Chat Room" : (isGroupChat ? friend.name : `Chat with ${friend.name}`)}</span>
              {isGroupChat && <small>{memberCount} friend{memberCount === 1 ? "" : "s"} added</small>}
            </div>
          </div>

          {!isGroupChat && !isGlobalChat && (
            <button
              type="button"
              className={`favorite-chat-btn ${isPinned ? "pinned" : ""}`}
              onClick={togglePinnedChat}
              aria-label={isPinned ? "Unfavorite chat" : "Favorite chat"}
            >
              {isPinned ? "★ Favorited" : "☆ Favorite"}
            </button>
          )}

          {canDeleteGroup && (
            <button
              type="button"
              className="delete-group-btn"
              onClick={() => handleDeleteGroupChat(friend)}
              disabled={isDeletingGroup}
            >
              {isDeletingGroup ? "Deleting..." : "Delete Group Chat"}
            </button>
          )}
        </div>

        <div className={showMinor18PlusBlock ? "chat-body blur-on-18plus" : "chat-body"}>
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

        {groupDeleteError && <div style={{ color: "brown", padding: "6px 0" }}>{groupDeleteError}</div>}
        {error && <div style={{ color: "brown", padding: "6px 0" }}>{error}</div>}
        {isUploading && <div style={{ padding: "6px 0" }}>Uploading image...</div>}

        <div className={showMinor18PlusBlock ? "input-box blur-on-18plus" : "input-box"}>
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
            <>
              {normalizedFriends.map((friend) => (
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
              ))}

              {groupChatsLoading ? (
                <div className="group-chat-empty-state">Loading group chats...</div>
              ) : groupChats.length > 0 ? (
                groupChats.map((group) => (
                  <div
                    className={`dm ${selectedFriend?.id === group.id ? "active" : ""}`}
                    key={group.id}
                    onClick={() => setSelectedFriend(group)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open group chat ${group.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedFriend(group);
                      }
                    }}
                  >
                    <img
                      src={group.avatar || DEFAULT_GROUP_ICON}
                      alt={group.name}
                      onError={(e) => (e.currentTarget.src = DEFAULT_GROUP_ICON)}
                    />
                    <div className="group-chat-sidebar-copy">
                      <span>{group.name}</span>
                      <small>{Math.max((group.memberIds?.length || 1) - 1, 0)} friends</small>
                    </div>
                  </div>
                ))
              ) : null}
            </>
          )}
        </div>

        <button className="create-group" onClick={() => setShowCreateGroupModal(true)}>
          + Create Group Chat
        </button>

        <button
          className="create-group"
          onClick={() =>
            setSelectedFriend({
              id: CHAT_TYPES.GLOBAL,
              type: CHAT_TYPES.GLOBAL,
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

      {showCreateGroupModal && (
        <CreateGroupChatModal
          friends={normalizedFriends}
          onClose={() => setShowCreateGroupModal(false)}
          onCreate={handleCreateGroupChat}
          isCreating={isCreatingGroup}
          createError={groupCreateError}
        />
      )}
    </div>
  );
}