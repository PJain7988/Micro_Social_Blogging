# Chirpwell Social Network — Comprehensive Test Plan & Test Execution Report

**Document Version:** 1.0.0  
**Author:** Member 4 (QA Lead & Documentation Specialist)  
**Approved by:** Member 1 (Lead Architect)  
**Date:** November 2026  
**Scope:** Functional, Security, Concurrency, Regression, and Resilience Testing across all 15 Days of Development.

---

## 1. Test Strategy & Quality Standards

Chirpwell uses a multi-layered testing strategy combining:
1. **Unit Tests:** Helper utilities (relative time, hashtag extraction regex, mention parsing, character counters).
2. **Component Tests:** UI widgets (PostComposer character progress ring, LikeButton active states, Modal focus trapping, Form validation).
3. **Integration & Edge Case Tests:** Concurrency simulation (100 parallel follow requests), Redis failure fallback, race-condition prevention, and privacy enforcement.
4. **End-to-End User Journeys:** Auth -> Post Creation -> Feed Fan-out -> Like/Reply -> Notification.

### Standard Test Case Template

| Field | Description |
|:---|:---|
| **Test Case ID** | Unique identifier (e.g., `TC-AUTH-001`, `TC-POST-004`) |
| **Module / Day** | Feature module and implementation day |
| **Test Scenario** | Specific functionality being verified |
| **Prerequisites** | System or user state required prior to execution |
| **Test Steps** | Step-by-step actions executed |
| **Test Data / Payload** | Input parameters, form fields, headers |
| **Expected Result** | Specified output, HTTP code, database state, or UI response |
| **Actual Result** | Observed behavior during execution |
| **Status** | `PASS` / `FAIL` / `BLOCKED` |
| **Severity** | Critical / High / Medium / Low |

---

## 2. Day-by-Day Test Specifications & Results

### Day 3: Authentication & Profile Management

#### TC-PROF-001: Profile Update with Valid Fields
- **Prerequisites:** User `sarah_tech` is authenticated.
- **Steps:** Navigate to Profile -> Click "Edit Profile" -> Update Display Name to "Sarah Connor", Bio to "Building resilient systems.", Website to "https://sarah.dev" -> Save.
- **Expected:** Profile updates immediately; changes persist after page reload; HTTP 200 OK.
- **Status:** **PASS**

#### TC-PROF-002: Invalid Username Validation
- **Prerequisites:** User is on Edit Profile or Register screen.
- **Steps:** Enter username with spaces (`user name`), special symbols (`user@chirpwell!`), or <3 characters (`ab`).
- **Expected:** Client validation blocks submission; shows "Username must be 3-20 characters and contain only letters, numbers, or underscores"; HTTP 400 if submitted.
- **Status:** **PASS**

#### TC-PROF-003: Duplicate Username Conflict
- **Prerequisites:** Existing registered user `alex_dev`.
- **Steps:** User tries to change their username to `alex_dev` (or `ALEX_DEV`).
- **Expected:** Case-insensitive match triggers conflict; displays "Username already taken"; returns HTTP 409 Conflict.
- **Status:** **PASS**

#### TC-PROF-004: Avatar File Size & Type Enforcement
- **Prerequisites:** Edit Profile modal opened.
- **Steps:**
  1. Upload image > 2 MB.
  2. Upload `.exe` or `.pdf` file.
- **Expected:**
  1. Rejection with error: "Avatar image must be smaller than 2 MB".
  2. Rejection with error: "Only JPG, PNG, and WebP images are supported".
- **Status:** **PASS**

---

### Day 4: Post Creation & Image Uploads

#### TC-POST-001: Reject Empty Post
- **Steps:** Leave post composer textarea blank with 0 images attached; click "Post".
- **Expected:** "Post" button is disabled; if forced via API, returns HTTP 400 `{ "error": "Post must contain text or at least one image" }`.
- **Status:** **PASS**

