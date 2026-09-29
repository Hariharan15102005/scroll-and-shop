import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, MessageSquareShare, Gift, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../services/api';

interface ProductCardProps {
  product: Product;
  onShare?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onShare }) => {
  const { addToCart } = useCart();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(product.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(product.likeCount);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(
      async () => {
        try {
          const res = await productApi.toggleLike(product.id);
          setIsLiked(res.liked);
          setLikeCount(res.totalLikes);
        } catch (err) {
          console.warn('Could not toggle like', err);
        }
      },
      `save "${product.title}" to your liked products`,
      {
        actionType: 'TOGGLE_LIKE_PRODUCT',
        payload: { productId: product.id },
      }
    );
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(
      async () => {
        try {
          setIsAdding(true);
          await addToCart(product.id, 1);
          setIsAdded(true);
          setTimeout(() => setIsAdded(false), 2000);
        } catch (err) {
          alert((err as Error).message || 'Failed to add to cart');
        } finally {
          setIsAdding(false);
        }
      },
      `add "${product.title}" to your cart`,
      {
        actionType: 'ADD_TO_CART',
        payload: { productId: product.id, quantity: 1 },
      }
    );
  };

  const handleGiftClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(
      () => {
        navigate(`/gifts?productId=${product.id}`);
      },
      `gift "${product.title}" to a friend`,
      {
        actionType: 'SEND_GIFT',
        payload: { productId: product.id },
        returnUrl: `/gifts?productId=${product.id}`,
      }
    );
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      {/* Top Badges & Like Button */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {product.isDealOfTheDay && <span className="badge badge-deal">Deal of the Day</span>}
        {discount > 0 && !product.isDealOfTheDay && <span className="badge badge-deal">{discount}% off</span>}
      </div>

      <button
        onClick={handleToggleLike}
        title={isLiked ? 'Unlike' : 'Like'}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 5,
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '50%',
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          cursor: 'pointer',
        }}
      >
        <Heart size={18} color={isLiked ? '#c40000' : '#888'} fill={isLiked ? '#c40000' : 'none'} />
      </button>

      {/* Product Image Link */}
      <Link to={`/products/${product.slug || product.id}`} className="product-card-img-wrapper">
        <img src={product.mainImageUrl} alt={product.title} className="product-card-img" loading="lazy" />
      </Link>

      {/* Product Card Body */}
      <div className="product-card-body">
        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' }}>
          {product.brand || product.categoryName || 'Scroll & Shop'}
        </div>

        <Link to={`/products/${product.slug || product.id}`} className="product-card-title">
          {product.title}
        </Link>

        {/* Rating */}
        <div className="product-rating-row">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={13}
                fill={s <= Math.round(product.ratingAverage) ? '#de7921' : 'none'}
                color="#de7921"
              />
            ))}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f1111' }}>
            {product.ratingAverage.toFixed(1)}
          </span>
          <span className="product-rating-count">({product.ratingCount})</span>
        </div>

        {/* Price Row */}
        <div className="product-price-row">
          {discount > 0 && <span className="discount-percentage">-{discount}%</span>}
          <span className="price-symbol">₹</span>
          <span className="price-whole">{Math.floor(product.price).toLocaleString('en-IN')}</span>
          <span className="price-fraction">.00</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <div style={{ fontSize: '12px', color: '#067d62', marginBottom: '12px', fontWeight: 500 }}>
          {product.stockQuantity > 0 ? (
            <span>✓ FREE Delivery by <strong>Tomorrow</strong></span>
          ) : (
            <span style={{ color: '#c40000' }}>Out of Stock</span>
          )}
        </div>

        {/* Card Actions */}
        <div className="product-card-footer">
          <button
            className="btn-primary"
            style={{ flex: 1, fontSize: '13px' }}
            onClick={handleAddToCart}
            disabled={isAdding || product.stockQuantity <= 0}
          >
            {isAdded ? (
              <>
                <Check size={16} /> Added
              </>
            ) : isAdding ? (
              'Adding...'
            ) : (
              <>
                <ShoppingCart size={15} /> Add to Cart
              </>
            )}
          </button>

          <button
            className="btn-outline"
            style={{ padding: '7px 10px' }}
            title="Gift this to a friend"
            onClick={handleGiftClick}
          >
            <Gift size={16} color="#ff9900" />
          </button>

          {onShare && (
            <button
              className="btn-outline"
              style={{ padding: '7px 10px' }}
              title="Discuss with friends in chat"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                requireAuth(
                  () => {
                    onShare(product);
                  },
                  `discuss "${product.title}" with friends in chat`,
                  {
                    actionType: 'SHARE_PRODUCT',
                    payload: { productId: product.id },
                  }
                );
              }}
            >
              <MessageSquareShare size={16} color="#007185" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
