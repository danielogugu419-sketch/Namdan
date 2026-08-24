import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { db } from './src/server/db.js';
import { 
  User, Post, StoryItem, Reel, Message, Conversation, 
  NotificationItem, Group, Page, MarketplaceItem, 
  MarketplaceOrder, ModerationCase, VerificationRequest,
  ReactionType, LiveStream, LiveStreamChatMessage 
} from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;
const httpServer = http.createServer(app);

// Configure Uploads Storage Directory
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini API for AI Content Moderation
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'NEMDAN' });
});

// 1. AUTHENTICATION & USERS
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;
  const user = db.users.find(
    u => u.email.toLowerCase() === emailOrUsername?.toLowerCase() ||
         u.username.toLowerCase() === emailOrUsername?.toLowerCase()
  );

  if (user) {
    return res.json({
      success: true,
      token: `nemdan_jwt_${user.id}_${Date.now()}`,
      user
    });
  }

  // Fallback to default user if testing
  const fallback = db.users[0];
  res.json({
    success: true,
    token: `nemdan_jwt_${fallback.id}_${Date.now()}`,
    user: fallback
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, username, email, phone, role = 'user', referralCode } = req.body;
  
  const existing = db.getUserByUsername(username) || db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Username or Email is already registered on NEMDAN.' });
  }

  const newUser: User = {
    id: `u_${Date.now()}`,
    username: username.toLowerCase().replace(/\s+/g, '_'),
    name,
    email,
    phone: phone || '',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    bio: 'Proud new member of the NEMDAN Global Community 🌍',
    role: role as any,
    isVerified: false,
    joinedDate: 'Just now',
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
    isPrivate: false,
    privacySettings: {
      profileVisibility: 'public',
      postAudienceDefault: 'public',
      whoCanMessage: 'everyone',
      whoCanFriendRequest: 'everyone'
    }
  };

  db.users.push(newUser);
  db.friendships[newUser.id] = [];
  db.follows[newUser.id] = [];
  db.userCoins[newUser.id] = 500; // Welcome virtual coins

  // Process referral reward if provided
  if (referralCode) {
    db.processReferralRegistration(newUser.id, referralCode);
  }

  res.json({
    success: true,
    token: `nemdan_jwt_${newUser.id}_${Date.now()}`,
    user: newUser
  });
});

// Phone OTP simulation (SMS / WhatsApp)
app.post('/api/auth/otp/send', (req: Request, res: Response) => {
  const { phone, channel = 'sms' } = req.body;
  const mockOtp = '849201';
  res.json({
    success: true,
    message: `Verification code sent via ${channel.toUpperCase()} to ${phone}. (Demo code: ${mockOtp})`,
    demoCode: mockOtp
  });
});

app.post('/api/auth/otp/verify', (req: Request, res: Response) => {
  const { code, phone } = req.body;
  if (code === '849201' || code?.length === 6) {
    const user = db.users[0];
    return res.json({
      success: true,
      token: `nemdan_jwt_${user.id}_${Date.now()}`,
      user
    });
  }
  res.status(400).json({ error: 'Invalid verification code. Please try again.' });
});

app.get('/api/users', (req: Request, res: Response) => {
  res.json(db.users);
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = db.getUser(req.params.id) || db.getUserByUsername(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  db.users[idx] = { ...db.users[idx], ...req.body };
  res.json(db.users[idx]);
});

// Friends & Follows
app.get('/api/users/:id/friends', (req: Request, res: Response) => {
  const friendIds = db.friendships[req.params.id] || [];
  const friends = friendIds.map(fid => db.getUser(fid)).filter(Boolean);
  res.json(friends);
});

app.post('/api/users/:id/friend-request', (req: Request, res: Response) => {
  const { senderId } = req.body;
  const targetId = req.params.id;
  
  if (!db.friendships[targetId]) db.friendships[targetId] = [];
  if (!db.friendships[senderId]) db.friendships[senderId] = [];

  const isFriend = db.friendships[senderId].includes(targetId);
  if (isFriend) {
    // Remove friend
    db.friendships[senderId] = db.friendships[senderId].filter(id => id !== targetId);
    db.friendships[targetId] = db.friendships[targetId].filter(id => id !== senderId);
    return res.json({ status: 'removed' });
  }

  // Toggle friendship / request
  db.friendships[senderId].push(targetId);
  db.friendships[targetId].push(senderId);

  // Send notification
  const sender = db.getUser(senderId);
  if (sender) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: targetId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      type: 'friend_accept',
      title: 'New Connection',
      message: `${sender.name} is now connected with you on NEMDAN.`,
      isRead: false,
      createdAt: 'Just now'
    });
  }

  res.json({ status: 'friends' });
});

// 2. IMAGE & MEDIA UPLOAD
app.post('/api/upload/image', async (req: Request, res: Response) => {
  try {
    const { dataUrl, name = 'image.jpg', userId } = req.body;

    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing image data.' });
    }

    // Authenticate user check
    const user = userId ? db.getUser(userId) : db.users[0];
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: invalid user account.' });
    }

    // Validate MIME type
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image encoding.' });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    const allowedMimeTypes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/svg+xml': 'svg',
      'image/avif': 'avif'
    };

    const ext = allowedMimeTypes[mimeType] || 'jpg';
    const buffer = Buffer.from(base64Data, 'base64');
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB

    if (buffer.length > maxSizeBytes) {
      return res.status(400).json({
        error: `File exceeds maximum limit of 15MB (Size: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).`
      });
    }

    const safeUniqueName = `nemdan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = path.join(uploadsDir, safeUniqueName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeUniqueName}`;

    res.json({
      success: true,
      url: publicUrl,
      fileName: safeUniqueName,
      originalName: name,
      size: buffer.length,
      mimeType
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to process and store image upload.' });
  }
});

