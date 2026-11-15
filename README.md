# ⚡ Chirpwell — High-Performance Micro-Social Blogging Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend: React 18](https://img.shields.io/badge/Frontend-React_18_%2B_TypeScript-61DAFB.svg)](frontend/)
[![Styling: TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3-38B2AC.svg)](frontend/)
[![Architecture: Redis Fan--Out](https://img.shields.io/badge/Architecture-Redis_Fan--Out-DC382D.svg)](docs/ARCHITECTURE.md)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB_%2B_Mongoose-47A248.svg)](docs/DATABASE_SCHEMA.md)

Chirpwell is a modern, responsive, and resilient micro-social blogging network (inspired by X / Threads). It is engineered for sub-50ms home feed delivery via **Redis fan-out-on-write**, atomic concurrency handling, live Socket.IO interactions, private account workflows, and automated **AI content moderation**.

---

## 👥 Team Breakdown & 15-Day Ownership

| Member | Role | Core Deliverables (Days 1 to 15) |
|:---|:---|:---|
| **Member 1 (You)** | **Lead Architect & Frontend Integration** | Architecture, repository setup, React application shell, routing, API client, profile structure, post composer integration, threaded conversations, follow integration, cursor pagination & infinite scroll, Redis feed integration, WebSocket live sync, hashtag & search discovery, privacy settings, moderation dashboard, capstone integration. |
| **Member 2** | **Backend & Database Engineer** | Express + TypeScript REST API, MongoDB schemas & Mongoose models, bcrypt/JWT auth, profile APIs, post CRUD & Cloudinary uploads, threaded reply hierarchy, atomic follow/unfollow transactions, Redis fan-out BullMQ worker, Socket.IO rooms, Gemini AI moderation pipeline, search and rate limiting. |
| **Member 3** | **UI/UX Designer & Frontend UI Engineer** | Design system & tokens, wireframes (`docs/design/WIREFRAMES.md`), login/register screens, profile header & avatar, post card & composer with radial counter, reply thread UI, follower lists, empty & loading states, interactive like/repost/bookmark buttons, RichText hashtag/mention linking, moderation banner, responsive layout across 360px–1440px. |

---

## 🚀 Key Architectural Highlights

1. **Fan-Out-On-Write Feed Pipeline:** When a user publishes a post, post IDs are asynchronously distributed via BullMQ to follower Redis Sorted Sets (`feed:{userId}`, capped at 800). Reading the feed takes `<5ms` from Redis, hydrated in a single batched MongoDB query.
2. **Atomic Social Graph & Concurrency:** Followers, following, and like counts update via atomic MongoDB `$inc` within transactions; unique compound indexes prevent race conditions under 100+ simultaneous requests.
3. **Cursor-Based Infinite Scrolling:** Stable `(createdAt, _id)` pagination guarantees zero duplicate or skipped posts during live feed insertion.
4. **AI-Powered Content Safety:** Google Gemini evaluates post text asynchronously for toxicity, hate speech, and spam, automatically flagging or rejecting abusive submissions without blocking the author's submission response.
5. **Robust Redis Fallback:** If Redis is down, the system transparently degrades to MongoDB aggregation queries without 500 errors.

---

## 🛠️ Quick Start & Local Setup

### Option 1: Docker Compose (All Services)

```bash
# Clone the repository
git clone https://github.com/your-username/chirpwell.git
cd chirpwell

# Launch MongoDB, Redis, Backend and Frontend containers
docker-compose up -d

# Services available at:
# Frontend Web App:  http://localhost:5173
# REST API & Sockets: http://localhost:5000/api/v1
# MongoDB:           localhost:27017
# Redis:             localhost:6379
```

### Option 2: Running Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# App will run at http://localhost:5173

# Execute unit and component tests
npm run test

# Production build & type-check
npm run build
```

---

## 🧭 Project Navigation & Documentation

- 📐 [System Architecture & Data Flows](docs/ARCHITECTURE.md)
- 📊 [Database Schema & Mongoose Models](docs/DATABASE_SCHEMA.md)
- 🔌 [REST API Specification & Endpoints](docs/API_DOCUMENTATION.md)
- 📋 [15-Day Feature Traceability Matrix](docs/FEATURE_CHECKLIST.md)
- 🧪 [QA Test Plan & 122 Test Cases](docs/TESTING.md)
- 🎨 [UI/UX Wireframe Specifications](docs/design/WIREFRAMES.md)
- 📌 [GitHub Projects Board Structure](docs/PROJECT_BOARD.md)
- 🖥️ [Presentation Slide Deck Script](docs/PRESENTATION.md)
- 🎓 [Individual Viva Questions & Answers](docs/VIVA_QA.md)

---

## 🔒 Demo Accounts (Ready for Evaluation)

| Account | Username | Password | Role / Characteristic |
|:---|:---|:---|:---|
| **Sarah Connor** | `sarah_tech` | `Password123!` | Public tech lead, 1.8k followers, rich feed |
| **Alex Rivera** | `alex_dev` | `Password123!` | Private account (requires follow request) |
| **Admin Moderator** | `moderator_admin` | `Password123!` | Has access to `/moderation` queue |
| **Demo User** | `demo_user` | `Password123!` | Fresh account for live signup/posting demo |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
