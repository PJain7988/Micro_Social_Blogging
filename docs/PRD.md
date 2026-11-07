
# Chripwell — Product Requirements Document (PRD)

**Version:** 2.0  
**Project Type:** Full-Stack Micro-Blogging Social Network  
**Status:** Proposed Product Requirements

---

## 1. Product Overview

ConnectX is a micro-blogging social networking platform where users can share short posts, upload images, connect with other users, and interact through likes, reposts, and replies.

The platform provides a personalized home feed, user profiles, hashtag discovery, notifications, privacy controls, and AI-assisted content moderation.

Its goal is to provide a simple, responsive, and secure social networking experience.

## 2. Problem Statement

Users need a platform where they can:

- Share short updates, images and mini videos (Like X/threads)
- Follow other users and view their posts.
- Discuss posts through replies.
- Discover content through hashtags and search.
- Receive notifications about interactions.
- Control who can view their content.

ConnectX addresses these needs through a centralized social platform with privacy protection and content moderation.

## 3. Product Goals

1. Provide a simple and user-friendly social networking experience.
2. Allow users to create and interact with posts.
3. Deliver a personalized and responsive home feed.
4. Protect private accounts and user data.
5. Support real-time notifications and interaction updates.
6. Use AI to assist content moderation.
7. Keep the application maintainable and ready for future improvements.

## 4. Target Users and Roles

| Role | Responsibilities |
|---|---|
| Guest | View publicly accessible content and access registration/login. |
| Registered User | Create posts, manage profile, follow users, and interact with content. |
| Private Account User | Control profile visibility and approve or reject follow requests. |
| Admin/Moderator | Review flagged posts and take moderation actions. |

A private account is a normal registered account with additional privacy restrictions.

## 5. Core Features

### 5.1 Authentication and User Profile

- Register using email, username, and password.
- Login and logout securely.
- Use JWT-based authentication.
- Store passwords as secure hashes.
- Maintain unique email addresses and usernames.
- View and update profile information.
- Upload and update profile pictures.

### 5.2 Posts and Replies

- Create text-based posts.
- Attach an optional image to a post.
- Edit and delete own posts.
- Support replies and threaded discussions.
- Display like, repost, and reply counts.
- Restrict post editing and deletion to the owner or authorized moderator.

### 5.3 Follow System

- Follow and unfollow public accounts.
- Send follow requests to private accounts.
- Accept or reject follow requests.
- View followers and following lists.
- Prevent duplicate follow relationships and self-following.

### 5.4 Home Feed

- Display posts from the logged-in user and eligible followed accounts.
- Show recent posts first.
- Support pagination.
- Exclude deleted or inaccessible content.
- Respect private accounts, blocks, and mutes.

### 5.5 Likes and Reposts

- Like and unlike posts.
- Repost and remove reposts.
- Prevent duplicate likes and reposts.
- Update interaction counts correctly.
- Prevent unauthorized interactions with private content.

### 5.6 Hashtags and Mentions

- Detect hashtags such as `#technology`.
- Detect user mentions such as `@username`.
- Make hashtags and mentions clickable.
- Display posts associated with a hashtag.

### 5.7 Trending Topics

- Display popular hashtags.
- Calculate trends using recent public posts.
- Refresh trending results periodically.
- Exclude deleted and rejected content.

### 5.8 Notifications

Generate notifications for:

- New followers.
- Likes and reposts.
- Replies and mentions.
- Follow requests and accepted requests.
- Relevant moderation updates.

Users should be able to view notifications and mark them as read.

### 5.9 Privacy and User Safety

- Allow users to make their accounts public or private.
- Support block and unblock.
- Support mute and unmute.
- Restrict private content to approved followers.
- Apply privacy rules on the backend, not only in the frontend.

### 5.10 AI-Assisted Moderation

- Use Google Gemini API to assist in reviewing post content.
- Identify potentially inappropriate or harmful content.
- Send flagged content to the moderation queue.
- Allow admins/moderators to approve or reject flagged posts.
- Handle AI service failures without treating them as proof that content is safe.

AI moderation assists human moderators; it does not replace their judgment.

### 5.11 Search

- Search users by username or display name.
- Search public posts by text or hashtag.
- Respect privacy and blocking rules in search results.

### 5.12 Admin and Moderation

- View flagged posts.
- Review moderation information.
- Approve or reject posts.
- Remove content that violates platform rules.
- Restrict abusive accounts when required.

