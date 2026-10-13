import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import './LoginView.css';

export default function LoginView() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const [email, setEmail] = useState('admin@cafe.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('admin');

  const selectPreset = (role) => {
    setSelectedPreset(role);
    setPassword('password123');
    if (role === 'admin') setEmail('admin@cafe.com');
    else if (role === 'staff') setEmail('user@cafe.com');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await login({ email, password });
      if (data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="orb orb-1 animate-float"></div>
      <div className="orb orb-2 animate-float" style={{ animationDelay: '-3s' }}></div>
      <div className="orb orb-3 animate-float" style={{ animationDelay: '-1.5s' }}></div>

      <div className="auth-card glass-panel animate-pop-in">
        <div className="auth-header">
          <div className="brand-badge">🧋 VAT' MILKTEA &amp; CAFE</div>
          <h1 className="auth-logo"><span className="brand-text">Vat'</span><span className="white-text">Milktea</span></h1>
          <p className="auth-subtitle">POS &amp; Management System</p>
        </div>

        <div className="role-selector-bar">
          <p className="role-selector-label">Select Account Role to Quick Fill:</p>
          <div className="role-pills">
            <button type="button" onClick={() => selectPreset('admin')} className={`preset-btn ${selectedPreset === 'admin' ? 'active-admin' : ''}`}>
              <span className="dot dot-admin"></span> Admin
            </button>
            <button type="button" onClick={() => selectPreset('staff')} className={`preset-btn ${selectedPreset === 'staff' ? 'active-staff' : ''}`}>
              <span className="dot dot-staff"></span> Cashier / Staff
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert-error">
            <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@cafe.com" className="form-input" required id="login-email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="form-input" required id="login-password" />
            </div>
          </div>

          <button type="submit" className="btn-primary animate-pulse-glow" disabled={loading} id="login-submit">
            {!loading ? (
              <span className="btn-content">
                Access System
                <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            ) : (
              <span className="btn-content">
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle className="path" cx="12" cy="12" r="10" fill="none" strokeWidth="3"></circle>
                </svg>
                Authenticating...
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-link-text">
            New Staff Member? <Link to="/register" className="auth-link">Register Staff Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
