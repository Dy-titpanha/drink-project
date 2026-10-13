import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import api from '../services/api.js';
import './WelcomeView.css';

export default function WelcomeView() {
  const auth = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('ABA KHQR');
  const [ordering, setOrdering] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);
  const [lastOrderRef, setLastOrderRef] = useState('');
  const [projects, setProjects] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });

  const categories = [
    { name: 'All', icon: '🧋' },
    { name: 'Milk Tea', icon: '🥤' },
    { name: 'Coffee', icon: '☕' },
    { name: 'Matcha', icon: '🍵' },
    { name: 'Fruit Tea', icon: '🍓' },
    { name: 'Smoothie', icon: '🍧' },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (err) {
        console.error('Failed to load menu projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const openProfileModal = () => {
    setProfileForm({ name: auth.user?.name || '', email: auth.user?.email || '' });
    setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    setProfileMessage('');
    setProfileError(false);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    setProfileError(false);
    try {
      await auth.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setProfileError(true);
      setProfileMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.password.length < 6) {
      setProfileError(true);
      setProfileMessage('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setProfileError(true);
      setProfileMessage('New passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    setProfileMessage('');
    setProfileError(false);
    try {
      await auth.updatePassword({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
      });
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      setProfileMessage('Password updated successfully.');
    } catch (err) {
      setProfileError(true);
      setProfileMessage(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesCat = activeCategory === 'All' || 
                         p.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
                         (activeCategory === 'Milk Tea' && p.category.toLowerCase().includes('milktea'));
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [projects, activeCategory, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const getItemQuantity = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const incrementQuantity = (id) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  };

  const decrementQuantity = (id) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const executeCheckout = async () => {
    setOrdering(true);
    try {
      const payload = {
        cart: cart.map(i => ({ id: i.id, price: i.price, quantity: i.quantity })),
        payment_method: selectedPayment,
        customer_name: customerName || auth.user.name,
      };

      const { data } = await api.post('/checkout', payload);
      setLastOrderRef(data.order?.ref_number || 'MM-SUCCESS');
      setCart([]);
      setCustomerName('');
      setOrderSuccessModal(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing checkout.');
    } finally {
      setOrdering(false);
    }
  };

  const startCheckoutProcess = () => {
    if (cart.length === 0) return;
    if (!auth.isAuthenticated()) {
      alert('Please sign in to complete your checkout!');
      return;
    }

    if (selectedPayment === 'ABA KHQR') {
      setShowQrModal(true);
    } else {
      executeCheckout();
    }
  };

  const confirmKhqrPayment = () => {
    setShowQrModal(false);
    executeCheckout();
  };

  return (
    <div className="pos-container">
      <main className="pos-main">
        <header className="pos-header glass-panel">
          <div className="brand-wrapper">
            <h1 className="brand-title">
              <span className="text-brand">Vat'</span><span className="text-white">Milktea</span>
            </h1>
            
            <div className="role-header-pill">
              {auth.isAdmin() ? (
                <span className="role-badge role-badge-admin"><span className="dot-live animate-pulse"></span> Admin Mode</span>
              ) : auth.isAuthenticated() ? (
                <span className="role-badge role-badge-staff"><span className="dot-live animate-pulse"></span> Staff POS</span>
              ) : (
                <span className="role-badge" style={{background: 'rgba(255,255,255,0.08)', color: '#94a3b8'}}>Guest Mode</span>
              )}
            </div>

            <button onClick={() => setIsCartOpen(true)} className="mobile-cart-btn">
              <svg className="icon-cart" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cart.length > 0 && <span className="badge-count animate-bounce">{cartCount}</span>}
            </button>
          </div>
          
          <div className="search-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search favorite boba, coffee, matcha..." 
              className="search-input"
            />
          </div>
          
          <div className="user-actions">
            {auth.user ? (
              <div className="user-info">
                {auth.isAdmin() && <Link to="/dashboard" className="btn-dashboard">⚡ Admin Panel</Link>}
                <div className="avatar" title={auth.user.name}>
                  {auth.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-name-box">
                  <p className="name">{auth.user.name}</p>
                  <p className="role-text">{auth.isAdmin() ? 'Admin' : 'Cashier / Staff'}</p>
                </div>
                <button onClick={openProfileModal} className="btn-logout-icon" title="My Account">
                  <svg className="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <button onClick={auth.logout} className="btn-logout-icon" title="Logout">
                  <svg className="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn-signin">Sign In</Link>
                <Link to="/register" className="btn-register-sm">Register</Link>
              </div>
            )}
          </div>
        </header>

        <div className="pos-content">
          <div className="categories-bar">
            {categories.map(cat => (
              <button 
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`cat-btn ${activeCategory === cat.name ? 'active' : ''}`}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProjects.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)} 
                className="product-card glass-card glass-card-hover animate-fade-in"
              >
                <div className="product-img-wrapper">
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500'} 
                    className="product-img" 
                    alt={product.title} 
                  />
                  <div className="category-tag">{product.category}</div>
                  
                  {getItemQuantity(product.id) > 0 && (
                    <div className="in-cart-pill animate-pop-in">
                      ✓ {getItemQuantity(product.id)} in Cart
                    </div>
                  )}
                </div>

                <div className="product-details">
                  <h4 className="product-title">{product.title}</h4>
                  <p className="product-desc">{product.description || 'Freshly crafted boba & tea'}</p>
                  
                  <div className="product-footer">
                    <p className="product-price">${Number(product.price).toFixed(2)}</p>
                    <button className="btn-add-cart">
                      <span>+ Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="empty-products glass-panel">
                <span className="empty-icon">🧋</span>
                <h3>No drinks found</h3>
                <p>Try searching for a different keyword or category.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <aside className="pos-sidebar glass-panel">
        <div className="sidebar-header">
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <h2>Order Summary</h2>
            <span className="badge-store">{cartCount} Items</span>
          </div>
        </div>

        <div className="cart-body">
          <div className="input-group">
            <label className="input-label">Customer Reference Name</label>
            <input 
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John (Walk-in / Table 4)..." 
              className="customer-input"
            />
          </div>

          {cart.map(item => (
            <div key={item.id} className="cart-item glass-card animate-fade-in">
              <div className="cart-item-info">
                <img src={item.image || 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500'} className="cart-img" alt=""/>
                <div className="cart-item-text">
                  <p className="item-title">{item.title}</p>
                  <p className="item-price">${Number(item.price).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="cart-item-controls">
                <div className="qty-stepper">
                  <button onClick={() => decrementQuantity(item.id)} className="stepper-btn">-</button>
                  <span className="qty-val">{item.quantity}</span>
                  <button onClick={() => incrementQuantity(item.id)} className="stepper-btn">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="btn-remove" title="Remove Item">
                  &times;
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p className="empty-title">Your Cart is Empty</p>
              <p className="empty-sub" style={{margin:0, fontSize:'12px'}}>Click any drink on the left to add items</p>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="payment-method-bar">
            <p className="payment-label">Payment Method:</p>
            <div className="payment-options">
              {['ABA KHQR', 'Cash', 'Card'].map(pm => (
                <button 
                  key={pm}
                  onClick={() => setSelectedPayment(pm)} 
                  className={`pay-btn ${selectedPayment === pm ? 'active' : ''}`}
                >
                  {pm === 'ABA KHQR' ? '📱 ABA KHQR' : pm === 'Cash' ? '💵 Cash' : '💳 Card'}
                </button>
              ))}
            </div>
          </div>

          <div className="totals-breakdown">
            <div className="calc-row">
              <span>Subtotal</span>
              <span>${(cartTotal * 0.9).toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>VAT (10%)</span>
              <span>${(cartTotal * 0.1).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Grand Total</span>
              <span className="total-amount">${(cartTotal * 1.1).toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={startCheckoutProcess}
            disabled={cart.length === 0 || ordering}
            className="btn-checkout animate-pulse-glow"
          >
            {!ordering ? (
              <span>{selectedPayment === 'ABA KHQR' ? '📱 Pay with ABA KHQR' : '🚀 Place Order & Checkout'}</span>
            ) : (
              <span>Processing Order...</span>
            )}
          </button>
        </div>
      </aside>

      {showQrModal && (
        <div className="modal-overlay">
          <div className="khqr-modal-card glass-panel animate-pop-in">
            <div className="khqr-header">
              <div className="khqr-logo-box">
                <span className="khqr-text font-black" style={{fontWeight: 900}}>KHQR</span>
                <span className="bakong-sub">BAKONG</span>
              </div>
              <button onClick={() => setShowQrModal(false)} className="khqr-close-btn">&times;</button>
            </div>

            <div className="khqr-body">
              <div className="merchant-info">
                <h3 className="merchant-title">VAT' MILKTEA &amp; CAFE</h3>
                <p className="merchant-id">Merchant ID: <code>VAT-MILKTEA-001</code></p>
              </div>

              <div className="khqr-amount-box">
                <p className="amount-label">Amount Payable</p>
                <h2 className="amount-val">${(cartTotal * 1.1).toFixed(2)}</h2>
              </div>

              <div className="qr-code-wrapper">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=KHQR_VAT_MILKTEA_TOTAL_${(cartTotal * 1.1).toFixed(2)}`} 
                  className="qr-code-img"
                  alt="ABA KHQR Code"
                />
                <div className="qr-scan-line"></div>
              </div>

              <div className="scan-instructions">
                <p className="scan-title" style={{margin:0}}>Scan to Pay with Any Mobile Banking App</p>
                <div className="bank-logos">
                  <span className="bank-pill">ABA Mobile</span>
                  <span className="bank-pill">ACLEDA</span>
                  <span className="bank-pill">Sathapana</span>
                  <span className="bank-pill">Wing</span>
                </div>
              </div>

              <button onClick={confirmKhqrPayment} disabled={ordering} className="btn-confirm-khqr animate-pulse-glow">
                {!ordering ? <span>📱 Simulate KHQR Scan &amp; Pay Success</span> : <span>Confirming Transaction...</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {orderSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-pop-in">
            <div className="modal-icon-wrapper">
              <span className="success-emoji" style={{fontSize: '54px'}}>🎉</span>
            </div>
            <h2 style={{margin:'0 0 8px 0'}}>Order Placed Successfully!</h2>
            <p className="ref-number">Order Ref: <strong>{lastOrderRef}</strong></p>
            <div className="telegram-notice-box">
              <span className="tg-icon">✈️</span>
              <div>
                <p className="tg-title" style={{margin:0}}>Telegram Bot Notification Sent!</p>
                <p className="tg-sub" style={{margin:0}}>Receipt &amp; drink list broadcasted to Telegram chat.</p>
              </div>
            </div>
            
            <button onClick={() => setOrderSuccessModal(false)} className="btn-modal-close">
              Done &amp; Next Order
            </button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeProfileModal()}>
          <div className="profile-modal-card glass-panel animate-pop-in">
            <div className="profile-modal-header">
              <div className="profile-modal-title">
                <h2 style={{margin:0}}>My Account</h2>
                <p className="profile-modal-sub">
                  Signed in as <strong>{auth.user?.name}</strong> ({auth.user?.role})
                </p>
              </div>
              <button onClick={closeProfileModal} className="khqr-close-btn" style={{background:'transparent', border:'none', cursor:'pointer'}}>&times;</button>
            </div>

            {profileMessage && (
              <div className={`alert-box ${profileError ? 'alert-error' : 'alert-success'}`}>
                <span>{profileMessage}</span>
              </div>
            )}

            <div className="profile-section">
              <h3 className="profile-section-title" style={{margin:0}}>Profile Details</h3>
              <form onSubmit={saveProfile} className="profile-form">
                <div className="form-group">
                  <label className="form-label" style={{margin:0}}>Full Name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} type="text" className="customer-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{margin:0}}>Email Address</label>
                  <input value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} type="email" className="customer-input" required />
                </div>
                <button type="submit" className="btn-profile-save" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-section">
              <h3 className="profile-section-title" style={{margin:0}}>Change Password</h3>
              <form onSubmit={savePassword} className="profile-form">
                <div className="form-group">
                  <label className="form-label" style={{margin:0}}>Current Password</label>
                  <input value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})} type="password" className="customer-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{margin:0}}>New Password</label>
                  <input value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} type="password" placeholder="Minimum 6 characters" className="customer-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{margin:0}}>Confirm New Password</label>
                  <input value={passwordForm.password_confirmation} onChange={e => setPasswordForm({...passwordForm, password_confirmation: e.target.value})} type="password" className="customer-input" required />
                </div>
                <button type="submit" className="btn-profile-save btn-profile-save-rose" disabled={passwordSaving}>
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
