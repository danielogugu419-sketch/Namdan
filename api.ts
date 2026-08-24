import { 
  User, Post, StoryItem, Reel, Message, Conversation, 
  NotificationItem, Group, Page, MarketplaceItem, 
  MarketplaceOrder, ModerationCase, VerificationRequest,
  LiveStream, LiveStreamChatMessage,
  VirtualGift, CoinPackage, LiveStreamGift, GifterLeaderboardEntry,
  CreatorEarnings, WithdrawalRequest, ReferralConfig, ReferralConversion, ReferralStats 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(emailOrUsername: string, password?: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password })
    });
    return res.json();
  },

  async register(data: { name: string; username: string; email: string; phone?: string; role?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async sendOtp(phone: string, channel: 'sms' | 'whatsapp' = 'sms'): Promise<{ success: boolean; message: string; demoCode: string }> {
    const res = await fetch(`${API_BASE}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, channel })
    });
    return res.json();
  },

  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  async getUser(id: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`);
    return res.json();
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async toggleFriend(userId: string, senderId: string): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/users/${userId}/friend-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId })
    });
    return res.json();
  },

  // Posts & Uploads
  async uploadImage(dataUrl: string, name: string = 'photo.jpg', userId?: string): Promise<{ success: boolean; url: string; fileName: string; size: number }> {
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, name, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload photo');
    }
    return res.json();
  },

  async uploadMultipleImages(images: { dataUrl: string; name?: string }[], userId?: string): Promise<{ success: boolean; urls: string[]; count: number }> {
    const res = await fetch(`${API_BASE}/upload/multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Batch upload failed' }));
      throw new Error(err.error || 'Failed to upload photos');
    }
    return res.json();
  },

  async getPosts(tab?: string, userId?: string): Promise<Post[]> {
    const params = new URLSearchParams();
    if (tab) params.append('tab', tab);
    if (userId) params.append('userId', userId);
    const res = await fetch(`${API_BASE}/posts?${params.toString()}`);
    return res.json();
  },

  async createPost(postData: any): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    return res.json();
  },

  async reactPost(postId: string, userId: string, type: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${postId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type })
    });
    return res.json();
  },

  async votePoll(postId: string, userId: string, optionId: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, optionId })
    });
    return res.json();
  },

  async deletePost(postId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE' });
    return res.json();
  },

  // Comments
  async getComments(postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
    return res.json();
  },

  async addComment(postId: string, userId: string, content: string, mediaUrl?: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content, mediaUrl })
    });
    return res.json();
  },

  // Stories
  async getStories(): Promise<StoryItem[]> {
    const res = await fetch(`${API_BASE}/stories`);
    return res.json();
  },

  async createStory(data: any): Promise<StoryItem> {
    const res = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async viewStory(storyId: string, userId: string): Promise<StoryItem> {
    const res = await fetch(`${API_BASE}/stories/${storyId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async reactStory(storyId: string, userId: string, reaction: string): Promise<StoryItem> {
    const res = await fetch(`${API_BASE}/stories/${storyId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reaction })
    });
    return res.json();
  },

  async deleteStory(storyId: string, userId: string): Promise<{ success: boolean; storyId: string }> {
    const res = await fetch(`${API_BASE}/stories/${storyId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  // Reels
  async getReels(): Promise<Reel[]> {
    const res = await fetch(`${API_BASE}/reels`);
    return res.json();
  },

  async createReel(data: any): Promise<Reel> {
    const res = await fetch(`${API_BASE}/reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async reactReel(reelId: string, userId: string, type: string): Promise<Reel> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type })
    });
    return res.json();
  },

  // Messaging
  async getConversations(userId?: string): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations?userId=${userId || ''}`);
    return res.json();
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`);
    return res.json();
  },

  async sendMessage(conversationId: string, data: any): Promise<Message> {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Marketplace
  async getMarketplaceItems(category?: string, search?: string, sellerId?: string): Promise<MarketplaceItem[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (sellerId) params.append('sellerId', sellerId);
    const res = await fetch(`${API_BASE}/marketplace?${params.toString()}`);
    return res.json();
  },

  async createMarketplaceItem(data: any): Promise<MarketplaceItem> {
    const res = await fetch(`${API_BASE}/marketplace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async orderMarketplaceItem(orderData: any): Promise<MarketplaceOrder> {
    const res = await fetch(`${API_BASE}/marketplace/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  async getMarketplaceOrders(userId?: string): Promise<MarketplaceOrder[]> {
    const res = await fetch(`${API_BASE}/marketplace/orders?userId=${userId || ''}`);
    return res.json();
  },

  // Groups & Pages
  async getGroups(): Promise<Group[]> {
    const res = await fetch(`${API_BASE}/groups`);
    return res.json();
  },

  async createGroup(data: any): Promise<Group> {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async toggleJoinGroup(groupId: string, userId: string): Promise<Group> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async getPages(): Promise<Page[]> {
    const res = await fetch(`${API_BASE}/pages`);
    return res.json();
  },

  async createPage(data: any): Promise<Page> {
    const res = await fetch(`${API_BASE}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications?userId=${userId || ''}`);
    return res.json();
  },

  async markNotificationsRead(userId?: string) {
    const res = await fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  // Search
  async search(query: string) {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  // Creator & Admin
  async getCreatorStats(userId: string) {
    const res = await fetch(`${API_BASE}/creator/stats/${userId}`);
    return res.json();
  },

  async getAdminOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`);
    return res.json();
  },

  async getModerationQueue(): Promise<ModerationCase[]> {
    const res = await fetch(`${API_BASE}/admin/moderation`);
    return res.json();
  },

  async moderateDecision(caseId: string, decision: string, adminId?: string): Promise<ModerationCase> {
    const res = await fetch(`${API_BASE}/admin/moderation/${caseId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, adminId })
    });
    return res.json();
  },

  async getVerifications(): Promise<VerificationRequest[]> {
    const res = await fetch(`${API_BASE}/admin/verifications`);
    return res.json();
  },

  async verificationDecision(reqId: string, decision: string): Promise<VerificationRequest> {
    const res = await fetch(`${API_BASE}/admin/verifications/${reqId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });
    return res.json();
  },

  async requestVerification(data: any): Promise<VerificationRequest> {
    const res = await fetch(`${API_BASE}/verification/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Live Streams
  async getLiveStreams(category?: string, status?: 'live' | 'ended'): Promise<LiveStream[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (status) params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/live/streams${qs}`);
    return res.json();
  },

  async getLiveStream(id: string): Promise<LiveStream> {
    const res = await fetch(`${API_BASE}/live/streams/${id}`);
    return res.json();
  },

  async getLiveStreamMessages(streamId: string): Promise<LiveStreamChatMessage[]> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/messages`);
    return res.json();
  },

  async createLiveStream(data: Partial<LiveStream>): Promise<LiveStream> {
    const res = await fetch(`${API_BASE}/live/streams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async endLiveStream(streamId: string, durationSeconds?: number): Promise<LiveStream> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationSeconds })
    });
    return res.json();
  },

  async sendLiveChatMessage(streamId: string, data: { userId?: string; senderId?: string; message?: string; content?: string; senderName?: string; senderAvatar?: string; isHost?: boolean; type?: string; giftDetails?: any }): Promise<LiveStreamChatMessage> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async sendLiveReaction(streamId: string, data: { userId?: string; type?: string; delta?: number }): Promise<{ success: boolean; likesCount: number }> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateLiveViewers(streamId: string, delta: number): Promise<{ success: boolean; viewerCount: number }> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/viewers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    });
    return res.json();
  },

  async pinLiveMessage(streamId: string, pinnedMessage: string): Promise<LiveStream> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinnedMessage })
    });
    return res.json();
  },

  async getLiveChatMessages(streamId: string): Promise<LiveStreamChatMessage[]> {
    return this.getLiveStreamMessages(streamId);
  },

  async reactLiveStream(streamId: string, data: { userId?: string; type?: string; delta?: number }): Promise<{ success: boolean; likesCount: number }> {
    return this.sendLiveReaction(streamId, data);
  },

  async getStreamGiftLeaderboard(streamId: string): Promise<GifterLeaderboardEntry[]> {
    return this.getStreamLeaderboard(streamId);
  },

  // Virtual Coins
  async getCoinBalance(userId: string): Promise<{ userId: string; coins: number }> {
    const res = await fetch(`${API_BASE}/coins/balance/${userId}`);
    return res.json();
  },

  async getCoinPackages(): Promise<CoinPackage[]> {
    const res = await fetch(`${API_BASE}/coins/packages`);
    return res.json();
  },

  async purchaseCoins(userId: string, packageId?: string, customAmount?: number, paymentMethod: string = 'card'): Promise<{ success: boolean; newBalance: number; addedCoins: number }> {
    const res = await fetch(`${API_BASE}/coins/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, packageId, customAmount, paymentMethod })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Coin purchase failed' }));
      throw new Error(err.error || 'Coin purchase failed');
    }
    return res.json();
  },

  async updateCoinPackage(packageId: string, updates: Partial<CoinPackage>): Promise<CoinPackage> {
    const res = await fetch(`${API_BASE}/admin/coins/packages/${packageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Virtual Gifts Catalog & Gifting
  async getVirtualGifts(): Promise<VirtualGift[]> {
    const res = await fetch(`${API_BASE}/gifts`);
    return res.json();
  },

  async createVirtualGift(giftData: Partial<VirtualGift>): Promise<VirtualGift> {
    const res = await fetch(`${API_BASE}/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(giftData)
    });
    return res.json();
  },

  async updateVirtualGift(giftId: string, updates: Partial<VirtualGift>): Promise<VirtualGift> {
    const res = await fetch(`${API_BASE}/gifts/${giftId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteVirtualGift(giftId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/gifts/${giftId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async sendLiveGift(streamId: string, senderId: string, giftId: string, comboCount: number = 1): Promise<{ gift: LiveStreamGift; senderCoins: number; leaderboard: GifterLeaderboardEntry[]; stream: LiveStream }> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, giftId, comboCount })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gift transfer failed' }));
      throw new Error(err.error || 'Failed to send gift');
    }
    return res.json();
  },

  async getStreamGifts(streamId: string): Promise<LiveStreamGift[]> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/gifts`);
    return res.json();
  },

  async getStreamLeaderboard(streamId: string): Promise<GifterLeaderboardEntry[]> {
    const res = await fetch(`${API_BASE}/live/streams/${streamId}/leaderboard`);
    return res.json();
  },

  // Creator Earnings & Withdrawals
  async getCreatorEarnings(creatorId: string): Promise<CreatorEarnings> {
    const res = await fetch(`${API_BASE}/creator/earnings/${creatorId}`);
    return res.json();
  },

  async getWithdrawals(creatorId?: string): Promise<WithdrawalRequest[]> {
    const params = new URLSearchParams();
    if (creatorId) params.append('creatorId', creatorId);
    const res = await fetch(`${API_BASE}/creator/withdrawals?${params.toString()}`);
    return res.json();
  },

  async requestWithdrawal(data: { creatorId: string; amountUSD: number; paymentMethod: string; accountDetails: any }): Promise<WithdrawalRequest> {
    const res = await fetch(`${API_BASE}/creator/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Withdrawal request failed' }));
      throw new Error(err.error || 'Failed to request withdrawal');
    }
    return res.json();
  },

  async approveWithdrawal(requestId: string, reviewerId?: string): Promise<WithdrawalRequest> {
    const res = await fetch(`${API_BASE}/admin/withdrawals/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId })
    });
    return res.json();
  },

  async rejectWithdrawal(requestId: string, reason?: string, reviewerId?: string): Promise<WithdrawalRequest> {
    const res = await fetch(`${API_BASE}/admin/withdrawals/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, reviewerId })
    });
    return res.json();
  },

  async setPlatformCommission(rate: number): Promise<{ success: boolean; platformCommissionRate: number }> {
    const res = await fetch(`${API_BASE}/admin/settings/commission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate })
    });
    return res.json();
  },

  // Referral Rewards
  async getReferralStats(userId: string): Promise<ReferralStats> {
    const res = await fetch(`${API_BASE}/referrals/stats/${userId}`);
    return res.json();
  },

  async getReferralConversions(userId: string): Promise<ReferralConversion[]> {
    const res = await fetch(`${API_BASE}/referrals/conversions/${userId}`);
    return res.json();
  },

  async getAllReferralConversions(): Promise<ReferralConversion[]> {
    const res = await fetch(`${API_BASE}/admin/referrals/conversions`);
    return res.json();
  },

  async getReferralConfig(): Promise<ReferralConfig> {
    const res = await fetch(`${API_BASE}/admin/referrals/config`);
    return res.json();
  },

  async updateReferralConfig(config: Partial<ReferralConfig>): Promise<ReferralConfig> {
    const res = await fetch(`${API_BASE}/admin/referrals/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  }
};
