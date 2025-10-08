import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // stop page reload

    // Temporary fake login check
    if (username && password) {
      console.log('Logging in with:', username, password);
      // simulate success → redirect
      navigate('/friends');
    } else {
      alert('Please enter both username and password');
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <h1>Log In</h1>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Log In</button>
        </form>
        <p className="switch-auth">
          Don’t have an account? <a href="/signin">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
