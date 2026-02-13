import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/welcome.css";
import "../Styles/global.css";

export default function Welcome() {
  const navigate = useNavigate();

  // Create animated stars ONCE
  useEffect(() => {
    const container = document.querySelector(".star-field");

    // If stars already exist, don't recreate them
    if (container.children.length > 0) return;

    for (let i = 0; i < 60; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.top = Math.random() * 100 + "%";
      star.style.left = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 2 + "s";
      container.appendChild(star);
    }
  }, []);

  // Toggle dark mode
  const toggleDark = () => {
    document.body.classList.toggle("dark");
  };

  return (
    <div className="welcome-container">
      {/* Star Background */}
      <div className="star-field"></div>

      <div className="welcome-content">
        <img
          src="/images/bonfire.png"
          alt="Bonfire Logo"
          className="welcome-logo"
        />

        <h1>Welcome to Bonfire</h1>

        {/* Dark Mode Button */}
        <button className="welcome-btn login" onClick={toggleDark}>
          🌙 Toggle Dark Mode
        </button>

        {/* Register / Sign In Buttons */}
        <div className="button-group">
          <button
            className="welcome-btn register"
            onClick={() => navigate("/signin")}
          >
            Register
          </button>

          <button
            className="welcome-btn login"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
