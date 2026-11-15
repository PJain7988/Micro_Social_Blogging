# Chirpwell Social Network — GitHub Projects Board Structure

**Document Version:** 1.0.0  
**Board Owner:** Member 4 (QA & Project Documentation)  
**Methodology:** Agile / Kanban with 3-Day Sprints  
**GitHub Project View:** `https://github.com/orgs/chirpwell-network/projects/1` (Board & Roadmap views)

---

## 1. Board Columns & Workflow Definitions

| Column Name | Description & Exit Criteria |
|:---|:---|
| 📋 **Product Backlog** | Unscheduled feature ideas, user stories, and technical debt items. |
| 🗓️ **Sprint Ready (To Do)** | Groomed tasks with defined acceptance criteria and assigned member. |
| 🔨 **In Progress** | Work actively being coded on a dedicated `feat/*` or `fix/*` branch. Max WIP: 2 items per member. |
| 🧪 **In Review / QA** | Pull Request opened; passes CI (lint, build, unit tests); Member 4 verifies test cases. |
| ✅ **Done (Delivered)** | PR merged into `main`; verified against PRD acceptance criteria; documentation updated. |

---

## 2. Epics & Milestones Mapping

- **Milestone 1 (Sprint 1 - Days 1 to 3):** Foundation, Authentication, Profile Management.
- **Milestone 2 (Sprint 2 - Days 4 to 6):** Posts, Media Attachments, Threads, Follow System.
- **Milestone 3 (Sprint 3 - Days 7 to 9):** Fast Home Feed, Redis Fan-out, Engagement & WebSockets.
- **Milestone 4 (Sprint 4 - Days 10 to 12):** Discovery, Hashtags, Private Accounts, Grouped Notifications.
- **Milestone 5 (Sprint 5 - Days 13 to 14):** AI Content Moderation, Global Search, Safety & Rate Limits.
- **Milestone 6 (Day 15):** Final Integration, Deployment, Documentation & Viva Presentation.

---

## 3. Sprint Breakdown & Task Cards

### Sprint 1: Days 1–3 (Foundation & Authentication)

```
[#101] Finalize Architecture & Repo Structure
  Assignee: Member 1 | Points: 3 | Label: arch, infra
  Description: Setup frontend/backend structure, docker-compose, tsconfig strict mode.

[#102] Express & MongoDB Setup
  Assignee: Member 2 | Points: 5 | Label: backend, db
  Description: Mongoose connection, initial User, Post, Follow schemas.

[#103] UI Wireframes & Token Specs
  Assignee: Member 3 | Points: 3 | Label: design, ui
  Description: Auth screens, home feed, profile layout wireframes in docs/design.

[#104] QA Test Plan & Project Board
  Assignee: Member 4 | Points: 3 | Label: docs, qa
  Description: Feature checklist, test case template, GitHub board schema.

[#105] React App Shell, Layout & Routing
  Assignee: Member 1 | Points: 5 | Label: frontend, arch
  Description: React Router v6, 3-column layout, API client wrapper with JWT.

[#106] Auth API: JWT, Hash & Sessions
  Assignee: Member 2 | Points: 5 | Label: backend, auth
  Description: Register, login, refresh endpoints; bcrypt password hashing.

[#107] Login & Signup Screens
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: Form inputs, client-side validation, error handling, demo logins.

[#108] Reusable Component Library
  Assignee: Member 4 | Points: 5 | Label: frontend, ui-kit
  Description: Button, Input, Modal, Avatar, Badge, Spinner, Skeleton components.

[#109] Profile Frontend & Auth Integration
  Assignee: Member 1 | Points: 3 | Label: frontend, auth
  Description: AuthContext integration, protected route guards, profile structure.

[#110] Profile CRUD Endpoints & Avatar Upload
  Assignee: Member 2 | Points: 5 | Label: backend, api
  Description: View/update profile, Cloudinary image upload middleware.

[#111] Profile Header, Bio & Counts UI
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: Profile banner, avatar display, follower stats, bio layout.

[#112] Edit Profile Form & Validation Tests
  Assignee: Member 4 | Points: 3 | Label: frontend, qa
  Description: Edit profile modal, username collision test, avatar size checks.
```

### Sprint 2: Days 4–6 (Posts & Social Relationships)

