import { User, Post, NotificationItem, TrendingTopic, ModerationQueueItem, FollowRequest } from '../types';

export const mockUsers: Record<string, User> = {
  sarah_tech: {
    id: 'u_1',
    username: 'sarah_tech',
    displayName: 'Sarah Connor',
    email: 'sarah@example.com',
    bio: 'Distributed systems architect & open source fanatic. Building high-throughput data pipelines on Redis & Mongo.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
    location: 'San Francisco, CA',
    website: 'https://sarah.dev',
    followersCount: 1820,
    followingCount: 342,
    postsCount: 56,
    isPrivate: false,
    isFollowing: false,
    role: 'user',
    isVerified: true,
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  alex_dev: {
    id: 'u_2',
    username: 'alex_dev',
    displayName: 'Alex Rivera',
    email: 'alex@example.com',
    bio: 'Backend engineer. Redis Sorted Sets enthusiast. Clean code, rock climbing and coffee. ☕',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop',
    location: 'Austin, TX',
    website: 'https://alexrivera.io',
    followersCount: 940,
    followingCount: 215,
    postsCount: 38,
    isPrivate: true, // Private account to test follow request flow!
    isFollowing: false,
    role: 'user',
    createdAt: '2026-02-10T12:00:00.000Z',
  },
  maria_design: {
    id: 'u_3',
    username: 'maria_design',
    displayName: 'Maria Garcia',
    email: 'maria@example.com',
    bio: 'Product Designer at Figma lover. Crafting accessible, WCAG-compliant design systems for #SocialApps.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&h=400&fit=crop',
    location: 'London, UK',
    website: 'https://mariadesign.co',
    followersCount: 3200,
    followingCount: 410,
    postsCount: 120,
    isPrivate: false,
    isFollowing: true,
    role: 'user',
    isVerified: true,
    createdAt: '2025-11-20T09:30:00.000Z',
  },
  moderator_admin: {
    id: 'u_4',
    username: 'moderator_admin',
    displayName: 'System Moderator',
    email: 'mod@chirpwell.internal',
    bio: 'Chirpwell Safety and AI Moderation Operations. Keeping the community civil, respectful, and safe.',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop',
    location: 'Global Grid',
    website: 'https://chirpwell.safety',
    followersCount: 50,
    followingCount: 10,
    postsCount: 5,
    isPrivate: false,
    isFollowing: false,
    role: 'moderator',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  demo_user: {
    id: 'u_5',
    username: 'demo_user',
    displayName: 'Demo Reviewer',
    email: 'reviewer@eval.edu',
    bio: 'Viva Evaluator & Project Tester. Testing real-time feed updates, Redis latency and AI safety.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=400&fit=crop',
    location: 'Campus Hub',
    followersCount: 12,
    followingCount: 3,
    postsCount: 4,
    isPrivate: false,
    role: 'user',
    createdAt: '2026-11-01T10:00:00.000Z',
  }
};

export const mockPosts: Post[] = [
  {
    id: 'p_101',
    author: mockUsers.sarah_tech,
    content: 'Just deployed our Redis fan-out-on-write feed engine! 🚀 Feed retrieval times dropped from 240ms down to 18ms p95. Storing only MongoDB ObjectIDs in Redis Sorted Sets ensures data integrity remains 100% correct. #Redis #DistributedSystems #WebDev',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop'
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    likesCount: 48,
    repostsCount: 12,
    repliesCount: 6,
    isLiked: false,
    isReposted: false,
    isBookmarked: true,
    status: 'APPROVED',
    aiScore: 0.02,
    isPinned: true,
  },
  {
    id: 'p_102',
    author: mockUsers.alex_dev,
    content: 'Quick architecture poll for fellow backend architects: When implementing cursor-based pagination for high-volume social feeds, which strategy do you favor? #Database #SoftwareEngineering',
    images: [],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    likesCount: 34,
    repostsCount: 8,
    repliesCount: 4,
    isLiked: true,
    isReposted: false,
    status: 'APPROVED',
    aiScore: 0.01,
    poll: {
      id: 'poll_1',
      question: 'Which cursor strategy is best for high-volume social feeds?',
      options: [
        { id: 'opt_1', text: 'Timestamp + ObjectId compound cursor', votesCount: 78 },
        { id: 'opt_2', text: 'ULID (Lexicographically sortable IDs)', votesCount: 45 },
        { id: 'opt_3', text: 'Redis ZSet score as epoch timestamp', votesCount: 62 },
        { id: 'opt_4', text: 'Traditional Offset with caching', votesCount: 7 }
      ],
      totalVotes: 192,
      userVotedOptionId: 'opt_1',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    }
  },
  {
    id: 'p_103',
    author: mockUsers.maria_design,
    content: 'Design system preview: We finalized the UI wireframes and token specs for Chirpwell! Notice the typographic apostrophes (’), WCAG 2.1 AA compliant contrast ratios, and clean radial character counter. Thoughts? @sarah_tech @alex_dev #UIUX #DesignSystem',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1581291518655-9523c932deda?w=800&h=500&fit=crop'
    ],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    likesCount: 89,
    repostsCount: 22,
    repliesCount: 9,
    isLiked: true,
    isReposted: true,
    status: 'APPROVED',
    aiScore: 0.01,
  },
  {
    id: 'p_104',
    author: mockUsers.sarah_tech,
    content: 'Reminder: Never use Offset pagination in production live feeds! If 10 posts arrive while a user is on page 1, scrolling to page 2 (OFFSET 20) repeats 10 items. Always use deterministic cursor markers. #SoftwareArchitecture #BestPractices',
    images: [],
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    likesCount: 112,
    repostsCount: 35,
    repliesCount: 11,
    isLiked: false,
    isReposted: false,
    status: 'APPROVED',
    aiScore: 0.03,
  }
];

export const mockReplies: Record<string, Post[]> = {
  p_101: [
    {
      id: 'rep_201',
      author: mockUsers.alex_dev,
      content: 'Fantastic results Sarah! How are you handling cache invalidation when an author deletes or soft-deletes a post that was already pushed to 10k follower Redis lists? @sarah_tech',
      images: [],
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      likesCount: 14,
      repostsCount: 2,
      repliesCount: 1,
      isLiked: true,
      parentId: 'p_101',
      status: 'APPROVED'
    },
    {
      id: 'rep_202',
      author: mockUsers.sarah_tech,
      content: 'Great question @alex_dev! Because Redis stores ONLY the post ObjectId and not the full post document, when the client fetches the feed, the hydration step checks the MongoDB document. If `isDeleted: true` or status is flagged, it is immediately omitted from the hydrated response!',
      images: [],
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      likesCount: 18,
      repostsCount: 1,
      repliesCount: 0,
      isLiked: false,
      parentId: 'p_101',
      status: 'APPROVED'
    }
  ]
};

export const mockTrendingTopics: TrendingTopic[] = [
  { tag: 'Redis', postsCount: 14200, category: 'Database & Infrastructure' },
  { tag: 'TypeScript', postsCount: 9800, category: 'Programming Languages' },
  { tag: 'WebDev', postsCount: 8400, category: 'Tech' },
  { tag: 'DistributedSystems', postsCount: 6100, category: 'Engineering' },
  { tag: 'UIUX', postsCount: 4300, category: 'Design' },
  { tag: 'AIModeration', postsCount: 2900, category: 'Machine Learning' },
  { tag: 'FullStack', postsCount: 2100, category: 'Technology' },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'LIKE',
    actors: [mockUsers.alex_dev, mockUsers.maria_design, mockUsers.demo_user],
    post: mockPosts[0],
    isRead: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    count: 3
  },
  {
    id: 'notif_2',
    type: 'REPLY',
    actors: [mockUsers.alex_dev],
    post: mockPosts[0],
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_3',
    type: 'FOLLOW_REQUEST',
    actors: [mockUsers.alex_dev],
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif_4',
    type: 'MENTION',
    actors: [mockUsers.maria_design],
    post: mockPosts[2],
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  }
];