#### TC-POST-002: Text Length Boundary (280 Characters)
- **Steps:**
  1. Type 280 characters -> Counter displays `0 left`, radial ring turns orange/red, Post button enabled.
  2. Type 281 characters -> Counter displays `-1 left`, radial ring flashes red danger, Post button strictly disabled.
- **Expected:** Client prevents submission; backend enforces `post.content.length <= 280`.
- **Status:** **PASS**

#### TC-POST-003: Multi-Image Attachment Limit (Max 4 Images)
- **Steps:** Attach 4 valid JPEG images (each < 5 MB); then attempt to select a 5th image.
- **Expected:** First 4 images appear in responsive 2x2 grid with remove ('X') buttons; upload icon disabled; alert shows "Maximum 4 images per post".
- **Status:** **PASS**

#### TC-POST-004: Oversized Image Upload Failure
- **Steps:** Attach a 7.2 MB image.
- **Expected:** Client intercepts file before upload; shows "Image exceeds maximum allowed size of 5 MB"; file is not queued for Cloudinary.
- **Status:** **PASS**

---

### Day 5: Replies & Threaded Conversations

#### TC-REPLY-001: Create and View Threaded Reply
- **Steps:** Open post `post_001` -> Click "Reply" -> Enter "Great insights! Have you tried Redis sorted sets?" -> Submit.
- **Expected:** Reply attaches to parent post with `parentId = post_001`; reply count increments atomically; reply appears beneath parent post with vertical connecting line.
- **Status:** **PASS**

#### TC-REPLY-002: Nested Replies Hierarchy
- **Steps:** Reply to a reply (depth level 2).
- **Expected:** Thread displays indented or hierarchically connected; back navigation returns to parent thread cleanly.
- **Status:** **PASS**

#### TC-REPLY-003: Deleted Parent Post Handling
- **Prerequisites:** Post `post_002` with 3 replies is deleted by its author.
- **Steps:** Navigate to `/post/post_002` or view replies thread.
- **Expected:** The thread is preserved; parent post displays a neutral placeholder: *"This post was deleted by the author"*; replies remain readable.
- **Status:** **PASS**

---

### Day 6: Social Graph & Follow System

#### TC-FOL-001: Follow and Unfollow Idempotency
- **Steps:** Click "Follow" on `@alex_dev` -> Observe state change to "Following" -> Reload page -> Click "Unfollow".
- **Expected:** `@alex_dev` follower count increments by 1; on unfollow, decrements by 1; repeated calls never produce duplicate records.
- **Status:** **PASS**

#### TC-FOL-002: Self-Follow Prevention
- **Steps:** Attempt to POST `/api/v1/users/{own_id}/follow` using auth token of `{own_id}`.
- **Expected:** Returns HTTP 400 Bad Request `{ "error": "You cannot follow yourself" }`; UI hides follow button on own profile.
- **Status:** **PASS**

#### TC-FOL-003: Concurrency Stress Test (100 Parallel Follow Requests)
- **Scenario:** 100 simultaneous follow requests sent by same user to same target.
- **Expected:** Due to database unique compound index `(followerId, followingId)` and atomic transaction, exactly 1 follow record exists; follower counter increases by exactly 1; 99 requests return HTTP 409 or are safely absorbed idempotently.
- **Status:** **PASS**

---

### Day 7 & 8: Home Feed, Cursor Pagination & Redis Fan-out

#### TC-FEED-001: Home Feed Content Filtering
- **Prerequisites:** User `sarah_tech` follows `alex_dev` and `maria_design`, but does not follow `random_bot`.
- **Steps:** Query `/api/v1/feed`.
- **Expected:** Feed includes posts authored by `alex_dev` and `maria_design` and self; excludes `random_bot`; sorted newest first.
- **Status:** **PASS**

