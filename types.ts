export type UserRole = 'user' | 'creator' | 'moderator' | 'community_manager' | 'marketplace_manager' | 'super_admin';

export type ThemeMode = 'light' | 'dark' | 'system';

export type NavigationTab = 
  | 'feed' 
  | 'friends' 
  | 'reels' 
  | 'live'
  | 'marketplace' 
  | 'groups' 
  | 'pages' 
  | 'messages' 
  | 'notifications' 
  | 'creator_studio' 
  | 'admin' 
  | 'profile' 
  | 'settings' 
  | 'search'
  | 'menu'
  | 'saved'
  | 'wallet';

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'received' | 'sent' | 'tip';
  title: string;
  description?: string;
  amount: number; // in USD
  status: 'completed' | 'pending' | 'failed';
  date: string;
  relativeTime: string;
  sender?: string;
  recipient?: string;
  reference: string;
  channel?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  coverImage?: string;
  coverPhoto?: string;
  bio: string;
  role: UserRole;
  isVerified: boolean;
  isBanned?: boolean;
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  joinedDate?: string;
  joinedAt?: string;
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  friends?: string[];
  isPrivate?: boolean;
  privacySettings?: {
    profileVisibility: 'public' | 'friends' | 'private';
    postAudienceDefault: 'public' | 'friends' | 'custom';
    whoCanMessage: 'everyone' | 'friends';
    whoCanFriendRequest: 'everyone' | 'friends_of_friends';
  };
  blockedUsers?: string[];
  restrictedUsers?: string[];
}

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface PostReaction {
  userId: string;
  userName: string;
  userAvatar: string;
  type: ReactionType;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userVerified?: boolean;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  likesCount?: number;
  likedBy?: string[];
  replies?: PostCommentReply[];
}

export interface PostCommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userVerified?: boolean;
  content: string;
  createdAt: string;
  likesCount?: number;
  likedBy?: string[];
}

export type PostAudience = 'public' | 'friends' | 'custom';

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // userIds
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar: string;
  authorVerified?: boolean;
  groupId?: string;
  groupName?: string;
  pageId?: string;
  pageName?: string;
  content: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'location' | 'background' | 'poll' | 'link';
  mediaUrls?: string[];
  media?: { type: 'image' | 'video'; url: string }[];
  audioUrl?: string;
  audioTitle?: string;
  backgroundColor?: string;
  locationName?: string;
  pollOptions?: PollOption[];
  linkPreview?: {
    url: string;
    title: string;
    description: string;
    image?: string;
  };
  audience?: PostAudience;
  reactions: PostReaction[];
  commentsCount?: number;
  comments?: PostComment[];
  sharesCount?: number;
  savesCount?: number;
  savedBy?: string[];
  createdAt: string;
  updatedAt?: string;
  isFlagged?: boolean;
  flagReason?: string;
  moderationStatus?: 'clean' | 'flagged' | 'pending';
}

export interface StoryOverlayText {
  id: string;
  text: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  color: string;
  bgColor?: string;
  fontStyle?: 'bold' | 'classic' | 'neon' | 'typewriter' | 'handwriting' | 'impact';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
}

export interface StorySticker {
  id: string;
  type: 'emoji' | 'location' | 'mention' | 'music' | 'time' | 'nemdan' | 'poll' | 'question' | 'badge';
  content: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  scale?: number;
  rotation?: number;
  extraData?: any;
}

export interface StoryItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userVerified?: boolean;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  backgroundGradient?: string;
  musicTitle?: string;
  filter?: string;
  cropAspect?: '9:16' | '1:1' | '4:5' | 'original';
  rotation?: number;
  zoom?: number;
  textOverlays?: StoryOverlayText[];
  stickers?: StorySticker[];
  createdAt: string;
  expiresAt: string;
  viewers: {
    userId: string;
    userName: string;
    userAvatar: string;
    viewedAt: string;
    reaction?: ReactionType | string;
  }[];
}

export interface Reel {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername?: string;
  creatorAvatar: string;
  creatorVerified?: boolean;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  audioTitle?: string;
  audioTrack?: string;
  viewsCount: number;
  reactions: PostReaction[];
  commentsCount: number;
  comments?: PostComment[];
  sharesCount: number;
  savesCount: number;
  savedBy?: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'audio' | 'sticker' | 'gif';
  content: string;
  mediaUrl?: string;
  audioDuration?: number;
  reactions?: { userId: string; emoji: string }[];
  isRead?: boolean;
  readBy?: string[];
  createdAt: string;
  deletedForEveryone?: boolean;
}

