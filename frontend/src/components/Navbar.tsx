import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  MapPin,
  Users,
  MessageCircle,
  Gift,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Sparkles,
  Heart,
  Menu,
  X,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSocial } from '../context/SocialContext';
import { productApi, notificationApi } from '../services/api';
import { Product } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { pendingRequests } = useSocial();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const [list, count] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(list || []);
      setUnreadCount(count || 0);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await notificationApi.markAsRead(notif.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productApi.getProducts({ size: 40 }).then((res) => setAllProducts(res.content || [])).catch(() => {});
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter autocomplete suggestions
  const suggestions = searchQuery.trim()
    ? allProducts
        .filter((p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase().trim()))
        )
        .slice(0, 5)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <header className="navbar-top">
      {/* Mobile Drawer Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Navigation Menu"
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        <Menu size={24} />
      </button>

      {/* Brand Logo */}
      <Link to="/" className="nav-brand">
        <div className="nav-logo-icon">S</div>
        <div className="nav-logo-text">
          <span>Scroll &amp; Shop</span>
          <span className="nav-logo-sub">Social Commerce</span>
        </div>
      </Link>

      {/* Deliver To Location */}
      <div className="nav-location" onClick={() => navigate('/profile')}>
        <MapPin size={18} color="#ccc" />
        <div className="nav-location-text">
          <span>Deliver to {user?.username || 'Guest'}</span>
          <span className="nav-location-bold">Bangalore 560001</span>
        </div>
      </div>

      {/* Search Bar with Autocomplete */}
      <div ref={searchContainerRef} style={{ flex: 1, maxWidth: '800px', position: 'relative' }}>
        <form className="nav-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search headphones, keyboards, laptops, gifts, creator tags..."
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', padding: '0 8px', color: '#999', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="nav-search-btn" title="Search">
            <Search size={20} />
          </button>
        </form>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              color: '#111',
              borderRadius: '0 0 8px 8px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              marginTop: '2px',
              zIndex: 300,
              border: '1px solid #ddd',
              overflow: 'hidden',
            }}
          >
            {suggestions.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  navigate(`/products/${item.slug || item.id}`);
                  setShowSuggestions(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fff8e7')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                <img src={item.mainImageUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#007185' }}>in {item.categoryName || 'Catalog'}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#b12704' }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nav Actions */}
      <div className="nav-actions">
        {/* Gift Your Friend Hub */}
        <Link to="/gifts" className="nav-link-item" title="Gift your friends">
          <span className="nav-link-small">Send Love</span>
          <span className="nav-link-bold">
            <Gift size={15} color="#ff9900" /> Gift a Friend
          </span>
        </Link>

        {/* Friends & Social */}
        <Link to="/friends" className="nav-link-item" title="Friends & Social Network">
          <span className="nav-link-small">
            {pendingRequests.length > 0 ? `${pendingRequests.length} Pending` : 'Network'}
          </span>
          <span className="nav-link-bold">
            <Users size={15} /> Friends
          </span>
        </Link>

        {/* Chat */}
        <Link to="/chat" className="nav-link-item" title="Chat & Discussions">
          <span className="nav-link-small">Messages</span>
          <span className="nav-link-bold">
            <MessageCircle size={15} /> Chat
          </span>
        </Link>

        {/* Notifications */}
        <div
          className="nav-link-item"
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => {
            setIsNotifOpen(!isNotifOpen);
            if (!isNotifOpen && unreadCount > 0) {
              loadNotifications();
            }
          }}
          title="Notifications"
        >
          <span className="nav-link-small">
            {unreadCount > 0 ? `${unreadCount} New` : 'Alerts'}
          </span>
          <span className="nav-link-bold" style={{ position: 'relative' }}>
            <Bell size={16} color={unreadCount > 0 ? '#ff9900' : 'white'} /> Alerts
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  background: '#cc0c39',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                {unreadCount}
              </span>
            )}
          </span>

          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                color: '#111',
                borderRadius: '8px',
                boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
                padding: '16px',
                width: '320px',
                zIndex: 250,
                border: '1px solid #ddd',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px' }}>Notifications</div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', color: '#007185', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#777', fontSize: '13px' }}>
                  No new notifications
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map((notif: any) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        handleNotificationClick(notif);
                        setIsNotifOpen(false);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        background: notif.isRead ? '#ffffff' : '#fff8e7',
                        border: notif.isRead ? '1px solid #f0f0f0' : '1px solid #ffe8b5',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f1111', marginBottom: '2px' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#565959', lineHeight: 1.3 }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Auth Section: Logged in Account dropdown vs Guest Sign In / Sign Up buttons */}
        {isAuthenticated ? (
          <div
            className="nav-link-item nav-account-menu-trigger"
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsAccountMenuOpen(true)}
            onMouseLeave={() => setIsAccountMenuOpen(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || user.username}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ff9900',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff9900, #ff5500)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span className="nav-link-small">Hello, {user?.fullName?.split(' ')[0] || user?.username}</span>
                <span className="nav-link-bold">
                  Account <ChevronDown size={12} />
                </span>
              </div>
            </div>

            {isAccountMenuOpen && (
              <div
                className="nav-account-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  color: '#111',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  padding: '16px',
                  minWidth: '220px',
                  zIndex: 200,
                  border: '1px solid #ddd',
                }}
              >
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user?.fullName || user?.username}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>@{user?.username} {user?.role ? `• ${user.role}` : ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }} onClick={() => setIsAccountMenuOpen(false)}>
                    <UserIcon size={16} /> My Profile &amp; Settings
                  </Link>
                  <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }} onClick={() => setIsAccountMenuOpen(false)}>
                    <ShoppingCart size={16} /> Your Orders
                  </Link>
                  <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }} onClick={() => setIsAccountMenuOpen(false)}>
                    <Heart size={16} /> Gift Wishlist
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b12704', fontWeight: 'bold' }} onClick={() => setIsAccountMenuOpen(false)}>
                      <ShieldCheck size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      logout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#c40000',
                      background: 'none',
                      border: 'none',
                      padding: '8px 0 2px 0',
                      marginTop: '6px',
                      borderTop: '1px solid #eee',
                      cursor: 'pointer',
                      fontWeight: '600',
                      width: '100%',
                      textAlign: 'left',
                      fontSize: '13px',
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="nav-auth-buttons">
            <Link to="/login" id="nav-signin-btn" className="nav-btn-signin" title="Sign In to your account">
              Sign In
            </Link>
            <Link to="/register" id="nav-signup-btn" className="nav-btn-signup" title="Create a new account">
              Sign Up
            </Link>
          </div>
        )}

        {/* Orders */}
        <Link to="/orders" className="nav-link-item">
          <span className="nav-link-small">Returns</span>
          <span className="nav-link-bold">&amp; Orders</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="nav-cart-btn" title="Shopping Cart">
          <ShoppingCart size={28} />
          {itemCount > 0 && <span className="nav-cart-badge">{itemCount}</span>}
          <span style={{ fontWeight: 700, fontSize: '14px', marginTop: '10px' }}>Cart</span>
        </Link>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '56px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 999,
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              background: '#232f3e',
              color: 'white',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #444', paddingBottom: '12px' }}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff9900' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff9900, #ff5500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{user?.fullName || user?.username}</div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>@{user?.username}</div>
                </div>
              </div>
            ) : (
              <div style={{ borderBottom: '1px solid #444', paddingBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Welcome to Scroll &amp; Shop</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="nav-btn-signin"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="nav-btn-signup"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#111',
                      background: 'linear-gradient(135deg, #ff9900 0%, #febd69 100%)',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}

            <Link to="/search" style={{ color: 'white', display: 'flex', gap: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>
              <Search size={18} /> Shop All Catalog
            </Link>
            <Link to="/gifts" style={{ color: 'white', display: 'flex', gap: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>
              <Gift size={18} color="#ff9900" /> Gift a Friend
            </Link>
            <Link to="/friends" style={{ color: 'white', display: 'flex', gap: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>
              <Users size={18} /> Friends Network
            </Link>
            <Link to="/chat" style={{ color: 'white', display: 'flex', gap: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>
              <MessageCircle size={18} /> Discussions &amp; Chat
            </Link>
            <Link to="/wishlist" style={{ color: 'white', display: 'flex', gap: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>
              <Heart size={18} /> Gift Wishlist
            </Link>
            <Link to="/orders" style={{ color: 'white', display: 'flex', gap: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>
              <ShoppingCart size={18} /> Your Orders
            </Link>
            {isAuthenticated && (
              <Link to="/profile" style={{ color: 'white', display: 'flex', gap: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>
                <UserIcon size={18} /> My Profile &amp; Settings
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" style={{ color: '#ff9900', display: 'flex', gap: '8px', fontWeight: 700 }} onClick={() => setIsMobileMenuOpen(false)}>
                <ShieldCheck size={18} /> Admin Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                style={{
                  color: '#ff6b6b',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: 'auto',
                  borderTop: '1px solid #444',
                }}
              >
                <LogOut size={18} /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