export const mockFollowRequests: FollowRequest[] = [
  {
    id: 'freq_1',
    requester: mockUsers.alex_dev,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'pending'
  }
];

export const mockModerationQueue: ModerationQueueItem[] = [
  {
    id: 'mod_1',
    post: {
      id: 'p_flag_901',
      author: {
        id: 'u_spammer',
        username: 'suspicious_crypto_bot',
        displayName: 'Quick Cash Crypto Bot',
        email: 'bot@spam.xyz',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop',
        followersCount: 2,
        followingCount: 800,
        postsCount: 120,
        isPrivate: false,
        createdAt: '2026-11-14T00:00:00.000Z'
      },
      content: '🚨 GUARANTEED 500% RETURN TODAY ONLY! Send 0.5 ETH to [suspicious wallet address] to claim your prize! Click here: http://bit.ly/scam-link #Crypto #Giveaway',
      images: [],
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      status: 'FLAGGED',
      aiScore: 0.92,
      aiReason: 'Flagged for High Financial Scam / Phishing probability (confidence 92%).'
    },
    toxicityScore: 0.92,
    reason: 'Cryptocurrency Phishing / Spam violation detected by LLM Safety Model.',
    categories: ['Financial Scam', 'Spam', 'Malicious Link'],
    reportedCount: 4,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: 'FLAGGED'
  },
  {
    id: 'mod_2',
    post: {
      id: 'p_flag_902',
      author: {
        id: 'u_toxic',
        username: 'angry_troll',
        displayName: 'Anonymous Troll',
        email: 'troll@trash.net',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        followersCount: 0,
        followingCount: 50,
        postsCount: 15,
        isPrivate: false,
        createdAt: '2026-11-10T00:00:00.000Z'
      },
      content: 'You developers are completely incompetent and deserve to get fired immediately. Absolute trash product.',
      images: [],
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      status: 'FLAGGED',
      aiScore: 0.78,
      aiReason: 'Detected severe profanity and personal harassment violation.'
    },
    toxicityScore: 0.78,
    reason: 'Harassment & Hostile Language detected.',
    categories: ['Harassment', 'Toxic Language'],
    reportedCount: 2,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    status: 'FLAGGED'
  }
];
