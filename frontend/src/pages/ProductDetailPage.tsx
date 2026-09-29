import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Gift,
  MessageCircle,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Send,
} from 'lucide-react';
import { productApi, giftApi } from '../services/api';
import { Product, ProductReview, ProductComment } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from '../components/ReviewModal';
import { ShareProductModal } from '../components/ShareProductModal';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated, requireAuth } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slugOrId) return;

    const loadProductData = async () => {
      try {
        setIsLoading(true);
        const data = await productApi.getProduct(slugOrId);
        setProduct(data);
        setSelectedImage(data.mainImageUrl);
        setIsLiked(data.isLikedByCurrentUser);
        setLikeCount(data.likeCount);

        const [reviewList, commentList] = await Promise.all([
          productApi.getReviews(data.id),
          productApi.getComments(data.id),
        ]);
        setReviews(reviewList);
        setComments(commentList);
      } catch (err) {
        console.warn('Failed to load product detail', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [slugOrId]);

  const handleToggleLike = async () => {
    if (!product) return;
    requireAuth(
      async () => {
        try {
          const res = await productApi.toggleLike(product.id);
          setIsLiked(res.liked);
          setLikeCount(res.totalLikes);
        } catch (err) {
          console.warn('Error toggling like', err);
        }
      },
      `save "${product.title}" to your liked products`,
      {
        actionType: 'TOGGLE_LIKE_PRODUCT',
        payload: { productId: product.id },
      }
    );
  };

  const handleAddToCart = async () => {
    if (!product) return;
    requireAuth(
      async () => {
        try {
          setIsAdding(true);
          await addToCart(product.id, quantity);
          setIsAdded(true);
          setTimeout(() => setIsAdded(false), 2000);
        } catch (err: any) {
          alert(err.message || 'Failed to add to cart');
        } finally {
          setIsAdding(false);
        }
      },
      `add "${product.title}" to your cart`,
      {
        actionType: 'ADD_TO_CART',
        payload: { productId: product.id, quantity },
      }
    );
  };

  const handleBuyNow = async () => {
    if (!product) return;
    requireAuth(
      async () => {
        await addToCart(product.id, quantity);
        navigate('/checkout');
      },
      `proceed to instant checkout for "${product.title}"`,
      {
        actionType: 'BUY_NOW',
        payload: { productId: product.id, quantity },
      }
    );
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newComment.trim()) return;
    requireAuth(
      async () => {
        try {
          const created = await productApi.addComment(product.id, { content: newComment.trim() });
          setComments([created, ...comments]);
          setNewComment('');
        } catch (err) {
          alert('Failed to post discussion comment');
        }
      },
      'join the product discussion',
      {
        actionType: 'ADD_PRODUCT_COMMENT',
        payload: { productId: product.id, content: newComment.trim() },
      }
    );
  };

  const handleAddReply = async (parentCommentId: number) => {
    if (!product || !replyText.trim()) return;
    requireAuth(
      async () => {
        try {
          await productApi.addComment(product.id, { content: replyText.trim(), parentCommentId });
          const updatedComments = await productApi.getComments(product.id);
          setComments(updatedComments);
          setReplyingToId(null);
          setReplyText('');
        } catch (err) {
          alert('Failed to post reply');
        }
      },
      'reply to this discussion',
      {
        actionType: 'ADD_PRODUCT_COMMENT',
        payload: { productId: product.id, content: replyText.trim(), parentCommentId },
      }
    );
  };

  const handleAddWishlist = async () => {
    if (!product) return;
    requireAuth(
      async () => {
        try {
          await giftApi.addToWishlist(product.id, true);
          alert('Product added to your Gift Wishlist! Your friends can now see and gift this to you.');
        } catch (err) {
          alert('Product already in your wishlist');
        }
      },
      `add "${product.title}" to your Gift Wishlist`,
      {
        actionType: 'ADD_WISHLIST',
        payload: { productId: product.id },
      }
    );
  };

  if (isLoading || !product) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p>Loading product details...</p>
      </div>
    );
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const allImages = [product.mainImageUrl, ...(product.galleryImages || [])];

  return (
    <div className="main-content">
      {/* Product Breadcrumb */}
      <div style={{ fontSize: '13px', color: '#565959', marginBottom: '16px' }}>
        <Link to="/" style={{ color: '#007185' }}>Home</Link> &rsaquo;{' '}
        <span style={{ color: '#565959' }}>{product.categoryName || 'Products'}</span> &rsaquo;{' '}
        <span style={{ color: '#0f1111' }}>{product.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 340px', gap: '30px', marginBottom: '40px' }}>
        {/* Column 1: Image Gallery */}
        <div>
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e7e7e7',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '420px',
              marginBottom: '14px',
            }}
          >
            <img
              src={selectedImage}
              alt={product.title}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {allImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '6px',
                  border: `2px solid ${selectedImage === img ? '#ff9900' : '#ddd'}`,
                  padding: '4px',
                  cursor: 'pointer',
                  background: 'white',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Details & Description */}
        <div>
          <div style={{ fontSize: '13px', color: '#007185', fontWeight: 600, textTransform: 'uppercase' }}>
            Brand: {product.brand || 'Scroll & Shop'}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '6px 0 10px', lineHeight: 1.3 }}>
            {product.title}
          </h1>

          {/* Ratings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(product.ratingAverage) ? '#de7921' : 'none'}
                  color="#de7921"
                />
              ))}
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>{product.ratingAverage.toFixed(1)}</span>
            <span style={{ color: '#007185', fontSize: '13px' }}>({product.ratingCount} customer reviews)</span>
          </div>

          <div style={{ borderTop: '1px solid #e7e7e7', borderBottom: '1px solid #e7e7e7', padding: '16px 0', margin: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              {discount > 0 && <span className="discount-percentage">-{discount}%</span>}
              <span className="price-symbol">₹</span>
              <span className="price-whole" style={{ fontSize: '32px' }}>
                {Math.floor(product.price).toLocaleString('en-IN')}
              </span>
              <span className="price-fraction">.00</span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div style={{ fontSize: '13px', color: '#565959', marginTop: '4px' }}>
                M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#565959', marginTop: '2px' }}>
              Inclusive of all taxes. Free 1-Day Delivery available.
            </div>
          </div>

          {/* Highlights & Description */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>About this item</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#333' }}>
              {product.description}
            </p>
          </div>

          {/* Social Interactions Bar */}
          <div style={{ display: 'flex', gap: '10px', background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <button
              onClick={handleToggleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'white',
                border: '1px solid #ccc',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Heart size={16} color={isLiked ? '#c40000' : '#666'} fill={isLiked ? '#c40000' : 'none'} />
              <span>{likeCount} Likes</span>
            </button>

            <button
              onClick={() =>
                requireAuth(
                  () => setShowShareModal(true),
                  `discuss "${product.title}" with friends in chat`,
                  {
                    actionType: 'SHARE_PRODUCT',
                    payload: { productId: product.id },
                  }
                )
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'white',
                border: '1px solid #ccc',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Share2 size={16} color="#007185" />
              <span>Discuss with Friends</span>
            </button>

            <button
              onClick={handleAddWishlist}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'white',
                border: '1px solid #ccc',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Gift size={16} color="#ff9900" />
              <span>Add to Gift Wishlist</span>
            </button>
          </div>
        </div>

        {/* Column 3: Buy Box */}
        <div>
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #d5d9d9', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#b12704', marginBottom: '8px' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            <div style={{ fontSize: '13px', color: '#007185', marginBottom: '12px' }}>
              ✓ FREE delivery <strong>Tomorrow</strong>. Order within 4 hrs.
            </div>

            <div style={{ fontSize: '15px', fontWeight: 600, color: product.stockQuantity > 0 ? '#007600' : '#c40000', marginBottom: '16px' }}>
              {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Currently unavailable'}
            </div>

            {product.stockQuantity > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Quantity:</label>
                <select
                  className="form-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{ width: '80px', padding: '6px' }}
                >
                  {Array.from({ length: Math.min(10, product.stockQuantity) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '10px' }}
                onClick={handleAddToCart}
                disabled={isAdding || product.stockQuantity <= 0}
              >
                {isAdded ? (
                  <><Check size={16} /> Added to Cart</>
                ) : isAdding ? (
                  'Adding...'
                ) : (
                  <><ShoppingCart size={16} /> Add to Cart</>
                )}
              </button>

              <button
                className="btn-secondary"
                style={{ width: '100%', padding: '10px' }}
                onClick={handleBuyNow}
                disabled={product.stockQuantity <= 0}
              >
                <Zap size={16} /> Buy Now
              </button>

              <button
                className="btn-outline"
                style={{ width: '100%', padding: '8px' }}
                onClick={() =>
                  requireAuth(
                    () => navigate(`/gifts?productId=${product.id}`),
                    `gift "${product.title}" to a friend`,
                    {
                      actionType: 'SEND_GIFT',
                      payload: { productId: product.id },
                      returnUrl: `/gifts?productId=${product.id}`,
                    }
                  )
                }
              >
                <Gift size={16} color="#ff9900" /> Gift this to a Friend
              </button>
            </div>

            <div style={{ borderTop: '1px solid #eee', marginTop: '18px', paddingTop: '14px', fontSize: '12px', color: '#666', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#007185" />
                <span>Secure Transaction with Razorpay</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={16} color="#007185" />
                <span>7 Days Replacement Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Discussions ("Discuss with Friends") Section */}
      <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={20} color="#007185" /> Community &amp; Friend Discussions ({comments.length})
        </h2>

        {/* Post new comment box */}
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask a question or discuss this product with the community..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Send size={15} /> Post
          </button>
        </form>

        {/* Comment list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <img
                  src={comment.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={comment.username}
                  style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                />
                <span style={{ fontWeight: 600, fontSize: '13px' }}>@{comment.username}</span>
                <span style={{ fontSize: '11px', color: '#888' }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#222', marginLeft: '38px', marginBottom: '6px' }}>
                {comment.content}
              </div>

              {/* Reply toggle */}
              <div style={{ marginLeft: '38px' }}>
                <button
                  onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                  style={{ background: 'none', border: 'none', color: '#007185', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Reply
                </button>

                {/* Reply Box */}
                {replyingToId === comment.id && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '13px' }}
                    />
                    <button
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => handleAddReply(comment.id)}
                    >
                      Send
                    </button>
                  </div>
                )}

                {/* Nested replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div style={{ marginTop: '10px', paddingLeft: '14px', borderLeft: '2px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {comment.replies.map((reply) => (
                      <div key={reply.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={reply.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={reply.username}
                            style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                          />
                          <span style={{ fontWeight: 600, fontSize: '12px' }}>@{reply.username}</span>
                        </div>
                        <div style={{ fontSize: '13px', marginLeft: '30px', marginTop: '2px' }}>
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Customer Reviews &amp; Ratings</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(product.ratingAverage) ? '#de7921' : 'none'}
                    color="#de7921"
                  />
                ))}
              </div>
              <span style={{ fontWeight: 700 }}>{product.ratingAverage.toFixed(1)} out of 5</span>
              <span style={{ color: '#666', fontSize: '13px' }}>({product.ratingCount} total global ratings)</span>
            </div>
          </div>

          <button
            className="btn-outline"
            onClick={() =>
              requireAuth(
                () => setShowReviewModal(true),
                `write a review for "${product.title}"`,
                {
                  actionType: 'WRITE_REVIEW',
                  payload: { productId: product.id },
                }
              )
            }
          >
            Write a Customer Review
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {reviews.length === 0 ? (
            <p style={{ color: '#666', fontSize: '14px' }}>No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <img
                    src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={rev.username}
                    style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{rev.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= rev.rating ? '#de7921' : 'none'} color="#de7921" />
                    ))}
                  </div>
                  <strong style={{ fontSize: '14px' }}>{rev.title}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#c45500', fontWeight: 600, marginBottom: '6px' }}>
                  Verified Purchase
                </div>
                <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.4 }}>{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          productId={product.id}
          productTitle={product.title}
          onClose={() => setShowReviewModal(false)}
          onReviewAdded={(rev) => setReviews([rev, ...reviews])}
        />
      )}

      {/* Share into Chat Modal */}
      {showShareModal && (
        <ShareProductModal product={product} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};
