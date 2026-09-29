import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Users, MessageCircle } from 'lucide-react';
import { Product, Friend, Conversation } from '../types';
import { chatApi, socialApi } from '../services/api';

interface ShareProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState<string>(`Hey! Check out this ${product.title}! What do you think?`);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([socialApi.getFriends(), chatApi.getConversations()])
      .then(([f, c]) => {
        setFriends(f);
        setConversations(c);
        if (f.length > 0) setSelectedRecipientId(f[0].id);
      })
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSend = async () => {
    if (!selectedRecipientId) return;
    try {
      setIsSending(true);
      const conversation = await chatApi.startConversation(selectedRecipientId);
      await chatApi.sendMessage(conversation.id, {
        content: messageText,
        sharedProductId: product.id,
      });
      onClose();
      navigate('/chat');
    } catch (err) {
      alert((err as Error).message || 'Failed to share product');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Discuss with Friends</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Product Preview Card */}
          <div style={{ display: 'flex', gap: '14px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #e9ecef' }}>
            <img src={product.mainImageUrl} alt={product.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.3 }}>{product.title}</div>
              <div style={{ color: '#b12704', fontWeight: 700, marginTop: '4px' }}>₹{product.price.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Select Friend */}
          <div className="form-group">
            <label className="form-label">Send to Friend:</label>
            {friends.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#666' }}>
                You have not added any friends yet. Add friends from the <a href="/friends">Friends</a> page to chat!
              </p>
            ) : (
              <select
                className="form-select"
                value={selectedRecipientId || ''}
                onChange={(e) => setSelectedRecipientId(Number(e.target.value))}
              >
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName || f.username} (@{f.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Message Text */}
          <div className="form-group">
            <label className="form-label">Message:</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            onClick={handleSend}
            disabled={isSending || !selectedRecipientId}
          >
            {isSending ? 'Sending...' : <><Send size={16} /> Send to Chat</>}
          </button>
        </div>
      </div>
    </div>
  );
};