app.post('/api/upload/multiple', async (req: Request, res: Response) => {
  try {
    const { images, userId } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided for batch upload.' });
    }

    const user = userId ? db.getUser(userId) : db.users[0];
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: invalid user account.' });
    }

    const allowedMimeTypes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };

    const uploadedUrls: string[] = [];

    for (const item of images) {
      const dataUrl = item.dataUrl || item;
      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) continue;

      const mimeType = matches[1].toLowerCase();
      const base64Data = matches[2];

      if (!allowedMimeTypes[mimeType]) continue;

      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > 15 * 1024 * 1024) continue;

      const ext = allowedMimeTypes[mimeType];
      const safeUniqueName = `nemdan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = path.join(uploadsDir, safeUniqueName);

      await fs.promises.writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${safeUniqueName}`);
    }

    res.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length
    });
  } catch (err: any) {
    console.error('Batch Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload images.' });
  }
});

// 3. POSTS & FEED
app.get('/api/posts', (req: Request, res: Response) => {
  const { tab, userId } = req.query;
  let posts = [...db.posts];

  if (userId) {
    posts = posts.filter(p => p.authorId === userId);
  }

  res.json(posts);
});

app.post('/api/posts', async (req: Request, res: Response) => {
  const { 
    authorId, content, type = 'text', mediaUrls, media, audioUrl, audioTitle, 
    backgroundColor, locationName, pollOptions, audience = 'public', groupId, pageId 
  } = req.body;

  const author = db.getUser(authorId) || db.users[0];

  // Normalize media arrays
  let resolvedMediaUrls: string[] = [];
  if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
    resolvedMediaUrls = mediaUrls;
  } else if (Array.isArray(media) && media.length > 0) {
    resolvedMediaUrls = media.map(m => typeof m === 'string' ? m : m.url);
  }

  const resolvedMedia = resolvedMediaUrls.map(url => ({
    type: (url.includes('.mp4') || url.includes('video')) ? ('video' as const) : ('image' as const),
    url
  }));

  const postType = (resolvedMediaUrls.length > 0 && type === 'text') ? 'image' : type;

  const newPost: Post = {
    id: `p_${Date.now()}`,
    authorId: author.id,
    authorName: author.name,
    authorUsername: author.username,
    authorAvatar: author.avatar,
    authorVerified: author.isVerified,
    groupId,
    pageId,
    content: content || '',
    type: postType,
    mediaUrls: resolvedMediaUrls,
    media: resolvedMedia,
    audioUrl,
    audioTitle,
    backgroundColor,
    locationName,
    pollOptions: pollOptions?.map((text: string, idx: number) => ({
      id: `opt_${Date.now()}_${idx}`,
      text,
      votes: []
    })),
    audience,
    reactions: [],
    commentsCount: 0,
    sharesCount: 0,
    savesCount: 0,
    savedBy: [],
    createdAt: 'Just now'
  };

  // Perform AI Content Moderation in the background
  triggerAIModeration(newPost);

  db.posts.unshift(newPost);
  io.emit('new_post', newPost);
  res.status(201).json(newPost);
});

app.post('/api/posts/:id/react', (req: Request, res: Response) => {
  const { userId, type } = req.body;
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const user = db.getUser(userId) || db.users[0];
  const existingIdx = post.reactions.findIndex(r => r.userId === user.id);

  if (existingIdx !== -1) {
    if (post.reactions[existingIdx].type === type) {
      post.reactions.splice(existingIdx, 1); // remove reaction
    } else {
      post.reactions[existingIdx].type = type; // change reaction
    }
  } else {
    post.reactions.push({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      type: type as ReactionType
    });

    if (post.authorId !== user.id) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: post.authorId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        type: 'reaction',
        title: `Reaction to your post`,
        message: `${user.name} reacted (${type}) to your post.`,
        targetId: post.id,
        isRead: false,
        createdAt: 'Just now'
      });
    }
  }

  io.emit('post_updated', post);
  res.json(post);
});

app.post('/api/posts/:id/vote', (req: Request, res: Response) => {
  const { userId, optionId } = req.body;
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post || !post.pollOptions) return res.status(404).json({ error: 'Poll not found' });

  // Remove previous vote from this user across all options
  post.pollOptions.forEach(opt => {
    opt.votes = opt.votes.filter(v => v !== userId);
  });

  const targetOption = post.pollOptions.find(opt => opt.id === optionId);
  if (targetOption) {
    targetOption.votes.push(userId);
  }

  io.emit('post_updated', post);
  res.json(post);
});

app.delete('/api/posts/:id', (req: Request, res: Response) => {
  const idx = db.posts.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    db.posts.splice(idx, 1);
    io.emit('post_deleted', req.params.id);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Post not found' });
});

// COMMENTS
app.get('/api/posts/:id/comments', (req: Request, res: Response) => {
  const comments = db.comments.filter(c => c.postId === req.params.id);
  res.json(comments);
});

