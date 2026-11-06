
# ConnectX API Reference

**Version:** 1.0  
**Status:** Proposed API Contract  
**Base URL:** `/api/v1`

> This document defines the REST API contract for ConnectX. These endpoints represent the planned backend functionality and should not be considered implemented until verified.

---

## 1. API Conventions

- RESTful API architecture.
- JSON for request and response bodies.
- `multipart/form-data` for image uploads.
- Protected endpoints require JWT authentication.
- All timestamps use ISO 8601 UTC format.
- All list endpoints use cursor-based pagination.
- Server-side validation and authorization are mandatory.

### Authentication Header

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "resource_id"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "nextCursor": "cursor_value",
    "hasMore": true
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": []
  }
}
```

---

## 2. HTTP Status Codes

| Status | Error Code | Description |
|---|---|---|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | Authentication required |
| 401 | TOKEN_EXPIRED | Access token expired |
| 403 | FORBIDDEN | Access denied |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate or conflicting operation |
| 413 | FILE_TOO_LARGE | Uploaded file exceeds limit |
| 415 | UNSUPPORTED_MEDIA | Unsupported file format |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Internal server error |
| 502 | UPSTREAM_ERROR | External service error |

---

## 3. Pagination

All list endpoints support cursor-based pagination.

| Parameter | Default | Maximum |
|---|---:|---:|
| cursor | null | — |
| limit | 20 | 50 |

Example:

```http
GET /api/v1/feed?limit=20&cursor=next_cursor
```

Response metadata:

```json
{
  "nextCursor": "next_cursor",
  "hasMore": true
}
```

---

## 4. Authentication APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Authenticate user |
| POST | `/auth/refresh` | Refresh Cookie | Generate a new access token |
| POST | `/auth/logout` | Protected | Logout and revoke refresh token |
| GET | `/auth/me` | Protected | Get authenticated user details |

### Register Request

```json
{
  "email": "user@example.com",
  "username": "akash",
  "password": "Passw0rd1",
  "displayName": "Akash"
}
```

### Login Request

```json
{
  "email": "user@example.com",
  "password": "Passw0rd1"
}
```

### Authentication Rules

- Username: 3–20 characters.
- Username supports letters, numbers and underscores.
- Email and username must be unique.
- Password: minimum 8 characters, including a letter and number.
- Passwords must be hashed using bcrypt.
- Access token validity: 15 minutes.
- Refresh token validity: 7 days.
- Refresh tokens must be rotated and revoked securely.

---

## 5. User and Profile APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/:username` | Optional | View user profile |
| GET | `/users/:id/followers` | Optional | Get followers |
| GET | `/users/:id/following` | Optional | Get following list |
| GET | `/users/:id/posts?tab=posts` | Optional | Get user posts |
| GET | `/users/:id/posts?tab=replies` | Optional | Get user replies |
| GET | `/users/:id/posts?tab=reposts` | Optional | Get user reposts |
| PATCH | `/profile` | Protected | Update own profile |
| PUT | `/profile/avatar` | Protected | Upload profile avatar |
| DELETE | `/profile/avatar` | Protected | Remove profile avatar |

### Update Profile Request

```json
{
  "displayName": "Akash Paira",
  "bio": "Full Stack Developer",
  "isPrivate": true,
  "username": "akash_paira"
}
```

### Profile Rules

- Display name: maximum 50 characters.
- Bio: maximum 160 characters.
- Avatar formats: JPEG, PNG, WebP.
- Avatar size: maximum 2 MB.
- Username must remain unique.

---

## 6. Posts and Replies APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/posts` | Protected | Create a post |
| GET | `/posts/:id` | Optional | Get post details |
| PATCH | `/posts/:id` | Author | Edit own post |
| DELETE | `/posts/:id` | Author/Admin | Delete post |
| POST | `/posts/:id/replies` | Protected | Create a reply |
| GET | `/posts/:id/replies` | Optional | Get post replies |

### Create Post

Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| content | String | Conditional | Post text, maximum 280 characters |
| image | File | No | Optional post image |

A post must contain either text or an image.

### Post Rules

- Maximum one image per post.
- Supported formats: JPEG, PNG, WebP.
- Maximum image size: 5 MB.
- Server must validate file type, size and signature.
- Images are uploaded to Cloudinary.
- Editing a post triggers hashtag, mention and moderation processing.
- Deletion uses soft delete.
- Replies maintain `parentPostId` and `rootPostId`.

---

## 7. Follow and Feed APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/users/:id/follow` | Protected | Follow or request to follow |
| DELETE | `/users/:id/follow` | Protected | Unfollow user |
| DELETE | `/users/:id/follow-request` | Protected | Cancel follow request |
| GET | `/follow-requests` | Protected | Get incoming requests |
| POST | `/follow-requests/:userId/accept` | Protected | Accept follow request |
| POST | `/follow-requests/:userId/reject` | Protected | Reject follow request |
| GET | `/feed` | Protected | Get personalized home feed |

### Follow Response

Public account:

```json
{
  "success": true,
  "data": {
    "status": "FOLLOWING"
  }
}
```

Private account:

```json
{
  "success": true,
  "data": {
    "status": "REQUESTED"
  }
}
```

### Feed Rules

- Show posts from followed users and the authenticated user.
- Sort posts by newest first.
- Support cursor-based pagination.
- Exclude deleted, rejected, flagged, blocked and muted content.
- Replies do not appear in the home feed.

---

