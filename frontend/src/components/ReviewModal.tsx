import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { productApi } from '../services/api';
import { ProductReview } from '../types';

interface ReviewModalProps {
  productId: number;
  productTitle: string;
  onClose: () => void;
  onReviewAdded: (review: ProductReview) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ productId, productTitle, onClose, onReviewAdded }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const newReview = await productApi.addReview(productId, { rating, title, comment });
      onReviewAdded(newReview);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Write a Customer Review</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div style={{ padding: '10px', background: '#fdeded', color: '#c40000', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Reviewing: <strong>{productTitle}</strong>
          </div>

          {/* Star Rating Select */}
          <div className="form-group">
            <label className="form-label">Overall Rating</label>
            <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  color="#de7921"
                  fill={(hoverRating || rating) >= star ? '#de7921' : 'none'}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Headline</label>
            <input
              type="text"
              className="form-input"
              placeholder="What's most important to know?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Written Review</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="What did you like or dislike? What did you use this product for?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