app.post('/api/posts/:id/comments', (req: Request, res: Response) => {
  const { userId, content, mediaUrl } = req.body;
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const user = db.getUser(userId) || db.users[0];
  const newComment = {
    id: `c_${Date.now()}`,
    postId: post.id,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    userVerified: user.isVerified,
    content,
    mediaUrl,
    createdAt: 'Just now',
    likesCount: 0,
    likedBy: [],
    replies: []
  };

  db.comments.push(newComment);
  post.commentsCount = (post.commentsCount || 0) + 1;

  if (post.authorId !== user.id) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: post.authorId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      type: 'comment',
      title: 'New Comment',
      message: `${user.name} commented on your post: "${content.slice(0, 40)}..."`,
      targetId: post.id,
      isRead: false,
      createdAt: 'Just now'
    });
  }

  io.emit('comment_added', { postId: post.id, comment: newComment });
  res.status(201).json(newComment);
});

// 3. STORIES
app.get('/api/stories', (req: Request, res: Response) => {
  const now = Date.now();
  // Filter stories that expire strictly after 24 hours
  const activeStories = db.stories.filter(s => {
    if (!s.expiresAt) return true;
    return new Date(s.expiresAt).getTime() > now;
  });
  res.json(activeStories);
});

app.post('/api/stories', (req: Request, res: Response) => {
  const { 
    userId, 
    mediaUrl, 
    mediaType = 'image', 
    caption, 
    musicTitle, 
    backgroundGradient,
    filter,
    cropAspect,
    rotation,
    zoom,
    textOverlays,
    stickers
  } = req.body;
  const user = db.getUser(userId) || db.users[0];

  const newStory: StoryItem = {
    id: `s_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    userVerified: user.isVerified,
    mediaUrl,
    mediaType,
    caption,
    musicTitle,
    backgroundGradient,
    filter,
    cropAspect: cropAspect || '9:16',
    rotation: rotation || 0,
    zoom: zoom || 1,
    textOverlays: textOverlays || [],
    stickers: stickers || [],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    viewers: []
  };

  db.stories.unshift(newStory);
  io.emit('new_story', newStory);
  res.status(201).json(newStory);
});

app.post('/api/stories/:id/view', (req: Request, res: Response) => {
  const { userId } = req.body;
  const story = db.stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  const user = db.getUser(userId) || db.users[0];
  if (!story.viewers.some(v => v.userId === user.id)) {
    story.viewers.push({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      viewedAt: 'Just now'
    });
    io.emit('story_viewed', { storyId: story.id, viewer: { userId: user.id, userName: user.name, userAvatar: user.avatar, viewedAt: 'Just now' } });
  }
  res.json(story);
});

app.post('/api/stories/:id/react', (req: Request, res: Response) => {
  const { userId, reaction, emoji } = req.body;
  const story = db.stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  const user = db.getUser(userId) || db.users[0];
  const reactValue = reaction || emoji || '❤️';
  const existingViewer = story.viewers.find(v => v.userId === user.id);
  if (existingViewer) {
    existingViewer.reaction = reactValue;
  } else {
    story.viewers.push({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      viewedAt: 'Just now',
      reaction: reactValue
    });
  }

  if (story.userId !== user.id) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: story.userId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      type: 'reaction',
      title: 'Story Reaction',
      message: `${user.name} reacted ${reactValue} to your NEMDAN story`,
      targetId: story.id,
      isRead: false,
      createdAt: 'Just now'
    });
  }

  io.emit('story_reaction', { storyId: story.id, userId: user.id, reaction: reactValue });
  res.json(story);
});

app.delete('/api/stories/:id', (req: Request, res: Response) => {
  const { userId } = req.body;
  const idx = db.stories.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Story not found' });

  const story = db.stories[idx];
  const user = db.getUser(userId);
  if (user && (user.id === story.userId || user.role === 'super_admin' || user.role === 'moderator')) {
    db.stories.splice(idx, 1);
    io.emit('story_deleted', { storyId: req.params.id });
    return res.json({ success: true, storyId: req.params.id });
  }
  return res.status(403).json({ error: 'Unauthorized to delete this story' });
});

// 4. REELS
app.get('/api/reels', (req: Request, res: Response) => {
  res.json(db.reels);
});

app.post('/api/reels', (req: Request, res: Response) => {
  const { creatorId, videoUrl, caption, audioTitle, thumbnailUrl } = req.body;
  const creator = db.getUser(creatorId) || db.users[0];

  const newReel: Reel = {
    id: `r_${Date.now()}`,
    creatorId: creator.id,
    creatorName: creator.name,
    creatorUsername: creator.username,
    creatorAvatar: creator.avatar,
    creatorVerified: creator.isVerified,
    videoUrl,
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    caption,
    audioTitle: audioTitle || `${creator.name} • Original Audio`,
    viewsCount: 1,
    reactions: [],
    commentsCount: 0,
    sharesCount: 0,
    savesCount: 0,
    createdAt: 'Just now'
  };

  db.reels.unshift(newReel);
  io.emit('new_reel', newReel);
  res.status(201).json(newReel);
});

app.post('/api/reels/:id/react', (req: Request, res: Response) => {
  const { userId, type } = req.body;
  const reel = db.reels.find(r => r.id === req.params.id);
  if (!reel) return res.status(404).json({ error: 'Reel not found' });

  const user = db.getUser(userId) || db.users[0];
  const existingIdx = reel.reactions.findIndex(r => r.userId === user.id);

  if (existingIdx !== -1) {
    if (reel.reactions[existingIdx].type === type) {
      reel.reactions.splice(existingIdx, 1);
    } else {
      reel.reactions[existingIdx].type = type;
    }
  } else {
    reel.reactions.push({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      type: type as ReactionType
    });
  }

  res.json(reel);
});

// 4.5 LIVE STREAMS & REPLAYS
app.get('/api/live/streams', (req: Request, res: Response) => {
  const { category, status } = req.query;
  const streams = db.getLiveStreams(
    category as string | undefined, 
    status as 'live' | 'ended' | undefined
  );
  res.json(streams);
});

app.get('/api/live/streams/:id', (req: Request, res: Response) => {
  const stream = db.getLiveStream(req.params.id);
  if (!stream) return res.status(404).json({ error: 'Live stream not found' });
  res.json(stream);
});

app.get('/api/live/streams/:id/messages', (req: Request, res: Response) => {
  const stream = db.getLiveStream(req.params.id);
  if (!stream) return res.status(404).json({ error: 'Live stream not found' });
  
  if (stream.status === 'ended' && stream.replayChat) {
    return res.json(stream.replayChat);
  }
  const messages = db.liveStreamChats[req.params.id] || [];
  res.json(messages);
});

app.post('/api/live/streams', (req: Request, res: Response) => {
  const { hostId, title, description, category, tags, videoUrl, thumbnailUrl, pinnedMessage } = req.body;
  const host = db.getUser(hostId) || db.users[0];

  const newStream = db.createLiveStream({
    hostId: host.id,
    hostName: host.name,
    hostUsername: host.username,
    hostAvatar: host.avatar,
    hostVerified: host.isVerified,
    title: title || `${host.name}'s Live Stream`,
    description,
    category: category || 'just_chatting',
    tags: tags || ['Live', 'NEMDAN'],
    videoUrl,
    thumbnailUrl: thumbnailUrl || host.avatar,
    pinnedMessage
  });

  // Notify all users in real-time
  io.emit('live_stream_started', newStream);

  // Add system notification for followers
  db.notifications.unshift({
    id: `notif_live_${Date.now()}`,
    userId: 'u_admin',
    senderId: host.id,
    senderName: host.name,
    senderAvatar: host.avatar,
    type: 'live',
    title: 'Live Broadcast Started',
    message: `🔴 ${host.name} is now LIVE: "${newStream.title.slice(0, 45)}..."`,
    targetId: newStream.id,
    isRead: false,
    createdAt: 'Just now'
  });

  res.status(201).json(newStream);
});

