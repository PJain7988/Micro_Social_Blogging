# Chirpwell — Capstone Presentation Slide Deck & Script

**Project Title:** Chirpwell: High-Performance Micro-Social Blogging Platform  
**Team Members:** Member 1 (Lead Architect), Member 2 (Backend & Database Engineer), Member 3 (UI/UX & Frontend Engineer), Member 4 (QA, Documentation & Component Specialist)  
**Evaluation:** Final Project Presentation & Viva Defense

---

## Slide 1: Title & Team Introduction

- **Title:** Chirpwell — Scalable Micro-Social Blogging Architecture
- **Subtitle:** Engineering a Fast, Resilient, and Safe Social Network with Fan-Out-On-Write & AI Moderation
- **Speakers:** Team Chirpwell (Members 1, 2, 3, 4)
- **Speaker Notes:**
  > *"Good morning evaluators. Today we are excited to present Chirpwell, an end-to-end full-stack micro-blogging social network designed to deliver sub-50ms feed retrieval, real-time interactions, and automated safety at scale. Over the next 15 minutes, we will walk you through the system architecture, engineering challenges, and a live demonstration."*

---

## Slide 2: Problem Statement & Motivation

- **Core Challenges in Modern Social Networks:**
  1. **Feed Latency at Scale:** Traditional relational joins on high-volume follower graphs degrade exponentially as follower counts climb.
  2. **Data Consistency under Concurrency:** Race conditions during rapid follow/unfollow and like bursts cause counter desynchronization.
  3. **Content Safety Bottlenecks:** Manual moderation cannot scale with user generation speed, while synchronous AI checks introduce intolerable posting latency.
  4. **Privacy Invariants:** Complex social graphs (private accounts, blocks, mutes) often leak data through caching layers.
- **Chirpwell Solution:** Hybrid data architecture decoupling fast reads (Redis) from durable truth (MongoDB), with asynchronous background processing (BullMQ) and non-blocking AI evaluation.

---

## Slide 3: High-Level System Architecture

- **Visual Architecture:**
  - **Client:** React 18 + TypeScript + Vite + Tailwind CSS (Responsive 360px – 1440px)
  - **API Gateway & REST API:** Express.js + Zod Validation Layer + JWT Auth
  - **Real-Time Layer:** Socket.IO with authenticated user and post rooms
  - **Data Tier:** MongoDB (Source of Truth) + Redis 7 (Speed Layer & Pub/Sub)
  - **Asynchronous Workers:** BullMQ processing fan-out distribution, trending ranking, and AI toxicity moderation
  - **AI Engine:** Google Gemini LLM API with structured JSON output classification

---

## Slide 4: Data Modeling & Schema Design

- **MongoDB Document-Referenced Strategy:**
  - `User`: Identity, password hash, bio, avatar, counters, privacy flags (`isPrivate`)
  - `Post`: Content (1-280 chars), images (up to 4), `parentId` for threaded discussions, engagement counters, moderation state
  - `Follow`: Compound unique index `(followerId, followingId)`, status (`accepted` vs `pending`)
  - `Like` / `Repost`: Atomic tracking with unique index preventing double-voting
  - `Notification`: Grouped activity documents with actor lists
- **Why MongoDB over Pure Relational?**
  - Flexible document model for polymorphic posts (plain text, multi-image, polls, replies).
  - Native atomic updates (`$inc`, `$addToSet`) to eliminate race conditions without heavyweight distributed table locks.

---

## Slide 5: The Feed Pipeline — Fan-Out-On-Write Optimization

- **How Fan-Out-On-Write Works in Chirpwell:**
  1. Author submits post via `POST /api/v1/posts`.
  2. Post is persisted to MongoDB with status `PENDING`.
  3. Backend immediately enqueues a `fanout` background job and replies HTTP 201 (<150ms).
  4. BullMQ worker batches follower IDs (1000 per chunk) and pushes `postId` into Redis Sorted Sets: `feed:{followerId}` scored by timestamp.
  5. Redis sets are trimmed to the newest 800 entries to prevent memory unbounded growth.
- **Hydration at Read Time:**
  - When follower opens the app, API fetches 20 IDs from Redis, executes single `$in` MongoDB query, applies real-time block/mute/privacy filter, and returns complete post cards.
- **Fail-Safe Fallback:** If Redis is down, system transparently switches to database aggregation queries without throwing 500 errors.

---

## Slide 6: Real-Time Engagement & Socket.IO Architecture

- **Event-Driven Interactions:**
  - **Room Strategy:**
    - `user:{userId}`: Delivers private notifications and follow request approvals.
    - `post:{postId}`: Broadcasts real-time like and repost counter changes to all active viewers.