## 6. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript | User interface |
| Build Tool | Vite | Frontend development and build |
| Styling | Tailwind CSS | Responsive UI |
| Routing | React Router | Frontend navigation |
| API State | TanStack Query | API data fetching and caching |
| Backend | Node.js + TypeScript | Server-side application |
| Framework | Express.js | REST API development |
| ODM | Mongoose | MongoDB interaction and schema management |
| Database | MongoDB | Permanent application data |
| Real-time | Socket.IO | Live notifications and updates |
| Image Storage | Cloudinary | Profile and post images |
| AI Service | Google Gemini API | AI-assisted moderation |
| Background Jobs | BullMQ | Asynchronous task processing |
| Cache/Queue Support | Redis | Temporary data, queues and feed optimization |
| Version Control | Git + GitHub | Source-code management |

**Architecture:** Modular Monolith.

The backend will be organized into separate modules such as authentication, users, posts, feed, follows, notifications, moderation, and search.

MongoDB will be the primary database. Redis will support performance and background processing; it will not replace MongoDB as the permanent data store.

## 7. Important Product Rules

1. Email and username must be unique.
2. Passwords must never be stored in plain text.
3. A user cannot follow themselves.
4. Duplicate follows, likes, and reposts are not allowed.
5. Users can edit or delete only their own posts, unless an authorized moderator acts.
6. Private posts must not be accessible to unapproved users.
7. Deleted or rejected posts must not appear in normal feeds.
8. Block and mute restrictions must be enforced on the server.
9. AI moderation results must not be treated as perfectly accurate.
10. Background service failures must not unnecessarily interrupt normal user actions.

## 8. Non-Functional Requirements

### Performance

- Common user actions should respond quickly.
- Feed loading should use pagination.
- Background tasks should not unnecessarily block API requests.

### Security

- Use secure authentication and authorization.
- Validate incoming API data.
- Protect sensitive routes.
- Keep API keys and secrets in environment variables.
- Apply suitable rate limits.

### Usability

- Provide a clean and responsive interface.
- Support desktop and mobile screens.
- Include loading, empty, success, and error states.
- Provide clear navigation and readable content.

### Maintainability

- Keep frontend and backend code modular.
- Use reusable components and services.
- Maintain consistent API responses and error handling.
- Write tests for important business rules.

## 9. Main Application Pages

1. Landing Page
2. Registration and Login
3. Home Feed
4. Explore and Search
5. Hashtag Results
6. User Profile
7. Post Details and Replies
8. Notifications
9. Follow Requests
10. Privacy and Account Settings
11. Admin Moderation Dashboard

## 10. High-Level User Workflow

1. A user registers or logs in.
2. The user completes their profile.
3. The user discovers and follows other accounts.
4. The user creates a text or image post.
5. The system processes the post and moderation request.
6. Eligible followers can see the post in their feeds.
7. Other users can like, repost, reply, or mention users.
8. The system generates notifications.
9. Users can explore hashtags and search content.
10. Moderators review flagged content when necessary.

## 11. Out of Scope

The following features are not part of the initial project scope:

- Voice and video calls.
- Live video streaming.
- Direct messaging and group chats.
- Payment systems and subscriptions.
- Advertisement management.
- Complex recommendation algorithms.
- Advanced analytics dashboards.
- Multiple images per post.

These features can be considered for future versions.

## 12. Success Criteria

ConnectX will be considered functionally successful when:

- Users can register, log in, and manage their profiles.
- Users can create, edit, delete, and reply to posts.
- Follow and private-account workflows work correctly.
- The home feed displays eligible content.
- Likes and reposts prevent duplicate interactions.
- Hashtags, mentions, and search work as expected.
- Notifications are generated and delivered correctly.
- Privacy, block, and mute rules are enforced.
- Moderators can review flagged content.
- The application works on desktop and mobile screens.

## 13. Future Improvements

Possible future enhancements include:

- Direct messaging.
- Advanced content recommendations.
- Bookmarks and saved posts.
- Polls.
- Multiple image uploads.
- Advanced profile customization.
- Improved content discovery.

---

**Document Note:** This PRD defines the product scope and expected behaviour. Technical implementation details, database collections, API contracts, and development tasks should be documented separately in the SRS, DATABASE_SCHEMA.md, API.md, and project planning documents.