```
[#201] Post Composer Frontend & Submit Hook
  Assignee: Member 1 | Points: 3 | Label: frontend, posts
  Description: Integrate composer with post submission API and optimistic updates.

[#202] Post Creation API & Image Validation
  Assignee: Member 2 | Points: 5 | Label: backend, posts
  Description: POST /posts endpoint, validation (1-280 chars, max 4 images, 5MB).

[#203] Post Card, Composer & Media Preview UI
  Assignee: Member 3 | Points: 5 | Label: frontend, ui
  Description: PostCard component, radial character counter, image grid.

[#204] Post Edge Case Test Suite
  Assignee: Member 4 | Points: 3 | Label: qa, testing
  Description: Empty post, oversized media, 281-char boundary tests.

[#205] Post Detail Page & Thread UI
  Assignee: Member 1 | Points: 5 | Label: frontend, threads
  Description: Route /post/:id, vertical thread connectors, parent post view.

[#206] Reply APIs & Parent Relationship
  Assignee: Member 2 | Points: 5 | Label: backend, threads
  Description: parentId relation, recursive reply retrieval, count increment.

[#207] Reply Composer & Thread View
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: In-line reply composer, "Replying to @user" header.

[#208] Nested Replies & Deleted Post Tests
  Assignee: Member 4 | Points: 3 | Label: qa, testing
  Description: Deleted parent placeholder, nested reply depths.

[#209] Follow Button Integration & Count Sync
  Assignee: Member 1 | Points: 3 | Label: frontend, follows
  Description: Follow/unfollow action handler, optimistic follower count updates.

[#210] Follow APIs & Atomic Counters
  Assignee: Member 2 | Points: 5 | Label: backend, follows
  Description: Unique compound index (followerId, followingId), atomic updates.

[#211] Follower/Following Modal Lists
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: Tabbed followers/following modal with user cards.

[#212] Concurrency Follow Stress Tests
  Assignee: Member 4 | Points: 3 | Label: qa, concurrency
  Description: 100 simultaneous follow requests, duplicate prevention test.
```

### Sprint 3: Days 7–9 (Feed & Engagement)

```
[#301] Home Feed & Infinite Scroll
  Assignee: Member 1 | Points: 5 | Label: frontend, feed
  Description: Cursor-based infinite scrolling, IntersectionObserver hook.

[#302] Feed API for Followed Users
  Assignee: Member 2 | Points: 5 | Label: backend, feed
  Description: GET /feed endpoint, newest-first ordering, cursor pagination.

[#303] Post Card Polish & Feed Skeletons
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: Skeleton loading states, empty feed illustrations, responsive card.

[#304] Feed Cursor & Duplication Tests
  Assignee: Member 4 | Points: 3 | Label: qa, testing
  Description: Pagination cursor stability, duplicate detection on refresh.

[#305] Redis Feed Retrieval Integration
  Assignee: Member 1 | Points: 3 | Label: frontend, feed
  Description: Consuming Redis-accelerated feed, cache headers.

[#306] Fan-out-on-Write Service & Queues
  Assignee: Member 2 | Points: 8 | Label: backend, redis
  Description: BullMQ job pushing post IDs to follower feed:{userId} sorted sets.

[#307] Feed Refresh & Failure State UI
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: "New posts" floating pill, pull to refresh, retry action.

[#308] Redis Failure Fallback Tests
  Assignee: Member 4 | Points: 5 | Label: qa, resilience
  Description: Test feed retrieval when Redis is down; MongoDB fallback verification.

[#309] Engagement Counts & Socket Integration
  Assignee: Member 1 | Points: 5 | Label: frontend, sockets
  Description: Socket.IO listener for live like/repost count updates.

[#310] Like & Repost APIs with Socket Broadcast
  Assignee: Member 2 | Points: 5 | Label: backend, api
  Description: Unique like constraints, atomic counts, Socket room emit.

[#311] Like, Repost, Bookmark Buttons
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: Active toggle states, micro-animations, accessible aria attributes.

[#312] Like/Unlike Concurrency Test Suite
  Assignee: Member 4 | Points: 3 | Label: qa, concurrency
  Description: Rapid double-click likes, repost removal, two-session live sync.
```

### Sprint 4: Days 10–12 (Discovery, Privacy & Notifications)

