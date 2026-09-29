import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Gift, Sparkles, Heart, CheckCircle2, Bookmark, ArrowRight, Users, ShieldCheck } from 'lucide-react';
import { giftApi, productApi } from '../services/api';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FriendGiftIdeas, GiftWishlistItem, Product } from '../types';

export const GiftFriendPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const friendIdParam = searchParams.get('friendId');
  const productIdParam = searchParams.get('productId');
  const navigate = useNavigate();

  const { friends } = useSocial();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(
    friendIdParam ? Number(friendIdParam) : null
  );
  const [giftIdeas, setGiftIdeas] = useState<FriendGiftIdeas | null>(null);
  const [initialProduct, setInitialProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      const returnUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('auth_redirect', returnUrl);
      navigate('/login', {
        state: {
          returnUrl,
          actionDescription: 'browse friend gift ideas and send surprise gifts',
        },
      });
      return;
    }

    if (productIdParam) {
      productApi.getProduct(productIdParam).then(setInitialProduct).catch(console.warn);
    }

    if (friends.length > 0 && !selectedFriendId) {
      setSelectedFriendId(friends[0].id);
    }
  }, [isAuthenticated, friends, productIdParam]);

  useEffect(() => {
    if (!selectedFriendId) return;

    const loadFriendData = async () => {
      try {
        setIsLoading(true);
        const data = await giftApi.getFriendGiftIdeas(selectedFriendId);
        setGiftIdeas(data);
      } catch (err) {
        console.warn('Failed to load friend gift ideas', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriendData();
  }, [selectedFriendId]);

  const handleToggleReserve = async (wishlistId: number) => {
    try {
      const updated = await giftApi.toggleReserveWishlistItem(wishlistId);
      if (giftIdeas) {
        setGiftIdeas({
          ...giftIdeas,
          wishlistItems: giftIdeas.wishlistItems.map((item) =>
            item.id === wishlistId ? updated : item
          ),
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update reservation');
    }
  };

  const handleSendGift = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      navigate('/checkout');
    } catch (err: any) {
      alert(err.message || 'Failed to start gift checkout');
    }
  };

  return (
    <div className="main-content">
      {/* Gift Hub Hero Banner */}
      <div className="gift-hero-banner">
        <div>
          <span className="badge" style={{ background: '#ff9900', color: '#111', marginBottom: '8px' }}>
            🎁 Gift Your Friend Hub
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0 10px' }}>
            Give Gifts They Truly Love
          </h1>
          <p style={{ color: '#e0e0e0', fontSize: '15px', maxWidth: '600px' }}>
            Pick a friend to browse their saved wishlists and personalized gift suggestions. Add a custom greeting card and gift wrapping in 1-click!
          </p>
        </div>
        <Gift size={90} color="#ff9900" style={{ opacity: 0.9 }} />
      </div>

      {/* Select Friend Carousel / Grid */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#007185" /> 1. Choose a Friend to Gift
        </h2>

        {friends.length === 0 ? (
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
            <p style={{ color: '#666' }}>
              You don't have any connected friends yet. Connect with friends to see their gift wishlists!
            </p>
            <Link to="/friends" className="btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
              Find Friends
            </Link>
          </div>
        ) : (
          <div className="friend-selector-grid">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className={`friend-select-card ${selectedFriendId === friend.id ? 'selected' : ''}`}
                onClick={() => setSelectedFriendId(friend.id)}
              >
                <img
                  src={friend.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt=""
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px' }}
                />
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{friend.fullName || friend.username}</div>
                <div style={{ fontSize: '12px', color: '#007185' }}>@{friend.username}</div>
                {selectedFriendId === friend.id && (
                  <div style={{ marginTop: '8px', color: '#067d62', fontWeight: 700, fontSize: '11px' }}>
                    ✓ Selected Friend
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Selected Friend Wishlist & Recommendations */}
      {selectedFriendId && giftIdeas && (
        <>
          {/* Friend Wishlist Section */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bookmark size={20} color="#ff9900" /> {giftIdeas.friendFullName || giftIdeas.friendUsername}'s Public Gift Wishlist ({giftIdeas.wishlistItems.length})
            </h2>

            {giftIdeas.wishlistItems.length === 0 ? (
              <p style={{ color: '#666', fontSize: '14px' }}>
                {giftIdeas.friendUsername} has not added any public wishlist items yet. Check out our smart gift ideas below!
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {giftIdeas.wishlistItems.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #e7e7e7', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                    <img src={item.product.mainImageUrl} alt={item.product.title} style={{ width: '100%', height: '140px', objectFit: 'contain', marginBottom: '10px' }} />
                    <div style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.3, marginBottom: '4px' }}>
                      {item.product.title}
                    </div>
                    <div style={{ color: '#b12704', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </div>

                    {item.isReserved ? (
                      <div style={{ background: '#fef7e0', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', color: '#b06000', marginBottom: '10px' }}>
                        🔒 Reserved by {item.reservedByUsername === user?.username ? 'You' : item.reservedByUsername || 'a friend'}
                      </div>
                    ) : (
                      <div style={{ color: '#067d62', fontSize: '12px', marginBottom: '10px' }}>
                        ✓ Available to Gift
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                        className="btn-primary"
                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                        onClick={() => handleSendGift(item.product.id)}
                      >
                        <Gift size={14} /> Gift This
                      </button>
                      <button
                        className="btn-outline"
                        style={{ fontSize: '12px', padding: '8px 12px' }}
                        onClick={() => handleToggleReserve(item.id)}
                        title={item.isReserved ? 'Unreserve' : 'Reserve so friends do not duplicate'}
                      >
                        {item.isReserved ? 'Unreserve' : 'Reserve'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recommended Gift Ideas for Selected Friend */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#ff9900" /> Recommended Gift Ideas for @{giftIdeas.friendUsername}
            </h2>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
              Derived using permitted browsing categories, likes and verified interests.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
              {giftIdeas.recommendedGifts.map((product) => (
                <div key={product.id} style={{ border: '1px solid #e7e7e7', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <img src={product.mainImageUrl} alt={product.title} style={{ width: '100%', height: '140px', objectFit: 'contain', marginBottom: '10px' }} />
                  <div style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.3, marginBottom: '4px' }}>
                    {product.title}
                  </div>
                  <div style={{ color: '#b12704', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 'auto', width: '100%', fontSize: '13px', padding: '8px' }}
                    onClick={() => handleSendGift(product.id)}
                  >
                    <Gift size={14} /> Send as Gift &rarr;
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
