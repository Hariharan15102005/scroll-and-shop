import axios from 'axios';
import {
  AuthResponse,
  UserProfile,
  Category,
  Product,
  ProductReview,
  ProductComment,
  CartSummary,
  CartItem,
  Order,
  Friend,
  FriendRequest,
  Conversation,
  Message,
  ShoppingVideo,
  GiftWishlistItem,
  FriendGiftIdeas,
  AdminStats,
  CashbackOverview,
  CashbackCampaign,
  Address,
  AddressRequest,
  SellerProfile,
  SellerRegistrationRequest,
  ClaimResponse,
  SocialProviderConfig,
  ConnectedSocialAccount,
  SocialFeedResponse,
} from '../types';
import {
  DEMO_USERS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_VIDEOS,
  DEMO_FRIENDS,
  DEMO_FRIEND_REQUESTS,
  DEMO_WISHLISTS,
  DEMO_CONVERSATIONS,
  DEMO_MESSAGES,
  DEMO_REVIEWS,
  DEMO_COMMENTS,
  DEMO_ORDERS,
} from '../data/demoData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3500,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for local cart storage
const getLocalCart = (): CartSummary => {
  const saved = localStorage.getItem('demo_cart');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    items: [],
    subtotal: 0,
    estimatedShipping: 0,
    estimatedTax: 0,
    total: 0,
    totalItemCount: 0,
  };
};

const saveLocalCart = (items: CartItem[]): CartSummary => {
  const subtotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
  const estimatedShipping = subtotal >= 1000 || subtotal === 0 ? 0 : 99;
  const estimatedTax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + estimatedShipping + estimatedTax;
  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const summary: CartSummary = {
    items,
    subtotal,
    estimatedShipping,
    estimatedTax,
    total,
    totalItemCount,
  };

  localStorage.setItem('demo_cart', JSON.stringify(summary));
  return summary;
};

// Helper for local wishlists
const getLocalWishlists = (): Record<number, GiftWishlistItem[]> => {
  const saved = localStorage.getItem('demo_wishlists');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return DEMO_WISHLISTS;
};

const saveLocalWishlists = (wishlists: Record<number, GiftWishlistItem[]>) => {
  localStorage.setItem('demo_wishlists', JSON.stringify(wishlists));
};

// Helper for local orders
const getLocalOrders = (): Order[] => {
  const saved = localStorage.getItem('demo_orders');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return DEMO_ORDERS;
};

const saveLocalOrders = (orders: Order[]) => {
  localStorage.setItem('demo_orders', JSON.stringify(orders));
};

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await api.post('/auth/login', { username, password });
      return res.data;
    } catch {
      // Fallback demo authentication
      const found = DEMO_USERS.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      ) || DEMO_USERS[0];

      return {
        token: 'demo-jwt-token-' + found.username + '-' + Date.now(),
        type: 'Bearer',
        id: found.id,
        username: found.username,
        email: found.email,
        fullName: found.fullName,
        avatarUrl: found.avatarUrl,
        role: found.role,
        isPersonalizationEnabled: found.isPersonalizationEnabled,
      };
    }
  },

  register: async (payload: { username: string; password: string; email?: string; fullName?: string; bio?: string }): Promise<AuthResponse> => {
    try {
      const res = await api.post('/auth/register', payload);
      return res.data;
    } catch {
      const newUser: UserProfile = {
        id: Date.now(),
        username: payload.username.trim().toLowerCase(),
        email: payload.email,
        fullName: payload.fullName || payload.username,
        bio: payload.bio || '',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        role: 'USER',
        isPersonalizationEnabled: true,
        friendCount: 0,
        isFriend: false,
        isPendingRequest: false,
        isBlocked: false,
      };

      return {
        token: 'demo-jwt-token-' + newUser.username + '-' + Date.now(),
        type: 'Bearer',
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        isPersonalizationEnabled: newUser.isPersonalizationEnabled,
      };
    }
  },

  getMe: async (): Promise<UserProfile> => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
          return JSON.parse(savedUser);
        }
      } catch {}
      return DEMO_USERS[0];
    }
  },

  updateProfile: async (payload: { fullName?: string; bio?: string; avatarUrl?: string; email?: string; isPersonalizationEnabled?: boolean }): Promise<UserProfile> => {
    try {
      const res = await api.put('/auth/profile', payload);
      return res.data;
    } catch {
      let current = DEMO_USERS[0];
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
          current = JSON.parse(savedUser);
        }
      } catch {}
      const updated: UserProfile = {
        ...current,
        ...payload,
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    }
  },

  getUserProfile: async (userId: number): Promise<UserProfile> => {
    try {
      const res = await api.get(`/auth/users/${userId}`);
      return res.data;
    } catch {
      return DEMO_USERS.find((u) => u.id === userId) || DEMO_USERS[0];
    }
  },

  searchUsers: async (query: string): Promise<UserProfile[]> => {
    try {
      const res = await api.get('/auth/users/search', { params: { query } });
      return res.data;
    } catch {
      const q = query.toLowerCase().trim();
      return DEMO_USERS.filter(
        (u) => u.username.toLowerCase().includes(q) || (u.fullName && u.fullName.toLowerCase().includes(q))
      );
    }
  },
};