export interface Conversation {
  id: string;
  isGroup?: boolean;
  name?: string;
  groupAvatar?: string;
  participants: User[];
  participantIds?: string[];
  lastMessage?: Message;
  unreadCount?: number;
  updatedAt: string;
}

export interface CallSession {
  id: string;
  caller: User;
  receiver: User;
  type: 'voice' | 'video';
  status: 'calling' | 'connected' | 'ended' | 'rejected' | 'busy';
  startedAt?: string;
  endedAt?: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

export type NotificationType = 
  | 'like' 
  | 'reaction' 
  | 'comment' 
  | 'reply' 
  | 'friend_request' 
  | 'friend_accept' 
  | 'follow' 
  | 'message' 
  | 'story_react' 
  | 'reel_like' 
  | 'group_invite' 
  | 'group_activity' 
  | 'marketplace_order' 
  | 'moderation_alert'
  | 'live'
  | 'gift'
  | 'withdrawal'
  | 'referral'
  | 'system';

export interface NotificationItem {
  id: string;
  recipientId?: string;
  userId?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  title: string;
  content?: string;
  message?: string;
  targetUrl?: string;
  targetId?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  slug?: string;
  description: string;
  coverImage?: string;
  coverPhoto?: string;
  avatarImage?: string;
  category: string;
  privacy: 'public' | 'private';
  creatorId: string;
  creatorName?: string;
  adminIds?: string[];
  moderatorIds?: string[];
  members?: string[];
  memberIds?: string[];
  membersCount: number;
  rules?: { id: string; title: string; desc: string }[];
  createdAt: string;
}

export interface Page {
  id: string;
  name: string;
  username?: string;
  category: string;
  description: string;
  avatar: string;
  coverImage?: string;
  coverPhoto?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  location?: string;
  ownerId?: string;
  isVerified: boolean;
  followersCount: number;
  rating?: number;
  reviewCount?: number;
  adminIds?: string[];
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerVerified?: boolean;
  sellerRating: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  location: string;
  images: string[];
  isSold?: boolean;
  paymentMethod?: 'Cash on Delivery';
  deliveryMethod?: string;
  deliveryOptions?: ('Seller Delivery' | 'NEMDAN Express' | 'Local Pickup')[];
  createdAt: string;
}

export interface MarketplaceOrder {
  id: string;
  itemId: string;
  itemTitle?: string;
  itemPrice?: number;
  totalPrice?: number;
  itemImage?: string;
  sellerId: string;
  buyerId: string;
  buyerName?: string;
  buyerPhone?: string;
  recipientPhone?: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  deliveryType?: string;
  paymentMethod?: 'Cash on Delivery';
  status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface ModerationCase {
  id: string;
  targetType?: 'post' | 'comment' | 'reel' | 'marketplace' | 'user';
  targetId?: string;
  authorId?: string;
  authorName: string;
  contentSnippet: string;
  mediaUrl?: string;
  reportedBy?: string;
  reportReason?: string;
  category?: string;
  aiScore?: number;
  confidenceScore?: number;
  aiCategory?: string;
  aiExplanation?: string;
  explanation?: string;
  status: 'pending' | 'approved' | 'removed' | 'dismissed';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userUsername?: string;
  userAvatar: string;
  category: string;
  documentType: string;
  reason?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  createdAt?: string;
}

export type LiveStreamCategory = 
  | 'all' 
  | 'gaming' 
  | 'music' 
  | 'tech' 
  | 'just_chatting' 
  | 'lifestyle' 
  | 'education' 
  | 'fitness' 
  | 'art'
  | 'chat'
  | 'coding'
  | 'crypto'
  | 'trading'
  | 'general'
  | 'talk'
  | 'business';

export interface LiveStreamChatMessage {
  id: string;
  streamId: string;
  userId?: string;
  senderId?: string;
  userName?: string;
  senderName?: string;
  userAvatar?: string;
  senderAvatar?: string;
  userRole?: string;
  userVerified?: boolean;
  message?: string;
  content?: string;
  isHost?: boolean;
  type?: 'chat' | 'gift' | 'system' | 'pinned' | 'tip';
  gift?: {
    name: string;
    icon: string;
    amount: number;
  };
  giftDetails?: {
    icon: string;
    name: string;
    amount: number;
  };
  createdAt: string;
  timestamp?: number;
}

export interface VirtualGift {
  id: string;
  name: string;
  icon: string;
  animationType?: 'rose' | 'heart' | 'coffee' | 'diamond' | 'rocket' | 'lion' | 'crown' | 'universe' | 'star' | 'fire' | 'giftbox' | 'custom';
  animation?: string;
  coinPrice: number;
  coins?: number;
  description?: string;
  category?: 'classic' | 'popular' | 'luxury' | 'exclusive' | 'special';
  badge?: string;
  soundEffect?: string;
  isActive?: boolean;
}

export type VirtualGiftItem = VirtualGift;

export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins: number;
  priceUSD: number;
  priceNGN: number;
  popular?: boolean;
  badge?: string;
  icon: string;
}

export interface LiveStreamGift {
  id: string;
  streamId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  coinAmount: number;
  totalValueUSD: number;
  comboCount?: number;
  animationType: VirtualGift['animationType'];
  timestamp: number;
  createdAt: string;
}

export interface GifterLeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  totalCoins: number;
  rank: number;
  badge?: string;
}