app.post('/api/live/streams/:id/end', (req: Request, res: Response) => {
  const { durationSeconds } = req.body;
  const endedStream = db.endLiveStream(req.params.id, durationSeconds);
  if (!endedStream) return res.status(404).json({ error: 'Live stream not found' });

  io.to(`live_${req.params.id}`).emit('live_stream_ended', endedStream);
  io.emit('live_stream_status_updated', { streamId: req.params.id, status: 'ended' });

  res.json(endedStream);
});

app.post('/api/live/streams/:id/messages', (req: Request, res: Response) => {
  const { userId, message, type = 'chat', giftDetails } = req.body;
  const user = db.getUser(userId) || db.users[0];

  const chatMessage = db.addLiveChatMessage(req.params.id, {
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    userRole: user.role,
    userVerified: user.isVerified,
    message,
    type,
    giftDetails
  });

  // Broadcast to room
  io.to(`live_${req.params.id}`).emit('live_chat_message', chatMessage);
  io.emit('live_chat_message_global', { streamId: req.params.id, message: chatMessage });

  res.status(201).json(chatMessage);
});

app.post('/api/live/streams/:id/react', (req: Request, res: Response) => {
  const { delta = 1, type = 'love', userId } = req.body;
  const user = db.getUser(userId) || db.users[0];
  const newLikes = db.reactLiveStream(req.params.id, delta);

  io.to(`live_${req.params.id}`).emit('live_reaction', {
    streamId: req.params.id,
    userId: user.id,
    userName: user.name,
    type,
    likesCount: newLikes
  });

  res.json({ success: true, likesCount: newLikes });
});

app.post('/api/live/streams/:id/viewers', (req: Request, res: Response) => {
  const { delta = 1 } = req.body;
  const currentViewers = db.updateLiveViewers(req.params.id, delta);

  io.to(`live_${req.params.id}`).emit('live_viewer_update', {
    streamId: req.params.id,
    viewerCount: currentViewers
  });

  res.json({ success: true, viewerCount: currentViewers });
});

app.post('/api/live/streams/:id/pin', (req: Request, res: Response) => {
  const { pinnedMessage } = req.body;
  const stream = db.getLiveStream(req.params.id);
  if (!stream) return res.status(404).json({ error: 'Live stream not found' });

  stream.pinnedMessage = pinnedMessage;
  io.to(`live_${req.params.id}`).emit('live_pinned_message_updated', {
    streamId: req.params.id,
    pinnedMessage
  });

  res.json(stream);
});

// 5. MESSAGING & CONVERSATIONS
app.get('/api/conversations', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.json(db.conversations);
  const userConvs = db.conversations.filter(c => c.participantIds.includes(userId as string));
  res.json(userConvs);
});

app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const messages = db.messages[req.params.id] || [];
  res.json(messages);
});

app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const { senderId, content, type = 'text', mediaUrl } = req.body;
  const conv = db.conversations.find(c => c.id === req.params.id);
  const sender = db.getUser(senderId) || db.users[0];

  const newMsg: Message = {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    conversationId: req.params.id,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    type,
    content,
    mediaUrl,
    reactions: [],
    isRead: false,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  if (!db.messages[req.params.id]) db.messages[req.params.id] = [];
  db.messages[req.params.id].push(newMsg);

  if (conv) {
    conv.lastMessage = newMsg;
    conv.updatedAt = new Date().toISOString();
  }

  io.to(req.params.id).emit('receive_message', newMsg);
  io.emit('conversation_updated', conv);
  res.status(201).json(newMsg);
});

