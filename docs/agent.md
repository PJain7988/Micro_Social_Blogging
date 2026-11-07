# AGENTS.md – Chirpwell

> Operating manual for AI coding agents (Claude Code, Cursor, Copilot, Codex) and new contributors.
> Read it fully before changing anything. When this file and the PRD disagree, the PRD wins; ask the maintainer.

| | |
|---|---|
| **Product** | Chirpwell, a micro-blogging social network (X / Threads inspired) |
| **Phase** | UI with mock data now; backend follows the 15-day plan (section 12) |
| **Status of this file** | Living document. Update it in the same PR that changes structure or rules |

---

## 1. Mission and Principles

Chirpwell lets people publish short posts, follow others, engage with content and read a fast, personalised home feed.

Engineering principles, in priority order:

1. **Correctness of data.** Counts, feeds and permissions must be right, including under concurrent requests.
2. **Privacy and safety.** Private accounts, blocks, mutes and moderation are never bypassed.
3. **Speed.** Feed reads come from Redis; heavy work runs in background jobs.
4. **Simplicity.** Prefer the smallest change that solves the problem. No speculative abstractions.
5. **Accessibility.** Every feature works with keyboard and screen reader and on a 360 px screen.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript (strict), Vite, Tailwind CSS 3, React Router 6 |
| Backend *(planned)* | Node.js 20, Express JS, TypeScript, Zod validation |
| Database *(planned)* | MongoDB |
| Cache and queues *(planned)* | Redis 7 (Docker), BullMQ |
| Real time *(planned)* | Socket.io |
| Media *(planned)* | S3 or Cloudinary |
| AI moderation *(planned)* | LLM API with structured JSON output |
| Testing | Vitest, React Testing Library, Supertest, Playwright (smoke) |
| CI | GitHub Actions: lint, type-check, test, build |

---

## 3. Commands

```bash
npm install          # install dependencies
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # tsc type-check + production build
npm run preview      # serve production build
npm run lint         # ESLint (when added)
npm run test         # Vitest (when added)
```

Pre-merge gate: `npm run build` and `npm run test` must both pass with zero errors and zero warnings you introduced.

---

## 4. Repository Map

```
src/
  components/
    layout/    AppLayout, Sidebar, RightPanel
    post/      PostCard, PostComposer, RichText
    ui/        Button, Avatar, EmptyState, PageHeader   (generic, no business logic)
  pages/       One file per route
  hooks/       useInfiniteScroll and future data hooks
  services/    api.ts (REST client), socket.ts (Socket.io client)
  context/     AuthContext
  data/        mock.ts   (temporary; deleted as endpoints land)
  lib/         cn.ts, time.ts (pure helpers)
  types/       Shared TypeScript types
```

| Route | Page | Auth |
|---|---|---|
| `/login`, `/register` | Auth forms | Public |
| `/` | Home feed | Required |
| `/u/:username` | Profile | Public, respects privacy |
| `/post/:id` | Post and thread | Respects privacy |
| `/tag/:tag` | Hashtag page | Public posts only |
| `/search` | Posts and people | Required |
| `/notifications` | Grouped notifications | Required |
| `/requests` | Follow requests | Required |
| `/settings` | Profile, privacy, blocks and mutes | Required |
| `/moderation` | Moderation queue | Moderator role |

Placement rules:
- Route-level logic in `pages/`; reusable pieces in `components/`; data access only in `services/` and hooks.
- `components/ui/` stays presentational and domain-free.
- Import with the `@/` alias. One component per file; filename equals the default export.

---

## 5. Boundaries

### Always
- Read the relevant PRD section and existing code before editing.
- Keep diffs small and focused on the task.
- Handle **loading, empty and error** states in every data view.
- Add or update tests with every behaviour change.
- Run the pre-merge gate before reporting a task as finished.
- State assumptions and trade-offs in the PR description.

### Ask first
- Adding or upgrading a dependency.
- Database schema changes or migrations.
- Changing public API shapes, routes or auth flow.
- Large refactors or moving files.
- Anything that affects privacy rules, moderation or rate limits.

### Never
- Commit secrets, `.env`, `node_modules` or `dist`.
- Use `any`, `@ts-ignore`, `dangerouslySetInnerHTML`, or offset pagination.
- Store auth tokens in `localStorage`.
- Bypass or weaken privacy, block, mute or moderation checks, even temporarily.
- Disable or delete a failing test to make a build pass.
- Reformat unrelated files or rewrite code outside the task.

---

## 6. Coding Standards

**TypeScript**
- `strict` on. Use `unknown` and narrow; model state with discriminated unions.
- Shared types in `src/types`; derive API types from the contract, not by hand-copy.
- Named exports for helpers, default export for components and pages.

**React**
- Function components and hooks only. Keep components under about 150 lines; split by responsibility.
- Derive state instead of duplicating it. Memoise only when measured.
- Side effects belong in hooks. Clean up observers, timers and sockets.
- User text is rendered only through `RichText`, which links `#hashtags` and `@mentions` and nothing else.

