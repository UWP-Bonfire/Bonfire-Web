import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/addfriends.css";

export default function AddFriends() {
  const navigate = useNavigate();

   const allFriends = [
    { name: "Emma Frost", img: "/images/3d_avatar_1.png" },
    { name: "Luna Snow", img: "/images/3d_avatar_13.png" },
    { name: "Hank Pim", img: "/images/3d_avatar_16.png" },
    { name: "Peter Parker", img: "/images/3d_avatar_2.png" },
    { name: "Iron Fist", img: "/images/3d_avatar_5.png" },
  ];

  const [query, setQuery] = useState("");
  const [added, setAdded] = useState([]);

  // Filter results when typing
  const filteredFriends = allFriends.filter(
    (friend) =>
      query.length > 0 &&
      friend.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAdd = (name) => {
    // toggle add/added state
    if (!added.includes(name)) {
      setAdded([...added, name]);
    } else {
      setAdded(added.filter((f) => f !== name));
    }
  };

  return (
    <div className="addfriends-container">
      <h1 className="page-title">Add Friends</h1>

      {/* Search input */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a friend..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Results list */}
      <div className="friends-list">
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend, index) => (
            <div className="friend-card" key={index}>
              <img
                src={friend.img}
                alt={friend.name}
                className="friend-avatar"
              />
              <span className="friend-name">{friend.name}</span>
              {added.includes(friend.name) ? (
                <button
                  className="added-btn"
                  onClick={() => handleAdd(friend.name)}
                >
                  Added
                </button>
              ) : (
                <button
                  className="add-btn"
                  onClick={() => handleAdd(friend.name)}
                >
                  Add
                </button>
              )}
            </div>
          ))
        ) : query.length > 0 ? (
          <p className="no-results">No friends found 😔</p>
        ) : (
          <p className="no-results">Start typing to find friends!</p>
        )}
      </div>

      {/* Back button */}
      <button className="back-btn" onClick={() => navigate("/friends")}>
        ← Back to Friends
      </button>
    </div>
  );
}