// 6. MARKETPLACE
app.get('/api/marketplace', (req: Request, res: Response) => {
  const { category, search, sellerId } = req.query;
  let items = [...db.marketplaceItems];

  if (category && category !== 'All') {
    items = items.filter(i => i.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }
  if (sellerId) {
    items = items.filter(i => i.sellerId === sellerId);
  }

  res.json(items);
});

app.post('/api/marketplace', (req: Request, res: Response) => {
  const { sellerId, title, description, price, category, condition, location, images } = req.body;
  const seller = db.getUser(sellerId) || db.users[0];

  const newItem: MarketplaceItem = {
    id: `item_${Date.now()}`,
    sellerId: seller.id,
    sellerName: seller.name,
    sellerAvatar: seller.avatar,
    sellerVerified: seller.isVerified,
    sellerRating: 5.0,
    title,
    description,
    price: Number(price),
    currency: 'USD',
    category: category || 'General',
    condition: condition || 'new',
    location: location || 'Global',
    images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
    isSold: false,
    paymentMethod: 'Cash on Delivery',
    deliveryOptions: ['Seller Delivery', 'NEMDAN Express', 'Local Pickup'],
    createdAt: 'Just now'
  };

  db.marketplaceItems.unshift(newItem);
  res.status(201).json(newItem);
});

app.post('/api/marketplace/order', (req: Request, res: Response) => {
  const { itemId, buyerId, buyerName, buyerPhone, deliveryAddress, deliveryType } = req.body;
  const item = db.marketplaceItems.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const newOrder: MarketplaceOrder = {
    id: `ord_${Date.now()}`,
    itemId: item.id,
    itemTitle: item.title,
    itemPrice: item.price,
    itemImage: item.images[0],
    sellerId: item.sellerId,
    buyerId,
    buyerName,
    buyerPhone,
    deliveryAddress,
    deliveryType: deliveryType || 'NEMDAN Express',
    paymentMethod: 'Cash on Delivery',
    status: 'pending',
    createdAt: 'Just now'
  };

  db.orders.unshift(newOrder);

  // Notify seller
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: item.sellerId,
    type: 'marketplace_order',
    title: 'New Cash on Delivery Order! 📦',
    message: `${buyerName} ordered "${item.title}" ($${item.price}) for Cash on Delivery.`,
    targetId: newOrder.id,
    isRead: false,
    createdAt: 'Just now'
  });

  res.status(201).json(newOrder);
});

app.get('/api/marketplace/orders', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.json(db.orders);
  const userOrders = db.orders.filter(o => o.buyerId === userId || o.sellerId === userId);
  res.json(userOrders);
});

// 7. GROUPS & PAGES
app.get('/api/groups', (req: Request, res: Response) => {
  res.json(db.groups);
});

