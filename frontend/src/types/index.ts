export interface Address {
  id: number;
  recipientName: string;
  phone: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  houseNumber: string;
  buildingName?: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface AddressRequest {
  recipientName: string;
  phone: string;
  addressType?: string;
  houseNumber: string;
  buildingName?: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface SellerProfile {
  id: number;
  userId: number;
  storeName: string;
  storeHandle: string;
  businessType?: string;
  businessCategory?: string;
  storeDescription?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  pickupAddress?: string;
  operatingRegion?: string;
  shippingPreference?: string;
  returnPolicy?: string;
  verificationStatus: 'PENDING_VERIFICATION' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  createdAt?: string;
}

export interface SellerRegistrationRequest {
  storeName: string;
  storeHandle: string;
  businessType?: string;
  businessCategory?: string;
  storeDescription?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  pickupAddress?: string;
  operatingRegion?: string;
  shippingPreference?: string;
  returnPolicy?: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN' | 'CREATOR';
  isPersonalizationEnabled: boolean;
  interests?: string;
  feedPreference?: string;
  preferredBrands?: string;
  preferredPriceRange?: string;
  sellerProfile?: SellerProfile;
}

export interface UserProfile extends User {
  friendCount: number;
  isFriend: boolean;
  isPendingRequest: boolean;
  isBlocked: boolean;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN' | 'CREATOR';
  isPersonalizationEnabled: boolean;
  sellerProfile?: SellerProfile;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  brand?: string;
  mainImageUrl: string;
  galleryImages: string[];
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  isDealOfTheDay: boolean;
  tags?: string;
  searchKeywords?: string;
  isLikedByCurrentUser: boolean;
  likeCount: number;
  commentCount: number;
}

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  username: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ProductComment {
  id: number;
  productId: number;
  userId: number;
  username: string;
  userAvatar?: string;
  content: string;
  parentCommentId?: number;
  replies: ProductComment[];
  createdAt: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productTitle: string;
  productSlug: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
  itemTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  estimatedShipping: number;
  estimatedTax: number;
  total: number;
  totalItemCount: number;
}

export interface OrderItem {
  id: number;
  productId?: number;
  productTitle: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  username: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  subtotalAmount: number;
  shippingFee: number;
  taxAmount: number;
  shippingName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingPhone: string;
  isGift: boolean;
  giftRecipientId?: number;
  giftRecipientUsername?: string;
  giftMessage?: string;
  giftWrappingOption?: string;
  items: OrderItem[];
  paymentStatus: string;
  razorpayOrderId?: string;
  createdAt: string;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  senderUsername: string;
  senderFullName?: string;
  senderAvatar?: string;
  receiverId: number;
  receiverUsername: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Friend {
  id: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface ConversationParticipant {
  id: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  senderAvatar?: string;
  content: string;
  sharedProduct?: Product;
  createdAt: string;
}

export interface Conversation {
  id: number;
  title?: string;
  isGroup: boolean;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface ShoppingVideo {
  id: number;
  creatorId: number;
  creatorUsername: string;
  creatorFullName?: string;
  creatorAvatar?: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  likesCount: number;
  viewsCount: number;
  taggedProducts: Product[];
  createdAt: string;
}

export interface GiftWishlistItem {
  id: number;
  userId: number;
  username: string;
  product: Product;
  isPublic: boolean;
  isReserved: boolean;
  reservedByUserId?: number;
  reservedByUsername?: string;
  createdAt: string;
}

export interface FriendGiftIdeas {
  friendId: number;
  friendUsername: string;
  friendFullName?: string;
  friendAvatar?: string;
  wishlistItems: GiftWishlistItem[];
  recommendedGifts: Product[];
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalVideos: number;
  totalRevenue: number;
  pendingOrders: number;
  paidOrders: number;
}

export interface SocialProviderConfig {
  provider: string;
  displayName: string;
  icon: string;
  status: 'LIVE' | 'SANDBOX_AVAILABLE' | 'PENDING_APPROVAL';
  description: string;
  requiredPermissions: string;
  permissionsExplanation: string;
  isEligibleForCashback: boolean;
  cashbackRewardNote?: string;
}

export interface ConnectedSocialAccount {
  id: number;
  provider: string;
  providerUserId?: string;
  providerUsername?: string;
  providerDisplayName?: string;
  profilePictureUrl?: string;
  status: 'CONNECTED' | 'PENDING_VERIFICATION' | 'REVOKED' | 'DISCONNECTED';
  permissionsGranted?: string;
  isVerified: boolean;
  rewardClaimed: boolean;
  connectedAt: string;
  lastSyncAt?: string;
}

export interface CashbackTransaction {
  id: number;
  amount: number;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVERSED';
  referenceId?: string;
  description?: string;
  campaignTitle?: string;
  availableAt?: string;
  createdAt: string;
}

export interface CashbackCampaign {
  id: number;
  title: string;
  description?: string;
  rewardType: string;
  rewardValue: number;
  activityType: string;
  minPurchaseAmount?: number;
  maxCashbackPerUser?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  terms?: string;
  badgeText?: string;
  hasClaimed?: boolean;
}

export interface CashbackOverview {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarned: number;
  recentTransactions: CashbackTransaction[];
  activeCampaigns: CashbackCampaign[];
  eligibilitySummary: string;
}

export interface ClaimResponse {
  claimId: number;
  campaignId: number;
  campaignTitle: string;
  rewardAmount: number;
  status: string;
  message: string;
}

export interface FeedItem {
  id: string;
  itemType: 'SOCIAL_POST' | 'SHOPPING_PRODUCT' | 'SHOPPING_VIDEO' | 'DEAL_HIGHLIGHT';
  contentRatioCategory: 'SOCIAL' | 'SHOPPING';
  postId?: number;
  creatorUsername?: string;
  creatorFullName?: string;
  creatorAvatar?: string;
  creatorRole?: string;
  postContent?: string;
  postImageUrl?: string;
  likeCount?: number;
  commentCount?: number;
  isLikedByMe?: boolean;
  product?: Product;
  video?: ShoppingVideo;
  timestamp: string;
}

export interface SocialFeedResponse {
  items: FeedItem[];
  totalCount: number;
  socialRatio: number;
  shoppingRatio: number;
}

export type AuthIntentActionType =
  | 'ADD_TO_CART'
  | 'BUY_NOW'
  | 'ADD_WISHLIST'
  | 'TOGGLE_LIKE_PRODUCT'
  | 'TOGGLE_LIKE_POST'
  | 'TOGGLE_LIKE_VIDEO'
  | 'FOLLOW_USER'
  | 'COMMENT_POST'
  | 'COMMENT_VIDEO'
  | 'ADD_PRODUCT_COMMENT'
  | 'SEND_FRIEND_REQUEST'
  | 'ACCEPT_FRIEND_REQUEST'
  | 'REJECT_FRIEND_REQUEST'
  | 'CANCEL_FRIEND_REQUEST'
  | 'SEND_MESSAGE'
  | 'START_CHAT'
  | 'WRITE_REVIEW'
  | 'SHARE_PRODUCT'
  | 'UPLOAD_VIDEO'
  | 'SEND_GIFT'
  | 'CLAIM_CASHBACK'
  | 'GENERIC';

export interface AuthPendingIntent {
  actionType: AuthIntentActionType;
  actionDescription: string;
  returnUrl: string;
  payload?: Record<string, any>;
  timestamp: number;
}

