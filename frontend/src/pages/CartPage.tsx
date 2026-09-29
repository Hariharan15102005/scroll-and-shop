import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, CheckCircle2, ShieldCheck, ArrowRight, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isGift, setIsGift] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '8px', marginTop: '20px' }}>
        <ShoppingCart size={48} color="#ff9900" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Your Shopping Cart is waiting</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Sign in to view your saved cart items and sync across devices.</p>
        <button
          className="btn-primary"
          style={{ padding: '10px 28px' }}
          onClick={() => {
            sessionStorage.setItem('auth_redirect', '/cart');
            navigate('/login', {
              state: {
                returnUrl: '/cart',
                actionDescription: 'view and manage your shopping cart',
              },
            });
          }}
        >
          Sign In to Your Account
        </button>
      </div>
    );
  }

  if (isLoading || !cart) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p>Loading your shopping cart...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '8px', marginTop: '20px' }}>
        <ShoppingCart size={48} color="#888" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Your Cart is Empty</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Explore today's deals, electronics, or discover items from creator videos!</p>
        <Link to="/search" className="btn-primary" style={{ padding: '10px 24px' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  const freeDeliveryThreshold = 1000;
  const isFreeDelivery = cart.subtotal >= freeDeliveryThreshold;
  const progressPercent = Math.min(100, (cart.subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
      {/* Left Column: Cart Items */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, borderBottom: '1px solid #ddd', paddingBottom: '12px', marginBottom: '16px' }}>
          Shopping Cart ({cart.totalItemCount} {cart.totalItemCount === 1 ? 'item' : 'items'})
        </h1>

        {/* Free Delivery Meter */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {isFreeDelivery ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 600, fontSize: '13px' }}>
              <CheckCircle2 size={18} /> Congratulations! Your order qualifies for <strong>FREE Delivery</strong>.
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '13px', color: '#15803d', marginBottom: '6px' }}>
                Add <strong>₹{(freeDeliveryThreshold - cart.subtotal).toFixed(2)}</strong> of eligible items to get <strong>FREE Delivery</strong>.
              </div>
              <div style={{ background: '#dcfce7', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#22c55e', height: '100%', width: `${progressPercent}%`, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                gap: '16px',
                borderBottom: '1px solid #eee',
                paddingBottom: '20px',
              }}
            >
              {/* Product Image */}
              <Link to={`/products/${item.productSlug || item.productId}`}>
                <img
                  src={item.productImageUrl}
                  alt={item.productTitle}
                  style={{ width: '100%', height: '120px', objectFit: 'contain', background: '#fafafa', borderRadius: '6px' }}
                />
              </Link>

              {/* Product Info */}
              <div>
                <Link
                  to={`/products/${item.productSlug || item.productId}`}
                  style={{ fontSize: '16px', fontWeight: 600, color: '#0f1111', lineHeight: 1.3, display: 'block', marginBottom: '6px' }}
                >
                  {item.productTitle}
                </Link>
                <div style={{ fontSize: '12px', color: '#007600', marginBottom: '8px', fontWeight: 500 }}>
                  In Stock
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <label>Qty:</label>
                    <select
                      className="form-select"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      style={{ padding: '4px 8px', fontSize: '13px' }}
                    >
                      {Array.from({ length: Math.min(10, item.stockQuantity || 10) }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span style={{ color: '#ccc' }}>|</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: '#007185', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f1111' }}>
                  ₹{item.itemTotal.toLocaleString('en-IN')}
                </div>
                {item.quantity > 1 && (
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    (₹{item.unitPrice.toLocaleString('en-IN')} each)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '16px' }}>
          Subtotal ({cart.totalItemCount} items): <strong style={{ color: '#b12704', fontSize: '18px' }}>₹{cart.subtotal.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {/* Right Column: Checkout Summary Box */}
      <div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Order Summary</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Subtotal:</span>
              <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Delivery:</span>
              <span style={{ color: cart.estimatedShipping === 0 ? '#007600' : 'inherit' }}>
                {cart.estimatedShipping === 0 ? 'FREE' : `₹${cart.estimatedShipping.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated GST (18%):</span>
              <span>₹{cart.estimatedTax.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '17px', color: '#b12704' }}>
              <span>Order Total:</span>
              <span>₹{cart.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', marginBottom: '12px' }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#007185" />
            <span>100% Secure Checkout with Razorpay Test Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};