app.post('/api/groups', (req: Request, res: Response) => {
  const { name, description, category, privacy, creatorId, coverImage, avatarImage } = req.body;
  const creator = db.getUser(creatorId) || db.users[0];

  const newGroup: Group = {
    id: `g_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    coverImage: coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    avatarImage: avatarImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80',
    category: category || 'General',
    privacy: privacy || 'public',
    creatorId: creator.id,
    adminIds: [creator.id],
    moderatorIds: [],
    memberIds: [creator.id],
    membersCount: 1,
    rules: [
      { id: 'r1', title: 'Respectful Community', desc: 'No bullying or discrimination.' }
    ],
    createdAt: 'Just now'
  };

  db.groups.push(newGroup);
  res.status(201).json(newGroup);
});

app.post('/api/groups/:id/join', (req: Request, res: Response) => {
  const { userId } = req.body;
  const group = db.groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  if (group.memberIds.includes(userId)) {
    group.memberIds = group.memberIds.filter(id => id !== userId);
    group.membersCount = Math.max(1, group.membersCount - 1);
  } else {
    group.memberIds.push(userId);
    group.membersCount += 1;
  }

  res.json(group);
});

app.get('/api/pages', (req: Request, res: Response) => {
  res.json(db.pages);
});

app.post('/api/pages', (req: Request, res: Response) => {
  const { name, username, category, description, website, phone, email, address, coverImage, avatar, adminId } = req.body;
  const admin = db.getUser(adminId) || db.users[0];

  const newPage: Page = {
    id: `page_${Date.now()}`,
    name,
    username: username.toLowerCase().replace(/\s+/g, '_'),
    category,
    description,
    avatar: avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    website,
    phone,
    email,
    address,
    isVerified: true,
    followersCount: 1,
    rating: 5.0,
    reviewCount: 1,
    adminIds: [admin.id],
    createdAt: 'Just now'
  };

  db.pages.push(newPage);
  res.status(201).json(newPage);
});

// 8. NOTIFICATIONS & SEARCH
app.get('/api/notifications', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.json(db.notifications);
  const userNotifs = db.notifications.filter(n => n.recipientId === userId);
  res.json(userNotifs);
});

app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  const { userId } = req.body;
  db.notifications.forEach(n => {
    if (!userId || n.recipientId === userId) n.isRead = true;
  });
  res.json({ success: true });
});

app.get('/api/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  if (!q) return res.json({ users: [], posts: [], reels: [], groups: [], pages: [], marketplace: [] });

  const users = db.users.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  const posts = db.posts.filter(p => p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q));
  const reels = db.reels.filter(r => r.caption.toLowerCase().includes(q) || r.creatorName.toLowerCase().includes(q));
  const groups = db.groups.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
  const pages = db.pages.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  const marketplace = db.marketplaceItems.filter(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));

  res.json({ users, posts, reels, groups, pages, marketplace });
});

// 9. CREATOR DASHBOARD
app.get('/api/creator/stats/:id', (req: Request, res: Response) => {
  const user = db.getUser(req.params.id) || db.users[1];
  const userReels = db.reels.filter(r => r.creatorId === user.id);
  const totalViews = userReels.reduce((acc, r) => acc + (r.viewsCount || 0), 0) + 142800;
  const totalReactions = userReels.reduce((acc, r) => acc + (r.reactions?.length || 0), 0) + 1890;

  res.json({
    followers: user.followersCount || 12450,
    followersCount: user.followersCount || 12450,
    monthlyViews: totalViews,
    totalViews: totalViews,
    totalLikes: totalReactions,
    estimatedEarnings: 2840.50,
    engagementRate: '8.4%',
    monthlyGrowth: '+24.8%',
    estimatedRevenue: '$2,840.50',
    topReels: userReels,
    achievements: [
      { id: '1', title: '100K Views Milestone', unlocked: true, date: 'May 2026' },
      { id: '2', title: 'Viral Spark Badge', unlocked: true, date: 'June 2026' },
      { id: '3', title: 'Top 1% Creator League', unlocked: true, date: 'July 2026' }
    ]
  });
});

// 10. ADMIN & AI CONTENT MODERATION QUEUE
app.get('/api/admin/overview', (req: Request, res: Response) => {
  res.json({
    totalUsers: db.users.length + 12840,
    activeUsers: 8920,
    totalPosts: db.posts.length + 48900,
    totalReels: db.reels.length + 14200,
    totalStories: db.stories.length + 3100,
    totalMessages: 98400,
    totalGroups: db.groups.length + 420,
    totalPages: db.pages.length + 310,
    totalMarketplaceItems: db.marketplaceItems.length + 1840,
    pendingModerationCount: db.moderationQueue.filter(m => m.status === 'pending').length,
    pendingVerificationCount: db.verificationRequests.filter(v => v.status === 'pending').length
  });
});

app.get('/api/admin/moderation', (req: Request, res: Response) => {
  res.json(db.moderationQueue);
});

app.post('/api/admin/moderation/:id/decision', (req: Request, res: Response) => {
  const { decision, adminId } = req.body; // 'approved' | 'removed' | 'dismissed'
  const item = db.moderationQueue.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Moderation item not found' });

  item.status = decision;
  item.reviewedBy = adminId || 'u_admin';
  item.reviewedAt = new Date().toISOString();

  if (decision === 'removed') {
    // If post was removed
    if (item.targetType === 'post') {
      db.posts = db.posts.filter(p => p.id !== item.targetId);
    }
  }

  res.json(item);
});

app.get('/api/admin/verifications', (req: Request, res: Response) => {
  res.json(db.verificationRequests);
});

app.post('/api/admin/verifications/:id/decision', (req: Request, res: Response) => {
  const { decision } = req.body; // 'approved' | 'rejected'
  const item = db.verificationRequests.find(v => v.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Verification request not found' });

  item.status = decision;
  if (decision === 'approved') {
    const user = db.getUser(item.userId);
    if (user) user.isVerified = true;
  }

  res.json(item);
});

app.post('/api/verification/request', (req: Request, res: Response) => {
  const { userId, category, documentType, reason } = req.body;
  const user = db.getUser(userId) || db.users[0];

  const newReq: VerificationRequest = {
    id: `ver_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    userAvatar: user.avatar,
    category: category || 'Creator',
    documentType: documentType || 'ID Document',
    reason,
    status: 'pending',
    submittedAt: 'Just now'
  };

  db.verificationRequests.unshift(newReq);
  res.status(201).json(newReq);
});

// 11. VIRTUAL COINS & PACKAGES
app.get('/api/coins/balance/:userId', (req: Request, res: Response) => {
  const coins = db.getUserCoins(req.params.userId);
  res.json({ userId: req.params.userId, coins });
});

app.get('/api/coins/packages', (req: Request, res: Response) => {
  res.json(db.getCoinPackages());
});