**Styling**
- Tailwind utilities with the design tokens below; use `cn()` for conditionals.
- No new hard-coded colours, fonts or one-off pixel values.

**Naming:** components `PascalCase`, hooks `useThing`, helpers `camelCase`, constants `SCREAMING_SNAKE`, files match their main export.

**Comments:** explain *why*, not *what*. No commented-out code and no stray `console.log`.

### Design tokens

| Token | Hex | Use |
|---|---|---|
| `paper` | #F2F4F8 | Page background |
| `ink` | #16213A | Primary text |
| `mute` | #66708A | Secondary text |
| `line` | #DDE2EC | Borders |
| `accent` | #2B4BFF | Links, primary actions, active nav |
| `accentSoft` | #E6EAFF | Selected and unread backgrounds |
| `danger` | #C8344B | Errors, destructive actions, liked state |

Typeface: Instrument Sans. Layout: sidebar, centre column (max 600 px), right panel (hidden below 1024 px). Mobile: sidebar becomes a horizontal bar. Use typographic apostrophes (’) in copy.

---

## 7. Domain Rules and Invariants

These must hold in every layer. A change that breaks one is a bug.

### Content
| Rule | Detail |
|---|---|
| Post length | 1–280 characters (count characters, not bytes) |
| Media | Up to 4 images; JPG, PNG, WebP; 5 MB each |
| Valid post | Has text or at least one image |
| Replies | Store `parentId`; render as a thread; a deleted parent shows "This post was deleted" |
| Delete | Soft delete; counts and threads stay consistent |

### Identity
- Username: 3–20 chars, letters, numbers, underscore; unique **case-insensitive** (store a lower-case canonical form; enforce with a database unique index).
- Bio max 160 characters; avatar max 2 MB.

### Social graph
- No self-follow. Follow and unfollow are **idempotent**.
- `(follower_id, following_id)` is unique at the database level.
- Follower and following counters change **atomically** with the follow row (single transaction or atomic increment). A periodic reconciliation job compares counters with real rows.
- Private account: follow creates a `pending` request; only `accepted` followers see posts.
- Block: removes follows both ways; blocks profile views, follows, replies, likes and mentions between the two users. Mute: hides posts and notifications from the muter only; the muted user is never told.

### Feed
- Home feed: posts and reposts from followed users, newest first.
- **Cursor pagination** on `(createdAt, id)`. Default page 20, max 50. No duplicates or gaps while new posts arrive.
- Exclude deleted, flagged, removed, blocked and muted content at read time, even if IDs are cached.
- Fan-out on write: on post creation a worker pushes the ID to each follower's Redis list `feed:{userId}`, trims to 800, and runs asynchronously. Missing or empty list triggers a rebuild from PostgreSQL. Follow back-fills recent posts; unfollow removes that author's posts.

### Engagement
- One like and one repost per user per post (unique constraints).
- Counters update atomically; changes broadcast to Socket.io room `post:{id}`; sockets are authenticated.

### Hashtags and mentions
- Hashtags are lower-cased, stored once per post, 1–50 chars; `#123` and bare `#` are ignored.
- Mentions link only to existing, non-blocking users.

### Trending
- Background job every 5 minutes with a lock to prevent overlap. Counts **unique users** in the last 24 hours, ignores flagged and private posts, stores top 10 in Redis `trending:hashtags`, and keeps the last result if a run fails.

### Notifications
- Types: like, reply, mention, follow, follow request. None for actions on your own content.
- Likes group per `(recipient, post, type)`: display "Rahul and 5 others liked your post". Unliking decrements or removes.
- Delivered live over Socket.io and persisted; unread badge; mark one or all as read.

### Moderation
- Every new post and reply is sent to the LLM asynchronously. The LLM returns structured JSON: `label`, `score`, `reason`.
- Score above threshold: status `flagged`, hidden from feeds, added to the moderation queue. Moderator chooses approve or remove; author is notified on removal.
- LLM timeout or invalid JSON: retry with backoff, log, never lose the post.

### Rate limiting
- Posting limited per **user ID** (default 10 per minute, 100 per day) using Redis counters. Exceeding returns `429` with `Retry-After`. If Redis is down, fall back to a conservative in-memory limit.

---

## 8. API Conventions (backend phase)

- REST, JSON, base path `/api`. Resources are plural nouns; actions are verbs on sub-paths (`POST /posts/:id/like`).
- Validate every request body, query and param with Zod. Reject unknown fields.
- Success and list shape:

```json
{ "data": [ ... ], "nextCursor": "2026-11-04T10:15:00.000Z_8f3a" }
```

- Error shape (stable, machine-readable):

```json
{ "error": { "code": "USERNAME_TAKEN", "message": "Username already taken", "details": {} } }
```

| Status | Use |
|---|---|
| 400 | Validation failure |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed (private, blocked, not moderator) |
| 404 | Not found, or hidden for privacy |
| 409 | Conflict (duplicate username, duplicate like) |
| 429 | Rate limit exceeded |

