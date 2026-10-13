import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { placeEzOrder } from '../services/orderService.js';
import './EZOrderView.css';

const CATEGORIES = [
  { name: 'All', icon: '🧋' },
  { name: 'Milk Tea', icon: '🥤' },
  { name: 'Coffee', icon: '☕' },
  { name: 'Matcha', icon: '🍵' },
  { name: 'Fruit Tea', icon: '🍓' },
  { name: 'Smoothie', icon: '🍧' },
];

const PAYMENT_METHODS = [
  { id: 'KHQR', label: '📱 KHQR' },
  { id: 'Cash at Counter', label: '💵 Cash at Counter' },
];

export default function EZOrderView() {
  const [searchParams] = useSearchParams();
  const tableParam = parseInt(searchParams.get('table'), 10) || '';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    order_type: tableParam ? 'dine_in' : 'take_away',
    table_number: tableParam || '',
    payment_method: 'KHQR',
    notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchMenu = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const res = await fetch(`${window.location.protocol}//${window.location.hostname}:8000/api/projects`);
        if (!res.ok) throw new Error(`API responded ${res.status}`);
        const data = await res.json();
        if (!cancelled) setProjects(Array.isArray(data) ? data.filter(p => p.status === 'approved') : []);
      } catch (err) {
        if (!cancelled) setLoadError('Could not reach the café menu. Please check your connection and retry.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMenu();
    return () => { cancelled = true; };
  }, []);

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

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  const getItemQuantity = (id) => cart.find(i => i.id === id)?.quantity || 0;

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i);
      return [...prev, { id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 }];
    });
    setFieldErrors(prev => ({ ...prev, cart: undefined }));
  };

  const incrementQuantity = (id) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i));

  const decrementQuantity = (id) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    setSubmitError('');
  };

  const validateForm = () => {
    const errs = {};
    if (cart.length === 0) errs.cart = 'Your cart is empty — add at least one drink first.';

    const name = form.customer_name.trim();
    if (!name) errs.customer_name = 'Please tell us your name.';
    else if (name.length < 2 || name.length > 255) errs.customer_name = 'Name must be between 2 and 255 characters.';

    const phone = form.phone.trim();
    if (phone && !/^0\d{8,9}$/.test(phone)) errs.phone = 'Use a format like 012345678 (9–10 digits starting with 0).';

    if (!['dine_in', 'take_away'].includes(form.order_type)) errs.order_type = 'Choose Dine In or Take Away.';

    if (form.order_type === 'dine_in') {
      const table = String(form.table_number).trim();
      if (table === '') errs.table_number = 'Table number is required for dine in.';
      else if (!/^\d{1,3}$/.test(table) || Number(table) < 1 || Number(table) > 999) {
        errs.table_number = 'Table number must be a whole number between 1 and 999.';
      }
    }

    if (!form.payment_method) errs.payment_method = 'Pick a payment method.';

    if (form.notes.trim().length > 500) errs.notes = 'Notes must be 500 characters or fewer.';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        cart: cart.map(i => ({ id: i.id, quantity: i.quantity })),
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim() || null,
        order_type: form.order_type,
        table_number: form.order_type === 'dine_in' ? Number(String(form.table_number).trim()) : null,
        payment_method: form.payment_method,
        notes: form.notes.trim() || null,
      };

      const { data } = await placeEzOrder(payload);
      setPlacedOrder(data.order);
      setCart([]);
      setShowForm(false);
      window.scrollTo({ top: 0 });
    } catch (err) {
      const res = err.response;
      if (res?.data?.errors && typeof res.data.errors === 'object') {
        const mapped = {};
        Object.entries(res.data.errors).forEach(([key, messages]) => {
          const field = key.includes('cart') ? 'cart' : key;
          mapped[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setFieldErrors(mapped);
      } else {
        setSubmitError(res?.data?.message || 'Something went wrong placing your order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = () => {
    const errs = {};
    if (cart.length === 0) errs.cart = 'Your cart is empty — add at least one drink first.';
    setFieldErrors(errs);
    if (Object.keys(errs).length === 0) setShowForm(true);
  };

  const startNewOrder = () => {
    setPlacedOrder(null);
    setFieldErrors({});
    setSubmitError('');
    setForm({
      customer_name: '',
      phone: '',
      order_type: tableParam ? 'dine_in' : 'take_away',
      table_number: tableParam || '',
      payment_method: 'KHQR',
      notes: '',
    });
  };

  if (placedOrder) {
    const orderTypeLabel = placedOrder.order_type === 'dine_in'
      ? `Dine In${placedOrder.table_number ? ` • Table ${placedOrder.table_number}` : ''}`
      : 'Take Away';
    return (
      <div className="ez-container">
        <div className="ez-success glass-panel ez-animate-pop-in">
          <div className="ez-success-icon">🎉</div>
          <h1 className="ez-success-title">Order Received!</h1>
          <p className="ez-success-sub">Show this reference at the counter.</p>
          <div className="ez-ref-chip">{placedOrder.ref_number}</div>

          <div className="ez-summary-box">
            <div className="ez-summary-row"><span>Name</span><strong>{placedOrder.customer_name}</strong></div>
            <div className="ez-summary-row"><span>Type</span><strong>{orderTypeLabel}</strong></div>
            <div className="ez-summary-row"><span>Payment</span><strong>{placedOrder.payment_method}</strong></div>
            <div className="ez-summary-row ez-total"><span>Total Payable</span><strong>${Number(placedOrder.total).toFixed(2)}</strong></div>
          </div>

          <ul className="ez-success-items">
            {placedOrder.items?.map(item => (
              <li key={item.id}>
                <span>{item.project?.title || 'Drink'} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <p className="ez-pay-note">
            Payment status: <strong>Pending</strong> — pay with {placedOrder.payment_method} when you collect your drinks.
          </p>

          <button onClick={startNewOrder} className="btn-ez-submit">Order Something Else</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ez-container">
      <header className="ez-header glass-panel">
        <div className="ez-brand-row">
          <h1 className="ez-logo"><span className="text-brand">Vat'</span><span>Milktea</span></h1>
          <span className="ez-badge">⚡ EZORDER</span>
          {tableParam ? <span className="ez-table-pill">🍽 Table {tableParam}</span> : null}
        </div>
        <p className="ez-tagline">Scan • Tap • Sip — order straight from your phone</p>
      </header>

      <div className="ez-search-wrapper">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search drinks..."
          className="ez-search-input"
        />
      </div>

      <div className="ez-categories no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`ez-cat-btn ${activeCategory === cat.name ? 'active' : ''}`}
          >
            <span>{cat.icon}</span><span>{cat.name}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="ez-empty glass-panel">
          <span className="ez-empty-icon">⏳</span>
          <h3>Loading menu...</h3>
        </div>
      )}

      {!loading && loadError && (
        <div className="ez-empty glass-panel">
          <span className="ez-empty-icon">📡</span>
          <h3>Menu unavailable</h3>
          <p>{loadError}</p>
        </div>
      )}

      {!loading && !loadError && (
        <div className="ez-grid">
          {filteredProjects.map(product => (
            <div key={product.id} className="ez-card glass-card glass-card-hover ez-animate-fade-in">
              <div className="ez-img-wrap">
                <img src={product.image || 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500'} alt={product.title} />
                <span className="ez-cat-tag">{product.category}</span>
              </div>
              <div className="ez-card-body">
                <h4 className="ez-item-name">{product.title}</h4>
                <p className="ez-item-desc">{product.description || 'Freshly crafted boba & tea'}</p>
                <div className="ez-card-footer">
                  <span className="ez-price">${Number(product.price).toFixed(2)}</span>
                  {getItemQuantity(product.id) > 0 ? (
                    <div className="ez-stepper">
                      <button onClick={() => decrementQuantity(product.id)} aria-label="Decrease">−</button>
                      <span>{getItemQuantity(product.id)}</span>
                      <button onClick={() => incrementQuantity(product.id)} aria-label="Increase">+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(product)} className="btn-ez-add">+ Add</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="ez-empty glass-panel">
              <span className="ez-empty-icon">🧋</span>
              <h3>No drinks found</h3>
              <p>Try another keyword or category.</p>
            </div>
          )}
        </div>
      )}

      {cartCount > 0 && !showForm && (
        <div className="ez-cart-bar ez-animate-slide-up">
          <div className="ez-cart-bar-info">
            <strong>{cartCount} item{cartCount > 1 ? 's' : ''}</strong>
            <span>${(cartTotal * 1.1).toFixed(2)} incl. VAT</span>
          </div>
          <button onClick={openForm} className="btn-ez-review">Review Order →</button>
        </div>
      )}

      {showForm && (
        <div className="ez-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <form onSubmit={handleSubmit} className="ez-sheet glass-panel ez-animate-pop-in" noValidate>
            <div className="ez-sheet-head">
              <h2>Your Order</h2>
              <button type="button" onClick={() => setShowForm(false)} className="ez-close-btn">&times;</button>
            </div>

            <div className="ez-sheet-items">
              {cart.map(item => (
                <div key={item.id} className="ez-line">
                  <img src={item.image || 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=200'} alt="" />
                  <div className="ez-line-text">
                    <p className="ez-line-title">{item.title}</p>
                    <p className="ez-line-price">${Number(item.price).toFixed(2)} each</p>
                  </div>
                  <div className="ez-stepper">
                    <button type="button" onClick={() => decrementQuantity(item.id)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => incrementQuantity(item.id)}>+</button>
                  </div>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="ez-line-remove">&times;</button>
                </div>
              ))}
              {fieldErrors.cart && <p className="ez-field-error">{fieldErrors.cart}</p>}
            </div>

            <div className="ez-fields">
              <div className="ez-field">
                <label htmlFor="ez-name">Your Name *</label>
                <input
                  id="ez-name"
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => updateForm('customer_name', e.target.value)}
                  placeholder="e.g. Dara"
                  maxLength={255}
                />
                {fieldErrors.customer_name && <p className="ez-field-error">{fieldErrors.customer_name}</p>}
              </div>

              <div className="ez-field">
                <label htmlFor="ez-phone">Phone (optional)</label>
                <input
                  id="ez-phone"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  placeholder="012345678"
                  maxLength={10}
                />
                {fieldErrors.phone && <p className="ez-field-error">{fieldErrors.phone}</p>}
              </div>

              <div className="ez-field">
                <label>Order Type *</label>
                <div className="ez-toggle-row">
                  <button
                    type="button"
                    onClick={() => updateForm('order_type', 'dine_in')}
                    className={`ez-toggle ${form.order_type === 'dine_in' ? 'active' : ''}`}
                  >🍽 Dine In</button>
                  <button
                    type="button"
                    onClick={() => updateForm('order_type', 'take_away')}
                    className={`ez-toggle ${form.order_type === 'take_away' ? 'active' : ''}`}
                  >🥡 Take Away</button>
                </div>
                {fieldErrors.order_type && <p className="ez-field-error">{fieldErrors.order_type}</p>}
              </div>

              {form.order_type === 'dine_in' && (
                <div className="ez-field">
                  <label htmlFor="ez-table">Table Number *</label>
                  <input
                    id="ez-table"
                    type="number"
                    min="1"
                    max="999"
                    value={form.table_number}
                    onChange={(e) => updateForm('table_number', e.target.value)}
                    placeholder={tableParam ? String(tableParam) : 'e.g. 4'}
                  />
                  {fieldErrors.table_number && <p className="ez-field-error">{fieldErrors.table_number}</p>}
                </div>
              )}

              <div className="ez-field">
                <label>Payment Method *</label>
                <div className="ez-toggle-row">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => updateForm('payment_method', pm.id)}
                      className={`ez-toggle ${form.payment_method === pm.id ? 'active' : ''}`}
                    >{pm.label}</button>
                  ))}
                </div>
                {fieldErrors.payment_method && <p className="ez-field-error">{fieldErrors.payment_method}</p>}
              </div>

              <div className="ez-field">
                <label htmlFor="ez-notes">Notes (optional)</label>
                <textarea
                  id="ez-notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  placeholder="Less ice, extra boba..."
                  maxLength={500}
                />
                {fieldErrors.notes && <p className="ez-field-error">{fieldErrors.notes}</p>}
              </div>
            </div>

            <div className="ez-totals">
              <div className="ez-calc-row"><span>Subtotal</span><span>${(cartTotal * 0.9).toFixed(2)}</span></div>
              <div className="ez-calc-row"><span>VAT (10%)</span><span>${(cartTotal * 0.1).toFixed(2)}</span></div>
              <div className="ez-total-row"><span>Grand Total</span><span>${(cartTotal * 1.1).toFixed(2)}</span></div>
            </div>

            {submitError && <div className="ez-alert-error">{submitError}</div>}

            <button type="submit" disabled={submitting} className="btn-ez-submit">
              {submitting ? 'Placing Order...' : `Place Order • $${(cartTotal * 1.1).toFixed(2)}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