## 8. Likes, Reposts and Hashtags APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| PUT | `/posts/:id/like` | Protected | Like a post |
| DELETE | `/posts/:id/like` | Protected | Unlike a post |
| PUT | `/posts/:id/repost` | Protected | Repost a post |
| DELETE | `/posts/:id/repost` | Protected | Remove repost |
| GET | `/hashtags/trending` | Optional | Get trending hashtags |
| GET | `/hashtags/:tag/posts` | Optional | Get hashtag posts |

### Like Response

```json
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 12
  }
}
```

### Repost Response

```json
{
  "success": true,
  "data": {
    "reposted": true,
    "repostCount": 5
  }
}
```

### Hashtag Rules

- Hashtags start with `#`.
- Hashtags are stored in lowercase.
- Trending section shows the top 10 hashtags.
- Trending data is based on public posts from the last 24 hours.
- Trending data refreshes every 5 minutes.

---

## 9. Notification APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Protected | Get notifications |
| GET | `/notifications/unread-count` | Protected | Get unread count |
| POST | `/notifications/read` | Protected | Mark notifications as read |

### Notification Query Parameters

```http
GET /notifications?cursor=value&limit=20&unreadOnly=true
```

### Mark Notifications as Read

```json
{
  "groupKeys": ["LIKE:post_id"]
}
```

Alternatively, mark all notifications as read:

```json
{
  "all": true
}
```

### Supported Notification Types

- LIKE
- REPOST
- REPLY
- MENTION
- FOLLOW
- FOLLOW_REQUEST
- REQUEST_ACCEPTED
- MODERATION

Similar notifications can be grouped into a single notification.

---

## 10. Search, Block and Mute APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/search/users?q=akash` | Optional | Search users |
| GET | `/search/posts?q=react` | Optional | Search posts |
| PUT | `/users/:id/block` | Protected | Block a user |
| DELETE | `/users/:id/block` | Protected | Unblock a user |
| PUT | `/users/:id/mute` | Protected | Mute a user |
| DELETE | `/users/:id/mute` | Protected | Unmute a user |
| GET | `/blocks` | Protected | Get blocked users |
| GET | `/mutes` | Protected | Get muted users |

### Search Rules

- User search requires at least 2 characters.
- Search results must respect privacy settings.
- Blocked and unauthorized private content must not appear.

### Block and Mute Rules

- Blocking removes follow relationships in both directions.
- Blocking hides interactions between the two users.
- Muting hides the muted user's posts and notifications from the muting user.
- Users can unblock and unmute at any time.

---

## 11. Admin Moderation APIs

All endpoints require an authenticated user with the `ADMIN` role.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/moderation/queue` | Admin | Get moderation queue |
| GET | `/admin/moderation/stats` | Admin | Get moderation statistics |
| POST | `/admin/moderation/:recordId/approve` | Admin | Approve a post |
| POST | `/admin/moderation/:recordId/reject` | Admin | Reject a post |
| POST | `/admin/moderation/posts/:postId/recheck` | Admin | Re-run AI moderation |

### Moderation Decision Request

```json
{
  "note": "Reviewed and approved"
}
```

### Moderation Rules

- New and edited posts are checked asynchronously using Gemini AI.
- Flagged content remains hidden until admin review.
- Admin can approve or reject flagged content.
- AI service failure must not block post creation.
- Already reviewed moderation records cannot be reviewed again.

---

## 12. Real-Time Communication

ConnectX uses Socket.IO for live updates.

### Events

| Event | Direction | Description |
|---|---|---|
| `post:counts` | Server → Client | Updated like, repost and reply counts |
| `notification:new` | Server → Client | New notification |

### Room Structure

| Room | Purpose |
|---|---|
| `post:{id}` | Live post updates |
| `user:{id}` | Personal notifications |

### Rules

- Socket connections require JWT authentication.
- Users can only join authorized rooms.
- Private content must never be exposed through unauthorized subscriptions.
- Clients should refetch data after reconnecting.

---

## 13. API Rate Limits

| Operation | Limit |
|---|---|
| General API requests | 100 requests/minute |
| Login attempts | 5 attempts/15 minutes |
| Post creation | 30 posts/hour |
| Image uploads | 20 uploads/hour |

When the limit is exceeded:

- Return HTTP `429`.
- Error code: `RATE_LIMITED`.
- Include the `Retry-After` response header.

---

## 14. Security Requirements

1. Passwords must be hashed using bcrypt.
2. Access tokens must have a short expiration time.
3. Refresh tokens must be stored securely in HTTP-only cookies.
4. Refresh tokens must be rotated and revoked on logout.
5. Validate all request bodies, query parameters and path parameters.
6. Validate uploaded files on the server.
7. Enforce role-based authorization for admin APIs.
8. Enforce resource ownership for edit and delete operations.
9. Apply privacy and block rules to every relevant read endpoint.
10. Never expose passwords, secrets or tokens in API responses or logs.
11. Use secure HTTP headers and CORS configuration.
12. AI moderation must run asynchronously.

---

## 15. Important Implementation Notes

- This document describes the proposed API contract, not completed backend implementation.
- All endpoints must follow the common response and error formats.
- Authorization and privacy checks must be handled at the business-logic/service layer.
- Database transactions must protect operations that update relationships and counters.
- Redis is used for caching, feed optimization, rate limiting and background jobs.
- PostgreSQL is the source of truth in the current SRS architecture.
- Changes to endpoint behavior should be reflected in this document and the SRS.

---

**End of API Reference**