- Authorisation is checked in the service layer on every endpoint, not only in routes.
- Never leak existence: a blocked or private resource returns the same response as a missing one where appropriate.

---

## 9. Quality Gates

### Testing
- **Unit:** helpers (`time`, parsing of hashtags and mentions), pure logic.
- **Component:** composer limits, like and repost toggles, empty and error states, grouped notification text, private profile lock.
- **Integration (API):** auth, concurrent follow counts (for example 100 parallel follows yields exactly 100), idempotent duplicate requests, cursor pagination without duplicates or gaps, fan-out, rate limit, privacy and block rules, moderation retry.
- **Smoke (Playwright):** register, post, follow, like, see notification.
- Every bug fix ships with a regression test that failed before the fix.

### Performance budgets
| Metric | Target |
|---|---|
| Feed first page (Redis path) | under 200 ms p95 |
| Create post response | under 300 ms (heavy work is async) |
| Initial JS bundle | under 200 KB gzipped |
| Largest Contentful Paint | under 2.5 s on mid-range mobile |

### Accessibility
WCAG 2.1 AA. Visible focus rings, `aria-pressed` on toggles, `aria-live` for async status, labelled inputs, image alt text, `prefers-reduced-motion` respected, colour never the only signal.

### Security
- Passwords hashed with argon2 or bcrypt; sessions in secure HTTP-only, SameSite cookies; CSRF protection on state-changing routes.
- Parameterised queries only; escape output; sanitise uploads and check MIME type and size.
- Secrets only from environment; fail fast at startup if one is missing.
- Rate limit auth endpoints and lock out repeated failures.

---

## 10. Environment Variables

| Name | Used by | Example |
|---|---|---|
| `VITE_API_URL` | Frontend | `http://localhost:4000/api` |
| `VITE_WS_URL` | Frontend | `http://localhost:4000` |
| `DATABASE_URL` | Backend | `postgres://user:pass@localhost:5432/chirpwell` |
| `REDIS_URL` | Backend | `redis://localhost:6379` |
| `JWT_SECRET` / `SESSION_SECRET` | Backend | random 32+ bytes |
| `LLM_API_KEY` | Moderation worker | set in host secrets |
| `STORAGE_BUCKET`, `STORAGE_KEY` | Media | set in host secrets |

Keep a committed `.env.example` with placeholders only.

---

## 11. Workflow

**Branches:** `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`.

**Commits:** Conventional Commits, imperative mood, one logical change each.
```
feat(feed): add cursor pagination to home feed
fix(follow): make follow counter update atomic
```

**Pull request must include:** what and why, linked PRD requirement or acceptance criterion, screenshots for UI changes, test evidence, and any assumptions or follow-ups.

### Playbooks

**Add a page:** create `pages/Name.tsx`, register the route in `App.tsx`, add a nav item only if it is a primary destination, cover loading/empty/error states, add a component test.

**Replace mock data with an API call:** update the type in `types/` first, add the call in `services/api.ts`, consume it in a hook, remove the matching export from `data/mock.ts`, update tests.

**Add an endpoint:** define the Zod schema, implement in the service layer with authorisation checks, return the standard envelope, add integration tests including the unhappy paths, document it in the README.

---

## 12. Roadmap

| Day | Deliverable |
|---|---|
| 1 | TypeScript repo, schema (users, posts, follows, likes, reposts, hashtags, notifications), Redis in Docker |
| 2 | Login, profile with avatar and bio, unique usernames |
| 3 | Posts with text and images; replies as threads |
| 4 | Follow and unfollow with correct counts under concurrency |
| 5 | Home feed with cursor pagination and infinite scroll |
| 6 | Redis fan-out on write |
| 7 | Likes and reposts with live Socket.io counts |
| 8 | Hashtags, @mentions, hashtag pages |
| 9 | Trending hashtags background job |
| 10 | Private accounts and follow requests |
| 11 | Grouped notifications |
| 12 | AI moderation and queue |
| 13 | Search, block, mute |
| 14 | Rate limiting, tests, README |
| 15 | Deployment, demo, viva |

Work only on the current day's scope unless told otherwise.

---

## 13. Definition of Done

- [ ] Meets the PRD acceptance criteria for the feature
- [ ] Build, type-check, lint and tests pass
- [ ] Unhappy paths and edge cases from the PRD are handled and tested
- [ ] Loading, empty and error states present
- [ ] Works at 360 px and desktop; keyboard and screen reader usable
- [ ] No new secrets, `any`, or unjustified dependencies
- [ ] README and this file updated if behaviour or structure changed

---

## 14. Glossary

| Term | Meaning |
|---|---|
| Fan-out on write | Pushing a new post ID into every follower's feed list when the post is created |
| Cursor pagination | Paging by a stable position (`createdAt` + `id`) instead of page numbers |
| Hydration | Loading full post data for IDs read from Redis |
| Flagged | Post hidden by AI moderation, waiting for a moderator decision |
| Muted vs blocked | Mute hides content for the muter only; block severs all interaction both ways |
| Idempotent | Repeating a request has the same result as sending it once |