export interface CreatorEarnings {
  creatorId: string;
  totalCoinsReceived: number;
  totalUSDValue: number;
  platformCommissionRate: number; // e.g. 0.20 (20%)
  netEarningsUSD: number;
  netEarningsNGN: number;
  availableBalanceUSD: number;
  availableBalanceNGN: number;
  totalWithdrawnUSD: number;
  pendingWithdrawalUSD: number;
  recentGifts: LiveStreamGift[];
}

export interface WithdrawalRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  amountUSD: number;
  amountNGN: number;
  paymentMethod: 'bank_transfer' | 'paypal' | 'crypto' | 'flutterwave_momo';
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    paypalEmail?: string;
    cryptoAddress?: string;
    cryptoNetwork?: string;
    phoneNumber?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  transactionReference?: string;
}

export interface ReferralConfig {
  rewardReferrerAmount: number; // e.g., 500 NGN or $1.00
  rewardRefereeAmount: number; // e.g., 200 NGN or $0.50
  currency: 'NGN' | 'USD';
  maxReferralsPerUser: number;
  isEnabled: boolean;
  minEligibilityRule: string;
  antiFraudEnabled: boolean;
}

export interface ReferralConversion {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeId: string;
  refereeName: string;
  refereeAvatar: string;
  refereeEmail: string;
  referredUserName?: string;
  referrerRewardNGN?: number;
  eligibilityStatus?: string;
  status: 'eligible' | 'rewarded' | 'pending' | 'flagged' | 'credited';
  referrerReward: number;
  refereeReward: number;
  currency: 'NGN' | 'USD';
  createdAt: string;
  completedAt?: string;
  fraudScore?: number;
  eligibilityCheck: {
    emailVerified: boolean;
    phoneVerified: boolean;
    uniqueIpVerified: boolean;
    profileCompleted: boolean;
  };
}

export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalConverted: number;
  totalEarnedNGN: number;
  totalEarnedUSD: number;
  pendingRewardsCount: number;
  pendingRewardsValue: number;
  conversionRate: number;
  monthlyGrowth: {
    month: string;
    conversions: number;
    earnings: number;
  }[];
}

export interface LiveStream {
  id: string;
  hostId: string;
  hostName: string;
  hostUsername: string;
  hostAvatar: string;
  hostRole?: string;
  hostVerified?: boolean;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  status: 'live' | 'ended';
  viewerCount: number;
  viewersCount?: number;
  peakViewers?: number;
  likesCount: number;
  totalCoinsReceived?: number;
  totalGiftsCount?: number;
  topGifters?: GifterLeaderboardEntry[];
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  videoUrl?: string;
  streamUrl?: string;
  thumbnailUrl: string;
  isMuted?: boolean;
  pinnedMessage?: string;
  replayChat?: LiveStreamChatMessage[];
  isHostOnline?: boolean;
}