```
[#401] Hashtag Page & Discovery UI
  Assignee: Member 1 | Points: 3 | Label: frontend, discovery
  Description: /tag/:tag route, matching posts query, discovery header.

[#402] Hashtag/Mention Parser & 24h Trending Job
  Assignee: Member 2 | Points: 5 | Label: backend, worker
  Description: Regex extraction, BullMQ trending job counting unique 24h users.

[#403] RichText Auto-linker & Mentions UI
  Assignee: Member 3 | Points: 5 | Label: frontend, ui
  Description: RichText component parsing #tags and @mentions into router links.

[#404] Hashtag Regex & Trending Job Tests
  Assignee: Member 4 | Points: 3 | Label: qa, testing
  Description: Tag normalization, bare symbol filter, 24h time-window test.

[#405] Privacy Settings & Follow Requests UI
  Assignee: Member 1 | Points: 3 | Label: frontend, privacy
  Description: Privacy toggle, pending requests manager screen.

[#406] Private Account APIs & Permissions Guard
  Assignee: Member 2 | Points: 5 | Label: backend, privacy
  Description: Privacy flag, follow request model, approval authorization.

[#407] Private Profile Lock State & UI
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: Padlock badge, hidden post list placeholder, "Requested" button.

[#408] Public/Private Access Control Tests
  Assignee: Member 4 | Points: 3 | Label: qa, security
  Description: Non-followers blocked from private feed, request cancellation test.

[#409] Notification Badges & Polling/Sockets
  Assignee: Member 1 | Points: 3 | Label: frontend, notifs
  Description: Real-time badge counter on sidebar, mark-all-as-read trigger.

[#410] Grouped Notification Backend Service
  Assignee: Member 2 | Points: 5 | Label: backend, notifs
  Description: Persistent records, grouping logic ("X and 4 others liked...").

[#411] Notification Page & Grouped Cards
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: Notification cards, avatar stacks, unread visual indicator.

[#412] Notification Grouping & Delivery Tests
  Assignee: Member 4 | Points: 3 | Label: qa, testing
  Description: Verify like aggregation, self-interaction suppression, offline cache.
```

### Sprint 5: Days 13–15 (Moderation, Safety, Polish & Viva)

```
[#501] Moderation Flow Integration & Admin Dashboard
  Assignee: Member 1 | Points: 5 | Label: frontend, moderation
  Description: /moderation route, approve/flag/delete controls for moderators.

[#502] LLM AI Moderation Worker & Report APIs
  Assignee: Member 2 | Points: 8 | Label: backend, ai
  Description: Gemini LLM prompt, toxicity score calculation, report queue.

[#503] Content Warning & Report Modal UI
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: Sensitive content blur banner, report post multi-choice modal.

[#504] AI Moderation Abuse Test Suite
  Assignee: Member 4 | Points: 3 | Label: qa, security
  Description: Testing hate speech, spam strings, LLM timeout retry resilience.

[#505] Global Search, Bookmarks & Polls
  Assignee: Member 1 | Points: 5 | Label: frontend, features
  Description: Unified search, bookmarks management, interactive poll voting.

[#506] Search API, Block/Mute & Rate Limiter
  Assignee: Member 2 | Points: 5 | Label: backend, api
  Description: User/post search endpoints, block/mute filters, Redis 10/min rate limiter.

[#507] Explore Page, Saved Posts & Poll UI
  Assignee: Member 3 | Points: 5 | Label: frontend, ui
  Description: Trending hashtags grid, Saved Posts layout, poll card component.

[#508] Search, Block & Rate Limit Tests
  Assignee: Member 4 | Points: 3 | Label: qa, security
  Description: HTTP 429 verification, mutual block isolation, poll vote tally.

[#509] Final Integration, Bug Fixes & Live Demo
  Assignee: Member 1 | Points: 5 | Label: integration, release
  Description: End-to-end user journeys, seed mock data, Docker compose testing.

[#510] Production Environment & Performance Verification
  Assignee: Member 2 | Points: 5 | Label: devops, perf
  Description: DB indexes check, Redis memory tuning, production logging.

[#511] Responsive UI Audit & Visual Polish
  Assignee: Member 3 | Points: 3 | Label: frontend, ui
  Description: 360px mobile audit, cross-browser styling, WCAG contrast.

[#512] Regression Report, Final Docs, Presentation & Viva Guide
  Assignee: Member 4 | Points: 5 | Label: docs, viva
  Description: 122 test cases report, slide deck script, viva Q&A document.
```

---

## 4. Labels & Tagging Taxonomy

- `arch`: System architecture, contracts, standards
- `frontend`: React, Vite, Tailwind, components, pages
- `backend`: Express, Mongoose, Node.js, endpoints
- `db`: MongoDB schema, indexes, migrations
- `redis`: Fan-out, caching, queues, rate limiting
- `ui`: Presentation, layout, responsive design, animations
- `qa`: Test cases, automation, regression, validation
- `security`: Authentication, authorization, privacy, moderation
- `docs`: README, architecture, API reference, viva
