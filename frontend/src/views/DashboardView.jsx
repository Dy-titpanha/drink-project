import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import api from '../services/api.js';
import './DashboardView.css';

export default function DashboardView() {
  const auth = useAuthStore();
  const logout = useAuthStore(state => state.logout);

  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [cashiers, setCashiers] = useState([]);

  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Milk Tea');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [qrTable, setQrTable] = useState('');
  const [qrCopied, setQrCopied] = useState(false);

  const currentViewTitle = useMemo(() => {
    if (currentView === 'overview') return 'Analytics & Overview';
    if (currentView === 'products') return 'Drink Menu Management';
    if (currentView === 'orders') return 'Order History';
    if (currentView === 'cashiers') return 'Staff & Users';
    if (currentView === 'qr') return 'EZorder Scan-to-Order QR';
    return 'Dashboard';
  }, [currentView]);

  const ezUrl = useMemo(() => {
    const table = String(qrTable).trim();
    const base = `${window.location.origin}/ezorder`;
    return /^\d{1,3}$/.test(table) && Number(table) >= 1 ? `${base}?table=${Number(table)}` : base;
  }, [qrTable]);

  const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(ezUrl)}`;

  const copyEzLink = async () => {
    try {
      await navigator.clipboard.writeText(ezUrl);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 1600);
    } catch {
      alert(ezUrl);
    }
  };

  const printEzQr = () => {
    const table = String(qrTable).trim();
    const win = window.open('', 'EZ_QR_PRINT', 'height=640,width=460');
    if (!win) {
      alert('Please allow pop-ups to print the QR code.');
      return;
    }
    win.document.write(`
      <html>
        <head><title>EZorder Table QR</title></head>
        <body style="font-family:Arial,sans-serif;text-align:center;padding:28px;">
          <button onclick="window.print()" style="padding:8px 18px;font-size:14px;border-radius:8px;border:1px solid #ccc;background:#f5f5f5;cursor:pointer;">🖨 Print</button>
          <h2 style="margin:22px 0 0;">Vat' Milktea</h2>
          <p style="margin:6px 0 20px;color:#555;">Scan to order with <b>EZORDER</b>${table ? ` — Table ${table}` : ''}</p>
          <img src="${qrImgSrc}" alt="EZorder QR" width="300" height="300" />
          <p style="color:#888;font-size:12px;margin-top:16px;">${ezUrl}</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
  };

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.stats || {});
      setRecentOrders(data.recentOrders || []);
      setAllProducts(data.allProducts || []);
      setAllOrders(data.allOrders || []);
      setCashiers(data.cashiers || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const resetProductForm = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormPrice('');
    setFormCategory('Milk Tea');
    setFormImage('');
    setFormDescription('');
  };

  const startEdit = (product) => {
    setEditingProduct(product.id);
    setFormTitle(product.title);
    setFormPrice(product.price);
    setFormCategory(product.category);
    setFormImage(product.image || '');
    setFormDescription(product.description || '');
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const payload = {
        title: formTitle,
        price: formPrice,
        category: formCategory,
        image: formImage,
        description: formDescription,
      };

      if (editingProduct) {
        await api.put(`/projects/${editingProduct}`, payload);
      } else {
        await api.post('/projects', payload);
      }

      resetProductForm();
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drink?')) return;
    try {
      await api.delete(`/projects/${id}`);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product.');
    }
  };

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar glass-panel">
        <div className="sidebar-header-box">
          <div className="brand-badge">⚡ ADMIN CONTROL PANEL</div>
          <h1 className="dash-logo"><span className="brand-text">Vat'</span><span className="white-text">Milktea</span></h1>
          <p className="subtitle">System Overview &amp; Analytics</p>
        </div>

        <nav className="nav-menu">
          <button onClick={() => setCurrentView('overview')} className={`nav-item ${currentView === 'overview' ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span>Analytics Overview</span>
          </button>
          <button onClick={() => setCurrentView('products')} className={`nav-item ${currentView === 'products' ? 'active' : ''}`}>
            <span className="nav-icon">🧋</span>
            <span>Manage Menu Drinks</span>
          </button>
          <button onClick={() => setCurrentView('orders')} className={`nav-item ${currentView === 'orders' ? 'active' : ''}`}>
            <span className="nav-icon">📜</span>
            <span>Order History</span>
          </button>
          <button onClick={() => setCurrentView('cashiers')} className={`nav-item ${currentView === 'cashiers' ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span>Manage Staff</span>
          </button>
          <button onClick={() => setCurrentView('qr')} className={`nav-item ${currentView === 'qr' ? 'active' : ''}`}>
            <span className="nav-icon">📱</span>
            <span>EZorder Table QR</span>
          </button>
        </nav>

        {auth.user && (
          <div className="sidebar-user glass-card">
            <div className="user-card">
              <div className="avatar-sm">{auth.user.name.charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <p className="name">{auth.user.name}</p>
                <p className="email">{auth.user.email}</p>
              </div>
              <button onClick={logout} className="btn-logout-sm" title="Logout">✕</button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <header className="dash-header glass-panel">
          <div className="header-left">
            <Link to="/" className="btn-pos-back">← Open POS Menu</Link>
            <h2 className="view-title">{currentViewTitle}</h2>
          </div>
          {currentView === 'products' && (
            <button onClick={resetProductForm} className="btn-primary-sm animate-pulse-glow">
              + Add New Drink
            </button>
          )}
        </header>

        <div className="dash-content">
          {currentView === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card glass-card glass-card-hover glow-orange animate-slide-up">
                  <div className="stat-icon orange">💵</div>
                  <div className="stat-info">
                    <p className="stat-label">Total Revenue</p>
                    <h3 className="stat-val">${Number(stats.total_revenue || 0).toFixed(2)}</h3>
                    <span className="stat-trend green">↑ +14.2% this month</span>
                  </div>
                </div>

                <div className="stat-card glass-card glass-card-hover glow-green animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="stat-icon green">🧋</div>
                  <div className="stat-info">
                    <p className="stat-label">Active Drinks</p>
                    <h3 className="stat-val">{stats.total_projects || 0} Items</h3>
                    <span className="stat-trend green">Available on Menu</span>
                  </div>
                </div>

                <div className="stat-card glass-card glass-card-hover glow-blue animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="stat-icon blue">📦</div>
                  <div className="stat-info">
                    <p className="stat-label">Total Orders</p>
                    <h3 className="stat-val">{allOrders.length} Orders</h3>
                    <span className="stat-trend green">Completed Transactions</span>
                  </div>
                </div>

                <div className="stat-card glass-card glass-card-hover glow-purple animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="stat-icon purple">👥</div>
                  <div className="stat-info">
                    <p className="stat-label">Staff &amp; Users</p>
                    <h3 className="stat-val">{cashiers.length} Members</h3>
                    <span className="stat-trend purple">Active Accounts</span>
                  </div>
                </div>
              </div>

              <div className="overview-split">
                <div className="data-card glass-panel">
                  <h3 className="card-title">Recent Customer Orders</h3>
                  <div className="orders-list">
                    {recentOrders.map(order => (
                      <div key={order.id} className="order-row glass-card">
                        <div>
                          <p className="order-ref">Order #{order.ref_number}</p>
                          <p className="order-sub">{order.customer_name || 'Walk-in'} • {order.payment_method}</p>
                        </div>
                        <p className="order-total">${Number(order.total).toFixed(2)}</p>
                      </div>
                    ))}
                    {recentOrders.length === 0 && <p className="empty-msg">No recent orders found.</p>}
                  </div>
                </div>

                <div className="data-card glass-panel">
                  <h3 className="card-title">Top Selling Drinks</h3>
                  <div className="inventory-list">
                    {allProducts.slice(0, 5).map(prod => (
                      <div key={prod.id} className="inventory-row glass-card">
                        <div className="flex items-center gap-3">
                          <img src={prod.image || 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500'} className="prod-thumb" alt="" />
                          <div>
                            <p className="prod-name">{prod.title}</p>
                            <span className="badge-cat">{prod.category}</span>
                          </div>
                        </div>
                        <p className="prod-price">${Number(prod.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {currentView === 'products' && (
            <div className="products-manage-grid">
              <div className="form-card glass-panel">
                <h3 className="card-title">{editingProduct ? 'Edit Drink Details' : 'Create New Menu Drink'}</h3>
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Drink Title</label>
                    <input value={formTitle} onChange={e => setFormTitle(e.target.value)} type="text" className="form-input" required placeholder="e.g. Taro Milk Tea" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Retail Price ($)</label>
                    <input value={formPrice} onChange={e => setFormPrice(e.target.value)} type="number" step="0.01" className="form-input" required placeholder="3.50" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="form-input select-input" required>
                      <option value="Milk Tea">Milk Tea</option>
                      <option value="Coffee">Coffee</option>
                      <option value="Matcha">Matcha</option>
                      <option value="Fruit Tea">Fruit Tea</option>
                      <option value="Smoothie">Smoothie</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input value={formImage} onChange={e => setFormImage(e.target.value)} type="url" className="form-input" placeholder="https://images.unsplash.com/..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="form-input" placeholder="Drink ingredients &amp; notes..."></textarea>
                  </div>
                  <button type="submit" className="btn-submit" disabled={processing}>
                    {!processing ? (editingProduct ? 'Save Changes' : 'Publish to Menu') : 'Processing...'}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={resetProductForm} className="btn-cancel-edit">Cancel Edit</button>
                  )}
                </form>
              </div>

              <div className="products-list space-y-3">
                {allProducts.map(p => (
                  <div key={p.id} className="product-item glass-card glass-card-hover">
                    <div className="flex items-center gap-3">
                      <img src={p.image || 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500'} className="prod-thumb" alt="" />
                      <div>
                        <p className="prod-name">{p.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="badge-cat">{p.category}</span>
                          <span className="prod-price-sub">${Number(p.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="actions">
                      <button onClick={() => startEdit(p)} className="btn-action edit">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="btn-action delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'orders' && (
            <div className="orders-manage-view glass-panel">
              <h3 className="card-title">Complete Order Transactions History</h3>
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Ref #</th>
                      <th>Customer Name</th>
                      <th>Payment Method</th>
                      <th>Total</th>
                      <th>Date &amp; Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map(ord => (
                      <tr key={ord.id}>
                        <td><code>{ord.ref_number}</code></td>
                        <td>{ord.customer_name || 'Walk-in'}</td>
                        <td><span className="pay-pill">{ord.payment_method}</span></td>
                        <td className="amount">${Number(ord.total).toFixed(2)}</td>
                        <td>{new Date(ord.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'cashiers' && (
            <div className="cashiers-view glass-panel">
              <h3 className="card-title">Staff Members &amp; Accounts</h3>
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashiers.map(c => (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                        <td><span className="role-badge role-badge-staff">{c.role}</span></td>
                        <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {currentView === 'qr' && (
            <div className="qr-option-view glass-panel">
              <div className="qr-option-grid">
                <div className="qr-controls">
                  <h3 className="card-title">📱 EZorder — Scan to Order</h3>
                  <p className="qr-hint">
                    Print a QR for each table. Guests scan it and the self-service
                    menu opens on their phone — no app or account needed. Orders land
                    straight in your order history with a table number attached.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Table Number (optional)</label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={qrTable}
                      onChange={(e) => setQrTable(e.target.value)}
                      className="form-input"
                      placeholder="Leave empty for a general menu QR"
                    />
                  </div>
                  <div className="qr-link-box">
                    <code>{ezUrl}</code>
                    <button onClick={copyEzLink} className="btn-action edit">{qrCopied ? '✓ Copied' : 'Copy'}</button>
                  </div>
                  <div className="qr-actions">
                    <button onClick={printEzQr} className="btn-primary-sm">🖨 Print QR</button>
                    <a href={ezUrl} target="_blank" rel="noreferrer" className="btn-action edit">Preview Page ↗</a>
                  </div>
                </div>

                <div className={`qr-preview-card ${String(qrTable).trim() ? '' : 'qr-general'}`}>
                  <img src={qrImgSrc} alt="EZorder scan-to-order QR code" />
                  <span className="qr-preview-pill">{String(qrTable).trim() ? `Table ${Number(qrTable)}` : 'Scan • Tap • Sip'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
