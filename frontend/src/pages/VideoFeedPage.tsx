import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Plus, Upload, Sparkles, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { videoApi } from '../services/api';
import { ShoppingVideo } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { UploadVideoModal } from '../components/UploadVideoModal';

export const VideoFeedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const videoIdParam = searchParams.get('videoId');
  const navigate = useNavigate();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const { addToCart } = useCart();

  const [videos, setVideos] = useState<ShoppingVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        const res = await videoApi.getVideoFeed(0, 20);
        const list: ShoppingVideo[] = res.content || [];
        setVideos(list);

        if (videoIdParam) {
          const foundIdx = list.findIndex((v) => v.id === Number(videoIdParam));
          if (foundIdx !== -1) setCurrentVideoIndex(foundIdx);
        }
      } catch (err) {
        console.warn('Failed to load videos', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, [videoIdParam]);

  const currentVideo = videos[currentVideoIndex];

  // Record view on video change
  useEffect(() => {
    if (currentVideo) {
      videoApi.recordView(currentVideo.id).catch(console.warn);
    }
  }, [currentVideoIndex, currentVideo]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleToggleLike = async () => {
    if (!currentVideo) return;
    requireAuth(
      async () => {
        try {
          const newLikes = await videoApi.likeVideo(currentVideo.id);
          setVideos((prev) =>
            prev.map((v, idx) => (idx === currentVideoIndex ? { ...v, likesCount: newLikes } : v))
          );
        } catch (err) {
          console.warn('Like failed', err);
        }
      },
      `like @${currentVideo.creatorUsername}'s video`,
      {
        actionType: 'TOGGLE_LIKE_VIDEO',
        payload: { videoId: currentVideo.id },
      }
    );
  };

  const handleQuickAdd = async (productId: number) => {
    requireAuth(
      async () => {
        try {
          await addToCart(productId, 1);
          alert('Product added to your cart from video!');
        } catch (err: any) {
          alert(err.message || 'Failed to add to cart');
        }
      },
      'add this item to your cart',
      {
        actionType: 'ADD_TO_CART',
        payload: { productId: productId, quantity: 1 },
      }
    );
  };

  return (
    <div className="main-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} color="#ff9900" /> Watch &amp; Shop Feed
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Interactive shoppable short videos from real creators &amp; verified buyers.
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={() =>
            requireAuth(
              () => setShowUploadModal(true),
              'upload shoppable short videos',
              { actionType: 'UPLOAD_VIDEO' }
            )
          }
        >
          <Upload size={16} /> Upload Video
        </button>
      </div>

      {isLoading || !currentVideo ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '12px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading shoppable video feed...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'flex-start' }}>
          {/* Main Reel View */}
          <div className="video-reel-card">
            <video
              ref={videoRef}
              src={currentVideo.videoUrl}
              poster={currentVideo.thumbnailUrl}
              className="video-reel-player"
              loop
              autoPlay
              muted={isMuted}
              onClick={handleTogglePlay}
            />

            {/* Play/Pause Overlay Indicator */}
            {!isPlaying && (
              <div
                onClick={handleTogglePlay}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                }}
              >
                <Play size={64} color="white" />
              </div>
            )}

            {/* Mute/Unmute Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20,
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Side Action Buttons */}
            <div className="video-side-actions">
              <button className="video-action-btn" onClick={handleToggleLike}>
                <Heart size={20} color="#ff9900" fill="#ff9900" />
                <span>{currentVideo.likesCount}</span>
              </button>

              <div className="video-action-btn" style={{ cursor: 'default' }}>
                <Eye size={20} color="white" />
                <span>{currentVideo.viewsCount}</span>
              </div>
            </div>

            {/* Bottom Overlay Details & Shoppable Tags */}
            <div className="video-overlay-details">
              <div className="video-creator-info">
                <img
                  src={currentVideo.creatorAvatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'}
                  alt=""
                  className="creator-avatar"
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>@{currentVideo.creatorUsername}</div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>{currentVideo.creatorFullName}</div>
                </div>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', lineHeight: 1.3 }}>
                {currentVideo.title}
              </div>

              {currentVideo.description && (
                <div style={{ fontSize: '12px', color: '#e0e0e0', marginBottom: '8px' }}>
                  {currentVideo.description}
                </div>
              )}

              {/* Tagged Shoppable Products */}
              {currentVideo.taggedProducts && currentVideo.taggedProducts.length > 0 && (
                <div>
                  {currentVideo.taggedProducts.map((p) => (
                    <div key={p.id} className="video-shoppable-product-pill">
                      <img src={p.mainImageUrl} alt="" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </div>
                        <div style={{ color: '#b12704', fontWeight: 800, fontSize: '14px' }}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                        onClick={() => handleQuickAdd(p.id)}
                      >
                        <ShoppingBag size={14} /> Buy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Switcher Sidebar */}
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Upcoming Videos</h3>
            {videos.map((vid, idx) => (
              <div
                key={vid.id}
                onClick={() => {
                  setCurrentVideoIndex(idx);
                  setIsPlaying(true);
                }}
                style={{
                  display: 'flex',
                  gap: '10px',
                  background: idx === currentVideoIndex ? '#fff8e7' : 'white',
                  border: `2px solid ${idx === currentVideoIndex ? '#ff9900' : '#e7e7e7'}`,
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                <img
                  src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'}
                  alt=""
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {vid.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ff9900', fontWeight: 700, marginTop: '4px' }}>
                    @{vid.creatorUsername}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <UploadVideoModal
          onClose={() => setShowUploadModal(false)}
          onVideoUploaded={(newVid) => {
            setVideos([newVid, ...videos]);
            setCurrentVideoIndex(0);
          }}
        />
      )}
    </div>
  );
};
