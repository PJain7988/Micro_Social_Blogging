# Chirpwell — UI/UX Design System & Wireframe Specifications

**Document Version:** 1.0.0  
**Lead Designer & Frontend UI Engineer:** Member 3  
**Status:** Approved & Implemented  
**Target Breakpoints:** Mobile (360px – 640px), Tablet (641px – 1023px), Desktop (1024px – 1440px+)

---

## 1. Visual Design Tokens & Guidelines

Chirpwell uses a refined, modern editorial aesthetic inspired by modern micro-blogging platforms with high contrast and legible typography.

| Token Name | Value | Usage |
|:---|:---|:---|
| `--color-paper` | `#F2F4F8` | Page background, canvas wash |
| `--color-surface` | `#FFFFFF` | Card surfaces, modals, popovers |
| `--color-ink` | `#16213A` | Primary typography, headers |
| `--color-mute` | `#66708A` | Secondary text, timestamps, icons |
| `--color-line` | `#DDE2EC` | Dividers, borders, subtle lines |
| `--color-accent` | `#2B4BFF` | Primary CTA, active nav, links |
| `--color-accent-soft` | `#E6EAFF` | Active pill background, unread states |
| `--color-danger` | `#C8344B` | Errors, delete actions, liked heart |
| `--color-success` | `#10B981` | Repost state, approved badge, success toast |

**Typography:** System Sans / Inter / Instrument Sans.  
**Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px.  
**Border Radius:** UI inputs `8px`, cards `12px`, avatars `9999px` (full circle), pills `9999px`.

---

## 2. Global Layout Hierarchy

```
+---------------------------------------------------------------------------------------+
|  DESKTOP VIEW (>= 1024px)                                                             |
+----------------------+----------------------------------------+-----------------------+
|  LEFT SIDEBAR        |  CENTER MAIN FEED / VIEW               |  RIGHT PANEL          |
|  (Width: ~260px)     |  (Max-width: 620px, Centered)          |  (Width: ~320px)      |
|                      |                                        |                       |
|  [Logo: Chirpwell]       |  [ Sticky Page Header / Tabs ]         |  [ Search Bar       ] |
|                      |  ------------------------------------  |                       |
|  [*] Home            |  [ Post Composer Component ]           |  [ Trending Topics  ] |
|  [*] Explore         |    (Avatar + Textarea + 4 Media + Ring)|    #FullStack (14k)   |
|  [*] Notifications(3)|  ------------------------------------  |    #React19   (9.8k)  |
|  [*] Bookmarks       |  [ Feed Post Cards Stream ]            |    #TypeScript(8.2k)  |
|  [*] Requests (1)    |    - Card 1: Avatar, Name, Handle, Time|  -------------------- |
|  [*] Profile         |      Body Text (links #tags & @users)  |  [ Who to Follow    ] |
|  [*] Moderation (Ad) |      Image Grid (1-4 images) / Poll    |    @alex_dev [Follow] |
|  [*] Settings        |      Action Row: [💬][🔄][❤️][🔖][↗️]   |    @maria_ui [Follow] |
|                      |  ------------------------------------  |                       |
|  [+ New Post Button] |  [ Infinite Scroll Sentinel / Loader ] |                       |
|  ------------------  |                                        |                       |
|  [ User Avatar Box ] |                                        |                       |
+----------------------+----------------------------------------+-----------------------+
|  MOBILE VIEW (< 640px)                                                                |
|  +---------------------------------------------------------------------------------+  |
|  | [Header: Logo + Title + Profile Icon]                                            |  |
|  | [Main Feed / Content Stream (Full Width 360px+)]                                |  |
|  | [Floating Action Button: (+)]                                                   |  |
|  | [Bottom Nav Bar: Home | Explore | Notifs | Bookmarks | Profile]                 |  |
+---------------------------------------------------------------------------------------+
```

---

## 3. Screen Wireframes

### Screen 1: Login & Registration Wireframe

```
+---------------------------------------------------------------+
|                        [ Chirpwell Logo ]                         |
|                 Welcome back to the conversation              |
|                                                               |
|   +-------------------------------------------------------+   |
|   | Username or Email                                     |   |
|   +-------------------------------------------------------+   |
|   | Password                            [Show/Hide]       |   |
|   +-------------------------------------------------------+   |
|                                                               |
|   [                      Log In (Button)                 ]    |
|                                                               |
|   ------------------------- OR ----------------------------   |
|                                                               |
|   Quick Demo Accounts (1-Click Fill):                         |
|   [ Sarah (Eng) ]   [ Alex (Dev) ]   [ Moderator Admin ]      |
|                                                               |
|   Don't have an account? Sign up                              |
+---------------------------------------------------------------+
```

### Screen 2: Post Composer Component

