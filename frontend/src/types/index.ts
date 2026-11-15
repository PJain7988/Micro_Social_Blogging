export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isPrivate: boolean;
  isFollowing?: boolean;
  isPendingRequest?: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
  role?: 'user' | 'moderator' | 'admin';
  isVerified?: boolean;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  expiresAt: string;
}

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED';

export interface Post {
  id: string;
  author: User;
  content: string;
  images: string[];
  createdAt: string;
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  parentId?: string;
  parentPost?: Post | null;
  poll?: Poll;
  status: ModerationStatus;
  aiScore?: number;
  aiReason?: string;
  isPinned?: boolean;
}

export type NotificationType = 'LIKE' | 'REPOST' | 'REPLY' | 'FOLLOW' | 'FOLLOW_REQUEST' | 'MENTION';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actors: User[];
  post?: Post;
  isRead: boolean;
  createdAt: string;
  count?: number;
}

export interface FollowRequest {
  id: string;
  requester: User;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ModerationQueueItem {
  id: string;
  post: Post;
  toxicityScore: number;
  reason: string;
  categories: string[];
  reportedCount: number;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED';
}

export interface TrendingTopic {
  tag: string;
  postsCount: number;
  category: string;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
