import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, AuthResponse, AddressRequest, SellerRegistrationRequest, AuthPendingIntent, AuthIntentActionType } from '../types';
import { authApi } from '../services/api';

export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword?: string;
  agreeTerms?: boolean;
  email?: string;
  fullName?: string;
  bio?: string;
  phoneNumber?: string;
  accountType?: 'CUSTOMER' | 'SELLER';
  address?: AddressRequest;
  sellerDetails?: SellerRegistrationRequest;
  interests?: string[];
  feedPreference?: string;
  preferredBrands?: string;
  preferredPriceRange?: string;
  connectedInstagramHandle?: string;
}

export interface IntentOptions {
  actionType?: AuthIntentActionType;
  payload?: Record<string, any>;
  returnUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<string | null>;
  register: (payload: RegisterPayload) => Promise<string | null>;
  logout: () => void;
  updateProfile: (payload: { fullName?: string; bio?: string; avatarUrl?: string; email?: string; phoneNumber?: string; isPersonalizationEnabled?: boolean; interests?: string; feedPreference?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;

  // Centralized Auth Guard
  requireAuth: (
    callback: () => void | Promise<void>,
    actionDescription?: string,
    intentOptions?: IntentOptions
  ) => boolean;

  // Pending intent metadata
  pendingIntent: AuthPendingIntent | null;
  clearPendingIntent: () => void;

  // Protected Guest Action Interceptor Modal (preserved for fallback)
  isAuthModalOpen: boolean;
  authModalActionName: string;
  openAuthModal: (actionName?: string, callback?: () => void) => void;
  closeAuthModal: () => void;

  // Optional Social Onboarding Modal
  isSocialOnboardingOpen: boolean;
  openSocialOnboarding: () => void;
  closeSocialOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sanitizeReturnUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string') return '/';
  const trimmed = url.trim();
  // Safe local relative URLs only
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('javascript:') && !trimmed.includes('data:')) {
    return trimmed;
  }
  return '/';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        return JSON.parse(saved);
      }
    } catch {
      localStorage.removeItem('user');
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('token');
      return saved && saved !== 'undefined' && saved !== 'null' ? saved : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Intent State
  const [pendingIntent, setPendingIntent] = useState<AuthPendingIntent | null>(() => {
    try {
      const raw = sessionStorage.getItem('scrollshop_pending_intent');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  });

  // Modal State for Guest Actions
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalActionName, setAuthModalActionName] = useState('continue');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Modal State for Social Onboarding
  const [isSocialOnboardingOpen, setIsSocialOnboardingOpen] = useState(false);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken || currentToken === 'undefined' || currentToken === 'null') {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (err) {
      console.warn('Could not sync user profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const openAuthModal = (actionName: string = 'continue', callback?: () => void) => {
    setAuthModalActionName(actionName);
    if (callback) {
      setPendingAction(() => callback);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  const openSocialOnboarding = () => setIsSocialOnboardingOpen(true);
  const closeSocialOnboarding = () => setIsSocialOnboardingOpen(false);

  const clearPendingIntent = () => {
    sessionStorage.removeItem('scrollshop_pending_intent');
    sessionStorage.removeItem('auth_redirect');
    setPendingIntent(null);
  };

  /**
   * Execute preserved intent safely after login or registration.
   * Clears intent immediately to prevent duplicate actions.
   */
  const executePendingAction = async (): Promise<string | null> => {
    // 1. Run in-memory pending callback if present
    if (pendingAction) {
      const actionToRun = pendingAction;
      setPendingAction(null);
      try {
        await actionToRun();
      } catch (e) {
        console.warn('Could not complete in-memory resumed action', e);
      }
    }

    // 2. Check serialized persistent intent in sessionStorage
    const rawIntent = sessionStorage.getItem('scrollshop_pending_intent');
    if (!rawIntent) return null;

    // Immediately remove to prevent double execution
    sessionStorage.removeItem('scrollshop_pending_intent');
    setPendingIntent(null);

    try {
      const intent: AuthPendingIntent = JSON.parse(rawIntent);

      // Ignore intents older than 1 hour
      if (intent.timestamp && Date.now() - intent.timestamp > 3600 * 1000) {
        return sanitizeReturnUrl(intent.returnUrl);
      }

      switch (intent.actionType) {
        case 'ADD_TO_CART':
          if (intent.payload?.productId) {
            const { cartApi } = await import('../services/api');
            await cartApi.addToCart(intent.payload.productId, intent.payload.quantity || 1);
          }
          break;

        case 'BUY_NOW':
          if (intent.payload?.productId) {
            const { cartApi } = await import('../services/api');
            await cartApi.addToCart(intent.payload.productId, intent.payload.quantity || 1);
            return '/checkout';
          }
          break;

        case 'TOGGLE_LIKE_PRODUCT':
          if (intent.payload?.productId) {
            const { productApi } = await import('../services/api');
            await productApi.toggleLike(intent.payload.productId);
          }
          break;

        case 'TOGGLE_LIKE_VIDEO':
          if (intent.payload?.videoId) {
            const { videoApi } = await import('../services/api');
            await videoApi.likeVideo(intent.payload.videoId);
          }
          break;

        case 'ADD_WISHLIST':
          if (intent.payload?.productId) {
            const { giftApi } = await import('../services/api');
            await giftApi.addToWishlist(intent.payload.productId, true);
          }
          break;

        case 'SEND_FRIEND_REQUEST':
          if (intent.payload?.targetUserId) {
            const { socialApi } = await import('../services/api');
            await socialApi.sendRequest(intent.payload.targetUserId);
          }
          break;

        case 'ACCEPT_FRIEND_REQUEST':
          if (intent.payload?.requestId) {
            const { socialApi } = await import('../services/api');
            await socialApi.acceptRequest(intent.payload.requestId);
          }
          break;

        case 'FOLLOW_USER':
          if (intent.payload?.targetUserId) {
            const { socialApi } = await import('../services/api');
            await socialApi.followUser(intent.payload.targetUserId);
          }
          break;

        case 'ADD_PRODUCT_COMMENT':
          if (intent.payload?.productId && intent.payload?.content) {
            const { productApi } = await import('../services/api');
            await productApi.addComment(intent.payload.productId, {
              content: intent.payload.content,
              parentCommentId: intent.payload.parentCommentId,
            });
          }
          break;

        case 'SEND_MESSAGE':
          if (intent.payload?.recipientId && intent.payload?.content) {
            const { chatApi } = await import('../services/api');
            const conv = await chatApi.startConversation(intent.payload.recipientId);
            await chatApi.sendMessage(conv.id, {
              content: intent.payload.content,
              sharedProductId: intent.payload.sharedProductId,
            });
            return `/chat?userId=${intent.payload.recipientId}`;
          }
          break;

        case 'START_CHAT':
          if (intent.payload?.userId) {
            return `/chat?userId=${intent.payload.userId}`;
          }
          break;

        case 'SEND_GIFT':
          if (intent.payload?.productId) {
            const { cartApi } = await import('../services/api');
            await cartApi.addToCart(intent.payload.productId, 1);
            return `/checkout?gift=true&friendId=${intent.payload.friendId || ''}`;
          }
          break;

        default:
          break;
      }

      return sanitizeReturnUrl(intent.returnUrl);
    } catch (e) {
      console.warn('Could not complete persistent resumed intent', e);
      return null;
    }
  };

  const login = async (usernameOrEmail: string, password: string): Promise<string | null> => {
    const res: AuthResponse = await authApi.login(usernameOrEmail, password);
    setToken(res.token);
    localStorage.setItem('token', res.token);
    const profile: UserProfile = {
      id: res.id,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      avatarUrl: res.avatarUrl,
      role: res.role,
      isPersonalizationEnabled: res.isPersonalizationEnabled ?? true,
      friendCount: 0,
      isFriend: false,
      isPendingRequest: false,
      isBlocked: false,
    };
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
    await refreshUser();

    // Close auth modal and execute preserved action
    setIsAuthModalOpen(false);
    const resumePath = await executePendingAction();
    const storedRedirect = sessionStorage.getItem('auth_redirect');
    sessionStorage.removeItem('auth_redirect');

    const destination = resumePath || (storedRedirect ? sanitizeReturnUrl(storedRedirect) : null);
    return destination;
  };

  const register = async (payload: RegisterPayload): Promise<string | null> => {
    const res: AuthResponse = await authApi.register(payload);
    setToken(res.token);
    localStorage.setItem('token', res.token);
    const profile: UserProfile = {
      id: res.id,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      avatarUrl: res.avatarUrl,
      role: res.role,
      isPersonalizationEnabled: res.isPersonalizationEnabled ?? true,
      friendCount: 0,
      isFriend: false,
      isPendingRequest: false,
      isBlocked: false,
    };
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
    await refreshUser();

    // Close auth modal & execute preserved action
    setIsAuthModalOpen(false);
    const resumePath = await executePendingAction();
    const storedRedirect = sessionStorage.getItem('auth_redirect');
    sessionStorage.removeItem('auth_redirect');

    // Prompt optional social onboarding step for new users if not seller
    if (payload.accountType !== 'SELLER') {
      setTimeout(() => {
        setIsSocialOnboardingOpen(true);
      }, 400);
    }

    const destination = resumePath || (storedRedirect ? sanitizeReturnUrl(storedRedirect) : null);
    return destination;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearPendingIntent();
  };

  const updateProfile = async (payload: { fullName?: string; bio?: string; avatarUrl?: string; email?: string; phoneNumber?: string; isPersonalizationEnabled?: boolean; interests?: string; feedPreference?: string }) => {
    const updated = await authApi.updateProfile(payload);
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  /**
   * Centralized authentication guard for all protected user actions:
   * - If user is logged in: executes callback immediately and returns true.
   * - If guest: preserves the intended action, payload, and returnUrl in sessionStorage,
   *   and redirects to the authentication page (/login). Returns false.
   */
  const requireAuth = useCallback(
    (
      callback: () => void | Promise<void>,
      actionDescription: string = 'perform this action',
      intentOptions?: IntentOptions
    ): boolean => {
      if (token && user) {
        callback();
        return true;
      }

      // Determine returnUrl
      const currentPath = window.location.pathname + window.location.search;
      const safeReturnUrl = sanitizeReturnUrl(intentOptions?.returnUrl || currentPath);

      const intentObj: AuthPendingIntent = {
        actionType: intentOptions?.actionType || 'GENERIC',
        actionDescription,
        returnUrl: safeReturnUrl,
        payload: intentOptions?.payload || {},
        timestamp: Date.now(),
      };

      try {
        sessionStorage.setItem('scrollshop_pending_intent', JSON.stringify(intentObj));
        sessionStorage.setItem('auth_redirect', safeReturnUrl);
        setPendingIntent(intentObj);
      } catch (e) {
        console.warn('Storage error saving pending intent', e);
      }

      // Navigate to dedicated login / authentication page
      navigate('/login', {
        state: {
          actionDescription,
          returnUrl: safeReturnUrl,
          actionType: intentObj.actionType,
        },
      });

      return false;
    },
    [token, user, navigate]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        requireAuth,
        pendingIntent,
        clearPendingIntent,
        isAuthModalOpen,
        authModalActionName,
        openAuthModal,
        closeAuthModal,
        isSocialOnboardingOpen,
        openSocialOnboarding,
        closeSocialOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
