import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <img src="/images/bonfire.png" alt="Bonfire Logo" className="welcome-logo" />
        <h1>Welcome to Bonfire</h1>
        <div className="button-group">
          <button className="welcome-btn register" onClick={() => navigate("/signin")}>
            Register
          </button>
          <button className="welcome-btn login" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