export const productApi = {
  getProducts: async (params?: { q?: string; categoryId?: number; minPrice?: number; maxPrice?: number; sortBy?: string; sortDir?: string; page?: number; size?: number }) => {
    try {
      const res = await api.get('/products', { params });
      return res.data;
    } catch {
      let filtered = [...DEMO_PRODUCTS];

      if (params?.q) {
        const q = params.q.toLowerCase().trim();
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)) || (p.tags && p.tags.toLowerCase().includes(q)) || (p.brand && p.brand.toLowerCase().includes(q))
        );
      }

      if (params?.categoryId) {
        filtered = filtered.filter((p) => p.categoryId === Number(params.categoryId));
      }

      if (params?.minPrice !== undefined && !isNaN(params.minPrice)) {
        filtered = filtered.filter((p) => p.price >= params.minPrice!);
      }

      if (params?.maxPrice !== undefined && !isNaN(params.maxPrice)) {
        filtered = filtered.filter((p) => p.price <= params.maxPrice!);
      }

      if (params?.sortBy === 'price') {
        filtered.sort((a, b) => (params.sortDir === 'ASC' ? a.price - b.price : b.price - a.price));
      } else if (params?.sortBy === 'ratingAverage') {
        filtered.sort((a, b) => b.ratingAverage - a.ratingAverage);
      }

      const page = params?.page || 0;
      const size = params?.size || 12;
      const start = page * size;
      const paginated = filtered.slice(start, start + size);

      return {
        content: paginated,
        totalPages: Math.ceil(filtered.length / size) || 1,
        totalElements: filtered.length,
        number: page,
        size,
      };
    }
  },

  getFeatured: async (): Promise<Product[]> => {
    try {
      const res = await api.get('/products/featured');
      return res.data;
    } catch {
      return DEMO_PRODUCTS.filter((p) => p.isFeatured);
    }
  },

  getDeals: async (): Promise<Product[]> => {
    try {
      const res = await api.get('/products/deals');
      return res.data;
    } catch {
      return DEMO_PRODUCTS.filter((p) => p.isDealOfTheDay || (p.originalPrice && p.originalPrice > p.price));
    }
  },

  getProduct: async (slugOrId: string | number): Promise<Product> => {
    try {
      const res = await api.get(`/products/${slugOrId}`);
      return res.data;
    } catch {
      const found = DEMO_PRODUCTS.find(
        (p) => String(p.id) === String(slugOrId) || p.slug === String(slugOrId)
      );
      if (found) return found;
      return DEMO_PRODUCTS[0];
    }
  },

  toggleLike: async (productId: number): Promise<{ liked: boolean; totalLikes: number }> => {
    try {
      const res = await api.post(`/products/${productId}/like`);
      return res.data;
    } catch {
      const prod = DEMO_PRODUCTS.find((p) => p.id === productId);
      if (prod) {
        prod.isLikedByCurrentUser = !prod.isLikedByCurrentUser;
        prod.likeCount += prod.isLikedByCurrentUser ? 1 : -1;
        return { liked: prod.isLikedByCurrentUser, totalLikes: prod.likeCount };
      }
      return { liked: true, totalLikes: 1 };
    }
  },

  getComments: async (productId: number): Promise<ProductComment[]> => {
    try {
      const res = await api.get(`/products/${productId}/comments`);
      return res.data;
    } catch {
      return DEMO_COMMENTS[productId] || [];
    }
  },

  addComment: async (productId: number, payload: { content: string; parentCommentId?: number }): Promise<ProductComment> => {
    try {
      const res = await api.post(`/products/${productId}/comments`, payload);
      return res.data;
    } catch {
      const newC: ProductComment = {
        id: Date.now(),
        productId,
        userId: 1,
        username: 'admin',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        content: payload.content,
        parentCommentId: payload.parentCommentId,
        replies: [],
        createdAt: new Date().toISOString(),
      };
      if (!DEMO_COMMENTS[productId]) DEMO_COMMENTS[productId] = [];
      DEMO_COMMENTS[productId].unshift(newC);
      return newC;
    }
  },

  updateComment: async (productId: number, commentId: number, payload: { content: string }): Promise<ProductComment> => {
    try {
      const res = await api.put(`/products/${productId}/comments/${commentId}`, payload);
      return res.data;
    } catch {
      const comments = DEMO_COMMENTS[productId] || [];
      const target = comments.find((c) => c.id === commentId);
      if (target) target.content = payload.content;
      return target || comments[0];
    }
  },

  deleteComment: async (productId: number, commentId: number): Promise<void> => {
    try {
      await api.delete(`/products/${productId}/comments/${commentId}`);
    } catch {
      if (DEMO_COMMENTS[productId]) {
        DEMO_COMMENTS[productId] = DEMO_COMMENTS[productId].filter((c) => c.id !== commentId);
      }
    }
  },

  getReviews: async (productId: number): Promise<ProductReview[]> => {
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      return res.data;
    } catch {
      return DEMO_REVIEWS[productId] || [];
    }
  },

  addReview: async (productId: number, payload: { rating: number; title?: string; comment?: string }): Promise<ProductReview> => {
    try {
      const res = await api.post(`/products/${productId}/reviews`, payload);
      return res.data;
    } catch {
      const newRev: ProductReview = {
        id: Date.now(),
        productId,
        userId: 1,
        username: 'admin',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: payload.rating,
        title: payload.title,
        comment: payload.comment,
        isVerifiedPurchase: true,
        createdAt: new Date().toISOString(),
      };
      if (!DEMO_REVIEWS[productId]) DEMO_REVIEWS[productId] = [];
      DEMO_REVIEWS[productId].unshift(newRev);
      return newRev;
    }
  },

  updateReview: async (productId: number, reviewId: number, payload: { rating: number; title?: string; comment?: string }): Promise<ProductReview> => {
    try {
      const res = await api.put(`/products/${productId}/reviews/${reviewId}`, payload);
      return res.data;
    } catch {
      const reviews = DEMO_REVIEWS[productId] || [];
      const target = reviews.find((r) => r.id === reviewId);
      if (target) {
        target.rating = payload.rating;
        if (payload.title) target.title = payload.title;
        if (payload.comment) target.comment = payload.comment;
      }
      return target || reviews[0];
    }
  },

  deleteReview: async (productId: number, reviewId: number): Promise<void> => {
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
    } catch {
      if (DEMO_REVIEWS[productId]) {
        DEMO_REVIEWS[productId] = DEMO_REVIEWS[productId].filter((r) => r.id !== reviewId);
      }
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await api.get('/categories');
      return res.data;
    } catch {
      return DEMO_CATEGORIES;
    }
  },

  createProduct: async (payload: any): Promise<Product> => {
    try {
      const res = await api.post('/products', payload);
      return res.data;
    } catch {
      const newP: Product = {
        id: Date.now(),
        title: payload.title,
        slug: payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: payload.description,
        price: payload.price,
        stockQuantity: payload.stockQuantity || 10,
        categoryId: payload.categoryId,
        categoryName: DEMO_CATEGORIES.find((c) => c.id === payload.categoryId)?.name || 'General',
        brand: payload.brand || 'Scroll & Shop',
        mainImageUrl: payload.mainImageUrl,
        galleryImages: [payload.mainImageUrl],
        ratingAverage: 5.0,
        ratingCount: 1,
        isFeatured: true,
        isDealOfTheDay: false,
        isLikedByCurrentUser: false,
        likeCount: 0,
        commentCount: 0,
      };
      DEMO_PRODUCTS.unshift(newP);
      return newP;
    }
  },
};