app.post('/api/coins/purchase', (req: Request, res: Response) => {
  try {
    const { userId, packageId, customAmount, paymentMethod = 'card' } = req.body;
    const user = db.getUser(userId) || db.users[0];
    const result = db.purchaseCoins(user.id, packageId, customAmount, paymentMethod);

    // Emit balance update via socket
    io.to(`user_${user.id}`).emit('coins_balance_updated', {
      userId: user.id,
      coins: result.newBalance,
      addedCoins: result.addedCoins
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to purchase coins.' });
  }
});

app.put('/api/admin/coins/packages/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateCoinPackage(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 12. VIRTUAL GIFTS CATALOG & STREAM GIFTING
app.get('/api/gifts', (req: Request, res: Response) => {
  res.json(db.getVirtualGifts());
});

app.post('/api/gifts', (req: Request, res: Response) => {
  try {
    const newGift = db.createVirtualGift(req.body);
    io.emit('virtual_gifts_catalog_updated', db.getVirtualGifts());
    res.status(201).json(newGift);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/gifts/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateVirtualGift(req.params.id, req.body);
    io.emit('virtual_gifts_catalog_updated', db.getVirtualGifts());
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/gifts/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteVirtualGift(req.params.id);
    io.emit('virtual_gifts_catalog_updated', db.getVirtualGifts());
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/live/streams/:id/gifts', (req: Request, res: Response) => {
  try {
    const { senderId, giftId, comboCount = 1 } = req.body;
    const user = db.getUser(senderId) || db.users[0];
    const result = db.sendVirtualGift(req.params.id, user.id, giftId, comboCount);

    // Broadcast real-time gift animation, leaderboard update & stream stats
    io.to(`live_${req.params.id}`).emit('live_gift_received', {
      gift: result.gift,
      leaderboard: result.leaderboard,
      totalCoinsReceived: result.stream.totalCoinsReceived,
      totalGiftsCount: result.stream.totalGiftsCount,
      likesCount: result.stream.likesCount
    });

    // Notify user coin balance change
    io.to(`user_${user.id}`).emit('coins_balance_updated', {
      userId: user.id,
      coins: result.senderCoins
    });

    // Global feed of big gifts (Diamond, Rocket, Lion, Crown, Universe)
    if (result.gift.coinAmount >= 50) {
      io.emit('global_gift_shoutout', {
        senderName: result.gift.senderName,
        recipientName: result.gift.recipientName,
        giftName: result.gift.giftName,
        giftIcon: result.gift.giftIcon,
        coinAmount: result.gift.coinAmount,
        streamId: req.params.id
      });
    }

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send virtual gift.' });
  }
});

app.get('/api/live/streams/:id/gifts', (req: Request, res: Response) => {
  res.json(db.getStreamGifts(req.params.id));
});

app.get('/api/live/streams/:id/leaderboard', (req: Request, res: Response) => {
  res.json(db.getStreamLeaderboard(req.params.id));
});

// 13. CREATOR EARNINGS & WITHDRAWAL PAYOUTS
app.get('/api/creator/earnings/:id', (req: Request, res: Response) => {
  res.json(db.getCreatorEarnings(req.params.id));
});

app.get('/api/creator/withdrawals', (req: Request, res: Response) => {
  const { creatorId } = req.query;
  if (creatorId) {
    const list = db.withdrawalRequests.filter(r => r.creatorId === creatorId);
    return res.json(list);
  }
  res.json(db.withdrawalRequests);
});

app.post('/api/creator/withdrawals', (req: Request, res: Response) => {
  try {
    const { creatorId, amountUSD, paymentMethod, accountDetails } = req.body;
    const request = db.requestWithdrawal(creatorId, Number(amountUSD), paymentMethod, accountDetails);
    
    // Notify admin
    io.emit('admin_withdrawal_requested', request);

    res.status(201).json(request);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit withdrawal request.' });
  }
});

app.post('/api/admin/withdrawals/:id/approve', (req: Request, res: Response) => {
  try {
    const { reviewerId = 'u_admin' } = req.body;
    const approved = db.approveWithdrawal(req.params.id, reviewerId);
    io.emit('withdrawal_status_updated', approved);
    res.json(approved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/withdrawals/:id/reject', (req: Request, res: Response) => {
  try {
    const { reviewerId = 'u_admin', reason } = req.body;
    const rejected = db.rejectWithdrawal(req.params.id, reviewerId, reason);
    io.emit('withdrawal_status_updated', rejected);
    res.json(rejected);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/settings/commission', (req: Request, res: Response) => {
  const { rate } = req.body;
  const newRate = db.setPlatformCommission(Number(rate));
  res.json({ success: true, platformCommissionRate: newRate });
});

// 14. REFERRAL REWARDS & ANALYTICS
app.get('/api/referrals/stats/:userId', (req: Request, res: Response) => {
  const stats = db.getReferralStats(req.params.userId);
  res.json(stats);
});

app.get('/api/referrals/conversions/:userId', (req: Request, res: Response) => {
  const conversions = db.getReferralConversions(req.params.userId);
  res.json(conversions);
});

app.get('/api/admin/referrals/conversions', (req: Request, res: Response) => {
  res.json(db.getAllReferralConversions());
});

app.get('/api/admin/referrals/config', (req: Request, res: Response) => {
  res.json(db.referralConfig);
});

app.put('/api/admin/referrals/config', (req: Request, res: Response) => {
  const updated = db.updateReferralConfig(req.body);
  res.json(updated);
});

// AI MODERATION FUNCTION using Gemini
async function triggerAIModeration(post: Post) {
  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      // Rule-based fallback moderation heuristic
      const spamKeywords = ['guaranteed 500%', 'free crypto', 'multiplying wallet', 'send btc', 'hate', 'kill', 'scam'];
      const hasSpam = spamKeywords.some(kw => post.content.toLowerCase().includes(kw));
      if (hasSpam) {
        db.moderationQueue.unshift({
          id: `mod_${Date.now()}`,
          targetType: 'post',
          targetId: post.id,
          authorId: post.authorId,
          authorName: post.authorName,
          contentSnippet: post.content.slice(0, 140),
          reportedBy: 'NEMDAN AI Safety Filter',
          reportReason: 'Potential Financial Scheme / Toxic Content',
          aiScore: 92,
          aiCategory: 'Scams & Spam',
          aiExplanation: 'Automated linguistic heuristic flagged high risk financial promise pattern.',
          status: 'pending',
          createdAt: 'Just now'
        });
      }
      return;
    }

    const prompt = `Analyze this social media post for safety violations (Hate Speech, Harassment, Financial Scams, Graphic Violence, Inappropriate Media, Spam).
Content: "${post.content}"
Return a JSON object with:
- isHarmful: boolean
- category: string
- confidenceScore: number (0 to 100)
- explanation: string`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isHarmful: { type: Type.BOOLEAN },
            category: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ['isHarmful', 'category', 'confidenceScore', 'explanation']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.isHarmful && parsed.confidenceScore >= 70) {
      db.moderationQueue.unshift({
        id: `mod_${Date.now()}`,
        targetType: 'post',
        targetId: post.id,
        authorId: post.authorId,
        authorName: post.authorName,
        contentSnippet: post.content.slice(0, 140),
        reportedBy: 'NEMDAN Gemini 3.7 AI Scanner',
        reportReason: parsed.category,
        aiScore: parsed.confidenceScore,
        aiCategory: parsed.category,
        aiExplanation: parsed.explanation,
        status: 'pending',
        createdAt: 'Just now'
      });
    }
  } catch (err) {
    console.error('AI Moderation error:', err);
  }
}

// ----------------------------------------------------
// SOCKET.IO REAL-TIME EVENTS & WEBRTC SIGNALING
// ----------------------------------------------------
io.on('connection', (socket) => {
  // User presence & joining rooms
  socket.on('join_user', (userId: string) => {
    socket.join(`user_${userId}`);
    socket.broadcast.emit('user_online', { userId, status: 'online' });
  });

  socket.on('join_conversation', (conversationId: string) => {
    socket.join(conversationId);
  });

  // Typing indicators
  socket.on('typing_start', ({ conversationId, userId, userName }) => {
    socket.to(conversationId).emit('user_typing', { conversationId, userId, userName });
  });

  socket.on('typing_stop', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user_stop_typing', { conversationId, userId });
  });

  // WebRTC Voice & Video Call Signaling
  socket.on('initiate_call', (data: { from: User; toUserId: string; type: 'voice' | 'video' }) => {
    io.to(`user_${data.toUserId}`).emit('incoming_call', {
      callId: `call_${Date.now()}`,
      caller: data.from,
      type: data.type
    });
  });

  socket.on('answer_call', (data: { callerId: string; accepted: boolean; signal?: any }) => {
    io.to(`user_${data.callerId}`).emit('call_answered', data);
  });

  socket.on('end_call', (data: { targetUserId: string }) => {
    io.to(`user_${data.targetUserId}`).emit('call_ended');
  });

  socket.on('webrtc_signal', (data: { targetUserId: string; signal: any }) => {
    io.to(`user_${data.targetUserId}`).emit('webrtc_signal', data.signal);
  });

  // Live Stream real-time rooms & events
  socket.on('join_live_stream', (streamId: string) => {
    socket.join(`live_${streamId}`);
    // Notify host/room of viewer join
    const count = db.updateLiveViewers(streamId, 1);
    io.to(`live_${streamId}`).emit('live_viewer_update', { streamId, viewerCount: count });
  });

  socket.on('leave_live_stream', (streamId: string) => {
    socket.leave(`live_${streamId}`);
    const count = db.updateLiveViewers(streamId, -1);
    io.to(`live_${streamId}`).emit('live_viewer_update', { streamId, viewerCount: count });
  });

  // WebRTC Live Stream Broadcasting Signaling
  socket.on('live_broadcaster_ready', (data: { streamId: string; hostId: string }) => {
    socket.join(`live_${data.streamId}`);
    socket.to(`live_${data.streamId}`).emit('live_broadcaster_online', {
      streamId: data.streamId,
      broadcasterSocketId: socket.id,
      hostId: data.hostId
    });
  });

  socket.on('live_viewer_join_broadcast', (data: { streamId: string; viewerId: string }) => {
    socket.to(`live_${data.streamId}`).emit('live_new_viewer_joined', {
      streamId: data.streamId,
      viewerSocketId: socket.id,
      viewerId: data.viewerId
    });
  });

  socket.on('live_webrtc_offer', (data: { targetSocketId: string; offer: any; streamId: string }) => {
    io.to(data.targetSocketId).emit('live_webrtc_offer', {
      broadcasterSocketId: socket.id,
      offer: data.offer,
      streamId: data.streamId
    });
  });

  socket.on('live_webrtc_answer', (data: { targetSocketId: string; answer: any; streamId: string }) => {
    io.to(data.targetSocketId).emit('live_webrtc_answer', {
      viewerSocketId: socket.id,
      answer: data.answer,
      streamId: data.streamId
    });
  });

  socket.on('live_webrtc_ice_candidate', (data: { targetSocketId: string; candidate: any }) => {
    io.to(data.targetSocketId).emit('live_webrtc_ice_candidate', {
      fromSocketId: socket.id,
      candidate: data.candidate
    });
  });

  socket.on('send_live_chat', (data: { streamId: string; message: any }) => {
    io.to(`live_${data.streamId}`).emit('live_chat_message', data.message);
  });

  socket.on('send_live_reaction', (data: { streamId: string; type: string; userId: string; userName: string }) => {
    const newLikes = db.reactLiveStream(data.streamId, 1);
    io.to(`live_${data.streamId}`).emit('live_reaction', {
      ...data,
      likesCount: newLikes
    });
  });

  socket.on('send_live_gift', (data: { streamId: string; senderId: string; giftId: string; comboCount?: number }) => {
    try {
      const result = db.sendVirtualGift(data.streamId, data.senderId, data.giftId, data.comboCount || 1);
      io.to(`live_${data.streamId}`).emit('live_gift_received', {
        gift: result.gift,
        leaderboard: result.leaderboard,
        totalCoinsReceived: result.stream.totalCoinsReceived,
        totalGiftsCount: result.stream.totalGiftsCount,
        likesCount: result.stream.likesCount
      });
      io.to(`user_${data.senderId}`).emit('coins_balance_updated', {
        userId: data.senderId,
        coins: result.senderCoins
      });
    } catch (err: any) {
      socket.emit('live_gift_error', { message: err.message });
    }
  });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & STATIC ASSETS
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`NEMDAN Social Platform Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
