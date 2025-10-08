import React from 'react';
import '../Styles/styles.css';

export default function Signin() {
  return (
    <div className="auth-body">
      <div className="auth-container">
        <h1>Create Account</h1>
        <form action="#" method="get">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />

          <label htmlFor="confirm-password">Confirm Password</label>
          <input type="password" id="confirm-password" name="confirm-password" required />

          <button type="submit">Sign Up</button>
        </form>

        <p className="switch-auth">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
}