export const cartApi = {
  getCart: async (): Promise<CartSummary> => {
    try {
      const res = await api.get('/cart');
      return res.data;
    } catch {
      return getLocalCart();
    }
  },

  addToCart: async (productId: number, quantity: number = 1): Promise<CartSummary> => {
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      return res.data;
    } catch {
      const cart = getLocalCart();
      const product = DEMO_PRODUCTS.find((p) => p.id === productId) || DEMO_PRODUCTS[0];
      const existingIdx = cart.items.findIndex((i) => i.productId === productId);

      let newItems = [...cart.items];
      if (existingIdx !== -1) {
        newItems[existingIdx].quantity += quantity;
        newItems[existingIdx].itemTotal = newItems[existingIdx].quantity * newItems[existingIdx].unitPrice;
      } else {
        newItems.push({
          id: Date.now(),
          productId: product.id,
          productTitle: product.title,
          productSlug: product.slug,
          productImageUrl: product.mainImageUrl,
          unitPrice: product.price,
          quantity,
          stockQuantity: product.stockQuantity,
          itemTotal: product.price * quantity,
        });
      }

      return saveLocalCart(newItems);
    }
  },

  updateQuantity: async (cartItemId: number, quantity: number): Promise<CartSummary> => {
    try {
      const res = await api.put(`/cart/items/${cartItemId}`, { quantity });
      return res.data;
    } catch {
      const cart = getLocalCart();
      const newItems = cart.items.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            itemTotal: item.unitPrice * quantity,
          };
        }
        return item;
      });
      return saveLocalCart(newItems);
    }
  },

  removeItem: async (cartItemId: number): Promise<CartSummary> => {
    try {
      const res = await api.delete(`/cart/items/${cartItemId}`);
      return res.data;
    } catch {
      const cart = getLocalCart();
      const newItems = cart.items.filter((item) => item.id !== cartItemId);
      return saveLocalCart(newItems);
    }
  },

  clearCart: async (): Promise<void> => {
    try {
      await api.delete('/cart');
    } catch {
      saveLocalCart([]);
    }
  },
};