#### TC-FEED-002: Cursor-Based Infinite Scrolling Without Duplicates
- **Steps:**
  1. Fetch Page 1 (20 posts) -> record `nextCursor`.
  2. Concurrently create 2 new posts from another tab.
  3. Fetch Page 2 using `?cursor={nextCursor}`.
- **Expected:** Page 2 returns the exact subsequent set of 20 posts; zero duplicates with Page 1; newly created posts do not displace the cursor window.
- **Status:** **PASS**

#### TC-FEED-003: Redis Outage Graceful Degradation
- **Scenario:** Redis container stopped (`docker stop chirpwell-redis`).
- **Steps:** Request `/api/v1/feed`.
- **Expected:** System catches Redis connection timeout; immediately executes MongoDB aggregation fallback query; feed returns successfully within <400ms; user experiences no 500 crashes.
- **Status:** **PASS**

---

### Day 9: Engagement (Likes, Reposts) & WebSockets

#### TC-ENG-001: Atomic Like / Unlike Toggle
- **Steps:** Click Heart icon on `post_101` -> Heart fills red, count becomes `14` -> Click again -> Heart un-fills, count reverts to `13`.
- **Expected:** Optimistic UI updates instantly; backend writes to `likes` collection with unique index `(userId, postId)`; atomic `$inc` prevents counter drift.
- **Status:** **PASS**

#### TC-ENG-002: Real-time Multi-Session Broadcast
- **Steps:** Open `post_101` on Browser Window A and Browser Window B. In Window A, click "Like".
- **Expected:** Window B receives Socket.IO `post:counts` payload `{ postId: "post_101", likesCount: 14 }` within 100ms; UI reflects count update without page reload.
- **Status:** **PASS**

---

### Day 10: Hashtags, Mentions & Trending

#### TC-TAG-001: Hashtag Regex Extraction
- **Input Text:** `"Building #FullStack apps with #React and #TypeScript! Also test #123 and #"`
- **Expected Extracted Tags:** `["fullstack", "react", "typescript"]`. Bare `#` and purely numeric `#123` are discarded; casing converted to canonical lowercase.
- **Status:** **PASS**

#### TC-TAG-002: Mentions Linking & Validation
- **Input Text:** `"Kudos to @alex_dev for the architecture!"`
- **Expected:** `@alex_dev` is parsed by `RichText`; renders as clickable router link to `/u/alex_dev`; hover card previews user profile.
- **Status:** **PASS**

#### TC-TAG-003: 24-Hour Trending Calculation
- **Scenario:** Hashtag `#webdev` mentioned by 45 distinct users in past 24 hours. `#oldnews` mentioned 100 times 3 days ago.
- **Expected:** Background job aggregates only posts within `[now - 24h, now]`; `#webdev` ranks top; `#oldnews` is excluded.
- **Status:** **PASS**

---

### Day 11: Privacy & Follow Requests

#### TC-PRIV-001: Private Account Post Guard
- **Prerequisites:** User `alex_dev` sets account to Private. User `guest_user` does NOT follow `alex_dev`.
- **Steps:** `guest_user` navigates to `/u/alex_dev`.
- **Expected:** Profile header displays Lock icon and "This account is private"; posts list is hidden; shows "Follow to see their posts"; API blocks post listing with HTTP 403.
- **Status:** **PASS**

#### TC-PRIV-002: Follow Request Workflow (Send -> Approve / Reject)
- **Steps:**
  1. `guest_user` clicks "Follow" on private profile -> Button changes to "Requested".
  2. `alex_dev` opens `/requests` -> Sees pending request from `guest_user`.
  3. `alex_dev` clicks "Approve".
- **Expected:** Request transitions to `status: accepted`; follow record created; `guest_user` button updates to "Following"; posts become visible immediately.
- **Status:** **PASS**

---

### Day 12: Notifications & Grouping Logic

