import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { feedApi } from '../services/api';
import { FeedItem, SocialFeedResponse } from '../types';
import {
  Sparkles,
  ShoppingBag,
  Video,
  Heart,
  MessageCircle,
  Share2,
  Tag,
  Star,
  ExternalLink,
  Flame,
  CheckCircle,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const SocialFeedPage: React.FC = () => {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState<string>('FOR_YOU');
  const [feedData, setFeedData] = useState<SocialFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFeed(activeFilter);
  }, [activeFilter, isAuthenticated]);

  const loadFeed = async (filter: string) => {
    setLoading(true);
    try {
      const data = await feedApi.getFeed(filter);
      setFeedData(data);
    } catch (e) {
      console.warn('Failed to load social feed', e);
    } finally {
      setLoading(false);
    }
  };

  const togglePostLike = (postId: number) => {
    requireAuth(
      () => {
        setLikedPosts((prev) => {
          const next = new Set(prev);
          if (next.has(postId)) {
            next.delete(postId);
          } else {
            next.add(postId);
          }
          return next;
        });
      },
      'like this creator post',
      {
        actionType: 'TOGGLE_LIKE_POST',
        payload: { postId },
      }
    );
  };

  const handleAddToCart = (product: any) => {
    requireAuth(
      () => {
        addToCart(product.id || product, 1);
      },
      `add "${product.title || 'item'}" to your shopping cart`,
      {
        actionType: 'ADD_TO_CART',
        payload: { productId: product.id || product, quantity: 1 },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>30% Social • 70% Shopping Experience</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Social Shopping Feed</h1>
          <p className="text-xs text-gray-500 mt-1">
            Discover trending looks, creator gear recommendations, unboxings, and hot deals.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl text-xs font-semibold overflow-x-auto">
          {[
            { id: 'FOR_YOU', label: '✨ For You (30/70)' },
            { id: 'SHOPPING', label: '🛍️ Shopping' },
            { id: 'VIDEOS', label: '🎬 Videos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading dynamic feed...</div>
      ) : !feedData || feedData.items.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">No feed items available.</div>
      ) : (
        <div className="space-y-6">
          {feedData.items.map((item) => {
            if (item.itemType === 'SOCIAL_POST') {
              const isLiked = likedPosts.has(item.postId || 0);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Creator Bar */}
                  <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={item.creatorUsername}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-gray-900">{item.creatorFullName || item.creatorUsername}</span>
                          <span className="text-xs text-gray-400">@{item.creatorUsername}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                          {item.creatorRole || 'CREATOR'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-gray-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <p className="text-sm text-gray-800 leading-relaxed">{item.postContent}</p>

                    {item.postImageUrl && (
                      <div className="rounded-2xl overflow-hidden max-h-96 border border-gray-100">
                        <img
                          src={item.postImageUrl}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tagged Product Box */}
                  {item.product && (
                    <div className="mx-4 sm:mx-5 mb-4 p-3 bg-orange-50/60 border border-orange-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.mainImageUrl}
                          alt={item.product.title}
                          className="w-12 h-12 rounded-xl object-cover border border-orange-200/60"
                        />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-orange-600 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Tagged Product
                          </span>
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="font-bold text-xs text-gray-900 hover:text-orange-600 line-clamp-1"
                          >
                            {item.product.title}
                          </Link>
                          <span className="text-xs font-extrabold text-gray-900">
                            ${item.product.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-sm whitespace-nowrap"
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}

                  {/* Social Action Footer */}
                  <div className="px-4 sm:px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => togglePostLike(item.postId || 0)}
                        className={`flex items-center gap-1.5 font-medium transition-colors ${
                          isLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                        <span>{(item.likeCount || 0) + (isLiked ? 1 : 0)}</span>
                      </button>

                      <button
                        onClick={() =>
                          requireAuth(() => {}, 'join the community discussion on this post')
                        }
                        className="flex items-center gap-1.5 font-medium hover:text-gray-900 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{item.commentCount || 0}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText?.(window.location.href);
                        alert('Link copied to clipboard!');
                      }}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              );
            }

            if (item.itemType === 'SHOPPING_VIDEO' && item.video) {
              const v = item.video;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-md transition-all"
                >
                  <div className="relative w-full md:w-44 h-56 rounded-2xl overflow-hidden bg-black flex-shrink-0 group">
                    <video
                      src={v.videoUrl}
                      poster={v.thumbnailUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="p-3 rounded-full bg-white/80 text-gray-900 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">
                        🎬 Shoppable Video
                      </span>
                      <span className="text-xs text-gray-500">by @{v.creatorUsername}</span>
                    </div>

                    <h3 className="font-bold text-base text-gray-900">{v.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{v.description}</p>

                    {v.taggedProducts && v.taggedProducts.length > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        {v.taggedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200/80 text-xs"
                          >
                            <img src={p.mainImageUrl} alt={p.title} className="w-8 h-8 rounded object-cover" />
                            <div>
                              <span className="font-bold text-gray-900 block truncate max-w-[120px]">
                                {p.title}
                              </span>
                              <span className="text-orange-600 font-extrabold">${p.price.toFixed(2)}</span>
                            </div>
                            <button
                              onClick={() => handleAddToCart(p)}
                              className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-2 w-full md:w-auto">
                    <Link
                      to="/videos"
                      className="flex-1 md:flex-none px-4 py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold"
                    >
                      Watch Full Feed
                    </Link>
                  </div>
                </div>
              );
            }

            if (item.itemType === 'SHOPPING_PRODUCT' && item.product) {
              const p = item.product;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 hover:shadow-md transition-all"
                >
                  <img
                    src={p.mainImageUrl}
                    alt={p.title}
                    className="w-full sm:w-36 h-36 rounded-2xl object-cover border border-gray-100 flex-shrink-0"
                  />

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {p.isDealOfTheDay ? '⚡ Flash Deal' : '⭐ Recommended'}
                      </span>
                      <span className="text-xs text-gray-400">{p.categoryName}</span>
                    </div>

                    <Link
                      to={`/products/${p.slug}`}
                      className="font-bold text-base text-gray-900 hover:text-orange-600 block line-clamp-1"
                    >
                      {p.title}
                    </Link>

                    <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-lg font-extrabold text-gray-900">${p.price.toFixed(2)}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ${p.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs text-emerald-600 font-semibold">
                        +5% Cashback ($0.{(p.price * 0.05).toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-semibold shadow-sm whitespace-nowrap"
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/products/${p.slug}`}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};