export const orderApi = {
  createOrder: async (payload: any): Promise<Order> => {
    try {
      const res = await api.post('/orders', payload);
      return res.data;
    } catch {
      const cart = getLocalCart();
      const newOrder: Order = {
        id: Date.now(),
        orderNumber: 'SNS-' + Date.now() + '-DEMO',
        userId: 1,
        username: 'admin',
        status: 'PAID',
        totalAmount: cart.total || 14999,
        subtotalAmount: cart.subtotal || 14999,
        shippingFee: cart.estimatedShipping || 0,
        taxAmount: cart.estimatedTax || 2699.82,
        shippingName: payload.shippingName,
        shippingAddressLine1: payload.shippingAddressLine1,
        shippingAddressLine2: payload.shippingAddressLine2,
        shippingCity: payload.shippingCity,
        shippingState: payload.shippingState,
        shippingPostalCode: payload.shippingPostalCode,
        shippingPhone: payload.shippingPhone,
        isGift: Boolean(payload.isGift),
        giftRecipientId: payload.giftRecipientId,
        giftRecipientUsername: DEMO_USERS.find((u) => u.id === payload.giftRecipientId)?.username,
        giftMessage: payload.giftMessage,
        giftWrappingOption: payload.giftWrappingOption,
        items: cart.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productTitle: i.productTitle,
          productImageUrl: i.productImageUrl,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          totalPrice: i.itemTotal,
        })),
        paymentStatus: 'VERIFIED',
        razorpayOrderId: 'order_rzp_demo_' + Date.now(),
        createdAt: new Date().toISOString(),
      };

      const orders = getLocalOrders();
      saveLocalOrders([newOrder, ...orders]);
      saveLocalCart([]);
      return newOrder;
    }
  },

  getUserOrders: async (): Promise<Order[]> => {
    try {
      const res = await api.get('/orders');
      return res.data;
    } catch {
      return getLocalOrders();
    }
  },

  getReceivedGifts: async (): Promise<Order[]> => {
    try {
      const res = await api.get('/orders/gifts-received');
      return res.data;
    } catch {
      return getLocalOrders().filter((o) => o.isGift);
    }
  },

  getOrder: async (orderId: number): Promise<Order> => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      return res.data;
    } catch {
      const found = getLocalOrders().find((o) => o.id === orderId);
      return found || getLocalOrders()[0];
    }
  },
};

export const paymentApi = {
  initiatePayment: async (orderId: number) => {
    try {
      const res = await api.post(`/payments/create-order/${orderId}`);
      return res.data;
    } catch {
      return {
        razorpayOrderId: 'order_rzp_demo_' + Date.now(),
        orderId,
        amount: 14999,
        currency: 'INR',
        keyId: 'rzp_test_YourKeyIdHere',
      };
    }
  },
  verifyPayment: async (payload: any) => {
    try {
      const res = await api.post('/payments/verify', payload);
      return res.data;
    } catch {
      return {
        success: true,
        message: 'Payment verified in local demo mode',
        orderNumber: 'SNS-DEMO-VERIFIED',
        paymentStatus: 'VERIFIED',
      };
    }
  },
};

export const socialApi = {
  getFriends: async (): Promise<Friend[]> => {
    try {
      const res = await api.get('/social/friends');
      return res.data;
    } catch {
      return DEMO_FRIENDS;
    }
  },
  getPendingRequests: async (): Promise<FriendRequest[]> => {
    try {
      const res = await api.get('/social/requests/pending');
      return res.data;
    } catch {
      return DEMO_FRIEND_REQUESTS;
    }
  },
  sendRequest: async (targetUserId: number): Promise<FriendRequest> => {
    try {
      const res = await api.post('/social/requests', { targetUserId });
      return res.data;
    } catch {
      const target = DEMO_USERS.find((u) => u.id === targetUserId);
      return {
        id: Date.now(),
        senderId: 1,
        senderUsername: 'admin',
        receiverId: targetUserId,
        receiverUsername: target?.username || 'user',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
    }
  },
  acceptRequest: async (requestId: number): Promise<FriendRequest> => {
    try {
      const res = await api.post(`/social/requests/${requestId}/accept`);
      return res.data;
    } catch {
      const idx = DEMO_FRIEND_REQUESTS.findIndex((r) => r.id === requestId);
      if (idx !== -1) {
        const req = DEMO_FRIEND_REQUESTS[idx];
        req.status = 'ACCEPTED';
        DEMO_FRIENDS.push({
          id: req.senderId,
          username: req.senderUsername,
          fullName: req.senderFullName,
          avatarUrl: req.senderAvatar,
        });
        DEMO_FRIEND_REQUESTS.splice(idx, 1);
        return req;
      }
      return DEMO_FRIEND_REQUESTS[0];
    }
  },
  rejectRequest: async (requestId: number): Promise<FriendRequest> => {
    try {
      const res = await api.post(`/social/requests/${requestId}/reject`);
      return res.data;
    } catch {
      const idx = DEMO_FRIEND_REQUESTS.findIndex((r) => r.id === requestId);
      if (idx !== -1) {
        const req = DEMO_FRIEND_REQUESTS[idx];
        req.status = 'REJECTED';
        DEMO_FRIEND_REQUESTS.splice(idx, 1);
        return req;
      }
      return DEMO_FRIEND_REQUESTS[0];
    }
  },
  getSentRequests: async (): Promise<FriendRequest[]> => {
    try {
      const res = await api.get('/social/requests/sent');
      return res.data;
    } catch {
      return [];
    }
  },
  getSuggestedFriends: async (): Promise<Friend[]> => {
    try {
      const res = await api.get('/social/suggested');
      return res.data;
    } catch {
      return DEMO_USERS.slice(1, 8).map(u => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
      }));
    }
  },
  cancelRequest: async (requestId: number): Promise<void> => {
    try {
      await api.delete(`/social/requests/${requestId}`);
    } catch {
      const idx = DEMO_FRIEND_REQUESTS.findIndex((r) => r.id === requestId);
      if (idx !== -1) DEMO_FRIEND_REQUESTS.splice(idx, 1);
    }
  },
  removeFriend: async (friendId: number): Promise<void> => {
    try {
      await api.delete(`/social/friends/${friendId}`);
    } catch {
      const idx = DEMO_FRIENDS.findIndex((f) => f.id === friendId);
      if (idx !== -1) DEMO_FRIENDS.splice(idx, 1);
    }
  },
  blockUser: async (targetUserId: number): Promise<void> => {
    try {
      await api.post(`/social/block/${targetUserId}`);
    } catch {}
  },
  unblockUser: async (targetUserId: number): Promise<void> => {
    try {
      await api.post(`/social/unblock/${targetUserId}`);
    } catch {}
  },
  followUser: async (targetUserId: number): Promise<void> => {
    try {
      await api.post(`/social/follow/${targetUserId}`);
    } catch {}
  },
};

