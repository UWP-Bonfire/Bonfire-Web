import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/addfriends.css";

export default function AddFriends() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([
    { name: "User1", img: "Profile Images/IMG_1843.png", added: false },
    { name: "User2", img: "Profile Images/IMG_1845.png", added: false },
    { name: "User3", img: "Profile Images/IMG_1848.png", added: false },
    { name: "User4", img: "Profile Images/IMG_1851.png", added: false },
  ]);

  const handleAdd = (index) => {
    const updated = [...friends];
    updated[index].added = true;
    setFriends(updated);
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="addfriends-container">
      <h1 className="page-title">Add New Friends 🔥</h1>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Friends List */}
      <div className="friends-list">
        {filteredFriends.map((friend, index) => (
          <div key={index} className="friend-card">
            <img src={friend.img} alt={friend.name} className="friend-avatar" />
            <span className="friend-name">{friend.name}</span>
            {friend.added ? (
              <button className="added-btn" disabled>✓ Added</button>
            ) : (
              <button
                className="add-btn"
                onClick={() => handleAdd(index)}
              >
                + Add
              </button>
            )}
          </div>
        ))}

        {filteredFriends.length === 0 && (
          <p className="no-results">No users found...</p>
        )}
      </div>

      {/* Back button */}
      <button className="back-btn" onClick={() => navigate("/friends")}>
        ← Back to Friends
      </button>
    </div>
  );
}
