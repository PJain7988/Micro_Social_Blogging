import {
  User,
  Post,
  NotificationItem,
  TrendingTopic,
  ModerationQueueItem,
  FollowRequest,
  PaginatedResult
} from '../types';
import {
  mockUsers,
  mockPosts,
  mockReplies,
  mockTrendingTopics,
  mockNotifications,
  mockFollowRequests,
  mockModerationQueue
} from '../data/mockData';
import { socketService } from './socket';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private token: string | null = null;
  // Local active memory storage for interactive demo session
  private posts: Post[] = [...mockPosts];
  private users: Record<string, User> = { ...mockUsers };
  private replies: Record<string, Post[]> = { ...mockReplies };
  private notifications: NotificationItem[] = [...mockNotifications];
  private followRequests: FollowRequest[] = [...mockFollowRequests];
  private moderationQueue: ModerationQueueItem[] = [...mockModerationQueue];
  private bookmarkedPostIds: Set<string> = new Set(['p_101']);
  private mutedUserIds: Set<string> = new Set();
  private blockedUserIds: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('chirpwell_auth_token');
      if (savedToken) {
        this.token = savedToken;
      }
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('chirpwell_auth_token', token);
    } else {
      localStorage.removeItem('chirpwell_auth_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      // Backend is offline or network error: fallback gracefully to interactive local mock store!
      return this.handleLocalFallback<T>(endpoint, options);
    }
  }

  private handleLocalFallback<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Artificial latency for realism (80ms - 200ms)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const res = this.resolveMockRequest(endpoint, options);
          resolve(res as T);
        } catch (e) {
          reject(e);
        }
      }, 120);
    });
  }

  private resolveMockRequest(endpoint: string, options: RequestInit): any {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : {};

    // 1. Posts & Feed
    if (endpoint.startsWith('/feed/home') || endpoint.startsWith('/feed/following')) {
      return {
        data: this.posts.filter(p => !this.mutedUserIds.has(p.author.id) && !this.blockedUserIds.has(p.author.id)),
        nextCursor: 'cursor_20261114_end',
        hasMore: false,
      };
    }

    if (endpoint === '/posts' && method === 'POST') {
      const currentUser = this.getCurrentMockUser();
      const newPost: Post = {
        id: `p_${Date.now()}`,
        author: currentUser,
        content: body.content,
        images: body.images || [],
        createdAt: new Date().toISOString(),
        likesCount: 0,
        repostsCount: 0,
        repliesCount: 0,
        status: body.content.toLowerCase().includes('scam') || body.content.toLowerCase().includes('hate') ? 'FLAGGED' : 'APPROVED',
        aiScore: body.content.toLowerCase().includes('scam') ? 0.95 : 0.02,
        aiReason: body.content.toLowerCase().includes('scam') ? 'Flagged by AI Safety Model' : undefined,
        poll: body.poll ? {
          id: `poll_${Date.now()}`,
          question: body.poll.question,
          options: body.poll.options.map((opt: string, i: number) => ({ id: `opt_${i}`, text: opt, votesCount: 0 })),
          totalVotes: 0,
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
        } : undefined
      };

      this.posts.unshift(newPost);
      currentUser.postsCount += 1;

      // If flagged, add to moderation queue
      if (newPost.status === 'FLAGGED') {
        this.moderationQueue.unshift({
          id: `mod_${Date.now()}`,
          post: newPost,
          toxicityScore: newPost.aiScore || 0.9,
          reason: 'Automated AI Content Filter Alert',
          categories: ['Safety Violation'],
          reportedCount: 1,
          createdAt: new Date().toISOString(),
          status: 'FLAGGED'
        });
      }

      return newPost;
    }


    // Bookmarks list
    if (endpoint === '/posts/bookmarks') {
      return this.posts.filter(p => this.bookmarkedPostIds.has(p.id));
    }

    // Single post detail
    if (endpoint.startsWith('/posts/') && endpoint !== '/posts/bookmarks' && !endpoint.includes('/like') && !endpoint.includes('/repost') && !endpoint.includes('/replies') && !endpoint.includes('/bookmark') && !endpoint.includes('/poll')) {
      const postId = endpoint.split('/posts/')[1];
      const found = this.posts.find(p => p.id === postId);
      if (found) return found;
      // Also check replies
      for (const replyList of Object.values(this.replies)) {
        const r = replyList.find(item => item.id === postId);
        if (r) return r;
      }
      return this.posts[0];
    }

    // Replies
    if (endpoint.includes('/replies')) {
      const postId = endpoint.split('/posts/')[1].split('/replies')[0];
      if (method === 'GET') {
        return this.replies[postId] || [];
      }
      if (method === 'POST') {
        const currentUser = this.getCurrentMockUser();
        const newReply: Post = {
          id: `rep_${Date.now()}`,
          author: currentUser,
          content: body.content,
          images: body.images || [],
          createdAt: new Date().toISOString(),
          likesCount: 0,
          repostsCount: 0,
          repliesCount: 0,
          parentId: postId,
          status: 'APPROVED',
        };
        if (!this.replies[postId]) {
          this.replies[postId] = [];
        }
        this.replies[postId].unshift(newReply);

        // Increment parent replies count
        const parent = this.posts.find(p => p.id === postId);
        if (parent) {
          parent.repliesCount += 1;
        }

        return newReply;
      }
    }

    // Like / Unlike
    if (endpoint.includes('/like') && method === 'POST') {
      const postId = endpoint.split('/posts/')[1].split('/like')[0];
      const p = this.posts.find(item => item.id === postId);
      if (p) {
        p.isLiked = true;
        p.likesCount += 1;
        socketService.emit('post:counts', { postId: p.id, likesCount: p.likesCount, repostsCount: p.repostsCount });
        return { success: true, likesCount: p.likesCount };
      }
    }

    if (endpoint.includes('/unlike') && method === 'POST') {
      const postId = endpoint.split('/posts/')[1].split('/unlike')[0];
      const p = this.posts.find(item => item.id === postId);
      if (p) {
        p.isLiked = false;
        p.likesCount = Math.max(0, p.likesCount - 1);
        socketService.emit('post:counts', { postId: p.id, likesCount: p.likesCount, repostsCount: p.repostsCount });
        return { success: true, likesCount: p.likesCount };
      }
    }

    // Repost
    if (endpoint.includes('/repost') && method === 'POST') {
      const postId = endpoint.split('/posts/')[1].split('/repost')[0];
      const p = this.posts.find(item => item.id === postId);
      if (p) {
        p.isReposted = true;
        p.repostsCount += 1;
        return { success: true, repostsCount: p.repostsCount };
      }
    }

    if (endpoint.includes('/unrepost') && method === 'POST') {
      const postId = endpoint.split('/posts/')[1].split('/unrepost')[0];
      const p = this.posts.find(item => item.id === postId);
      if (p) {
        p.isReposted = false;
        p.repostsCount = Math.max(0, p.repostsCount - 1);
        return { success: true, repostsCount: p.repostsCount };
      }
    }

    // Bookmark
    if (endpoint.includes('/bookmark') && method === 'POST') {
      const postId = endpoint.split('/posts/')[1].split('/bookmark')[0];
      const p = this.posts.find(item => item.id === postId);
      if (p) {
        p.isBookmarked = !p.isBookmarked;
        if (p.isBookmarked) {
          this.bookmarkedPostIds.add(postId);
        } else {
          this.bookmarkedPostIds.delete(postId);
        }
        return { success: true, isBookmarked: p.isBookmarked };
      }
    }

    // Poll Vote
    if (endpoint.includes('/poll/')) {
      const parts = endpoint.split('/');
      const postId = parts[2];
      const optionId = parts[4];
      const post = this.posts.find(p => p.id === postId);
      if (post && post.poll) {
        post.poll.options.forEach(opt => {
          if (opt.id === optionId) {
            opt.votesCount += 1;
          }
        });
        post.poll.totalVotes += 1;
        post.poll.userVotedOptionId = optionId;
        return post.poll;
      }
    }

    // Users
    if (endpoint.startsWith('/users/')) {
      const username = endpoint.split('/users/')[1].split('/')[0];
      if (this.users[username]) {
        return this.users[username];
      }
      const byId = Object.values(this.users).find(u => u.id === username || u.username === username);
      if (byId) return byId;
      return this.users.sarah_tech;
    }

    // Follow / Unfollow
    if (endpoint.includes('/follow') && method === 'POST') {
      const userId = endpoint.split('/users/')[1].split('/follow')[0];
      const target = Object.values(this.users).find(u => u.id === userId || u.username === userId);
      const currentUser = this.getCurrentMockUser();
      if (target) {
        if (target.isPrivate) {
          target.isPendingRequest = true;
          this.followRequests.push({
            id: `req_${Date.now()}`,
            requester: currentUser,
            createdAt: new Date().toISOString(),
            status: 'pending'
          });
          return { status: 'requested', isPendingRequest: true };
        } else {
          target.isFollowing = true;
          target.followersCount += 1;
          currentUser.followingCount += 1;
          return { status: 'following', isFollowing: true };
        }
      }
    }

    if (endpoint.includes('/unfollow') && method === 'POST') {
      const userId = endpoint.split('/users/')[1].split('/unfollow')[0];
      const target = Object.values(this.users).find(u => u.id === userId || u.username === userId);
      const currentUser = this.getCurrentMockUser();
      if (target) {
        target.isFollowing = false;
        target.isPendingRequest = false;
        target.followersCount = Math.max(0, target.followersCount - 1);
        currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
        return { status: 'unfollowed', isFollowing: false };
      }
    }

    // Follow Requests
    if (endpoint === '/users/requests') {
      return this.followRequests.filter(r => r.status === 'pending');
    }

    if (endpoint.includes('/requests/') && endpoint.includes('/approve')) {
      const reqId = endpoint.split('/requests/')[1].split('/approve')[0];
      const req = this.followRequests.find(r => r.id === reqId);
      if (req) {
        req.status = 'accepted';
        req.requester.isFollowing = true;
        this.getCurrentMockUser().followersCount += 1;
        return { success: true };
      }
    }

    if (endpoint.includes('/requests/') && endpoint.includes('/reject')) {
      const reqId = endpoint.split('/requests/')[1].split('/reject')[0];
      const req = this.followRequests.find(r => r.id === reqId);
      if (req) {
        req.status = 'rejected';
        return { success: true };
      }
    }


    // Trending & Hashtags
    if (endpoint === '/tags/trending') {
      return mockTrendingTopics;
    }

    if (endpoint.startsWith('/tags/')) {
      const tag = endpoint.split('/tags/')[1].toLowerCase();
      return this.posts.filter(p => p.content.toLowerCase().includes(`#${tag}`));
    }

    // Search
    if (endpoint.startsWith('/search')) {
      const url = new URL(`http://dummy${endpoint}`);
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const matchedUsers = Object.values(this.users).filter(
        u => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)
      );
      const matchedPosts = this.posts.filter(
        p => p.content.toLowerCase().includes(q)
      );
      return { users: matchedUsers, posts: matchedPosts };
    }

    // Notifications
    if (endpoint === '/notifications') {
      return this.notifications;
    }

    if (endpoint === '/notifications/read-all') {
      this.notifications.forEach(n => (n.isRead = true));
      return { success: true };
    }

    // Moderation Queue & Report
    if (endpoint === '/moderation/queue') {
      return this.moderationQueue;
    }

    if (endpoint.startsWith('/moderation/queue/') && method === 'POST') {
      const id = endpoint.split('/moderation/queue/')[1];
      const action = body.action; // 'APPROVE' | 'REJECT' | 'DELETE'
      const item = this.moderationQueue.find(m => m.id === id);
      if (item) {
        if (action === 'APPROVE') {
          item.status = 'APPROVED';
          item.post.status = 'APPROVED';
        } else {
          item.status = 'REJECTED';
          item.post.status = 'REJECTED';
          // Remove from posts list
          this.posts = this.posts.filter(p => p.id !== item.post.id);
        }
        return { success: true, item };
      }
    }

    if (endpoint === '/moderation/report' && method === 'POST') {
      this.moderationQueue.push({
        id: `mod_${Date.now()}`,
        post: body.post,
        toxicityScore: 0.85,
        reason: body.reason,
        categories: [body.reason],
        reportedCount: 1,
        createdAt: new Date().toISOString(),
        status: 'FLAGGED'
      });
      return { success: true, message: 'Report submitted successfully' };
    }

    // Default
    return { success: true };
  }

  public getCurrentMockUser(): User {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('chirpwell_current_username') : null;
    return this.users[saved || 'sarah_tech'] || this.users.sarah_tech;
  }

  public switchMockUser(username: string): User {
    if (this.users[username]) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chirpwell_current_username', username);
      }
      return this.users[username];
    }
    return this.users.sarah_tech;
  }

  // High-level API Methods
  public async getFeed(): Promise<PaginatedResult<Post>> {
    return this.request<PaginatedResult<Post>>('/feed/home');
  }

  public async createPost(content: string, images: string[] = [], poll?: { question: string, options: string[] }): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, images, poll }),
    });
  }

  public async getPost(id: string): Promise<Post> {
    return this.request<Post>(`/posts/${id}`);
  }

  public async getReplies(postId: string): Promise<Post[]> {
    return this.request<Post[]>(`/posts/${postId}/replies`);
  }

  public async createReply(postId: string, content: string, images: string[] = []): Promise<Post> {
    return this.request<Post>(`/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content, images }),
    });
  }

  public async toggleLike(postId: string, isCurrentlyLiked: boolean): Promise<{ success: boolean; likesCount: number }> {
    const endpoint = isCurrentlyLiked ? `/posts/${postId}/unlike` : `/posts/${postId}/like`;
    return this.request<{ success: boolean; likesCount: number }>(endpoint, { method: 'POST' });
  }

  public async toggleRepost(postId: string, isCurrentlyReposted: boolean): Promise<{ success: boolean; repostsCount: number }> {
    const endpoint = isCurrentlyReposted ? `/posts/${postId}/unrepost` : `/posts/${postId}/repost`;
    return this.request<{ success: boolean; repostsCount: number }>(endpoint, { method: 'POST' });
  }

  public async toggleBookmark(postId: string): Promise<{ success: boolean; isBookmarked: boolean }> {
    return this.request<{ success: boolean; isBookmarked: boolean }>(`/posts/${postId}/bookmark`, { method: 'POST' });
  }

  public async votePoll(postId: string, optionId: string): Promise<any> {
    return this.request(`/posts/${postId}/poll/${optionId}`, { method: 'POST' });
  }

  public async getUser(username: string): Promise<User> {
    return this.request<User>(`/users/${username}`);
  }

  public async updateProfile(data: Partial<User>): Promise<User> {
    const current = this.getCurrentMockUser();
    Object.assign(current, data);
    return current;
  }

  public async toggleFollow(userId: string, isCurrentlyFollowing: boolean): Promise<any> {
    const endpoint = isCurrentlyFollowing ? `/users/${userId}/unfollow` : `/users/${userId}/follow`;
    return this.request(endpoint, { method: 'POST' });
  }

  public async getTrendingTopics(): Promise<TrendingTopic[]> {
    return this.request<TrendingTopic[]>('/tags/trending');
  }

  public async getPostsByTag(tag: string): Promise<Post[]> {
    return this.request<Post[]>(`/tags/${tag}`);
  }

  public async search(query: string): Promise<{ users: User[]; posts: Post[] }> {
    return this.request<{ users: User[]; posts: Post[] }>(`/search?q=${encodeURIComponent(query)}`);
  }

  public async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  public async markAllNotificationsRead(): Promise<any> {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  public async getBookmarks(): Promise<Post[]> {
    return this.request<Post[]>('/posts/bookmarks');
  }

  public async getFollowRequests(): Promise<FollowRequest[]> {
    return this.request<FollowRequest[]>('/users/requests');
  }

  public async approveFollowRequest(requestId: string): Promise<any> {
    return this.request(`/users/requests/${requestId}/approve`, { method: 'POST' });
  }

  public async rejectFollowRequest(requestId: string): Promise<any> {
    return this.request(`/users/requests/${requestId}/reject`, { method: 'POST' });
  }

  public async getModerationQueue(): Promise<ModerationQueueItem[]> {
    return this.request<ModerationQueueItem[]>('/moderation/queue');
  }

  public async actOnModeration(id: string, action: 'APPROVE' | 'REJECT' | 'DELETE'): Promise<any> {
    return this.request(`/moderation/queue/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  public async reportPost(postId: string, reason: string, note?: string): Promise<any> {
    const post = this.posts.find(p => p.id === postId) || this.posts[0];
    return this.request('/moderation/report', {
      method: 'POST',
      body: JSON.stringify({ post, reason, note }),
    });
  }
}

export const api = new ApiClient();
