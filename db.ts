import { 
  User, Post, StoryItem, Reel, Message, Conversation, 
  NotificationItem, Group, Page, MarketplaceItem, 
  MarketplaceOrder, ModerationCase, VerificationRequest,
  PostComment, LiveStream, LiveStreamChatMessage,
  VirtualGift, CoinPackage, LiveStreamGift, GifterLeaderboardEntry,
  CreatorEarnings, WithdrawalRequest, ReferralConfig, ReferralConversion, ReferralStats 
} from '../types.js';

// Pre-seeded users with distinctive roles
export const initialUsers: User[] = [
  {
    id: 'u_admin',
    username: 'daniel_admin',
    name: 'Daniel O. (Super Admin)',
    email: 'danielogugu419@gmail.com',
    phone: '08142883388',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Platform Lead & Architect at NEMDAN. Building the future of authentic global social connection.',
    role: 'super_admin',
    isVerified: true,
    location: 'San Francisco, CA',
    website: 'https://nemdan.global',
    work: 'Lead Architect @ NEMDAN',
    education: 'Stanford University',
    joinedDate: 'January 2025',
    followersCount: 14200,
    followingCount: 380,
    friendsCount: 520,
    isPrivate: false,
    privacySettings: {
      profileVisibility: 'public',
      postAudienceDefault: 'public',
      whoCanMessage: 'everyone',
      whoCanFriendRequest: 'everyone'
    }
  },
  {
    id: 'u_alex',
    username: 'alexrivera',
    name: 'Alex Rivera',
    email: 'alex@creator.nemdan',
    phone: '+1 (555) 432-8899',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    bio: 'Tech Journalist, AI Researcher & Filmmaker. Sharing daily Reels on futuristic robotics & digital culture 🚀',
    role: 'creator',
    isVerified: true,
    location: 'Tokyo / New York',
    website: 'https://alexrivera.tech',
    work: 'Founding Editor @ FutureCast',
    education: 'MIT Media Lab',
    joinedDate: 'March 2025',
    followersCount: 89400,
    followingCount: 240,
    friendsCount: 310,
    isPrivate: false
  },
  {
    id: 'u_elena',
    username: 'elenavance',
    name: 'Elena Vance',
    email: 'elena@design.nemdan',
    phone: '+1 (555) 765-1122',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    bio: 'Visual artist, UI curator & sustainable fashion trader. Passionate about community workshops and craft.',
    role: 'marketplace_manager',
    isVerified: true,
    location: 'Stockholm, Sweden',
    website: 'https://elenavance.studio',
    work: 'Principal Designer @ Vance Creatives',
    education: 'Royal College of Art',
    joinedDate: 'April 2025',
    followersCount: 25600,
    followingCount: 410,
    friendsCount: 480,
    isPrivate: false
  },
  {
    id: 'u_marcus',
    username: 'marcuschen',
    name: 'Marcus Chen',
    email: 'marcus@community.nemdan',
    phone: '+1 (555) 998-3344',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80',
    bio: 'Community Lead for Developers & Indie Hackers. Host of the weekly NEMDAN Builders Open Space 🎙️',
    role: 'community_manager',
    isVerified: true,
    location: 'Singapore',
    website: 'https://chenmarcus.io',
    work: 'Community Director @ OpenDev',
    education: 'National University of Singapore',
    joinedDate: 'February 2025',
    followersCount: 31200,
    followingCount: 520,
    friendsCount: 610,
    isPrivate: false
  },
  {
    id: 'u_sarah',
    username: 'sarah_j',
    name: 'Sarah Jenkins',
    email: 'sarah@nemdan.test',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    bio: 'Photographer & avid traveler. Currently exploring Scandinavia and documenting architectural wonders.',
    role: 'user',
    isVerified: false,
    location: 'Vancouver, Canada',
    website: 'https://sarahvisuals.photo',
    work: 'Freelance Photographer',
    education: 'Emily Carr University',
    joinedDate: 'May 2025',
    followersCount: 4200,
    followingCount: 340,
    friendsCount: 290,
    isPrivate: false
  }
];

