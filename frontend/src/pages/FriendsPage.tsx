import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Check,
  X,
  MessageCircle,
  Gift,
  Search,
  UserMinus,
  Sparkles,
  Clock,
  UserCheck,
  Send,
  Compass,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { UserProfile } from '../types';

export const FriendsPage: React.FC = () => {
  const {
    friends,
    pendingRequests,
    sentRequests,
    suggestedFriends,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    sendFriendRequest,
    removeFriend,
  } = useSocial();
  const { user, isAuthenticated, requireAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'sent' | 'discover'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const results = await authApi.searchUsers(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.warn('User search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetUserId: number, username: string) => {
    requireAuth(
      async () => {
        try {
          await sendFriendRequest(targetUserId);
          showNotification(`Friend request sent to @${username}!`);
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to send friend request');
        }
      },
      `send a friend request to @${username}`,
      {
        actionType: 'SEND_FRIEND_REQUEST',
        payload: { targetUserId, targetUsername: username },
      }
    );
  };

  const handleAccept = async (requestId: number, username: string) => {
    requireAuth(
      async () => {
        try {
          await acceptFriendRequest(requestId);
          showNotification(`Accepted friend request from @${username}!`);
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to accept request');
        }
      },
      `accept friend request from @${username}`,
      {
        actionType: 'ACCEPT_FRIEND_REQUEST',
        payload: { requestId, targetUsername: username },
      }
    );
  };

  const handleReject = async (requestId: number) => {
    requireAuth(
      async () => {
        try {
          await rejectFriendRequest(requestId);
          showNotification('Friend request declined.');
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to decline request');
        }
      },
      'decline friend request',
      {
        actionType: 'REJECT_FRIEND_REQUEST',
        payload: { requestId },
      }
    );
  };

  const handleCancel = async (requestId: number) => {
    requireAuth(
      async () => {
        try {
          await cancelFriendRequest(requestId);
          showNotification('Friend request cancelled.');
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to cancel request');
        }
      },
      'cancel friend request',
      {
        actionType: 'CANCEL_FRIEND_REQUEST',
        payload: { requestId },
      }
    );
  };

  const handleRemove = async (friendId: number, name: string) => {
    requireAuth(
      async () => {
        if (window.confirm(`Are you sure you want to remove ${name} from your friends?`)) {
          try {
            await removeFriend(friendId);
            showNotification(`Removed ${name} from friends.`);
          } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to remove friend');
          }
        }
      },
      `remove ${name} from your friends`
    );
  };

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} color="#ff9900" /> Friends &amp; Shopping Network
        </h1>
        <p style={{ color: '#565959', fontSize: '14px' }}>
          Connect with friends to discover shared gift wishlists, exchange shoppable cards in chat, and see what is trending in your network.
        </p>
      </div>

      {actionSuccess && (
        <div
          style={{
            background: '#e6f4ea',
            color: '#137333',
            border: '1px solid #ceead6',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <Check size={18} /> {actionSuccess}
        </div>
      )}

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #e7e7e7',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setActiveTab('friends')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 18px',
            fontSize: '15px',
            fontWeight: activeTab === 'friends' ? 800 : 600,
            color: activeTab === 'friends' ? '#b86200' : '#565959',
            borderBottom: activeTab === 'friends' ? '3px solid #f08804' : '3px solid transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <UserCheck size={18} /> My Friends ({friends.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 18px',
            fontSize: '15px',
            fontWeight: activeTab === 'requests' ? 800 : 600,
            color: activeTab === 'requests' ? '#b86200' : '#565959',
            borderBottom: activeTab === 'requests' ? '3px solid #f08804' : '3px solid transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
          }}
        >
          <Clock size={18} /> Received Requests
          {pendingRequests.length > 0 && (
            <span
              style={{
                background: '#cc0c39',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 18px',
            fontSize: '15px',
            fontWeight: activeTab === 'sent' ? 800 : 600,
            color: activeTab === 'sent' ? '#b86200' : '#565959',
            borderBottom: activeTab === 'sent' ? '3px solid #f08804' : '3px solid transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Send size={18} /> Sent Requests ({sentRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 18px',
            fontSize: '15px',
            fontWeight: activeTab === 'discover' ? 800 : 600,
            color: activeTab === 'discover' ? '#b86200' : '#565959',
            borderBottom: activeTab === 'discover' ? '3px solid #f08804' : '3px solid transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Compass size={18} /> Discover People ({suggestedFriends.length})
        </button>
      </div>

      {/* TAB 1: MY FRIENDS */}
      {activeTab === 'friends' && (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              Connected Friends ({friends.length})
            </h2>
            <button
              onClick={() => setActiveTab('discover')}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              <UserPlus size={15} /> Find More Friends
            </button>
          </div>

          {friends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafafa', borderRadius: '8px' }}>
              <Users size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No friends added yet</h3>
              <p style={{ color: '#666', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
                Connect with creators and shoppers to unlock shared wishlists, collaborative shopping, and instant chat.
              </p>
              <button onClick={() => setActiveTab('discover')} className="btn-primary">
                Explore Suggested People
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  style={{
                    border: '1px solid #e7e7e7',
                    borderRadius: '10px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={friend.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt={friend.username}
                      style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff9900' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {friend.fullName || friend.username}
                      </div>
                      <div style={{ fontSize: '13px', color: '#007185', fontWeight: 600 }}>@{friend.username}</div>
                    </div>
                  </div>

                  {friend.bio && (
                    <p style={{ fontSize: '13px', color: '#565959', fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
                      "{friend.bio}"
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                    <Link
                      to={`/chat?userId=${friend.id}`}
                      className="btn-outline"
                      style={{ flex: 1, padding: '8px 10px', fontSize: '13px', justifyContent: 'center' }}
                    >
                      <MessageCircle size={15} color="#007185" /> Chat
                    </Link>
                    <Link
                      to={`/gifts?friendId=${friend.id}`}
                      className="btn-primary"
                      style={{ flex: 1, padding: '8px 10px', fontSize: '13px', justifyContent: 'center' }}
                    >
                      <Gift size={15} /> Wishlist
                    </Link>
                    <button
                      onClick={() => handleRemove(friend.id, friend.fullName || friend.username)}
                      style={{
                        background: 'none',
                        border: '1px solid #d5d9d9',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        color: '#888',
                        cursor: 'pointer',
                      }}
                      title="Remove Friend"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: RECEIVED REQUESTS */}
      {activeTab === 'requests' && (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Incoming Friend Requests ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fafafa', borderRadius: '8px' }}>
              <Clock size={40} color="#ccc" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#555' }}>No pending friend requests</h3>
              <p style={{ color: '#888', fontSize: '13px' }}>When someone invites you to connect, their request will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: '#fffdf8',
                    padding: '18px',
                    borderRadius: '10px',
                    border: '1px solid #ffe8b5',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 2px 8px rgba(240, 136, 4, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={req.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt=""
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '15px' }}>{req.senderFullName || req.senderUsername}</div>
                      <div style={{ fontSize: '13px', color: '#007185' }}>@{req.senderUsername}</div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                        Requested {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, padding: '8px', fontSize: '13px', justifyContent: 'center' }}
                      onClick={() => handleAccept(req.id, req.senderUsername)}
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button
                      className="btn-outline"
                      style={{ flex: 1, padding: '8px', fontSize: '13px', color: '#c40000', borderColor: '#f5c2c7', justifyContent: 'center' }}
                      onClick={() => handleReject(req.id)}
                    >
                      <X size={16} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: SENT REQUESTS */}
      {activeTab === 'sent' && (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Pending Sent Requests ({sentRequests.length})
          </h2>

          {sentRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fafafa', borderRadius: '8px' }}>
              <Send size={40} color="#ccc" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#555' }}>No outgoing friend requests</h3>
              <p style={{ color: '#888', fontSize: '13px' }}>Requests you send to other users will show here until accepted.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e7e7e7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#f08804',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {req.receiverUsername?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>@{req.receiverUsername}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Sent {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancel(req.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #d5d9d9',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#c40000',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: DISCOVER & SUGGESTED */}
      {activeTab === 'discover' && (
        <div>
          {/* Search Box */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} color="#ff9900" /> Search Users by Username or Interest
            </h2>
            <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search username, creators, designers (e.g. alex_tech, sarah_style, marcus_fit)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '0 24px' }}>
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                  Search Results ({searchResults.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                  {searchResults.map((u) => {
                    const isFriend = friends.some((f) => f.id === u.id);
                    const isPending = sentRequests.some((s) => s.receiverId === u.id);

                    return (
                      <div
                        key={u.id}
                        style={{
                          border: '1px solid #e7e7e7',
                          padding: '14px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: '#fcfcfc',
                        }}
                      >
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {u.fullName || u.username}
                          </div>
                          <div style={{ fontSize: '12px', color: '#007185' }}>@{u.username}</div>
                        </div>
                        <div>
                          {isFriend ? (
                            <span className="badge badge-success">Friend</span>
                          ) : isPending ? (
                            <span className="badge badge-warning">Sent</span>
                          ) : (
                            <button
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleSendRequest(u.id, u.username)}
                            >
                              <UserPlus size={14} /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Suggested Creators & Shoppers */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e7e7e7' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#ff9900" /> People &amp; Creators You May Like
            </h2>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
              Recommended based on active shopping discussions, creator video reviews, and category interests.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {suggestedFriends.map((person) => {
                const isFriend = friends.some((f) => f.id === person.id);
                const isPending = sentRequests.some((s) => s.receiverId === person.id);

                return (
                  <div
                    key={person.id}
                    style={{
                      border: '1px solid #e7e7e7',
                      borderRadius: '10px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      background: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={person.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                        alt={person.username}
                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '15px' }}>{person.fullName || person.username}</div>
                        <div style={{ fontSize: '13px', color: '#007185', fontWeight: 600 }}>@{person.username}</div>
                      </div>
                    </div>

                    {person.bio && (
                      <p style={{ fontSize: '13px', color: '#565959', margin: 0, lineHeight: 1.4 }}>
                        {person.bio}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                      {isFriend ? (
                        <div style={{ textAlign: 'center', padding: '6px', color: '#067d62', fontWeight: 700, fontSize: '13px' }}>
                          ✓ Connected Friend
                        </div>
                      ) : isPending ? (
                        <div style={{ textAlign: 'center', padding: '6px', color: '#b06000', fontWeight: 600, fontSize: '13px' }}>
                          ⏱ Request Pending
                        </div>
                      ) : (
                        <button
                          className="btn-primary"
                          style={{ width: '100%', padding: '8px', fontSize: '13px', justifyContent: 'center' }}
                          onClick={() => handleSendRequest(person.id, person.username)}
                        >
                          <UserPlus size={15} /> Add to Friends
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

