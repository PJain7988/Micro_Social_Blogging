# Chirpwell Social Network — Comprehensive Viva Questions & Model Answers

**Document Version:** 1.0.0  
**Prepared by:** Member 4 (QA & Academic Documentation Lead)  
**Target Audience:** Evaluators, Professors, and Project Team (Members 1, 2, 3, 4)

---

## 🏛️ Member 1 Viva Questions (Lead Architect & Frontend Integration)

### Q1.1: Why did you choose Fan-Out-On-Write instead of Fan-Out-On-Read for the home feed? What are the trade-offs?
**Answer:**
In micro-social blogging applications, feed reads drastically outnumber post writes (typically a 100:1 read-to-write ratio). 
- **Fan-Out-On-Read** executes a heavy query combining multi-table joins or relational lookups (`SELECT * FROM posts WHERE author_id IN (SELECT following_id FROM follows WHERE follower_id = ?) ORDER BY created_at DESC LIMIT 20`) every single time a user loads or scrolls their feed. As follower counts and database volume scale, query latency degrades into seconds.
- **Fan-Out-On-Write (Chirpwell's approach)** shifts the computational cost to write time. When an author publishes a post, an asynchronous BullMQ worker immediately pushes the new `postId` into the Redis sorted set (`feed:{followerId}`) of each eligible follower. When followers open their feed, reading 20 IDs from Redis takes `<5ms` (using `ZREVRANGEBYSCORE`), followed by a single Mongoose `$in` batch query.
- **Trade-off & Mitigation:** The trade-off is the "Celebrity / High-Follower Problem" (e.g., an account with 500,000 followers requires 500,000 Redis insertions). We solve this by decoupling fan-out from the HTTP request cycle using asynchronous background worker jobs chunked in batches of 1,000, and capping each Redis feed at 800 post IDs.

### Q1.2: Explain Cursor-Based Pagination vs. Offset-Based Pagination. Why is Offset dangerous in a live social feed?
**Answer:**
- **Offset Pagination (`OFFSET 20 LIMIT 20`):** Relies on skipping records. In a live social network where hundreds of new posts are created every minute, if a user views page 1 (items 1–20) and 5 new posts are published before they scroll to page 2 (`OFFSET 20`), the top 5 items from page 1 shift down into page 2. As a result, the user sees duplicate posts. Conversely, if posts are deleted, records are skipped entirely. Furthermore, high offsets (`OFFSET 100000`) cause the database engine to scan and discard 100,000 rows, destroying performance.
- **Cursor Pagination (Chirpwell's approach):** Uses a deterministic reference point (a cursor composed of `(createdAt, id)`). When requesting the next batch, the client sends `?cursor=2026-11-14T10:00:00.000Z_65a4`. The database query is simply `WHERE (createdAt, _id) < (cursorTimestamp, cursorId) ORDER BY createdAt DESC, _id DESC LIMIT 20`. This guarantees constant $O(1)$ query time and mathematically prevents duplicates or skipped posts regardless of concurrent insertions or deletions.

### Q1.3: How does the client handle real-time engagement updates without overwriting local UI state?
**Answer:**
Chirpwell employs **Optimistic UI Updates** paired with authenticated Socket.IO rooms. When a user clicks "Like":
1. The local state immediately increments the count and sets `isLiked = true`, providing 0ms perceived feedback.
2. An asynchronous HTTP POST is dispatched. If the server returns an error (or network drops), the client rolls back the optimistic state and displays a warning toast.
3. Concurrently, the backend emits a Socket.IO event `post:counts` to the room `post:{id}`. Other connected clients listening to this room update their local cache reactively without requiring a page refresh.

---

## ⚙️ Member 2 Viva Questions (Backend, Database & Redis Architecture)

### Q2.1: How do you prevent race conditions and duplicate relationships during concurrent follow or like requests?
**Answer:**
We enforce consistency through a three-tiered defense:
1. **Database-Level Unique Compound Index:** In MongoDB, we enforce `follows.createIndex({ followerId: 1, followingId: 1 }, { unique: true })` and `likes.createIndex({ userId: 1, postId: 1 }, { unique: true })`. Even if 100 concurrent requests bypass the API validation simultaneously, the database engine will only commit the first insert and reject 99 with duplicate key error `E11000`.
2. **Atomic Counter Updates:** Counters (`followersCount`, `followingCount`, `likesCount`) are never updated via read-modify-write patterns (`user.followersCount += 1; user.save()`). Instead, we execute atomic MongoDB `$inc` operations (`User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } })`) within a database transaction or conditional query only if the follow row insertion succeeds.
3. **Application Idempotency:** The service layer catches duplicate errors and treats repeated requests idempotently, returning HTTP 200 or 409 safely without corrupting metrics.

### Q2.2: What happens if Redis crashes or is temporarily unreachable? How is system resilience maintained?
**Answer:**
MongoDB is the sole **Source of Truth**; Redis is strictly an ephemeral speed and caching layer. 
In our feed service, Redis calls are wrapped in defensive `try/catch` blocks with circuit-breaker timeouts. If Redis fails or times out:
1. An alert is logged to error monitoring.
2. The service immediately falls back to a direct MongoDB aggregation pipeline: fetching followed user IDs from the `follows` collection and executing a indexed query against `posts` sorted by `createdAt DESC`.
3. The response is returned to the user with an extra header `X-Feed-Source: mongodb-fallback`. Although latency increases from ~30ms to ~250ms, the user experiences zero service downtime.
4. When Redis recovers, background worker jobs can reconstitute any expired feed list on demand.

### Q2.3: How is the 24-hour trending hashtags calculation implemented efficiently?
**Answer:**
A recurring BullMQ job triggers every 5 minutes with a distributed Redis lock (`SET lock:trending 1 NX EX 60`) to avoid concurrent execution in multi-instance deployments.
- The worker executes an aggregation on posts created between `[Date.now() - 24 hours, Date.now()]`.
- It filters out posts with `status: "FLAGGED"` or posts belonging to private accounts.
- It unwinds the `hashtags` array and groups by `hashtag`, counting the distinct `authorId` values (so that a single spammer posting 1,000 times cannot game the trending board).
- The top 10 ranked tags are written to Redis string key `trending:hashtags` as cached JSON with a 10-minute TTL.
- If a calculation run fails, the previous cached ranking remains valid and served.

---

## 🎨 Member 3 Viva Questions (UI/UX Design, Components & Accessibility)

### Q3.1: How did you design for mobile responsiveness across the 360px to 1440px spectrum?
**Answer:**
We designed a mobile-first, responsive column structure using Tailwind CSS:
- **Mobile (<640px):** The left sidebar and right panel are hidden from the document flow. The primary navigation converts into a sticky, thumb-accessible bottom navigation bar with 5 icons (`Home`, `Explore`, `Notifications`, `Bookmarks`, `Profile`). The post composer is reachable either inline or through a Floating Action Button (FAB).
- **Tablet (641px–1023px):** Left navigation shrinks into a slim 64px icon rail; the main content feed expands up to 720px; the right panel is hidden or slides out as an overlay.
- **Desktop (>=1024px):** A complete 3-column layout is unlocked: Left navigation (260px sticky), center feed (max-width 620px), and right exploration panel (320px) featuring the search bar, 24h trending topics, and suggested connections.

### Q3.2: How does the PostCard render user-generated content safely without risking XSS or broken layout?
**Answer:**
1. **Never use `dangerouslySetInnerHTML`:** We never inject raw HTML.
2. **Custom `RichText` Parser:** User text is split into tokens using a secure regex that identifies `#(\w+)` and `@(\w+)`. Regular text is rendered as escaped React string literals, while hashtags and mentions are wrapped in `<Link>` components pointing to `/tag/:tag` and `/u/:username`.
3. **Word Break & Overflow:** We enforce Tailwind's `break-words` and `overflow-hidden` so that strings without spaces (such as 280 uninterrupted characters or long URLs) do not overflow container boundaries.
4. **Media Constraints:** Images are presented in a CSS grid with `aspect-ratio` bounds and `object-cover` to prevent layout reflows during image loading.

### Q3.3: What accessibility (a11y) standards did you follow?
**Answer:**
We adhered to **WCAG 2.1 AA** standards:
- **Color Contrast:** All text tokens meet minimum 4.5:1 contrast ratios against backgrounds (Ink `#16213A` on Paper `#F2F4F8` achieves `11.8:1`).
- **Focus Indicators:** Interactive elements have high-visibility focus rings (`focus:ring-2 focus:ring-accent`).
- **ARIA Attributes:** Dynamic toggles use `aria-pressed`, modals use `role="dialog"` with `aria-modal="true"` and keyboard `Escape` listeners, and loading states include `aria-busy="true"` and screen-reader accessible text (`sr-only`).
- **Icon Buttons:** Every icon-only button (Like, Repost, Bookmark, Close) includes an explicit `aria-label`.

---

## 🧪 Member 4 Viva Questions (QA, Testing, Validation & Documentation)

### Q4.1: Walk us through your test strategy for testing race conditions and concurrency.
**Answer:**
Concurrency bugs are notoriously common in social applications, particularly around counter integrity. In **Test Case TC-FOL-003**, we simulated high concurrency:
- We authored a stress test script using `Promise.all` that fired 100 simultaneous follow requests from the same user to the same target within 50ms.
- **Validation Criteria:** 
  1. The `follows` collection must contain exactly 1 document.
  2. The target's `followersCount` must equal exactly `initialCount + 1`.
  3. The API must return either HTTP 200 (for the winning call) or HTTP 409 Conflict / idempotent 200 for the subsequent 99 calls, with zero unhandled promise rejections.
- The test confirmed that MongoDB's unique index together with atomic `$inc` updates prevented any race-induced counter drift.

### Q4.2: How did you test and handle rate limiting (HTTP 429)?
**Answer:**
In **Test Case TC-RATE-001**:
- We tested our Redis sliding-window / counter rate limiter configured to 10 post creations per user per minute (`ratelimit:post:{userId}`).
- Using an automated loop, we submitted 11 valid post payloads within 30 seconds.
- Posts 1 through 10 returned HTTP 201 Created.
- The 11th request returned HTTP 429 Too Many Requests with headers `Retry-After: 30` and a clear JSON error body: `{ "error": "Rate limit exceeded. Try again in 30 seconds." }`.
- In the frontend, the UI captures HTTP 429 responses and displays a specialized warning toast with a live countdown timer until the user can post again.

### Q4.3: How did you ensure test coverage for deleted parent posts in threaded discussions?
**Answer:**
In **Test Case TC-REPLY-003**:
- We created a parent post with 3 nested replies. Then, the author deleted the parent post.
- **Soft Delete Pattern:** A naive hard delete would leave orphan reply records or break the thread UI. Our backend implements a soft-delete flag (`isDeleted: true`) which retains the post document ID and thread topology while wiping the post content.
- In the UI, the post renders a neutralized, accessible placeholder: *"This post was deleted by the author"* with disabled like/reply buttons, while maintaining the connecting vertical thread line to the active child replies below.
