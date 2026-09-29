import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Gift, CheckCircle2, Clock, Truck, ShieldAlert } from 'lucide-react';
import { orderApi } from '../services/api';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

export const OrderHistoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'gifts'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('auth_redirect', '/orders');
      navigate('/login', {
        state: {
          returnUrl: '/orders',
          actionDescription: 'view your order history and gift receipts',
        },
      });
      return;
    }

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const [myOrders, gifts] = await Promise.all([
          orderApi.getUserOrders(),
          orderApi.getReceivedGifts(),
        ]);
        setOrders(myOrders);
        setReceivedGifts(gifts);
      } catch (err) {
        console.warn('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);

  const currentList = activeTab === 'orders' ? orders : receivedGifts;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="badge badge-success">Paid &amp; Processing</span>;
      case 'SHIPPED':
        return <span className="badge badge-prime">Shipped / Out for Delivery</span>;
      case 'DELIVERED':
        return <span className="badge badge-success">Delivered</span>;
      case 'CANCELLED':
        return <span className="badge badge-deal">Cancelled</span>;
      default:
        return <span className="badge badge-warning">Pending Payment</span>;
    }
  };

  return (
    <div className="main-content">
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Your Orders &amp; Gifts</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #ddd', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '15px',
            fontWeight: activeTab === 'orders' ? 700 : 500,
            color: activeTab === 'orders' ? '#ff9900' : '#555',
            borderBottom: activeTab === 'orders' ? '3px solid #ff9900' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Package size={18} /> Placed Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('gifts')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '15px',
            fontWeight: activeTab === 'gifts' ? 700 : 500,
            color: activeTab === 'gifts' ? '#ff9900' : '#555',
            borderBottom: activeTab === 'gifts' ? '3px solid #ff9900' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Gift size={18} /> Received Gifts from Friends ({receivedGifts.length})
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading order history...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
          <Package size={48} color="#aaa" style={{ margin: '0 auto 16px' }} />
          <h3>{activeTab === 'orders' ? 'No orders placed yet' : 'No received gifts yet'}</h3>
          <p style={{ color: '#666', marginTop: '6px' }}>
            {activeTab === 'orders'
              ? 'Start browsing today’s deals and exciting tech gear!'
              : 'Share your gift wishlist with your friends so they know what you love!'}
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {currentList.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e7e7e7',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {/* Order Card Header */}
              <div
                style={{
                  background: '#f6f6f6',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                  color: '#565959',
                  borderBottom: '1px solid #e7e7e7',
                }}
              >
                <div style={{ display: 'flex', gap: '30px' }}>
                  <div>
                    <div>ORDER PLACED</div>
                    <div style={{ fontWeight: 600, color: '#0f1111' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div>TOTAL</div>
                    <div style={{ fontWeight: 600, color: '#0f1111' }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div>SHIP TO</div>
                    <div style={{ fontWeight: 600, color: '#0f1111' }}>{order.shippingName}</div>
                  </div>
                </div>

                <div>
                  <div>ORDER # {order.orderNumber}</div>
                  <div style={{ marginTop: '4px' }}>{getStatusBadge(order.status)}</div>
                </div>
              </div>

              {/* Order Card Body */}
              <div style={{ padding: '20px' }}>
                {order.isGift && (
                  <div
                    style={{
                      background: '#fff8e7',
                      border: '1px solid #ffe8b5',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      fontSize: '13px',
                    }}
                  >
                    🎁 <strong>Gift Order:</strong> "{order.giftMessage}" ({order.giftWrappingOption})
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img
                        src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                        alt={item.productTitle}
                        style={{ width: '70px', height: '70px', objectFit: 'contain', background: '#fafafa', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.productTitle}</div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                          Qty: {item.quantity} &times; ₹{item.unitPrice.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
