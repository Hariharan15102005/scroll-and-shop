import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { giftApi } from '../services/api';
import { GiftWishlistItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState<GiftWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('auth_redirect', '/wishlist');
      navigate('/login', {
        state: {
          returnUrl: '/wishlist',
          actionDescription: 'view and manage your gift wishlist',
        },
      });
      return;
    }

    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        const list = await giftApi.getMyWishlist();
        setWishlistItems(list);
      } catch (err) {
        console.warn('Failed to load wishlist', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (productId: number) => {
    try {
      await giftApi.removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter((item) => item.product.id !== productId));
    } catch (err) {
      alert('Failed to remove from wishlist');
    }
  };

  const handleTogglePrivacy = async (item: GiftWishlistItem) => {
    try {
      const updated = await giftApi.addToWishlist(item.product.id, !item.isPublic);
      setWishlistItems(wishlistItems.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      alert('Failed to update wishlist item visibility');
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={24} color="#ff9900" /> Your Gift Wishlist ({wishlistItems.length})
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Items saved here are visible to your connected friends so they can surprise you with the perfect gift!
          </p>
        </div>
        <Link to="/search" className="btn-outline">
          + Add More Products
        </Link>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading your gift wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '8px' }}>
          <Heart size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Your Wishlist is Empty</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Save products to your wishlist so your friends know what you'd love as a gift!</p>
          <Link to="/" className="btn-primary" style={{ padding: '10px 24px' }}>
            Discover Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e7e7e7',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <Link to={`/products/${item.product.slug || item.product.id}`}>
                <img
                  src={item.product.mainImageUrl}
                  alt={item.product.title}
                  style={{ width: '100%', height: '160px', objectFit: 'contain', marginBottom: '12px' }}
                />
              </Link>

              <Link
                to={`/products/${item.product.slug || item.product.id}`}
                style={{ fontWeight: 600, fontSize: '15px', color: '#0f1111', lineHeight: 1.3, marginBottom: '6px' }}
              >
                {item.product.title}
              </Link>

              <div style={{ color: '#b12704', fontWeight: 700, fontSize: '18px', marginBottom: '10px' }}>
                ₹{item.product.price.toLocaleString('en-IN')}
              </div>

              {/* Status pills */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                <button
                  onClick={() => handleTogglePrivacy(item)}
                  style={{
                    background: item.isPublic ? '#e6f4ea' : '#f0f0f0',
                    color: item.isPublic ? '#137333' : '#666',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                  title="Click to toggle Public / Private"
                >
                  {item.isPublic ? <><Globe size={12} /> Public to Friends</> : <><Lock size={12} /> Private</>}
                </button>

                {item.isReserved && (
                  <span style={{ background: '#fef7e0', color: '#b06000', fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>
                    🎁 Reserved by a Friend
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, fontSize: '13px' }}
                  onClick={async () => {
                    await addToCart(item.product.id, 1);
                    navigate('/cart');
                  }}
                >
                  <ShoppingCart size={15} /> Move to Cart
                </button>
                <button
                  className="btn-outline"
                  style={{ padding: '8px 12px', color: '#c40000' }}
                  onClick={() => handleRemove(item.product.id)}
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