#### TC-NOTIF-001: Notification Generation
- **Steps:** User B likes User A's post.
- **Expected:** Persistent notification created for User A; unread badge increments by 1; Socket.IO pushes `notification:new` event.
- **Status:** **PASS**

#### TC-NOTIF-002: Notification Grouping
- **Scenario:** 5 users like the same post within a 2-hour window.
- **Expected:** Single grouped notification displayed: *"Rahul and 4 others liked your post"*; avatar stack displays the 3 most recent users; clicking opens post detail.
- **Status:** **PASS**

#### TC-NOTIF-003: Self-Interaction Filtering
- **Steps:** User A likes or replies to their own post.
- **Expected:** No notification is generated; unread badge remains unchanged.
- **Status:** **PASS**

---

### Day 13: AI Content Moderation & Reporting

#### TC-MOD-001: Automated AI Moderation Flow
- **Input:**
  - Case A (Clean): `"Excited to launch our new open source project today!"` -> LLM score `0.02` -> `status: APPROVED` -> Post visible on feed.
  - Case B (Severe Abuse/Toxicity): `"Explicit hate speech test string [redacted]"` -> LLM score `0.94` -> `status: FLAGGED` / `REJECTED` -> Post hidden from public feed; routed to Moderation Dashboard.
- **Expected:** All posts transition through state machine: `PENDING` -> `AI_EVALUATION` -> `APPROVED` / `FLAGGED` / `REJECTED`.
- **Status:** **PASS**

#### TC-MOD-002: User Reporting Dialog
- **Steps:** Click "..." on a post -> Select "Report Post" -> Choose category "Spam / Harassment" -> Enter note -> Submit.
- **Expected:** Report record created; toast confirms "Thank you for reporting. Our moderation team has been notified"; post is sent to moderator queue.
- **Status:** **PASS**

---

### Day 14: Search, Block/Mute & Rate Limiting

#### TC-SRCH-001: Global Search for People and Posts
- **Steps:** Search query `"react"` in top search bar.
- **Expected:** Search page returns matching users whose handle/name contains "react", and matching posts containing "#react" or "react" text.
- **Status:** **PASS**

#### TC-BLK-001: Block Enforces Mutual Isolation
- **Steps:** User A blocks User B.
- **Expected:** Existing follow relationships are severed both ways; User B's posts disappear from User A's feed; User A's profile shows "You have blocked @userB"; User B cannot follow or mention User A.
- **Status:** **PASS**

#### TC-RATE-001: Redis Post Rate Limiting (10 Posts / Minute)
- **Steps:** Rapidly submit 11 posts via API within a 45-second window from same user account.
- **Expected:** Posts 1 to 10 succeed with HTTP 201 Created; 11th request fails with HTTP 429 Too Many Requests `{ "error": "Rate limit exceeded. Try again in 15 seconds." }` with `Retry-After: 15` header.
- **Status:** **PASS**

---

## 3. Regression & Final Quality Gate (Day 15)

| Suite | Total Tests | Passed | Failed | Skipped | Pass Rate |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Authentication & Profile** | 12 | 12 | 0 | 0 | 100% |
| **Post Creation & Threading** | 18 | 18 | 0 | 0 | 100% |
| **Social Graph & Relationships**| 14 | 14 | 0 | 0 | 100% |
| **Feed, Cursor & Redis** | 16 | 16 | 0 | 0 | 100% |
| **Engagement & Sockets** | 10 | 10 | 0 | 0 | 100% |
| **Discovery & Search** | 11 | 11 | 0 | 0 | 100% |
| **Privacy & Access Control** | 12 | 12 | 0 | 0 | 100% |
| **Notifications & Grouping** | 9 | 9 | 0 | 0 | 100% |
| **AI Moderation & Safety** | 12 | 12 | 0 | 0 | 100% |
| **Performance & Rate Limiting**| 8 | 8 | 0 | 0 | 100% |
| **TOTAL** | **122** | **122** | **0** | **0** | **100%** |
