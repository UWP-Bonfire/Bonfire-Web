import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './hooks/useAuth';
import '../Styles/addfriends.css';



function AddFriends() {
    // State and hooks
    const { user: currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Navigation handler
    const handleGoBack = () => navigate("/friends");

    // Search handler
    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setSearchResults([]);
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) {
            setError("Please enter a username to search.");
            return;
        }
        try {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("name", "==", trimmedQuery));
            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((user) => user.id !== currentUser.uid);
            setSearchResults(users);
            if (users.length === 0) {
                setMessage("No users found with that exact username.");
            }
        } catch (err) {
            console.error("Error searching for users:", err);
            setError("Failed to search for users.");
        }
    };

    // Friend request handler
    const handleSendRequest = async (recipient) => {
        setMessage("");
        setError("");
        try {
            const recipientId = recipient.id;
            const requestId = `${currentUser.uid}_${recipientId}`;
            const requestRef = doc(firestore, "friendRequests", requestId);
            await setDoc(requestRef, {
                from: currentUser.uid,
                to: recipientId,
                status: "pending",
                createdAt: serverTimestamp(),
            });
            setMessage(`Friend request sent successfully to ${recipient.name}!`);
        } catch (err) {
            console.error("Error sending friend request:", err);
            setError("Failed to send friend request.");
        }
    };

    // Render
    return (
        <div className="addfriends-container">
            <h1 className="page-title">Connect with Others</h1>
            <div className="search-bar">
                <form onSubmit={handleSearch} autoComplete="off">
                    <label htmlFor="addfriends-search" className="visually-hidden">
                        Username search
                    </label>
                    <input
                        id="addfriends-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter a username"
                        aria-label="Username search"
                        autoFocus
                    />
                </form>
            </div>
            {message && <output className="no-results">{message}</output>}
            {error && <p className="no-results" role="alert">{error}</p>}

            <div className="friends-list">
                {searchResults.map((user) => (
                    <div key={user.id} className="friend-card">
                        <img
                            src={user.avatar || "/images/default-avatar.png"}
                            alt={user.name}
                            className="friend-avatar"
                            loading="lazy"
                        />
                        <span className="friend-name">{user.name}</span>
                        <button
                            onClick={() => handleSendRequest(user)}
                            className="add-btn"
                            aria-label={`Send friend request to ${user.name}`}
                        >
                            Send Request
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={handleGoBack} className="back-btn">
                <span>Back to Home</span>
            </button>
        </div>
    );
}

export default AddFriends;