```
+---------------------------------------------------------------+
| [Avatar]  What's happening? #hashtags and @mentions supported |
|           |                                                   |
|           |                                                   |
| +-----------------------------------------------------------+ |
| | [Image 1: Preview [X]]        [Image 2: Preview [X]]      | |
| +-----------------------------------------------------------+ |
| ------------------------------------------------------------- |
| [ 📷 Image ] [ 📊 Poll ] [ 😀 Emoji ]     ( 242/280 [○] ) [Post]|
+---------------------------------------------------------------+
```

### Screen 3: Post Card & Thread Structure

```
+---------------------------------------------------------------+
| [Avatar]  Sarah Connor  @sarah_tech · 15m           [ ... ]  |
|                                                               |
| Deploying Redis fan-out on write has cut our feed latency to   |
| under 40ms! Check out our schema at #WebDev. Kudos to @alex_dev|
|                                                               |
| +-----------------------------------------------------------+ |
| | [ Attached Architecture Diagram Image ]                   | |
| +-----------------------------------------------------------+ |
|                                                               |
| [ 💬 14 ]        [ 🔄 5 ]        [ ❤️ 48 ]        [ 🔖 12 ]    |
+---------------------------------------------------------------+
|   | (Connecting Thread Line)                                  |
|   v                                                           |
| [Avatar]  Alex Rivera  @alex_dev · 8m                         |
| Replying to @sarah_tech                                       |
| Absolutely, Redis sorted sets combined with Mongo IDs is key! |
| [ 💬 2 ]         [ 🔄 1 ]        [ ❤️ 19 ]        [ 🔖 3 ]    |
+---------------------------------------------------------------+
```

### Screen 4: User Profile Header & Privacy States

```
+---------------------------------------------------------------+
| <-- Profile              Sarah Connor (12 posts)              |
| +-----------------------------------------------------------+ |
| | [ Banner Image Area: 600 x 200 ]                          | |
| +-----------------------------------------------------------+ |
|   [ Avatar (120px) ]                        [ Edit Profile ]  |
|                                                               |
|   Sarah Connor  [ 🔒 Private Account Badge ]                  |
|   @sarah_tech                                                 |
|   Full-stack engineer & distributed systems researcher.       |
|   📍 San Francisco, CA   🔗 https://sarah.dev   📅 Joined Nov 2026|
|                                                               |
|   **142** Following       **1,820** Followers                |
|                                                               |
|   [ Posts ]        [ Replies ]        [ Media ]     [ Likes ] |
| ============================================================= |
| (Post cards stream or "This Account is Private" lock placeholder)
+---------------------------------------------------------------+
```

### Screen 5: Notifications Screen with Grouping

```
+---------------------------------------------------------------+
| Notifications                                   [Mark all read]|
| [ All ]               [ Mentions ]               [ Unread ]   |
|---------------------------------------------------------------|
| [❤️ Red Heart]  [Av1][Av2][Av3]                               |
| Rahul, Priya and 4 others liked your post:                    |
| "Deploying Redis fan-out on write has cut feed latency..." · 2h|
|---------------------------------------------------------------|
| [🔄 Repost]     [Avatar]                                      |
| Alex Rivera reposted your post · 4h                           |
|---------------------------------------------------------------|
| [💬 Reply]      [Avatar]                                      |
| Marcus Vance replied to your post:                            |
| "What's the memory overhead per 10k users?" · 6h              |
+---------------------------------------------------------------+
```

### Screen 6: AI Content Moderation & Reporting UI

```
+---------------------------------------------------------------+
| Moderation Dashboard                             [Refresh Queue]|
| Total Pending: 4   |   Reviewed Today: 18   |   Avg LLM Score: 0.14|
|---------------------------------------------------------------|
| Status: [ ⚠️ FLAGGED ]   Toxicity Score: 0.88   Reason: Hate Speech|
| Author: @spambot99 · Reported by 3 users                      |
| Content: "Offensive text sample awaiting review..."           |
| Action:  [ ✅ Approve ]    [ ⚠️ Hide / Flag ]    [ ❌ Delete & Ban]|
+---------------------------------------------------------------+
```

---

## 4. Mobile & Responsive Layout Adaptations
- **Mobile (<640px):** Single column. Left sidebar collapses into a fixed bottom navigation bar (5 buttons). Post composer available via top feed or fixed Floating Action Button. Right panel hidden; accessible via the dedicated Explore/Search route.
- **Tablet (641px - 1023px):** Two column. Compact icon sidebar (64px width), main feed occupies remaining width up to 720px. Right panel omitted or toggled via drawer.
- **Desktop (>=1024px):** Full 3-column layout. Left sidebar (260px) + Main content (620px) + Right panel (320px). Sticky headers and panels.
