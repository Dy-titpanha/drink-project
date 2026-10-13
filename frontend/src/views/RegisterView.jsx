import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import './RegisterView.css';

export default function RegisterView() {
  const navigate = useNavigate();
  const register = useAuthStore(state => state.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await register({ name, email, password, role });
      navigate('/');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="orb orb-1 animate-float"></div>
      <div className="orb orb-2 animate-float" style={{ animationDelay: '-3s' }}></div>

      <div className="auth-card glass-panel animate-pop-in">
        <div className="auth-header">
          <div className="brand-badge">🧋 NEW ACCOUNT REGISTRATION</div>
          <h1 className="auth-logo"><span className="brand-text">Vat'</span><span className="white-text">Milktea</span></h1>
          <p className="auth-subtitle">Create Staff / Cashier Account</p>
        </div>

        {errorMessage && (
          <div className="alert-error">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="John Doe" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@cafe.com" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Minimum 6 characters" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Re-enter password" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="form-input select-input">
              <option value="user">Staff / Cashier (POS &amp; Orders)</option>
            </select>
            <p className="role-note">Admin accounts are provisioned by an existing system admin.</p>
          </div>

          <button type="submit" className="btn-primary animate-pulse-glow" disabled={loading}>
            {!loading ? <span>Create Account</span> : <span>Registering...</span>}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-link-text">
            Already registered? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