export const initialPosts: Post[] = [
  {
    id: 'p_1',
    authorId: 'u_admin',
    authorName: 'Daniel O. (Super Admin)',
    authorUsername: 'daniel_admin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    content: 'Welcome to NEMDAN — The Global Space for creators, friends, businesses, and communities worldwide 🌐\n\nWe engineered this platform from the ground up to empower authentic connections, seamless real-time messaging, crisp WebRTC video calling, dynamic Stories, vertical Reels, and our community Marketplace with Cash-on-Delivery safety.',
    type: 'image',
    mediaUrls: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80'
    ],
    audience: 'public',
    reactions: [
      { userId: 'u_alex', userName: 'Alex Rivera', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', type: 'love' },
      { userId: 'u_elena', userName: 'Elena Vance', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', type: 'like' },
      { userId: 'u_marcus', userName: 'Marcus Chen', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', type: 'wow' }
    ],
    commentsCount: 24,
    sharesCount: 18,
    savesCount: 35,
    createdAt: '12 minutes ago'
  },
  {
    id: 'p_2',
    authorId: 'u_alex',
    authorName: 'Alex Rivera',
    authorUsername: 'alexrivera',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    content: 'Just tested out the new NEMDAN Reels editor and audio integration! What format do you prefer for tech tutorials and behind-the-scenes breakdowns?',
    type: 'poll',
    pollOptions: [
      { id: 'opt_1', text: 'Short 60s Fast Vertical Reels', votes: ['u_admin', 'u_elena', 'u_sarah'] },
      { id: 'opt_2', text: 'Multi-slide Carousels & Infographics', votes: ['u_marcus'] },
      { id: 'opt_3', text: 'Live Interactive Voice/Video Rooms', votes: ['u_alex'] }
    ],
    audience: 'public',
    reactions: [
      { userId: 'u_admin', userName: 'Daniel O. (Super Admin)', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', type: 'like' },
      { userId: 'u_sarah', userName: 'Sarah Jenkins', userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', type: 'love' }
    ],
    commentsCount: 15,
    sharesCount: 9,
    savesCount: 12,
    createdAt: '1 hour ago'
  },
  {
    id: 'p_3',
    authorId: 'u_elena',
    authorName: 'Elena Vance',
    authorUsername: 'elenavance',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    content: 'Curated 5 brand new artisanal handmade ceramics on NEMDAN Marketplace today! Available with instant local delivery & Cash on Delivery payment for complete peace of mind ✨',
    type: 'image',
    mediaUrls: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=1000&auto=format&fit=crop&q=80'
    ],
    locationName: 'Stockholm Design District',
    audience: 'public',
    reactions: [
      { userId: 'u_alex', userName: 'Alex Rivera', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', type: 'love' },
      { userId: 'u_sarah', userName: 'Sarah Jenkins', userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', type: 'wow' }
    ],
    commentsCount: 8,
    sharesCount: 4,
    savesCount: 22,
    createdAt: '3 hours ago'
  },
  {
    id: 'p_4',
    authorId: 'u_marcus',
    authorName: 'Marcus Chen',
    authorUsername: 'marcuschen',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorVerified: true,
    content: 'Global Developer Hackathon 2026 is officially live on NEMDAN Groups! Over 400 teams collaborating across 45 countries in real time 💻🚀',
    type: 'background',
    backgroundColor: 'from-blue-600 via-indigo-600 to-cyan-500',
    audience: 'public',
    reactions: [
      { userId: 'u_admin', userName: 'Daniel O. (Super Admin)', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', type: 'love' },
      { userId: 'u_alex', userName: 'Alex Rivera', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', type: 'haha' }
    ],
    commentsCount: 31,
    sharesCount: 29,
    savesCount: 18,
    createdAt: '5 hours ago'
  }
];

export const initialComments: PostComment[] = [
  {
    id: 'c_1',
    postId: 'p_1',
    userId: 'u_alex',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    userVerified: true,
    content: 'The speed of the news feed and real-time messaging is incredible! Loving the clean NEMDAN blue aesthetic 🔥',
    createdAt: '8 minutes ago',
    likesCount: 9,
    likedBy: ['u_admin', 'u_elena'],
    replies: [
      {
        id: 'cr_1',
        commentId: 'c_1',
        userId: 'u_admin',
        userName: 'Daniel O. (Super Admin)',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        userVerified: true,
        content: 'Thanks Alex! Excited to see all the great Reels and content you drop here.',
        createdAt: '5 minutes ago',
        likesCount: 4,
        likedBy: ['u_alex']
      }
    ]
  },
  {
    id: 'c_2',
    postId: 'p_1',
    userId: 'u_elena',
    userName: 'Elena Vance',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    userVerified: true,
    content: 'The Marketplace integration is so smooth with COD support. Exactly what sellers need for trusted transactions.',
    createdAt: '6 minutes ago',
    likesCount: 6,
    likedBy: ['u_admin']
  }
];

export const initialStories: StoryItem[] = [
  {
    id: 's_1',
    userId: 'u_admin',
    userName: 'Daniel O.',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    userVerified: true,
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Live from the NEMDAN Global Engineering HQ! 🚀',
    musicTitle: 'Midnight Waves - Electric Pulse',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    viewers: [
      { userId: 'u_alex', userName: 'Alex Rivera', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', viewedAt: '2 min ago', reaction: 'love' },
      { userId: 'u_elena', userName: 'Elena Vance', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', viewedAt: '10 min ago', reaction: 'like' }
    ]
  },
  {
    id: 's_2',
    userId: 'u_alex',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    userVerified: true,
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Filming next week’s documentary on autonomous agents in Tokyo! 🤖',
    musicTitle: 'Cyber Neon - Synthwave Drift',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    viewers: [
      { userId: 'u_admin', userName: 'Daniel O.', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', viewedAt: '15 min ago', reaction: 'wow' }
    ]
  },
  {
    id: 's_3',
    userId: 'u_elena',
    userName: 'Elena Vance',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    userVerified: true,
    mediaUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Scandinavian twilight colors inspire today’s new studio collection 🎨',
    musicTitle: 'Nordic Calm - Ambient Piano',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    viewers: []
  },
  {
    id: 's_4',
    userId: 'u_sarah',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    userVerified: false,
    mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Sunrise hike in Banff National Park! The crisp air is pure magic 🏔️',
    musicTitle: 'Mountain Echoes - Acoustic Vibes',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    viewers: []
  }
];

export const initialReels: Reel[] = [
  {
    id: 'r_1',
    creatorId: 'u_alex',
    creatorName: 'Alex Rivera',
    creatorUsername: 'alexrivera',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creatorVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-talking-in-a-virtual-reality-41551-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    caption: 'How humanoid robots perceive 3D space with multimodal vision models in 2026! 🤖✨ #Robotics #AI #Innovation #NEMDAN',
    audioTitle: 'Alex Rivera • Original Cyber Audio',
    viewsCount: 142800,
    reactions: [
      { userId: 'u_admin', userName: 'Daniel O.', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', type: 'love' },
      { userId: 'u_elena', userName: 'Elena Vance', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', type: 'wow' }
    ],
    commentsCount: 382,
    sharesCount: 1240,
    savesCount: 940,
    createdAt: '2 days ago'
  },
  {
    id: 'r_2',
    creatorId: 'u_sarah',
    creatorName: 'Sarah Jenkins',
    creatorUsername: 'sarah_j',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    creatorVerified: false,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-waves-crashing-on-a-rocky-beach-42358-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Hidden waterfalls of the Pacific Northwest. Turn sound ON for natural white noise 🌊🌲 #Travel #Nature #4KCinematic',
    audioTitle: 'Pacific Ocean Breeze - Sarah J.',
    viewsCount: 89300,
    reactions: [
      { userId: 'u_admin', userName: 'Daniel O.', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', type: 'love' },
      { userId: 'u_alex', userName: 'Alex Rivera', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', type: 'like' }
    ],
    commentsCount: 215,
    sharesCount: 810,
    savesCount: 1120,
    createdAt: '3 days ago'
  },
  {
    id: 'r_3',
    creatorId: 'u_elena',
    creatorName: 'Elena Vance',
    creatorUsername: 'elenavance',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41712-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
    caption: 'Throwing a minimalist clay vase from raw stone clay in real-time. Pure therapy ✨🏺 #Ceramics #Artisanal #StudioVlog',
    audioTitle: 'Lofi Chillhop Beats • Pottery Sessions',
    viewsCount: 65400,
    reactions: [
      { userId: 'u_marcus', userName: 'Marcus Chen', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', type: 'love' }
    ],
    commentsCount: 142,
    sharesCount: 390,
    savesCount: 890,
    createdAt: '4 days ago'
  },
  {
    id: 'r_4',
    creatorId: 'u_marcus',
    creatorName: 'Marcus Chen',
    creatorUsername: 'marcuschen',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    creatorVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80',
    caption: 'Golden hour drone flight over Kyoto cherry blossoms 🌸 Take a deep breath and relax. #Kyoto #Spring #ChillVibes',
    audioTitle: 'Kyoto Ambient Harmonies • Marcus C.',
    viewsCount: 98100,
    reactions: [
      { userId: 'u_admin', userName: 'Daniel O.', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', type: 'love' },
      { userId: 'u_alex', userName: 'Alex Rivera', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', type: 'love' }
    ],
    commentsCount: 284,
    sharesCount: 1520,
    savesCount: 1430,
    createdAt: '5 days ago'
  },
  {
    id: 'r_5',
    creatorId: 'u_admin',
    creatorName: 'Daniel O. (Super Admin)',
    creatorUsername: 'daniel_admin',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    caption: 'Cyberpunk night aesthetics in Neo Tokyo 2026. Welcome to the future of NEMDAN creative media ⚡🌃 #Cyberpunk #NeoTokyo #Creator',
    audioTitle: 'Synthwave Odyssey • NEMDAN Records',
    viewsCount: 245000,
    reactions: [
      { userId: 'u_elena', userName: 'Elena Vance', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', type: 'love' },
      { userId: 'u_marcus', userName: 'Marcus Chen', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', type: 'love' }
    ],
    commentsCount: 512,
    sharesCount: 3100,
    savesCount: 2200,
    createdAt: '6 days ago'
  }
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv_1',
    isGroup: false,
    participants: [initialUsers[0], initialUsers[1]],
    participantIds: ['u_admin', 'u_alex'],
    lastMessage: {
      id: 'm_1',
      conversationId: 'conv_1',
      senderId: 'u_alex',
      senderName: 'Alex Rivera',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Hey Daniel! The WebRTC voice/video call quality is super crisp. Testing the new screen share feature next.',
      reactions: [{ userId: 'u_admin', emoji: '🔥' }],
      isRead: true,
      createdAt: '10:45 AM'
    },
    unreadCount: 0,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'conv_2',
    isGroup: false,
    participants: [initialUsers[0], initialUsers[2]],
    participantIds: ['u_admin', 'u_elena'],
    lastMessage: {
      id: 'm_2',
      conversationId: 'conv_2',
      senderId: 'u_elena',
      senderName: 'Elena Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Hi Daniel! Got 4 new Cash on Delivery orders today on Marketplace. Customer address confirmation was super fast.',
      reactions: [{ userId: 'u_admin', emoji: '❤️' }],
      isRead: false,
      createdAt: '11:12 AM'
    },
    unreadCount: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'conv_3',
    isGroup: true,
    name: 'NEMDAN Global Builders 🌍',
    groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    participants: initialUsers,
    participantIds: ['u_admin', 'u_alex', 'u_elena', 'u_marcus', 'u_sarah'],
    lastMessage: {
      id: 'm_3',
      conversationId: 'conv_3',
      senderId: 'u_marcus',
      senderName: 'Marcus Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Everyone remember our live AMA session starts at 5 PM UTC in the Developers Group!',
      reactions: [{ userId: 'u_admin', emoji: '👍' }, { userId: 'u_alex', emoji: '🙌' }],
      isRead: true,
      createdAt: '11:30 AM'
    },
    unreadCount: 0,
    updatedAt: new Date().toISOString()
  }
];

export const initialMessages: Record<string, Message[]> = {
  'conv_1': [
    {
      id: 'm_1_1',
      conversationId: 'conv_1',
      senderId: 'u_admin',
      senderName: 'Daniel O.',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Hey Alex! How are the new Reels metrics looking in your Creator Dashboard?',
      reactions: [],
      isRead: true,
      createdAt: '10:40 AM'
    },
    {
      id: 'm_1',
      conversationId: 'conv_1',
      senderId: 'u_alex',
      senderName: 'Alex Rivera',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Hey Daniel! The WebRTC voice/video call quality is super crisp. Testing the new screen share feature next.',
      reactions: [{ userId: 'u_admin', emoji: '🔥' }],
      isRead: true,
      createdAt: '10:45 AM'
    }
  ],
  'conv_2': [
    {
      id: 'm_2_1',
      conversationId: 'conv_2',
      senderId: 'u_admin',
      senderName: 'Daniel O.',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Elena, saw your new ceramic listings! How is buyer engagement going?',
      reactions: [],
      isRead: true,
      createdAt: '11:05 AM'
    },
    {
      id: 'm_2',
      conversationId: 'conv_2',
      senderId: 'u_elena',
      senderName: 'Elena Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Hi Daniel! Got 4 new Cash on Delivery orders today on Marketplace. Customer address confirmation was super fast.',
      reactions: [{ userId: 'u_admin', emoji: '❤️' }],
      isRead: false,
      createdAt: '11:12 AM'
    }
  ],
  'conv_3': [
    {
      id: 'm_3_1',
      conversationId: 'conv_3',
      senderId: 'u_admin',
      senderName: 'Daniel O.',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Welcome to the official NEMDAN Founders & Builders group chat!',
      reactions: [{ userId: 'u_elena', emoji: '🎉' }],
      isRead: true,
      createdAt: '11:20 AM'
    },
    {
      id: 'm_3',
      conversationId: 'conv_3',
      senderId: 'u_marcus',
      senderName: 'Marcus Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Everyone remember our live AMA session starts at 5 PM UTC in the Developers Group!',
      reactions: [{ userId: 'u_admin', emoji: '👍' }, { userId: 'u_alex', emoji: '🙌' }],
      isRead: true,
      createdAt: '11:30 AM'
    }
  ]
};

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientId: 'u_admin',
    senderId: 'u_alex',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'reaction',
    title: 'Reaction to your post',
    message: 'Alex Rivera loved your post "Welcome to NEMDAN — The Global Space..."',
    targetId: 'p_1',
    isRead: false,
    createdAt: '10 min ago'
  },
  {
    id: 'notif_2',
    recipientId: 'u_admin',
    senderId: 'u_elena',
    senderName: 'Elena Vance',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'comment',
    title: 'New comment on your post',
    message: 'Elena Vance commented: "The Marketplace integration is so smooth..."',
    targetId: 'p_1',
    isRead: false,
    createdAt: '25 min ago'
  },
  {
    id: 'notif_3',
    recipientId: 'u_admin',
    senderId: 'u_sarah',
    senderName: 'Sarah Jenkins',
    senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    type: 'friend_request',
    title: 'Friend Request',
    message: 'Sarah Jenkins sent you a friend request.',
    targetId: 'u_sarah',
    isRead: true,
    createdAt: '1 hour ago'
  },
  {
    id: 'notif_4',
    recipientId: 'u_admin',
    type: 'system',
    title: 'AI Moderation Alert',
    message: 'AI content moderation flagged 1 suspicious post for review in the Admin Queue.',
    targetId: 'admin_moderation',
    isRead: true,
    createdAt: '2 hours ago'
  }
];

export const initialGroups: Group[] = [
  {
    id: 'g_1',
    name: 'NEMDAN Global Developers & AI Builders',
    slug: 'nemdan-developers',
    description: 'The international hub for engineers, full-stack creators, and AI pioneers building on modern web architectures.',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80',
    category: 'Technology & Science',
    privacy: 'public',
    creatorId: 'u_admin',
    adminIds: ['u_admin', 'u_marcus'],
    moderatorIds: ['u_alex'],
    memberIds: ['u_admin', 'u_alex', 'u_elena', 'u_marcus', 'u_sarah'],
    membersCount: 4280,
    rules: [
      { id: 'r1', title: 'Be Respectful and Constructive', desc: 'No hate speech, trolling, or harassment.' },
      { id: 'r2', title: 'Share Real Code & Learnings', desc: 'Ensure technical questions provide clear reproducible snippets.' },
      { id: 'r3', title: 'No Unsolicited Spam or Piracy', desc: 'Promote relevant projects only in designated weekly showcase threads.' }
    ],
    createdAt: 'January 2025'
  },
  {
    id: 'g_2',
    name: 'Global Sustainable Living & Marketplace',
    slug: 'sustainable-living',
    description: 'Buy, sell, and trade eco-friendly items, vintage clothing, and sustainable goods locally with Cash on Delivery.',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&auto=format&fit=crop&q=80',
    category: 'Lifestyle & Trade',
    privacy: 'public',
    creatorId: 'u_elena',
    adminIds: ['u_elena'],
    moderatorIds: ['u_sarah'],
    memberIds: ['u_admin', 'u_elena', 'u_sarah'],
    membersCount: 1890,
    rules: [
      { id: 'r1', title: 'Authentic Listings Only', desc: 'Accurate photos and realistic condition assessments.' },
      { id: 'r2', title: 'Honest Delivery Info', desc: 'Prompt communication for Cash on Delivery drop-offs.' }
    ],
    createdAt: 'February 2025'
  },
  {
    id: 'g_3',
    name: 'Creators & Filmmakers Syndicate',
    slug: 'creators-syndicate',
    description: 'Private mastermind for verified creators, Reels producers, and digital storytellers sharing monetization strategies.',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80',
    category: 'Entertainment & Media',
    privacy: 'private',
    creatorId: 'u_alex',
    adminIds: ['u_alex'],
    moderatorIds: ['u_admin'],
    memberIds: ['u_admin', 'u_alex', 'u_elena'],
    membersCount: 650,
    rules: [
      { id: 'r1', title: 'Confidentiality', desc: 'What is shared in the mastermind stays in the mastermind.' }
    ],
    createdAt: 'March 2025'
  }
];

export const initialPages: Page[] = [
  {
    id: 'page_1',
    name: 'NEMDAN Global Newsroom',
    username: 'nemdan_news',
    category: 'Media & Technology Company',
    description: 'Official announcements, security briefings, feature releases, and global updates from the NEMDAN engineering team.',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    website: 'https://news.nemdan.global',
    email: 'press@nemdan.global',
    phone: '+1 (800) 555-0199',
    address: '100 Silicon Blvd, Suite 400, San Francisco, CA',
    isVerified: true,
    followersCount: 245000,
    rating: 4.9,
    reviewCount: 3410,
    adminIds: ['u_admin'],
    createdAt: 'January 2025'
  },
  {
    id: 'page_2',
    name: 'Vance Artisanal Ceramics & Design',
    username: 'vancestudio',
    category: 'Handmade Crafts & Home Decor',
    description: 'Modern organic pottery crafted with Scandinavian clay. Available locally with fast Cash on Delivery order processing.',
    avatar: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80',
    website: 'https://elenavance.studio',
    email: 'orders@elenavance.studio',
    phone: '+46 8 123 4567',
    address: 'Gamla Stan, Stockholm, Sweden',
    isVerified: true,
    followersCount: 18400,
    rating: 4.95,
    reviewCount: 520,
    adminIds: ['u_elena'],
    createdAt: 'February 2025'
  }
];

export const initialMarketplaceItems: MarketplaceItem[] = [
  {
    id: 'item_1',
    sellerId: 'u_elena',
    sellerName: 'Elena Vance',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    sellerVerified: true,
    sellerRating: 4.95,
    title: 'Handcrafted Nordic Ceramic Vase (Matte Earth Finish)',
    description: 'Individually wheel-thrown stoneware vase. Water-tight with minimalist speckled matte glaze. Perfect centerpiece for dried botanical arrangements.',
    price: 65,
    currency: 'USD',
    category: 'Home & Living',
    condition: 'new',
    location: 'Stockholm (Worldwide Shipping)',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80'
    ],
    isSold: false,
    paymentMethod: 'Cash on Delivery',
    deliveryOptions: ['Seller Delivery', 'NEMDAN Express', 'Local Pickup'],
    createdAt: '1 day ago'
  },
  {
    id: 'item_2',
    sellerId: 'u_alex',
    sellerName: 'Alex Rivera',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    sellerVerified: true,
    sellerRating: 4.9,
    title: 'Sony Alpha FX3 Cinema Camera + 24-70mm GM Lens Bundle',
    description: 'Pristine condition professional 4K cinema setup used for studio interview productions. Low shutter count, comes with 3 genuine NP-FZ100 batteries, cage, and hardcase.',
    price: 3400,
    currency: 'USD',
    category: 'Electronics',
    condition: 'like_new',
    location: 'New York / Brooklyn',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'
    ],
    isSold: false,
    paymentMethod: 'Cash on Delivery',
    deliveryOptions: ['Local Pickup', 'Seller Delivery'],
    createdAt: '2 days ago'
  },
  {
    id: 'item_3',
    sellerId: 'u_sarah',
    sellerName: 'Sarah Jenkins',
    sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    sellerVerified: false,
    sellerRating: 4.8,
    title: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
    description: 'Space Black M3 Max. 100% battery health with 22 cycles. Includes original MagSafe charger, braided USB-C cable, and box. Cash on delivery upon in-person testing.',
    price: 2450,
    currency: 'USD',
    category: 'Electronics',
    condition: 'like_new',
    location: 'Vancouver, BC',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
    ],
    isSold: false,
    paymentMethod: 'Cash on Delivery',
    deliveryOptions: ['Local Pickup', 'NEMDAN Express'],
    createdAt: '3 days ago'
  },
  {
    id: 'item_4',
    sellerId: 'u_elena',
    sellerName: 'Elena Vance',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    sellerVerified: true,
    sellerRating: 4.95,
    title: 'Vintage Mid-Century Walnut Lounge Chair with Linen Cushion',
    description: 'Authentic 1960s restored Scandinavian lounge armchair with solid oiled walnut frame and natural Belgian linen upholstery. Ergonomic and stylish.',
    price: 480,
    currency: 'USD',
    category: 'Home & Living',
    condition: 'good',
    location: 'Stockholm, Sweden',
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a82105e3f5?w=800&auto=format&fit=crop&q=80'
    ],
    isSold: false,
    paymentMethod: 'Cash on Delivery',
    deliveryOptions: ['Seller Delivery', 'Local Pickup'],
    createdAt: '4 days ago'
  }
];

export const initialOrders: MarketplaceOrder[] = [
  {
    id: 'ord_101',
    itemId: 'item_1',
    itemTitle: 'Handcrafted Nordic Ceramic Vase (Matte Earth Finish)',
    itemPrice: 65,
    itemImage: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u_elena',
    buyerId: 'u_admin',
    buyerName: 'Daniel O. (Super Admin)',
    buyerPhone: '08142883388',
    deliveryAddress: '742 Evergreen Terrace, San Francisco, CA 94107',
    deliveryType: 'NEMDAN Express',
    paymentMethod: 'Cash on Delivery',
    status: 'out_for_delivery',
    createdAt: 'Today at 09:15 AM'
  }
];

export const initialModerationQueue: ModerationCase[] = [
  {
    id: 'mod_1',
    targetType: 'post',
    targetId: 'p_spam_demo',
    authorId: 'u_spammer_99',
    authorName: 'CryptoSignals Bot',
    contentSnippet: 'Guaranteed 500% returns in 24 hours! Send 0.1 BTC to instant crypto multiplying wallet now: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    reportedBy: 'AI Auto-Scanner',
    reportReason: 'Potential Financial Scam / Spam Bot',
    aiScore: 96,
    aiCategory: 'Scams & Fraud',
    aiExplanation: 'Message pattern closely matches deceptive crypto multiplier scams with high confidence (96%). Flagged for admin queue review without automatic deletion.',
    status: 'pending',
    createdAt: '15 min ago'
  },
  {
    id: 'mod_2',
    targetType: 'comment',
    targetId: 'c_abuse_demo',
    authorId: 'u_troll_44',
    authorName: 'AnonymousUser782',
    contentSnippet: 'You are completely incompetent and should not be allowed online! Stop posting garbage.',
    reportedBy: 'u_alex',
    reportReason: 'Harassment & Toxic Behavior',
    aiScore: 84,
    aiCategory: 'Harassment & Bullying',
    aiExplanation: 'Targeted hostile language directed at creator. Flagged for review.',
    status: 'pending',
    createdAt: '1 hour ago'
  }
];

export const initialVerificationRequests: VerificationRequest[] = [
  {
    id: 'ver_1',
    userId: 'u_sarah',
    userName: 'Sarah Jenkins',
    userUsername: 'sarah_j',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    category: 'Creator',
    documentType: 'Official Government Passport & Photography Portfolio',
    reason: 'Active travel photographer published in National Geographic & BBC Wildlife with 50K+ external community following.',
    status: 'pending',
    submittedAt: 'Yesterday'
  }
];

export const initialLiveStreams: LiveStream[] = [
  {
    id: 'live_alex_1',
    hostId: 'u_alex',
    hostName: 'Alex Rivera',
    hostUsername: 'alexrivera',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hostVerified: true,
    title: 'Building Next-Gen AI Assistants with Gemini 3.7 & WebRTC 🚀 (Live Coding & Q&A)',
    description: 'Deep dive into real-time multi-modal streaming, WebRTC audio/video sync, and building full-stack platforms on modern web standards. Drop your questions in chat!',
    category: 'tech',
    tags: ['AI', 'WebRTC', 'FullStack', 'Coding'],
    status: 'live',
    viewerCount: 1420,
    peakViewers: 1850,
    likesCount: 3840,
    startedAt: '45 minutes ago',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    pinnedMessage: '👋 Welcome to the stream! Type !repo for the open-source boilerplate or send questions with #ask.',
    isHostOnline: true
  },
  {
    id: 'live_elena_2',
    hostId: 'u_elena',
    hostName: 'Elena Vance',
    hostUsername: 'elenavance',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    hostVerified: true,
    title: 'Late Night Lo-Fi Beats & Ceramic Sculpting Workshop 🎨✨ Chill with me!',
    description: 'Working on a new set of Nordic ceramic vases while playing relaxing lo-fi ambient tracks. Come relax and chat.',
    category: 'art',
    tags: ['Art', 'Ceramics', 'LoFi', 'Relax'],
    status: 'live',
    viewerCount: 890,
    peakViewers: 1120,
    likesCount: 2150,
    startedAt: '1 hour ago',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41718-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
    pinnedMessage: '✨ Glaze color poll coming up at 10 PM. Thank you for all the sweet tips!',
    isHostOnline: true
  },
  {
    id: 'live_marcus_3',
    hostId: 'u_marcus',
    hostName: 'Marcus Chen',
    hostUsername: 'marcuschen',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    hostVerified: true,
    title: 'Indie Hacker Show: Roasting & Reviewing Community Startup Landing Pages 🔥',
    description: 'Submissions are open! Paste your SaaS or product link in chat and I will give live UI/UX, conversion rate, and copy feedback.',
    category: 'just_chatting',
    tags: ['Startups', 'Design', 'Feedback', 'SaaS'],
    status: 'live',
    viewerCount: 640,
    peakViewers: 780,
    likesCount: 1820,
    startedAt: '25 minutes ago',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-a-video-game-in-a-dark-room-41976-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    pinnedMessage: '🔥 Next site on deck: @elena_vance portfolio redesign!',
    isHostOnline: true
  },
  {
    id: 'live_sarah_4',
    hostId: 'u_sarah',
    hostName: 'Sarah Jenkins',
    hostUsername: 'sarah_j',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    hostVerified: false,
    title: 'Sunset Photography in the Arctic Fjords — Live Camera Stream & Editing Tips 📸',
    description: 'Live field broadcast from Tromsø. Capturing the golden hour lighting against frozen fjords and editing in Lightroom live.',
    category: 'lifestyle',
    tags: ['Travel', 'Photography', 'Norway', 'Fjords'],
    status: 'live',
    viewerCount: 430,
    peakViewers: 550,
    likesCount: 1290,
    startedAt: '15 minutes ago',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-taking-photos-with-a-smartphone-41680-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    pinnedMessage: '🏔️ Free Lightroom preset pack link is in my bio!',
    isHostOnline: true
  },
  // Saved Replays (VODs)
  {
    id: 'replay_admin_1',
    hostId: 'u_admin',
    hostName: 'Daniel O. (Super Admin)',
    hostUsername: 'daniel_admin',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hostVerified: true,
    title: 'NEMDAN Global Keynote: Platform Architecture, Creator Monetization & WebRTC Engine',
    description: 'Official keynote unveiling the high performance architecture, AI safety moderation, Cash-on-Delivery marketplace, and creator wallet ecosystem.',
    category: 'tech',
    tags: ['Keynote', 'Architecture', 'NEMDAN', 'Global'],
    status: 'ended',
    viewerCount: 14800,
    peakViewers: 4200,
    likesCount: 12500,
    startedAt: '2 days ago',
    endedAt: '2 days ago',
    durationSeconds: 3420, // 57 mins
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    pinnedMessage: '📌 Replay available worldwide with full synchronized live chat logs.',
    replayChat: [
      {
        id: 'rc_1',
        streamId: 'replay_admin_1',
        userId: 'u_alex',
        userName: 'Alex Rivera',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        userRole: 'creator',
        userVerified: true,
        message: 'The latency numbers on WebRTC video calls look incredible! 🔥',
        createdAt: '2 days ago',
        timestamp: 120
      },
      {
        id: 'rc_2',
        streamId: 'replay_admin_1',
        userId: 'u_elena',
        userName: 'Elena Vance',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        userRole: 'marketplace_manager',
        userVerified: true,
        message: 'Loving the Cash on Delivery marketplace integration for local artisans 👏',
        createdAt: '2 days ago',
        timestamp: 245
      },
      {
        id: 'rc_3',
        streamId: 'replay_admin_1',
        userId: 'u_marcus',
        userName: 'Marcus Chen',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        userRole: 'community_manager',
        userVerified: true,
        message: 'Creator tips with instant wallet payout is going to change the game 🚀💎',
        type: 'gift',
        giftDetails: { icon: '💎', name: 'Super Diamond', amount: 50 },
        createdAt: '2 days ago',
        timestamp: 410
      }
    ]
  },
  {
    id: 'replay_alex_2',
    hostId: 'u_alex',
    hostName: 'Alex Rivera',
    hostUsername: 'alexrivera',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hostVerified: true,
    title: 'Cyberpunk Game Development in Unreal Engine 5: Raytracing & Volumetric Shaders',
    description: 'Interactive session exploring custom HLSL shaders and nanite geometry for futuristic cityscapes.',
    category: 'gaming',
    tags: ['UnrealEngine', 'Gaming', '3D', 'VFX'],
    status: 'ended',
    viewerCount: 8320,
    peakViewers: 2100,
    likesCount: 6420,
    startedAt: '4 days ago',
    endedAt: '4 days ago',
    durationSeconds: 2890, // 48 mins
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-a-video-game-in-a-dark-room-41976-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    replayChat: [
      {
        id: 'rc_4',
        streamId: 'replay_alex_2',
        userId: 'u_sarah',
        userName: 'Sarah Jenkins',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        message: 'That volumetric fog lighting is pure cinematic magic!',
        createdAt: '4 days ago',
        timestamp: 180
      }
    ]
  },
  {
    id: 'replay_elena_3',
    hostId: 'u_elena',
    hostName: 'Elena Vance',
    hostUsername: 'elenavance',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    hostVerified: true,
    title: 'Acoustic Sunset Guitar & Vocals Live Session (Full Album Preview)',
    description: 'An intimate sunset acoustic concert from the Stockholm studio featuring original indie folk songs.',
    category: 'music',
    tags: ['Music', 'Acoustic', 'Live', 'Concert'],
    status: 'ended',
    viewerCount: 5640,
    peakViewers: 1450,
    likesCount: 4980,
    startedAt: '5 days ago',
    endedAt: '5 days ago',
    durationSeconds: 1940, // 32 mins
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41718-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    replayChat: []
  }
];

export const initialLiveChats: Record<string, LiveStreamChatMessage[]> = {
  'live_alex_1': [
    {
      id: 'chat_1',
      streamId: 'live_alex_1',
      userId: 'u_marcus',
      userName: 'Marcus Chen',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      userRole: 'community_manager',
      userVerified: true,
      message: 'Great stream Alex! How are you handling WebRTC packet loss recovery?',
      createdAt: '5 min ago',
      timestamp: Date.now() - 300000
    },
    {
      id: 'chat_2',
      streamId: 'live_alex_1',
      userId: 'u_elena',
      userName: 'Elena Vance',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      userRole: 'marketplace_manager',
      userVerified: true,
      message: 'Sent a creator boost! Keep the insights coming 🚀',
      type: 'gift',
      giftDetails: { icon: '🚀', name: 'Rocket Boost', amount: 10 },
      createdAt: '3 min ago',
      timestamp: Date.now() - 180000
    },
    {
      id: 'chat_3',
      streamId: 'live_alex_1',
      userId: 'u_sarah',
      userName: 'Sarah Jenkins',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      userRole: 'user',
      userVerified: false,
      message: 'The live stream latency is basically zero! Super crisp quality 👏',
      createdAt: '1 min ago',
      timestamp: Date.now() - 60000
    },
    {
      id: 'chat_4',
      streamId: 'live_alex_1',
      userId: 'u_admin',
      userName: 'Daniel O. (Super Admin)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      userRole: 'super_admin',
      userVerified: true,
      message: 'Pinned the repository link at the top of the stream. Great demo! 🔥',
      createdAt: 'Just now',
      timestamp: Date.now()
    }
  ],
  'live_elena_2': [
    {
      id: 'chat_e1',
      streamId: 'live_elena_2',
      userId: 'u_alex',
      userName: 'Alex Rivera',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      userRole: 'creator',
      userVerified: true,
      message: 'The clay texturing is so satisfying to watch! ✨',
      createdAt: '10 min ago',
      timestamp: Date.now() - 600000
    },
    {
      id: 'chat_e2',
      streamId: 'live_elena_2',
      userId: 'u_sarah',
      userName: 'Sarah Jenkins',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      message: 'Sent 50 Diamond tips! You inspire me Elena 💎',
      type: 'gift',
      giftDetails: { icon: '💎', name: 'Diamond Sparkle', amount: 5 },
      createdAt: '4 min ago',
      timestamp: Date.now() - 240000
    }
  ],
  'live_marcus_3': [
    {
      id: 'chat_m1',
      streamId: 'live_marcus_3',
      userId: 'u_alex',
      userName: 'Alex Rivera',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      message: 'Roast my latest docs page next Marcus! 😄',
      createdAt: '2 min ago',
      timestamp: Date.now() - 120000
    }
  ],
  'live_sarah_4': [
    {
      id: 'chat_s1',
      streamId: 'live_sarah_4',
      userId: 'u_elena',
      userName: 'Elena Vance',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      message: 'The Arctic sky colors look breathtaking on live feed 🌅',
      createdAt: '5 min ago',
      timestamp: Date.now() - 300000
    }
  ]
};

export const initialVirtualGifts: VirtualGift[] = [
  {
    id: 'gift_rose',
    name: 'Red Rose',
    icon: '🌹',
    animationType: 'rose',
    coinPrice: 1,
    description: 'A classic single red rose expressing love and admiration.',
    category: 'classic',
    isActive: true
  },
  {
    id: 'gift_heart',
    name: 'Heart Burst',
    icon: '❤️',
    animationType: 'heart',
    coinPrice: 5,
    description: 'A glowing fountain of energetic floating hearts.',
    category: 'popular',
    badge: 'Popular',
    isActive: true
  },
  {
    id: 'gift_star',
    name: 'Golden Star',
    icon: '⭐',
    animationType: 'star',
    coinPrice: 10,
    description: 'Cosmic star shower illuminating the broadcast stage.',
    category: 'classic',
    badge: 'Top Pick',
    isActive: true
  },
  {
    id: 'gift_fire',
    name: 'Fire Blast',
    icon: '🔥',
    animationType: 'fire',
    coinPrice: 25,
    description: 'Blazing flame aura heating up the live stream energy.',
    category: 'popular',
    badge: 'Hot',
    isActive: true
  },
  {
    id: 'gift_coffee',
    name: 'Warm Coffee',
    icon: '☕',
    animationType: 'coffee',
    coinPrice: 15,
    description: 'Keep the creator energized with fresh espresso steam.',
    category: 'classic',
    isActive: true
  },
  {
    id: 'gift_diamond',
    name: 'Super Diamond',
    icon: '💎',
    animationType: 'diamond',
    coinPrice: 50,
    description: 'Sparkling high-clarity diamond crystal with shimmer shards.',
    category: 'popular',
    badge: 'Hot',
    isActive: true
  },
  {
    id: 'gift_rocket',
    name: 'Rocket Boost',
    icon: '🚀',
    animationType: 'rocket',
    coinPrice: 100,
    description: 'Blast the live stream to the stratosphere with blazing thrusters.',
    category: 'popular',
    badge: 'Trending',
    isActive: true
  },
  {
    id: 'gift_super',
    name: 'Gift Box',
    icon: '🎁',
    animationType: 'giftbox',
    coinPrice: 250,
    description: 'Surprise celebration box bursting with golden confetti.',
    category: 'special',
    badge: 'Special',
    isActive: true
  },
  {
    id: 'gift_lion',
    name: 'Golden Lion Roar',
    icon: '🦁',
    animationType: 'lion',
    coinPrice: 500,
    description: 'Magnificent golden lion roar with royal particle shockwaves.',
    category: 'luxury',
    badge: 'Luxury',
    isActive: true
  },
  {
    id: 'gift_crown',
    name: 'Imperial Crown',
    icon: '👑',
    animationType: 'crown',
    coinPrice: 1000,
    description: 'Crowning the creator with golden prestige and royal aura.',
    category: 'luxury',
    badge: 'VIP',
    isActive: true
  },
  {
    id: 'gift_universe',
    name: 'Universe Galaxy',
    icon: '🌌',
    animationType: 'universe',
    coinPrice: 5000,
    description: 'Ultimate cosmic vortex portal taking over the entire stream.',
    category: 'exclusive',
    badge: 'Legendary',
    isActive: true
  }
];

export const initialCoinPackages: CoinPackage[] = [
  {
    id: 'pkg_100',
    coins: 100,
    bonusCoins: 0,
    priceUSD: 0.99,
    priceNGN: 1500,
    icon: '🪙'
  },
  {
    id: 'pkg_500',
    coins: 500,
    bonusCoins: 25,
    priceUSD: 4.99,
    priceNGN: 7500,
    popular: true,
    badge: 'Most Popular',
    icon: '💰'
  },
  {
    id: 'pkg_1000',
    coins: 1000,
    bonusCoins: 100,
    priceUSD: 9.99,
    priceNGN: 15000,
    badge: 'Best Value',
    icon: '💎'
  },
  {
    id: 'pkg_5000',
    coins: 5000,
    bonusCoins: 750,
    priceUSD: 49.99,
    priceNGN: 75000,
    badge: 'VIP Tier',
    icon: '👑'
  }
];

export const initialReferralConfig: ReferralConfig = {
  rewardReferrerAmount: 500, // ₦500
  rewardRefereeAmount: 200, // ₦200
  currency: 'NGN',
  maxReferralsPerUser: 100,
  isEnabled: true,
  minEligibilityRule: 'Account registration + Profile photo + Valid phone verification',
  antiFraudEnabled: true
};

export const initialReferralConversions: ReferralConversion[] = [
  {
    id: 'ref_conv_1',
    referrerId: 'u_admin',
    referrerName: 'Daniel O. (Super Admin)',
    refereeId: 'u_alex',
    refereeName: 'Alex Rivera',
    refereeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    refereeEmail: 'alex@example.com',
    status: 'rewarded',
    referrerReward: 500,
    refereeReward: 200,
    currency: 'NGN',
    createdAt: '3 days ago',
    completedAt: '3 days ago',
    fraudScore: 2,
    eligibilityCheck: {
      emailVerified: true,
      phoneVerified: true,
      uniqueIpVerified: true,
      profileCompleted: true
    }
  },
  {
    id: 'ref_conv_2',
    referrerId: 'u_admin',
    referrerName: 'Daniel O. (Super Admin)',
    refereeId: 'u_elena',
    refereeName: 'Elena Vance',
    refereeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    refereeEmail: 'elena@example.com',
    status: 'rewarded',
    referrerReward: 500,
    refereeReward: 200,
    currency: 'NGN',
    createdAt: '2 days ago',
    completedAt: '2 days ago',
    fraudScore: 1,
    eligibilityCheck: {
      emailVerified: true,
      phoneVerified: true,
      uniqueIpVerified: true,
      profileCompleted: true
    }
  },
  {
    id: 'ref_conv_3',
    referrerId: 'u_admin',
    referrerName: 'Daniel O. (Super Admin)',
    refereeId: 'u_sarah',
    refereeName: 'Sarah Jenkins',
    refereeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    refereeEmail: 'sarah.j@example.com',
    status: 'pending',
    referrerReward: 500,
    refereeReward: 200,
    currency: 'NGN',
    createdAt: '6 hours ago',
    fraudScore: 5,
    eligibilityCheck: {
      emailVerified: true,
      phoneVerified: false,
      uniqueIpVerified: true,
      profileCompleted: true
    }
  }
];

// In-Memory state manager that mimics a relational database
class DatabaseStore {
  users: User[] = [...initialUsers];
  posts: Post[] = [...initialPosts];
  comments: PostComment[] = [...initialComments];
  stories: StoryItem[] = [...initialStories];
  reels: Reel[] = [...initialReels];
  conversations: Conversation[] = [...initialConversations];
  messages: Record<string, Message[]> = { ...initialMessages };
  notifications: NotificationItem[] = [...initialNotifications];
  groups: Group[] = [...initialGroups];
  pages: Page[] = [...initialPages];
  marketplaceItems: MarketplaceItem[] = [...initialMarketplaceItems];
  orders: MarketplaceOrder[] = [...initialOrders];
  moderationQueue: ModerationCase[] = [...initialModerationQueue];
  verificationRequests: VerificationRequest[] = [...initialVerificationRequests];
  liveStreams: LiveStream[] = [...initialLiveStreams];
  liveStreamChats: Record<string, LiveStreamChatMessage[]> = { ...initialLiveChats };
  
  // Gifting & Monetization Store
  virtualGifts: VirtualGift[] = [...initialVirtualGifts];
  coinPackages: CoinPackage[] = [...initialCoinPackages];
  platformCommissionRate: number = 0.20; // 20% platform cut, 80% creator payout
  userCoins: Record<string, number> = {
    'u_admin': 2500,
    'u_alex': 800,
    'u_elena': 1200,
    'u_marcus': 650,
    'u_sarah': 1500
  };
  streamGifts: Record<string, LiveStreamGift[]> = {
    'live_alex_1': [
      {
        id: 'gift_tx_1',
        streamId: 'live_alex_1',
        senderId: 'u_elena',
        senderName: 'Elena Vance',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        recipientId: 'u_alex',
        recipientName: 'Alex Rivera',
        giftId: 'gift_rocket',
        giftName: 'Rocket Boost',
        giftIcon: '🚀',
        coinAmount: 100,
        totalValueUSD: 1.00,
        comboCount: 1,
        animationType: 'rocket',
        timestamp: Date.now() - 180000,
        createdAt: '3 min ago'
      },
      {
        id: 'gift_tx_2',
        streamId: 'live_alex_1',
        senderId: 'u_admin',
        senderName: 'Daniel O. (Super Admin)',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        recipientId: 'u_alex',
        recipientName: 'Alex Rivera',
        giftId: 'gift_lion',
        giftName: 'Golden Lion Roar',
        giftIcon: '🦁',
        coinAmount: 500,
        totalValueUSD: 5.00,
        comboCount: 1,
        animationType: 'lion',
        timestamp: Date.now() - 60000,
        createdAt: '1 min ago'
      }
    ]
  };
  streamLeaderboards: Record<string, GifterLeaderboardEntry[]> = {
    'live_alex_1': [
      {
        userId: 'u_admin',
        userName: 'Daniel O. (Super Admin)',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        totalCoins: 500,
        rank: 1,
        badge: 'Top Supporter 👑'
      },
      {
        userId: 'u_elena',
        userName: 'Elena Vance',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        totalCoins: 100,
        rank: 2,
        badge: 'Super Gifter 🥈'
      },
      {
        userId: 'u_sarah',
        userName: 'Sarah Jenkins',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        totalCoins: 50,
        rank: 3,
        badge: 'Fan Gifter 🥉'
      }
    ]
  };
  creatorEarnings: Record<string, CreatorEarnings> = {
    'u_alex': {
      creatorId: 'u_alex',
      totalCoinsReceived: 1850,
      totalUSDValue: 18.50,
      platformCommissionRate: 0.20,
      netEarningsUSD: 14.80,
      netEarningsNGN: 22200,
      availableBalanceUSD: 14.80,
      availableBalanceNGN: 22200,
      totalWithdrawnUSD: 50.00,
      pendingWithdrawalUSD: 0,
      recentGifts: []
    },
    'u_admin': {
      creatorId: 'u_admin',
      totalCoinsReceived: 4200,
      totalUSDValue: 42.00,
      platformCommissionRate: 0.20,
      netEarningsUSD: 33.60,
      netEarningsNGN: 50400,
      availableBalanceUSD: 33.60,
      availableBalanceNGN: 50400,
      totalWithdrawnUSD: 120.00,
      pendingWithdrawalUSD: 0,
      recentGifts: []
    }
  };
  withdrawalRequests: WithdrawalRequest[] = [
    {
      id: 'wdr_1',
      creatorId: 'u_alex',
      creatorName: 'Alex Rivera',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      amountUSD: 50.00,
      amountNGN: 75000,
      paymentMethod: 'bank_transfer',
      accountDetails: {
        bankName: 'Access Bank Plc',
        accountNumber: '0129849201',
        accountName: 'Alex Rivera'
      },
      status: 'approved',
      requestedAt: '4 days ago',
      reviewedAt: '3 days ago',
      reviewedBy: 'u_admin',
      transactionReference: 'PAY-NEMDAN-892101'
    }
  ];

  // Referral Store
  referralConfig: ReferralConfig = { ...initialReferralConfig };
  referralConversions: ReferralConversion[] = [...initialReferralConversions];

  friendships: Record<string, string[]> = {
    'u_admin': ['u_alex', 'u_elena', 'u_marcus'],
    'u_alex': ['u_admin', 'u_elena'],
    'u_elena': ['u_admin', 'u_alex', 'u_sarah'],
    'u_marcus': ['u_admin'],
    'u_sarah': ['u_elena']
  };
  friendRequests: { from: string; to: string; createdAt: string }[] = [
    { from: 'u_sarah', to: 'u_admin', createdAt: '1 hour ago' }
  ];
  follows: Record<string, string[]> = {
    'u_admin': ['u_alex', 'u_elena', 'u_marcus', 'u_sarah'],
    'u_alex': ['u_admin', 'u_elena'],
    'u_elena': ['u_admin', 'u_alex'],
    'u_marcus': ['u_admin', 'u_alex'],
    'u_sarah': ['u_admin', 'u_alex', 'u_elena']
  };

  // Helper getters
  getUser(id: string) {
    return this.users.find(u => u.id === id);
  }

  getUserByUsername(username: string) {
    return this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Live stream methods
  getLiveStreams(category?: string, status?: 'live' | 'ended') {
    let list = [...this.liveStreams];
    if (status) {
      list = list.filter(s => s.status === status);
    }
    if (category && category !== 'all') {
      list = list.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    return list.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return (b.viewerCount || 0) - (a.viewerCount || 0);
    });
  }

  getLiveStream(id: string) {
    return this.liveStreams.find(s => s.id === id);
  }

  createLiveStream(streamData: Partial<LiveStream>): LiveStream {
    const newStream: LiveStream = {
      id: `live_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      hostId: streamData.hostId || 'u_admin',
      hostName: streamData.hostName || 'Host',
      hostUsername: streamData.hostUsername || 'host',
      hostAvatar: streamData.hostAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      hostVerified: streamData.hostVerified || false,
      title: streamData.title || 'Live Stream on NEMDAN',
      description: streamData.description || '',
      category: streamData.category || 'just_chatting',
      tags: streamData.tags || ['Live', 'NEMDAN'],
      status: 'live',
      viewerCount: 1,
      peakViewers: 1,
      likesCount: 0,
      startedAt: 'Just now',
      videoUrl: streamData.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4',
      thumbnailUrl: streamData.thumbnailUrl || streamData.hostAvatar || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      pinnedMessage: streamData.pinnedMessage || `Welcome to ${streamData.hostName}'s live stream!`,
      isHostOnline: true
    };

    this.liveStreams.unshift(newStream);
    this.liveStreamChats[newStream.id] = [
      {
        id: `chat_welcome_${Date.now()}`,
        streamId: newStream.id,
        userId: 'system',
        userName: 'NEMDAN Live Bot',
        userAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        message: `🔴 Stream started! Respect community guidelines and enjoy the broadcast.`,
        type: 'system',
        createdAt: 'Just now',
        timestamp: Date.now()
      }
    ];

    return newStream;
  }

  endLiveStream(streamId: string, durationSeconds?: number): LiveStream | null {
    const stream = this.liveStreams.find(s => s.id === streamId);
    if (!stream) return null;

    stream.status = 'ended';
    stream.endedAt = 'Just now';
    stream.isHostOnline = false;
    stream.durationSeconds = durationSeconds || 600;
    
    // Save chat history to replayChat
    stream.replayChat = [...(this.liveStreamChats[streamId] || [])];

    return stream;
  }

  addLiveChatMessage(streamId: string, chatData: Partial<LiveStreamChatMessage>): LiveStreamChatMessage {
    if (!this.liveStreamChats[streamId]) {
      this.liveStreamChats[streamId] = [];
    }

    const message: LiveStreamChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      streamId,
      userId: chatData.userId || 'u_guest',
      userName: chatData.userName || 'Viewer',
      userAvatar: chatData.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      userRole: chatData.userRole,
      userVerified: chatData.userVerified,
      message: chatData.message || '',
      type: chatData.type || 'chat',
      giftDetails: chatData.giftDetails,
      createdAt: 'Just now',
      timestamp: Date.now()
    };

    this.liveStreamChats[streamId].push(message);

    // If chat contains a gift, increment stream likes / score
    const stream = this.liveStreams.find(s => s.id === streamId);
    if (stream && chatData.giftDetails) {
      stream.likesCount = (stream.likesCount || 0) + (chatData.giftDetails.amount * 10);
    }

    return message;
  }

  reactLiveStream(streamId: string, deltaLikes: number = 1): number {
    const stream = this.liveStreams.find(s => s.id === streamId);
    if (stream) {
      stream.likesCount = (stream.likesCount || 0) + deltaLikes;
      return stream.likesCount;
    }
    return 0;
  }

  updateLiveViewers(streamId: string, delta: number): number {
    const stream = this.liveStreams.find(s => s.id === streamId);
    if (stream) {
      stream.viewerCount = Math.max(1, (stream.viewerCount || 0) + delta);
      if (stream.viewerCount > (stream.peakViewers || 0)) {
        stream.peakViewers = stream.viewerCount;
      }
      return stream.viewerCount;
    }
    return 1;
  }

  // ----------------------------------------------------
  // VIRTUAL COINS & GIFTING METHODS
  // ----------------------------------------------------
  getUserCoins(userId: string): number {
    if (typeof this.userCoins[userId] !== 'number') {
      this.userCoins[userId] = 500; // default welcoming coin balance
    }
    return this.userCoins[userId];
  }

  purchaseCoins(userId: string, packageId?: string, customAmount?: number, paymentMethod: string = 'card'): { success: boolean; newBalance: number; addedCoins: number; transaction: any } {
    let coinsToAdd = 0;
    let costUSD = 0;
    
    if (packageId) {
      const pkg = this.coinPackages.find(p => p.id === packageId);
      if (pkg) {
        coinsToAdd = pkg.coins + (pkg.bonusCoins || 0);
        costUSD = pkg.priceUSD;
      }
    } else if (customAmount && customAmount > 0) {
      coinsToAdd = customAmount;
      costUSD = Math.round((customAmount / 100) * 100) / 100;
    }

    if (coinsToAdd <= 0) {
      throw new Error('Invalid coin purchase package or amount.');
    }

    const current = this.getUserCoins(userId);
    const updated = current + coinsToAdd;
    this.userCoins[userId] = updated;

    // Add in-app notification
    this.notifications.unshift({
      id: `notif_coin_${Date.now()}`,
      userId,
      type: 'system',
      title: 'Coins Added to Wallet',
      message: `You successfully topped up ${coinsToAdd.toLocaleString()} Virtual Coins (${paymentMethod.toUpperCase()}).`,
      createdAt: 'Just now',
      read: false
    });

    return {
      success: true,
      newBalance: updated,
      addedCoins: coinsToAdd,
      transaction: {
        id: `tx_coin_${Date.now()}`,
        coins: coinsToAdd,
        costUSD,
        method: paymentMethod,
        date: new Date().toISOString()
      }
    };
  }

  sendVirtualGift(
    streamId: string,
    senderId: string,
    giftId: string,
    comboCount: number = 1
  ): { gift: LiveStreamGift; senderCoins: number; creatorCoins: number; leaderboard: GifterLeaderboardEntry[]; stream: LiveStream } {
    const stream = this.liveStreams.find(s => s.id === streamId);
    if (!stream) {
      throw new Error('Live stream not found.');
    }

    const giftConfig = this.virtualGifts.find(g => g.id === giftId);
    if (!giftConfig) {
      throw new Error('Gift item not found in catalog.');
    }

    const totalCoins = giftConfig.coinPrice * comboCount;
    const senderCoins = this.getUserCoins(senderId);

    if (senderCoins < totalCoins) {
      throw new Error(`Insufficient coins. You need ${totalCoins} coins but only have ${senderCoins}.`);
    }

    const sender = this.getUser(senderId);
    const host = this.getUser(stream.hostId);

    // Deduct coins from sender
    this.userCoins[senderId] = senderCoins - totalCoins;

    // Value calculation (1 coin = $0.01 base gross value)
    const grossValueUSD = (totalCoins * 0.01);
    const platformCutUSD = grossValueUSD * this.platformCommissionRate;
    const netCreatorUSD = grossValueUSD - platformCutUSD;
    const netCreatorNGN = netCreatorUSD * 1500;

    // Update creator earnings
    if (!this.creatorEarnings[stream.hostId]) {
      this.creatorEarnings[stream.hostId] = {
        creatorId: stream.hostId,
        totalCoinsReceived: 0,
        totalUSDValue: 0,
        platformCommissionRate: this.platformCommissionRate,
        netEarningsUSD: 0,
        netEarningsNGN: 0,
        availableBalanceUSD: 0,
        availableBalanceNGN: 0,
        totalWithdrawnUSD: 0,
        pendingWithdrawalUSD: 0,
        recentGifts: []
      };
    }

    const earnings = this.creatorEarnings[stream.hostId];
    earnings.totalCoinsReceived += totalCoins;
    earnings.totalUSDValue += grossValueUSD;
    earnings.netEarningsUSD += netCreatorUSD;
    earnings.netEarningsNGN += netCreatorNGN;
    earnings.availableBalanceUSD += netCreatorUSD;
    earnings.availableBalanceNGN += netCreatorNGN;

    const giftTx: LiveStreamGift = {
      id: `gift_tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      streamId,
      senderId,
      senderName: sender?.name || 'Live Fan',
      senderAvatar: sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipientId: stream.hostId,
      recipientName: host?.name || stream.hostName,
      giftId: giftConfig.id,
      giftName: giftConfig.name,
      giftIcon: giftConfig.icon,
      coinAmount: totalCoins,
      totalValueUSD: grossValueUSD,
      comboCount,
      animationType: giftConfig.animationType,
      timestamp: Date.now(),
      createdAt: 'Just now'
    };

    earnings.recentGifts.unshift(giftTx);

    // Save in stream gift history
    if (!this.streamGifts[streamId]) {
      this.streamGifts[streamId] = [];
    }
    this.streamGifts[streamId].unshift(giftTx);

    // Update Stream stats
    stream.totalCoinsReceived = (stream.totalCoinsReceived || 0) + totalCoins;
    stream.totalGiftsCount = (stream.totalGiftsCount || 0) + comboCount;
    stream.likesCount = (stream.likesCount || 0) + (totalCoins * 5);

    // Update Stream Leaderboard
    if (!this.streamLeaderboards[streamId]) {
      this.streamLeaderboards[streamId] = [];
    }

    const leaderboard = this.streamLeaderboards[streamId];
    const existingEntry = leaderboard.find(e => e.userId === senderId);
    if (existingEntry) {
      existingEntry.totalCoins += totalCoins;
    } else {
      leaderboard.push({
        userId: senderId,
        userName: sender?.name || 'Fan',
        userAvatar: sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        totalCoins: totalCoins,
        rank: 99
      });
    }

    // Re-rank leaderboard
    leaderboard.sort((a, b) => b.totalCoins - a.totalCoins);
    leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
      if (entry.rank === 1) entry.badge = 'Top Supporter 👑';
      else if (entry.rank === 2) entry.badge = 'Super Gifter 🥈';
      else if (entry.rank === 3) entry.badge = 'Fan Gifter 🥉';
      else entry.badge = `VIP #${entry.rank}`;
    });

    stream.topGifters = leaderboard.slice(0, 10);

    // Post to live stream chat
    this.addLiveChatMessage(streamId, {
      userId: senderId,
      userName: sender?.name || 'Fan',
      userAvatar: sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      type: 'gift',
      message: `Sent ${comboCount > 1 ? `${comboCount}x ` : ''}${giftConfig.icon} ${giftConfig.name} (${totalCoins} Coins)!`,
      giftDetails: {
        icon: giftConfig.icon,
        name: giftConfig.name,
        amount: totalCoins
      }
    });

    // Notify Host
    if (stream.hostId !== senderId) {
      this.notifications.unshift({
        id: `notif_gift_${Date.now()}`,
        userId: stream.hostId,
        type: 'system',
        title: 'New Live Gift Received!',
        message: `${sender?.name || 'A fan'} sent you ${comboCount > 1 ? `${comboCount}x ` : ''}${giftConfig.icon} ${giftConfig.name} worth ${totalCoins} Coins ($${grossValueUSD.toFixed(2)} USD).`,
        createdAt: 'Just now',
        read: false
      });
    }

    return {
      gift: giftTx,
      senderCoins: this.userCoins[senderId],
      creatorCoins: earnings.totalCoinsReceived,
      leaderboard: stream.topGifters,
      stream
    };
  }

  getStreamGifts(streamId: string): LiveStreamGift[] {
    return this.streamGifts[streamId] || [];
  }

  getStreamLeaderboard(streamId: string): GifterLeaderboardEntry[] {
    return this.streamLeaderboards[streamId] || [];
  }

  getCreatorEarnings(creatorId: string): CreatorEarnings {
    if (!this.creatorEarnings[creatorId]) {
      this.creatorEarnings[creatorId] = {
        creatorId,
        totalCoinsReceived: 0,
        totalUSDValue: 0,
        platformCommissionRate: this.platformCommissionRate,
        netEarningsUSD: 0,
        netEarningsNGN: 0,
        availableBalanceUSD: 0,
        availableBalanceNGN: 0,
        totalWithdrawnUSD: 0,
        pendingWithdrawalUSD: 0,
        recentGifts: []
      };
    }
    return this.creatorEarnings[creatorId];
  }

  // ----------------------------------------------------
  // CREATOR WITHDRAWAL & PAYOUTS
  // ----------------------------------------------------
  requestWithdrawal(
    creatorId: string,
    amountUSD: number,
    paymentMethod: WithdrawalRequest['paymentMethod'],
    accountDetails: WithdrawalRequest['accountDetails']
  ): WithdrawalRequest {
    const earnings = this.getCreatorEarnings(creatorId);

    if (amountUSD <= 0) {
      throw new Error('Withdrawal amount must be greater than $0.');
    }

    if (earnings.availableBalanceUSD < amountUSD) {
      throw new Error(`Insufficient available earnings balance. You have $${earnings.availableBalanceUSD.toFixed(2)} available.`);
    }

    const creator = this.getUser(creatorId);
    earnings.availableBalanceUSD -= amountUSD;
    earnings.availableBalanceNGN -= (amountUSD * 1500);
    earnings.pendingWithdrawalUSD += amountUSD;

    const request: WithdrawalRequest = {
      id: `wdr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      creatorId,
      creatorName: creator?.name || 'Creator',
      creatorAvatar: creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      amountUSD,
      amountNGN: amountUSD * 1500,
      paymentMethod,
      accountDetails,
      status: 'pending',
      requestedAt: 'Just now'
    };

    this.withdrawalRequests.unshift(request);

    // Notify creator
    this.notifications.unshift({
      id: `notif_wdr_${Date.now()}`,
      userId: creatorId,
      type: 'system',
      title: 'Withdrawal Request Submitted',
      message: `Your payout request for $${amountUSD.toFixed(2)} (₦${(amountUSD * 1500).toLocaleString()}) is pending Admin approval.`,
      createdAt: 'Just now',
      read: false
    });

    return request;
  }

  approveWithdrawal(requestId: string, reviewerId: string): WithdrawalRequest {
    const req = this.withdrawalRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Withdrawal request not found.');
    if (req.status !== 'pending') throw new Error(`Request is already ${req.status}.`);

    req.status = 'approved';
    req.reviewedAt = 'Just now';
    req.reviewedBy = reviewerId;
    req.transactionReference = `PAY-NEMDAN-${Date.now().toString().slice(-6)}`;

    const earnings = this.getCreatorEarnings(req.creatorId);
    earnings.pendingWithdrawalUSD = Math.max(0, earnings.pendingWithdrawalUSD - req.amountUSD);
    earnings.totalWithdrawnUSD += req.amountUSD;

    // Notify creator
    this.notifications.unshift({
      id: `notif_wdr_app_${Date.now()}`,
      userId: req.creatorId,
      type: 'system',
      title: '🎉 Payout Approved & Dispatched!',
      message: `Your withdrawal of $${req.amountUSD.toFixed(2)} (₦${req.amountNGN.toLocaleString()}) via ${req.paymentMethod.toUpperCase()} has been approved and sent. Ref: ${req.transactionReference}`,
      createdAt: 'Just now',
      read: false
    });

    return req;
  }

  rejectWithdrawal(requestId: string, reviewerId: string, reason: string = 'Details verification failed'): WithdrawalRequest {
    const req = this.withdrawalRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Withdrawal request not found.');
    if (req.status !== 'pending') throw new Error(`Request is already ${req.status}.`);

    req.status = 'rejected';
    req.reviewedAt = 'Just now';
    req.reviewedBy = reviewerId;
    req.rejectionReason = reason;

    // Refund back to available balance
    const earnings = this.getCreatorEarnings(req.creatorId);
    earnings.pendingWithdrawalUSD = Math.max(0, earnings.pendingWithdrawalUSD - req.amountUSD);
    earnings.availableBalanceUSD += req.amountUSD;
    earnings.availableBalanceNGN += req.amountNGN;

    // Notify creator
    this.notifications.unshift({
      id: `notif_wdr_rej_${Date.now()}`,
      userId: req.creatorId,
      type: 'system',
      title: 'Withdrawal Request Declined',
      message: `Your withdrawal request for $${req.amountUSD.toFixed(2)} was rejected. Reason: "${reason}". The funds were refunded to your available balance.`,
      createdAt: 'Just now',
      read: false
    });

    return req;
  }

  // ----------------------------------------------------
  // ADMIN GIFT & COMMISSION MANAGEMENT
  // ----------------------------------------------------
  getVirtualGifts(): VirtualGift[] {
    return this.virtualGifts;
  }

  createVirtualGift(data: Partial<VirtualGift>): VirtualGift {
    const newGift: VirtualGift = {
      id: `gift_${Date.now()}`,
      name: data.name || 'New Gift',
      icon: data.icon || '🎁',
      animationType: data.animationType || 'custom',
      coinPrice: Number(data.coinPrice) || 10,
      description: data.description || 'Special gift',
      category: data.category || 'popular',
      badge: data.badge,
      isActive: data.isActive !== undefined ? data.isActive : true
    };
    this.virtualGifts.push(newGift);
    return newGift;
  }

  updateVirtualGift(giftId: string, updates: Partial<VirtualGift>): VirtualGift {
    const gift = this.virtualGifts.find(g => g.id === giftId);
    if (!gift) throw new Error('Gift not found');
    Object.assign(gift, updates);
    return gift;
  }

  deleteVirtualGift(giftId: string): boolean {
    const idx = this.virtualGifts.findIndex(g => g.id === giftId);
    if (idx !== -1) {
      this.virtualGifts.splice(idx, 1);
      return true;
    }
    return false;
  }

  getCoinPackages(): CoinPackage[] {
    return this.coinPackages;
  }

  updateCoinPackage(packageId: string, updates: Partial<CoinPackage>): CoinPackage {
    const pkg = this.coinPackages.find(p => p.id === packageId);
    if (!pkg) throw new Error('Coin package not found');
    Object.assign(pkg, updates);
    return pkg;
  }

  setPlatformCommission(rate: number) {
    this.platformCommissionRate = Math.min(0.5, Math.max(0.05, rate));
    return this.platformCommissionRate;
  }

  // ----------------------------------------------------
  // REFERRAL REWARDS SYSTEM
  // ----------------------------------------------------
  getReferralStats(userId: string): ReferralStats {
    const user = this.getUser(userId);
    const username = user?.username || 'user';
    const code = `NEMDAN-${username.toUpperCase()}`;
    const link = `https://nemdan.global/join?ref=${username.toLowerCase()}`;

    const userConversions = this.referralConversions.filter(c => c.referrerId === userId);
    const converted = userConversions.filter(c => c.status === 'rewarded');
    const pending = userConversions.filter(c => c.status === 'pending');

    const totalEarnedNGN = converted.reduce((sum, c) => sum + (c.currency === 'NGN' ? c.referrerReward : c.referrerReward * 1500), 0);
    const totalEarnedUSD = Math.round((totalEarnedNGN / 1500) * 100) / 100;
    const pendingRewardsValue = pending.reduce((sum, c) => sum + (c.currency === 'NGN' ? c.referrerReward : c.referrerReward * 1500), 0);

    const conversionRate = userConversions.length > 0
      ? Math.round((converted.length / userConversions.length) * 100)
      : 85;

    return {
      referralCode: code,
      referralLink: link,
      totalReferrals: userConversions.length,
      totalConverted: converted.length,
      totalEarnedNGN,
      totalEarnedUSD,
      pendingRewardsCount: pending.length,
      pendingRewardsValue,
      conversionRate,
      monthlyGrowth: [
        { month: 'Nov', conversions: 4, earnings: 2000 },
        { month: 'Dec', conversions: 8, earnings: 4000 },
        { month: 'Jan', conversions: 12, earnings: 6000 },
        { month: 'Feb', conversions: 18, earnings: 9000 },
        { month: 'Mar (Now)', conversions: userConversions.length || 24, earnings: totalEarnedNGN || 12000 }
      ]
    };
  }

  getReferralConversions(userId: string): ReferralConversion[] {
    return this.referralConversions.filter(c => c.referrerId === userId);
  }

  getAllReferralConversions(): ReferralConversion[] {
    return this.referralConversions;
  }

  updateReferralConfig(updates: Partial<ReferralConfig>): ReferralConfig {
    this.referralConfig = { ...this.referralConfig, ...updates };
    return this.referralConfig;
  }

  processReferralRegistration(newUserId: string, referralCodeOrUsername: string): ReferralConversion | null {
    if (!referralCodeOrUsername || !this.referralConfig.isEnabled) return null;

    const clean = referralCodeOrUsername.replace(/^NEMDAN-/i, '').toLowerCase();
    const referrer = this.getUserByUsername(clean) || this.users.find(u => u.id === clean || u.username.toLowerCase() === clean);

    if (!referrer || referrer.id === newUserId) return null;

    const newUser = this.getUser(newUserId);
    if (!newUser) return null;

    const conversion: ReferralConversion = {
      id: `ref_conv_${Date.now()}`,
      referrerId: referrer.id,
      referrerName: referrer.name,
      refereeId: newUser.id,
      refereeName: newUser.name,
      refereeAvatar: newUser.avatar,
      refereeEmail: newUser.email,
      status: 'rewarded',
      referrerReward: this.referralConfig.rewardReferrerAmount,
      refereeReward: this.referralConfig.rewardRefereeAmount,
      currency: this.referralConfig.currency,
      createdAt: 'Just now',
      completedAt: 'Just now',
      fraudScore: 1,
      eligibilityCheck: {
        emailVerified: true,
        phoneVerified: true,
        uniqueIpVerified: true,
        profileCompleted: true
      }
    };

    this.referralConversions.unshift(conversion);

    // Notify referrer
    this.notifications.unshift({
      id: `notif_ref_bonus_${Date.now()}`,
      userId: referrer.id,
      type: 'system',
      title: '🎁 Referral Reward Credited!',
      message: `${newUser.name} registered using your referral code! ₦${conversion.referrerReward.toLocaleString()} has been credited to your NEMDAN Pay wallet.`,
      createdAt: 'Just now',
      read: false
    });

    // Notify referee (new user)
    this.notifications.unshift({
      id: `notif_ref_welc_${Date.now()}`,
      userId: newUser.id,
      type: 'system',
      title: '🎁 Welcome Referral Bonus!',
      message: `Welcome to NEMDAN! You received a ₦${conversion.refereeReward.toLocaleString()} welcome bonus from ${referrer.name}'s referral.`,
      createdAt: 'Just now',
      read: false
    });

    return conversion;
  }
}

export const db = new DatabaseStore();

