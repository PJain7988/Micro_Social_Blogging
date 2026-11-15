export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh',

  // Users & Profiles
  USER_BY_USERNAME: (username: string) => `/users/${username}`,
  USER_UPDATE_PROFILE: '/users/profile',
  USER_FOLLOW: (userId: string) => `/users/${userId}/follow`,
  USER_UNFOLLOW: (userId: string) => `/users/${userId}/unfollow`,
  USER_FOLLOWERS: (username: string) => `/users/${username}/followers`,
  USER_FOLLOWING: (username: string) => `/users/${username}/following`,
  USER_FOLLOW_REQUESTS: '/users/requests',
  USER_APPROVE_REQUEST: (requestId: string) => `/users/requests/${requestId}/approve`,
  USER_REJECT_REQUEST: (requestId: string) => `/users/requests/${requestId}/reject`,
  USER_BLOCK: (userId: string) => `/users/${userId}/block`,
  USER_UNBLOCK: (userId: string) => `/users/${userId}/unblock`,
  USER_MUTE: (userId: string) => `/users/${userId}/mute`,
  USER_UNMUTE: (userId: string) => `/users/${userId}/unmute`,

  // Posts & Threads
  POSTS_CREATE: '/posts',
  POST_BY_ID: (id: string) => `/posts/${id}`,
  POST_DELETE: (id: string) => `/posts/${id}`,
  POST_LIKE: (id: string) => `/posts/${id}/like`,
  POST_UNLIKE: (id: string) => `/posts/${id}/unlike`,
  POST_REPOST: (id: string) => `/posts/${id}/repost`,
  POST_UNREPOST: (id: string) => `/posts/${id}/unrepost`,
  POST_BOOKMARK: (id: string) => `/posts/${id}/bookmark`,
  POST_REPLIES: (id: string) => `/posts/${id}/replies`,
  POST_POLL_VOTE: (postId: string, optionId: string) => `/posts/${postId}/poll/${optionId}`,

  // Feed & Discovery
  FEED_HOME: '/feed/home',
  FEED_FOLLOWING: '/feed/following',
  TAG_POSTS: (tag: string) => `/tags/${tag}`,
  TRENDING_TAGS: '/tags/trending',
  SEARCH: '/search',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',

  // Moderation
  MODERATION_QUEUE: '/moderation/queue',
  MODERATION_ACTION: (id: string) => `/moderation/queue/${id}`,
  REPORT_POST: '/moderation/report',
};
