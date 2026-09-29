import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Gift, CreditCard, CheckCircle2, Sparkles, MapPin, UserCheck, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { orderApi, paymentApi, addressApi } from '../services/api';
import { Order, Address } from '../types';

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { friends } = useSocial();
  const navigate = useNavigate();

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'NEW'>('NEW');

  // Form State
  const [shippingName, setShippingName] = useState(user?.fullName || user?.username || '');
  const [shippingAddressLine1, setShippingAddressLine1] = useState('');
  const [shippingAddressLine2, setShippingAddressLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingPhone, setShippingPhone] = useState(user?.phoneNumber || '+91 9876543210');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // Gift Options
  const [isGift, setIsGift] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [giftMessage, setGiftMessage] = useState('Hope you enjoy this special gift! Cheers!');
  const [giftWrapping, setGiftWrapping] = useState('Premium Festive Box');

  // Payment & Processing State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('auth_redirect', '/checkout');
      navigate('/login', {
        state: {
          returnUrl: '/checkout',
          actionDescription: 'proceed with secure checkout',
        },
      });
      return;
    }
    if (friends.length > 0 && !selectedFriendId) {
      setSelectedFriendId(friends[0].id);
    }

    // Load saved user addresses
    const loadAddresses = async () => {
      try {
        const list = await addressApi.getAddresses();
        setSavedAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          applyAddress(defaultAddr);
          setSelectedAddressId(defaultAddr.id);
        } else {
          // Defaults if no saved address
          setShippingName(user?.fullName || user?.username || '');
          setShippingAddressLine1('Flat 402, Lotus Palms Residency, 12th Main');
          setShippingAddressLine2('Indiranagar Stage 2');
          setShippingCity('Bangalore');
          setShippingState('Karnataka');
          setShippingPostalCode('560038');
          setShippingPhone(user?.phoneNumber || '+91 9876543210');
        }
      } catch {
        // Fallback
      }
    };
    loadAddresses();
  }, [isAuthenticated, friends, user]);

  const applyAddress = (addr: Address) => {
    setShippingName(addr.recipientName);
    setShippingAddressLine1(`${addr.houseNumber}${addr.buildingName ? `, ${addr.buildingName}` : ''}, ${addr.street}`);
    setShippingAddressLine2(addr.area + (addr.landmark ? ` (Near ${addr.landmark})` : ''));
    setShippingCity(addr.city);
    setShippingState(addr.state);
    setShippingPostalCode(addr.postalCode);
    setShippingPhone(addr.phone);
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    applyAddress(addr);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '8px' }}>
        <h2>No items in cart for checkout</h2>
        <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/search')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleCreateOrderAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const order = await orderApi.createOrder({
        shippingName,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingPostalCode,
        shippingPhone,
        isGift,
        giftRecipientId: isGift ? (selectedFriendId || undefined) : undefined,
        giftMessage: isGift ? giftMessage : undefined,
        giftWrappingOption: isGift ? giftWrapping : undefined,
      });

      setCurrentOrder(order);

      // Initiate Razorpay order on backend
      const rzpData = await paymentApi.initiatePayment(order.id);
      setRazorpayOrderId(rzpData.razorpayOrderId);
      setShowPaymentModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initialize order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedPayment = async () => {
    if (!currentOrder || !razorpayOrderId) return;
    try {
      setIsSubmitting(true);
      // Simulate Razorpay signature verification with server verification
      const verifyRes = await paymentApi.verifyPayment({
        orderId: currentOrder.id,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: 'pay_test_' + Date.now(),
        razorpaySignature: 'sig_sim_valid_signature_' + Date.now(),
      });

      if (verifyRes.success) {
        setShowPaymentModal(false);
        setPaymentCompleted(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        await refreshCart();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (paymentCompleted && currentOrder) {
    return (
      <div className="main-content" style={{ maxWidth: '650px', margin: '40px auto', background: 'white', padding: '36px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 18px rgba(0,0,0,0.1)' }}>
        <CheckCircle2 size={64} color="#007600" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f1111', marginBottom: '8px' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: '#565959', fontSize: '15px', marginBottom: '20px' }}>
          Order <strong>#{currentOrder.orderNumber}</strong> has been confirmed and paid via Razorpay Test Mode.
          {isGift && ' A gift notification has been sent to your friend!'}
        </p>

        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'left', marginBottom: '24px', border: '1px solid #e9ecef' }}>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Delivery Address:</div>
          <div style={{ fontSize: '13px', color: '#444' }}>
            {shippingName}<br />
            {shippingAddressLine1}{shippingAddressLine2 ? `, ${shippingAddressLine2}` : ''}<br />
            {shippingCity}, {shippingState} - {shippingPostalCode}<br />
            Phone: {shippingPhone}
          </div>
          {isGift && (
            <div style={{ marginTop: '12px', borderTop: '1px solid #ddd', paddingTop: '10px', fontSize: '13px' }}>
              <span style={{ color: '#ff9900', fontWeight: 700 }}>🎁 Gift Order Included:</span> "{giftMessage}" ({giftWrapping})
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/orders')}>
            View Your Orders
          </button>
          <button className="btn-outline" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px' }}>
      {/* Left Column: Delivery & Gift Form */}
      <div>
        <form onSubmit={handleCreateOrderAndPay} style={{ background: 'white', padding: '28px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#ff9900" /> 1. Select Delivery Address
          </h2>

          {/* Saved Addresses Selector */}
          {savedAddresses.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Your Saved Delivery Addresses
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #ff9900' : '1px solid #e2e8f0',
                        background: isSelected ? '#fffaf0' : 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                    >
                      {isSelected && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', color: '#ea580c' }}>
                          <Check size={16} />
                        </span>
                      )}
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                        {addr.recipientName} ({addr.addressType})
                      </div>
                      <div style={{ color: '#475569', lineHeight: 1.3 }}>
                        {addr.houseNumber}, {addr.street}, {addr.area}, {addr.city} - {addr.postalCode}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
                        Phone: {addr.phone}
                      </div>
                      {addr.isDefault && (
                        <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          Default Address
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedAddressId('NEW');
                  setShippingName(user?.fullName || '');
                  setShippingAddressLine1('');
                  setShippingAddressLine2('');
                  setShippingCity('');
                  setShippingState('');
                  setShippingPostalCode('');
                  setShippingPhone(user?.phoneNumber || '');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: selectedAddressId === 'NEW' ? '#ea580c' : '#007185',
                  background: 'none',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '16px',
                }}
              >
                <Plus size={14} /> Use a different delivery address
              </button>
            </div>
          )}

          {/* Delivery Address Fields */}
          <div className="form-group">
            <label className="form-label">Recipient Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address Line 1 (House No, Street) *</label>
            <input
              type="text"
              className="form-input"
              value={shippingAddressLine1}
              onChange={(e) => setShippingAddressLine1(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address Line 2 (Area, Landmark)</label>
            <input
              type="text"
              className="form-input"
              value={shippingAddressLine2}
              onChange={(e) => setShippingAddressLine2(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-input"
                value={shippingState}
                onChange={(e) => setShippingState(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Postal / PIN Code *</label>
              <input
                type="text"
                className="form-input"
                value={shippingPostalCode}
                onChange={(e) => setShippingPostalCode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone Number *</label>
              <input
                type="text"
                className="form-input"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Billing Address Option */}
          <div style={{ marginTop: '10px', marginBottom: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={billingSameAsShipping}
                onChange={(e) => setBillingSameAsShipping(e.target.checked)}
              />
              <span>Billing address is same as delivery address</span>
            </label>
          </div>

          {/* Gift Option Checkbox */}
          <div style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#ff9900' }}
              />
              <Gift size={20} color="#ff9900" /> This is a Gift for a Friend
            </label>

            {isGift && (
              <div style={{ background: '#fff8e7', border: '1px solid #ffe8b5', padding: '16px', borderRadius: '8px', marginTop: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Choose Recipient Friend:</label>
                  {friends.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      Add friends from the Friends page to send gifts directly to them!
                    </p>
                  ) : (
                    <select
                      className="form-select"
                      value={selectedFriendId || ''}
                      onChange={(e) => setSelectedFriendId(Number(e.target.value))}
                    >
                      {friends.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.fullName || f.username} (@{f.username})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Gift Card Message:</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gift Wrapping Style:</label>
                  <select
                    className="form-select"
                    value={giftWrapping}
                    onChange={(e) => setGiftWrapping(e.target.value)}
                  >
                    <option value="Premium Festive Box">Premium Festive Box with Satin Ribbon</option>
                    <option value="Eco-Friendly Kraft Wrap">Eco-Friendly Handcrafted Kraft Wrap</option>
                    <option value="Luxury Velvet Gift Pouch">Luxury Velvet Gift Pouch</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '24px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing Order...' : 'Continue to Razorpay Payment'}
          </button>
        </form>
      </div>

      {/* Right Column: Order Review Summary */}
      <div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>
            Review Items ({cart.totalItemCount})
          </h3>

          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', paddingRight: '6px' }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src={item.productImageUrl} alt={item.productTitle} style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#fafafa', borderRadius: '4px' }} />
                <div style={{ flex: 1, fontSize: '13px' }}>
                  <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{item.productTitle}</div>
                  <div style={{ color: '#666', marginTop: '2px' }}>Qty: {item.quantity} &times; ₹{item.unitPrice.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>₹{item.itemTotal.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery:</span>
              <span style={{ color: cart.estimatedShipping === 0 ? '#007600' : 'inherit' }}>
                {cart.estimatedShipping === 0 ? 'FREE' : `₹${cart.estimatedShipping.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GST (18%):</span>
              <span>₹{cart.estimatedTax.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: '#b12704' }}>
              <span>Order Total:</span>
              <span>₹{cart.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Mode Payment Modal */}
      {showPaymentModal && currentOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px', padding: '28px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ background: '#0c2340', color: '#3399cc', padding: '8px 20px', borderRadius: '6px', fontWeight: 800, fontSize: '18px' }}>
                Razorpay <span style={{ color: '#fff', fontSize: '12px', background: '#ff9900', padding: '2px 6px', borderRadius: '4px' }}>TEST MODE</span>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Complete Your Payment</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '18px' }}>
              Order #{currentOrder.orderNumber}
            </p>

            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '13px', color: '#666' }}>Amount to Pay:</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f1111' }}>
                ₹{currentOrder.totalAmount.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                Simulated Razorpay Order ID: {razorpayOrderId}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ padding: '14px', fontSize: '15px' }}
                onClick={handleSimulatedPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying Signature...' : '✓ Pay via Test Mode (Simulate Success)'}
              </button>

              <button
                className="btn-outline"
                onClick={() => setShowPaymentModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>

            <div style={{ fontSize: '11px', color: '#888', marginTop: '14px' }}>
              * Server-side cryptographic HMAC-SHA256 signature verification is active on backend.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
