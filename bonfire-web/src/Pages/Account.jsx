import React from "react";
import "../Styles/account.css";

export default function Account() {
  return (
    <div className="account-container">
      <h1 className="title">User Account</h1>

      <div className="card">
        <img
          src="/icons/User.svg"
          alt="Profile"
          className="account-avatar"
        />

        <div className="info">
          <label>Username</label>
          <input type="text" value="User123" readOnly />

          <label>Email</label>
          <input type="text" value="user123@email.com" readOnly />

          <label>Bio</label>
          <textarea placeholder="Write something about yourself here..." />
        </div>
      </div>
    </div>
  );
}