- **Optimistic UI with Reconnection Resilience:**
  - Client increments counter immediately for 0ms visual latency.
  - Sockets synchronize background clients.
  - On socket disconnect/reconnect, the client revalidates counts via lightweight REST envelope.

---

## Slide 7: AI Content Moderation & Safety Pipeline

- **Automated Two-Stage Pipeline:**
  - `PENDING` -> Asynchronous LLM evaluation via BullMQ worker.
  - Structured Prompt requesting JSON output: `{ "toxicity": float, "categories": string[], "reason": string }`.
  - **Threshold Rules:**
    - Toxicity < 0.25 -> `APPROVED` (automatically enters fan-out distribution).
    - 0.25 <= Toxicity <= 0.70 -> `FLAGGED` (hidden from discovery, routed to Moderator Queue).
    - Toxicity > 0.70 -> `REJECTED` (blocked from public view; author alerted).
- **Graceful Failure:** If LLM service times out, post is held in retry queue with exponential backoff rather than failing silently.

---

## Slide 8: Privacy Controls, Blocks & Mutes

- **Multi-Layered Privacy Guard:**
  - **Public vs. Private:** Private accounts enforce a `FollowRequest` approval workflow. Unapproved users receive HTTP 403 and UI lock state.
  - **Blocking:** Mutual isolation. Existing follows destroyed, profiles invisible, notifications suppressed.
  - **Muting:** Client-side & feed filtering hiding muted users without alerting the target.

---

## Slide 9: Frontend Architecture & UI Component Design

- **Modular React 18 Component Hierarchy:**
  - `AppLayout`: Responsive 3-column architecture (Sidebar, Main Feed, Right Panel) collapsing seamlessly to mobile bottom bar.
  - `PostComposer`: Radial SVG progress ring for 280-char limit, image preview matrix, poll builder.
  - `PostCard`: Thread connectors, rich text parser auto-linking `#hashtags` and `@mentions`, interactive action buttons.
  - `AuthContext`: Centralized session state management with automatic token refresh.

---

## Slide 10: Quality Assurance & Testing Rigor

- **122 Test Cases Executed Across All 5 Phases:**
  - **Boundary Tests:** 280-character limit, empty posts, 5MB image limit.
  - **Concurrency Tests:** 100 parallel follow requests tested with zero duplicate records or counter drift.
  - **Resilience Tests:** Redis kill test validating seamless MongoDB fallback.
  - **Security Tests:** Private account leak prevention, rate limiting (HTTP 429 after 10 posts/min).

---

## Slide 11: Live Demonstration Walkthrough

- **Demonstration Scenarios:**
  1. User Registration & Instant Profile Setup with Avatar upload.
  2. Creating a Post with Images and interactive Poll.
  3. Real-time Likes and Reposts across two browser sessions.
  4. Testing Private Account follow request and approval workflow.
  5. Hashtag discovery and trending topic aggregation.
  6. Submitting toxic post and verifying automated AI flag in Moderator Dashboard.

---

## Slide 12: Production Deployment & Docker Topology

- **Containerized Orchestration (`docker-compose.yml`):**
  - Container 1: `chirpwell-frontend` (Vite static build served via Nginx/Node)
  - Container 2: `chirpwell-backend` (Node.js/Express API & Sockets)
  - Container 3: `chirpwell-mongodb` (Persistent volume storage & healthcheck)
  - Container 4: `chirpwell-redis` (LRU memory eviction policy & healthcheck)
- **Production Readiness:** Configured environment variables, CORS policies, helmet security headers, and compression.

---

## Slide 13: Team Responsibilities & Contribution Breakdown

- **Member 1 (You):** System Architecture, Frontend App Shell, Routing, Feed Integration, Sockets, and Capstone Assembly.
- **Member 2:** Express & TypeScript Backend, MongoDB Schemas, Redis Fan-out Worker, and LLM Moderation Service.
- **Member 3:** UI/UX Design System, Wireframes, Responsive Layouts, Post Cards, and Navigation UI.
- **Member 4:** QA Test Suite (122 Test Cases), Component Library (Buttons, Modals, Inputs), Documentation, and Viva Defense.

---

## Slide 14: Future Roadmap & Extensibility

- **Phase 6 Scope:**
  - Direct End-to-End Encrypted Messaging (WebRTC / Matrix).
  - Audio Spaces / Live Audio Rooms.
  - Video Transcoding & HLS Streaming pipeline.
  - Federated ActivityPub protocol support.

---

## Slide 15: Conclusion & Q&A

- **Summary:** Chirpwell proves that modern social networks can combine high-performance caching (sub-50ms feeds) with uncompromised data integrity, rigorous privacy controls, and automated AI safety.
- **Thank you! We invite your questions.**