export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const res = await api.get('/chat/conversations');
      return res.data;
    } catch {
      return DEMO_CONVERSATIONS;
    }
  },
  startConversation: async (recipientUserId: number): Promise<Conversation> => {
    try {
      const res = await api.post('/chat/conversations', { recipientUserId });
      return res.data;
    } catch {
      const target = DEMO_USERS.find((u) => u.id === recipientUserId) || DEMO_USERS[1];
      const existing = DEMO_CONVERSATIONS.find((c) =>
        c.participants.some((p) => p.id === recipientUserId)
      );
      if (existing) return existing;

      const newC: Conversation = {
        id: Date.now(),
        title: `${target.fullName || target.username} & You`,
        isGroup: false,
        participants: [
          { id: 1, username: 'admin', fullName: 'Platform Admin', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
          { id: target.id, username: target.username, fullName: target.fullName, avatarUrl: target.avatarUrl },
        ],
        updatedAt: new Date().toISOString(),
      };
      DEMO_CONVERSATIONS.unshift(newC);
      return newC;
    }
  },
  getMessages: async (conversationId: number): Promise<Message[]> => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`);
      return res.data;
    } catch {
      return DEMO_MESSAGES[conversationId] || [];
    }
  },
  sendMessage: async (conversationId: number, payload: { content?: string; sharedProductId?: number }): Promise<Message> => {
    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, payload);
      return res.data;
    } catch {
      const sharedProd = payload.sharedProductId
        ? DEMO_PRODUCTS.find((p) => p.id === payload.sharedProductId)
        : undefined;

      const newM: Message = {
        id: Date.now(),
        conversationId,
        senderId: 1,
        senderUsername: 'admin',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        content: payload.content || '',
        sharedProduct: sharedProd,
        createdAt: new Date().toISOString(),
      };

      if (!DEMO_MESSAGES[conversationId]) DEMO_MESSAGES[conversationId] = [];
      DEMO_MESSAGES[conversationId].push(newM);
      return newM;
    }
  },
};

export const videoApi = {
  getVideoFeed: async (page: number = 0, size: number = 10) => {
    try {
      const res = await api.get('/videos', { params: { page, size } });
      return res.data;
    } catch {
      return {
        content: DEMO_VIDEOS,
        totalPages: 1,
        totalElements: DEMO_VIDEOS.length,
      };
    }
  },
  uploadVideo: async (payload: any): Promise<ShoppingVideo> => {
    try {
      const res = await api.post('/videos', payload);
      return res.data;
    } catch {
      const tagged = (payload.taggedProductIds || []).map((id: number) =>
        DEMO_PRODUCTS.find((p) => p.id === id) || DEMO_PRODUCTS[0]
      );
      const newV: ShoppingVideo = {
        id: Date.now(),
        creatorId: 1,
        creatorUsername: 'admin',
        creatorFullName: 'Platform Administrator',
        creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        title: payload.title,
        description: payload.description,
        videoUrl: payload.videoUrl,
        thumbnailUrl: payload.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        likesCount: 0,
        viewsCount: 1,
        taggedProducts: tagged,
        createdAt: new Date().toISOString(),
      };
      DEMO_VIDEOS.unshift(newV);
      return newV;
    }
  },
  recordView: async (videoId: number): Promise<void> => {
    try {
      await api.post(`/videos/${videoId}/view`);
    } catch {
      const vid = DEMO_VIDEOS.find((v) => v.id === videoId);
      if (vid) vid.viewsCount++;
    }
  },
  likeVideo: async (videoId: number): Promise<number> => {
    try {
      const res = await api.post(`/videos/${videoId}/like`);
      return res.data;
    } catch {
      const vid = DEMO_VIDEOS.find((v) => v.id === videoId);
      if (vid) {
        vid.likesCount++;
        return vid.likesCount;
      }
      return 1;
    }
  },
};

export const recommendationApi = {
  getRecommendations: async (limit: number = 10): Promise<Product[]> => {
    try {
      const res = await api.get('/recommendations', { params: { limit } });
      return res.data;
    } catch {
      return DEMO_PRODUCTS.slice(0, limit);
    }
  },
};

export const giftApi = {
  getMyWishlist: async (): Promise<GiftWishlistItem[]> => {
    try {
      const res = await api.get('/gifts/wishlist');
      return res.data;
    } catch {
      const wishlists = getLocalWishlists();
      return wishlists[1] || [];
    }
  },
  addToWishlist: async (productId: number, isPublic: boolean = true): Promise<GiftWishlistItem> => {
    try {
      const res = await api.post('/gifts/wishlist', { productId, isPublic });
      return res.data;
    } catch {
      const wishlists = getLocalWishlists();
      if (!wishlists[1]) wishlists[1] = [];
      const prod = DEMO_PRODUCTS.find((p) => p.id === productId) || DEMO_PRODUCTS[0];
      const newItem: GiftWishlistItem = {
        id: Date.now(),
        userId: 1,
        username: 'admin',
        product: prod,
        isPublic,
        isReserved: false,
        createdAt: new Date().toISOString(),
      };
      wishlists[1].unshift(newItem);
      saveLocalWishlists(wishlists);
      return newItem;
    }
  },
  removeFromWishlist: async (productId: number): Promise<void> => {
    try {
      await api.delete(`/gifts/wishlist/${productId}`);
    } catch {
      const wishlists = getLocalWishlists();
      if (wishlists[1]) {
        wishlists[1] = wishlists[1].filter((w) => w.product.id !== productId);
        saveLocalWishlists(wishlists);
      }
    }
  },
  toggleReserveWishlistItem: async (wishlistId: number): Promise<GiftWishlistItem> => {
    try {
      const res = await api.post(`/gifts/wishlist/${wishlistId}/reserve`);
      return res.data;
    } catch {
      const wishlists = getLocalWishlists();
      let found: GiftWishlistItem | null = null;
      for (const uid in wishlists) {
        const item = wishlists[uid].find((w) => w.id === wishlistId);
        if (item) {
          item.isReserved = !item.isReserved;
          item.reservedByUsername = item.isReserved ? 'admin' : undefined;
          item.reservedByUserId = item.isReserved ? 1 : undefined;
          found = item;
          break;
        }
      }
      saveLocalWishlists(wishlists);
      return found || {
        id: wishlistId,
        userId: 2,
        username: 'friend',
        product: DEMO_PRODUCTS[0],
        isPublic: true,
        isReserved: true,
        createdAt: new Date().toISOString(),
      };
    }
  },
  getFriendGiftIdeas: async (friendId: number): Promise<FriendGiftIdeas> => {
    try {
      const res = await api.get(`/gifts/friends/${friendId}/ideas`);
      return res.data;
    } catch {
      const friend = DEMO_USERS.find((u) => u.id === friendId) || DEMO_USERS[1];
      const wishlists = getLocalWishlists();
      const wishlistItems = wishlists[friendId] || [];
      const recommendedGifts = DEMO_PRODUCTS.filter((p) => p.id % 2 === friendId % 2).slice(0, 6);

      return {
        friendId: friend.id,
        friendUsername: friend.username,
        friendFullName: friend.fullName,
        friendAvatar: friend.avatarUrl,
        wishlistItems,
        recommendedGifts: recommendedGifts.length > 0 ? recommendedGifts : DEMO_PRODUCTS.slice(0, 6),
      };
    }
  },
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    try {
      const res = await api.get('/admin/stats');
      return res.data;
    } catch {
      return {
        totalUsers: DEMO_USERS.length,
        totalProducts: DEMO_PRODUCTS.length,
        totalOrders: getLocalOrders().length,
        totalVideos: DEMO_VIDEOS.length,
        totalRevenue: getLocalOrders().reduce((sum, o) => sum + o.totalAmount, 0),
        pendingOrders: getLocalOrders().filter((o) => o.status === 'PENDING').length,
        paidOrders: getLocalOrders().filter((o) => o.status === 'PAID' || o.status === 'DELIVERED').length,
      };
    }
  },
  getOrders: async (status?: string, page: number = 0, size: number = 20) => {
    try {
      const res = await api.get('/admin/orders', { params: { status, page, size } });
      return res.data;
    } catch {
      const orders = getLocalOrders();
      return {
        content: orders,
        totalPages: 1,
        totalElements: orders.length,
      };
    }
  },
  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
      return res.data;
    } catch {
      const orders = getLocalOrders();
      const ord = orders.find((o) => o.id === orderId);
      if (ord) {
        ord.status = status as any;
        saveLocalOrders(orders);
        return ord;
      }
      return orders[0];
    }
  },
  getAllUsers: async (): Promise<UserProfile[]> => {
    try {
      const res = await api.get('/admin/users');
      return res.data;
    } catch {
      return DEMO_USERS;
    }
  },
  updateUserRole: async (userId: number, role: string): Promise<UserProfile> => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role });
      return res.data;
    } catch {
      const u = DEMO_USERS.find((usr) => usr.id === userId);
      if (u) u.role = role as any;
      return u || DEMO_USERS[0];
    }
  },
  updateProductStock: async (productId: number, stock: number): Promise<Product> => {
    try {
      const res = await api.patch(`/admin/products/${productId}/stock`, null, { params: { stock } });
      return res.data;
    } catch {
      const p = DEMO_PRODUCTS.find((prod) => prod.id === productId);
      if (p) p.stockQuantity = stock;
      return p || DEMO_PRODUCTS[0];
    }
  },
  createProduct: async (payload: any): Promise<Product> => {
    try {
      const res = await api.post('/admin/products', payload);
      return res.data;
    } catch {
      return productApi.createProduct(payload);
    }
  },
  updateProduct: async (productId: number, payload: any): Promise<Product> => {
    try {
      const res = await api.put(`/admin/products/${productId}`, payload);
      return res.data;
    } catch {
      const p = DEMO_PRODUCTS.find((prod) => prod.id === productId);
      if (p) Object.assign(p, payload);
      return p || DEMO_PRODUCTS[0];
    }
  },
  deleteProduct: async (productId: number): Promise<void> => {
    try {
      await api.delete(`/admin/products/${productId}`);
    } catch {
      const idx = DEMO_PRODUCTS.findIndex((p) => p.id === productId);
      if (idx !== -1) DEMO_PRODUCTS.splice(idx, 1);
    }
  },
};

export const mediaApi = {
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/media/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    }
  },
  uploadVideo: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/media/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch {
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    }
  },
};

export const notificationApi = {
  getNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch {
      return [];
    }
  },
  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await api.get('/notifications/unread-count');
      return res.data.unreadCount;
    } catch {
      return 0;
    }
  },
  markAsRead: async (id: number) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    } catch {}
  },
  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
    } catch {}
  },
  deleteNotification: async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch {}
  },
};

export const cashbackApi = {
  getOverview: async (): Promise<CashbackOverview> => {
    try {
      const res = await api.get('/cashback/overview');
      return res.data;
    } catch {
      return {
        availableBalance: 15.00,
        pendingBalance: 10.00,
        lifetimeEarned: 25.00,
        recentTransactions: [
          {
            id: 1,
            amount: 5.00,
            type: 'SOCIAL_CAMPAIGN',
            status: 'APPROVED',
            referenceId: 'SOC-CONNECT-INSTAGRAM',
            description: 'Welcome Reward: Connected Instagram account',
            campaignTitle: 'Connect Instagram & Earn $5.00',
            availableAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            amount: 10.00,
            type: 'PURCHASE_REWARD',
            status: 'PENDING',
            referenceId: 'ORDER-SNS-9912',
            description: '5% Cashback on Order #SNS-9912',
            availableAt: new Date(Date.now() + 7 * 86400000).toISOString(),
            createdAt: new Date().toISOString(),
          }
        ],
        activeCampaigns: [
          {
            id: 1,
            title: '5% Storewide Shopping Rewards',
            description: 'Earn 5% cashback on all qualifying orders. Approved 7 days after delivery.',
            rewardType: 'PERCENTAGE',
            rewardValue: 5.00,
            activityType: 'PURCHASE',
            isActive: true,
            badgeText: '5% BACK',
            terms: 'Applies automatically at checkout on all eligible items.',
            hasClaimed: false,
          },
          {
            id: 2,
            title: 'Connect Instagram & Earn $5.00',
            description: 'Link your verified Instagram creator or shopper profile to receive instant welcome reward credits.',
            rewardType: 'FIXED',
            rewardValue: 5.00,
            activityType: 'SOCIAL_CONNECT',
            isActive: true,
            badgeText: '$5 BONUS',
            terms: 'One-time bonus per verified social media handle.',
            hasClaimed: true,
          }
        ],
        eligibilitySummary: 'Cashback from qualifying purchases is credited as PENDING immediately and approved after our 7-day return policy.',
      };
    }
  },
  getCampaigns: async (): Promise<CashbackCampaign[]> => {
    try {
      const res = await api.get('/cashback/campaigns');
      return res.data;
    } catch {
      return [];
    }
  },
  claimReward: async (campaignId: number, claimDetails?: string, proofUrl?: string): Promise<ClaimResponse> => {
    const res = await api.post('/cashback/claim', { campaignId, claimDetails, proofUrl });
    return res.data;
  },
};

export const socialAccountsApi = {
  getProviders: async (): Promise<SocialProviderConfig[]> => {
    try {
      const res = await api.get('/social-accounts/providers');
      return res.data;
    } catch {
      return [
        {
          provider: 'INSTAGRAM',
          displayName: 'Instagram Creator & Business',
          icon: 'instagram',
          status: 'LIVE',
          description: 'Connect your official Instagram account to showcase creator posts and earn verified cashback rewards.',
          requiredPermissions: 'instagram_basic, pages_show_list',
          permissionsExplanation: 'Scroll & Shop only accesses your public profile handle and tagged media. We never access private direct messages.',
          isEligibleForCashback: true,
          cashbackRewardNote: 'Earn $5.00 Welcome Cashback when connecting a verified Instagram account!',
        },
        {
          provider: 'TIKTOK',
          displayName: 'TikTok Creator',
          icon: 'tiktok',
          status: 'LIVE',
          description: 'Sync your shoppable TikTok video reels and product showcases directly with your followers.',
          requiredPermissions: 'user.info.basic, video.list',
          permissionsExplanation: 'Read-only access to public videos tagged with Scroll & Shop products.',
          isEligibleForCashback: true,
          cashbackRewardNote: 'Earn $5.00 Cashback for connecting TikTok.',
        },
        {
          provider: 'YOUTUBE',
          displayName: 'YouTube Channel',
          icon: 'youtube',
          status: 'LIVE',
          description: 'Link your YouTube channel to feature unboxing videos, tech reviews, and gear recommendations.',
          requiredPermissions: 'https://www.googleapis.com/auth/youtube.readonly',
          permissionsExplanation: 'Read-only access to public channel metadata.',
          isEligibleForCashback: true,
          cashbackRewardNote: 'Eligible for Creator Partner cashback tiers.',
        },
        {
          provider: 'TWITTER',
          displayName: 'X / Twitter',
          icon: 'twitter',
          status: 'PENDING_APPROVAL',
          description: 'Official X API Developer App verification in progress. Integration is currently available in Sandbox developer test mode.',
          requiredPermissions: 'tweet.read, users.read',
          permissionsExplanation: 'Read-only access to public tweets mentioning Scroll & Shop deals.',
          isEligibleForCashback: false,
          cashbackRewardNote: 'Rewards will activate upon production API approval.',
        }
      ];
    }
  },
  getMyAccounts: async (): Promise<ConnectedSocialAccount[]> => {
    try {
      const res = await api.get('/social-accounts/my-accounts');
      return res.data;
    } catch {
      return [];
    }
  },
  connectAccount: async (payload: { provider: string; providerUsername?: string; providerDisplayName?: string; authorizationCode?: string; permissionsGranted?: string }): Promise<ConnectedSocialAccount> => {
    const res = await api.post('/social-accounts/connect', payload);
    return res.data;
  },
  disconnectAccount: async (provider: string): Promise<void> => {
    await api.delete(`/social-accounts/disconnect/${provider}`);
  },
};

export const feedApi = {
  getFeed: async (filter: string = 'FOR_YOU', page: number = 0, size: number = 20): Promise<SocialFeedResponse> => {
    try {
      const res = await api.get(`/feed?filter=${filter}&page=${page}&size=${size}`);
      return res.data;
    } catch {
      return {
        items: [],
        totalCount: 0,
        socialRatio: 30,
        shoppingRatio: 70,
      };
    }
  },
};

export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    try {
      const res = await api.get('/addresses');
      return res.data;
    } catch {
      const saved = localStorage.getItem('demo_addresses');
      return saved ? JSON.parse(saved) : [];
    }
  },
  addAddress: async (payload: AddressRequest): Promise<Address> => {
    try {
      const res = await api.post('/addresses', payload);
      return res.data;
    } catch {
      const saved = localStorage.getItem('demo_addresses');
      const list: Address[] = saved ? JSON.parse(saved) : [];
      if (payload.isDefault) {
        list.forEach((a) => (a.isDefault = false));
      }
      const newAddress: Address = {
        id: Date.now(),
        recipientName: payload.recipientName,
        phone: payload.phone,
        addressType: (payload.addressType as any) || 'HOME',
        houseNumber: payload.houseNumber,
        buildingName: payload.buildingName,
        street: payload.street,
        area: payload.area,
        landmark: payload.landmark,
        city: payload.city,
        district: payload.district,
        state: payload.state,
        postalCode: payload.postalCode,
        country: payload.country || 'India',
        isDefault: payload.isDefault || list.length === 0,
        createdAt: new Date().toISOString(),
      };
      list.unshift(newAddress);
      localStorage.setItem('demo_addresses', JSON.stringify(list));
      return newAddress;
    }
  },
  updateAddress: async (id: number, payload: AddressRequest): Promise<Address> => {
    try {
      const res = await api.put(`/addresses/${id}`, payload);
      return res.data;
    } catch {
      const saved = localStorage.getItem('demo_addresses');
      let list: Address[] = saved ? JSON.parse(saved) : [];
      if (payload.isDefault) {
        list.forEach((a) => (a.isDefault = false));
      }
      list = list.map((a) =>
        a.id === id
          ? {
              ...a,
              ...payload,
              addressType: (payload.addressType as any) || a.addressType,
              country: payload.country || a.country,
              isDefault: payload.isDefault !== undefined ? payload.isDefault : a.isDefault,
            }
          : a
      );
      localStorage.setItem('demo_addresses', JSON.stringify(list));
      return list.find((a) => a.id === id)!;
    }
  },
  deleteAddress: async (id: number): Promise<void> => {
    try {
      await api.delete(`/addresses/${id}`);
    } catch {
      const saved = localStorage.getItem('demo_addresses');
      if (saved) {
        const list: Address[] = JSON.parse(saved).filter((a: Address) => a.id !== id);
        localStorage.setItem('demo_addresses', JSON.stringify(list));
      }
    }
  },
  setDefaultAddress: async (id: number): Promise<Address> => {
    try {
      const res = await api.put(`/addresses/${id}/default`);
      return res.data;
    } catch {
      const saved = localStorage.getItem('demo_addresses');
      let list: Address[] = saved ? JSON.parse(saved) : [];
      list = list.map((a) => ({ ...a, isDefault: a.id === id }));
      localStorage.setItem('demo_addresses', JSON.stringify(list));
      return list.find((a) => a.id === id)!;
    }
  },
};

export default api;
