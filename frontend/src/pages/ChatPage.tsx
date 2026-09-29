import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Send, ShoppingBag, Plus, Users, Gift, ExternalLink } from 'lucide-react';
import { chatApi, productApi } from '../services/api';
import { connectWebSocket } from '../services/websocket';
import { Conversation, Message, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { friends } = useSocial();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  useEffect(() => {
    if (!isAuthenticated) {
      const returnUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('auth_redirect', returnUrl);
      navigate('/login', {
        state: {
          returnUrl,
          actionDescription: 'chat and discuss products with friends',
        },
      });
      return;
    }

    const initChat = async () => {
      try {
        setIsLoading(true);
        const convList = await chatApi.getConversations();
        setConversations(convList);

        if (targetUserId) {
          const directConv = await chatApi.startConversation(Number(targetUserId));
          setActiveConversation(directConv);
          const msgs = await chatApi.getMessages(directConv.id);
          setMessages(msgs);
        } else if (convList.length > 0) {
          setActiveConversation(convList[0]);
          const msgs = await chatApi.getMessages(convList[0].id);
          setMessages(msgs);
        }
      } catch (err) {
        console.warn('Chat loading notice', err);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [isAuthenticated, targetUserId]);

  // Load product catalog for attachment picker
  useEffect(() => {
    productApi.getProducts({ size: 30 }).then((res) => {
      setCatalogProducts(res.content || []);
    });
  }, []);

  // Connect WebSocket subscription when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const disconnect = connectWebSocket((newMsg: Message) => {
      if (newMsg.conversationId === activeConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      }
    }, activeConversation.id);

    return () => {
      disconnect();
    };
  }, [activeConversation]);

  const selectConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    try {
      const msgs = await chatApi.getMessages(conv.id);
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.warn('Failed to load messages', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || (!messageInput.trim() && !selectedProduct)) return;

    try {
      const sent = await chatApi.sendMessage(activeConversation.id, {
        content: messageInput.trim() || undefined,
        sharedProductId: selectedProduct?.id || undefined,
      });

      setMessages((prev) => [...prev, sent]);
      setMessageInput('');
      setSelectedProduct(null);
      scrollToBottom();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="main-content">
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageCircle size={22} color="#007185" /> Shopping Discussions &amp; Live Chat
      </h1>

      <div className="chat-container">
        {/* Left Sidebar: Conversations List */}
        <div className="chat-sidebar">
          <div style={{ padding: '16px', borderBottom: '1px solid #eee', fontWeight: 700, fontSize: '15px' }}>
            Conversations ({conversations.length})
          </div>

          <div className="chat-thread-list">
            {conversations.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                No chats started. Pick a friend from your <a href="/friends">Friends</a> list to chat!
              </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.participants.find((p) => p.username !== user?.username) || conv.participants[0];
                const isSelected = activeConversation?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`chat-thread-item ${isSelected ? 'active' : ''}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <img
                      src={other?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.title || other?.fullName || other?.username}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {conv.lastMessage?.content || (conv.lastMessage?.sharedProduct ? '🛍️ Shared a product card' : 'No messages yet')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Chat Panel */}
        <div className="chat-main-panel">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="chat-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>
                    {activeConversation.title || 'Chat Discussion'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#067d62' }}>● Connected Live</div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="chat-messages-area">
                {messages.map((msg) => {
                  const isMe = msg.senderUsername === user?.username;

                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble ${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'}`}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: isMe ? '#007185' : '#444', marginBottom: '4px' }}>
                        {isMe ? 'You' : `@${msg.senderUsername}`}
                      </div>

                      {msg.content && <div style={{ marginBottom: msg.sharedProduct ? '10px' : '0' }}>{msg.content}</div>}

                      {/* Attached Shoppable Product Card */}
                      {msg.sharedProduct && (
                        <div
                          style={{
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            padding: '12px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                          }}
                        >
                          <img
                            src={msg.sharedProduct.mainImageUrl}
                            alt={msg.sharedProduct.title}
                            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.3 }}>
                              {msg.sharedProduct.title}
                            </div>
                            <div style={{ color: '#b12704', fontWeight: 700, fontSize: '14px', marginTop: '2px' }}>
                              ₹{msg.sharedProduct.price.toLocaleString('en-IN')}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                              <button
                                className="btn-primary"
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                                onClick={() => navigate(`/products/${msg.sharedProduct?.slug || msg.sharedProduct?.id}`)}
                              >
                                View Product
                              </button>
                              <button
                                className="btn-outline"
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                                onClick={() => navigate(`/gifts?productId=${msg.sharedProduct?.id}`)}
                              >
                                <Gift size={12} color="#ff9900" /> Gift
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ fontSize: '10px', color: '#888', textAlign: 'right', marginTop: '4px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected Attached Product Indicator */}
              {selectedProduct && (
                <div style={{ background: '#fff8e7', borderTop: '1px solid #ffe8b5', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <ShoppingBag size={16} color="#ff9900" /> Attached: <strong>{selectedProduct.title}</strong> (₹{selectedProduct.price})
                  </div>
                  <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: '#c40000', cursor: 'pointer', fontWeight: 700 }}>
                    &times; Remove
                  </button>
                </div>
              )}

              {/* Input Row */}
              <form className="chat-input-row" onSubmit={handleSendMessage}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowProductPicker(!showProductPicker)}
                  title="Attach a shoppable product card"
                >
                  <ShoppingBag size={16} color="#ff9900" /> Attach Product
                </button>

                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a message or discuss product recommendation..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />

                <button type="submit" className="btn-primary" style={{ padding: '9px 18px' }}>
                  <Send size={16} />
                </button>
              </form>

              {/* Product Picker Dropdown Modal */}
              {showProductPicker && (
                <div style={{ position: 'absolute', bottom: '80px', left: '340px', right: '40px', background: 'white', borderRadius: '8px', border: '1px solid #ccc', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', padding: '16px', maxHeight: '300px', overflowY: 'auto', zIndex: 100 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px' }}>Select Product to Share in Chat:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {catalogProducts.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSelectedProduct(prod);
                          setShowProductPicker(false);
                        }}
                        style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer', background: '#fafafa' }}
                      >
                        <img src={prod.mainImageUrl} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ fontSize: '12px', lineHeight: 1.2 }}>
                          <div style={{ fontWeight: 600 }}>{prod.title}</div>
                          <div style={{ color: '#b12704', fontWeight: 700 }}>₹{prod.price.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>
              Select a conversation to start chatting!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
