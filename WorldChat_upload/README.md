# 🌍 WorldChat

A production-ready, full-stack **real-time chat application** with global & private chat, presence, typing indicators, temporary images, and **one-to-one voice & video calls (WebRTC)**.

Guests can join the global chat instantly with just a username. Registered users (Google Sign-In) unlock private messaging, image uploads, chat history, and calls.

---

## ✨ Features

### Guest users (no login)
- Pick any username and instantly join the **global chat**
- Temporary guest ID, session ends when the browser closes
- Send/receive real-time text messages, emojis
- See online users and typing indicators

### Registered users (Google Sign-In)
- Everything guests can do, **plus**:
- Edit profile + upload profile picture
- **Private one-to-one messaging** with chat history
- Upload **temporary images** (auto-expire after 5 minutes)
- Delete their own messages
- **Voice & video calls** (WebRTC)

### Real-time (Socket.IO)
- Instant global & private messaging
- Online presence + join/leave notifications
- Typing indicators
- Live image-expiry updates

### Calling (WebRTC)
- One-to-one voice & video
- Incoming call popup, accept / reject / end
- Mute mic, toggle camera, live call timer
- Socket.IO is used **only for signaling**; media is peer-to-peer

### Temporary images
- Uploaded to **Cloudinary**, URL + `expiresAt` stored in MongoDB
- A **node-cron** job runs every minute, deletes expired assets from Cloudinary, and replaces the message with **“This image has expired.”**

### UI / UX
- Modern interface inspired by Discord & Telegram
- **Dark / light mode**, fully responsive
- Sidebar, conversation list, online-user panel, beautiful message bubbles
- Smooth Framer Motion animations, loading skeletons, toast notifications, emoji picker, auto-scroll

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, JavaScript (JSX), Vite, Tailwind CSS, React Router, Socket.IO Client, Axios, Framer Motion |
| Backend | Node.js, Express, MongoDB + Mongoose, Socket.IO, JWT, Firebase Admin (Google Auth), Cloudinary, node-cron, Multer |
| Realtime | Socket.IO |
| Calls | WebRTC |
| Tooling | ESLint, Prettier |

> **Note on language:** the brief listed both “JavaScript” in the primary stack and “TypeScript frontend” under code quality. The frontend is implemented in **modern JavaScript (JSX)** to match the primary Vite + JavaScript stack, with ESLint + Prettier for code quality. The architecture (services, hooks, contexts) is structured so a TypeScript migration would be straightforward.

---

## 📁 Folder Structure

```
World_Chat/
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── eslint.config.js
│   ├── .prettierrc.json
│   └── src/
│       ├── server.js            # HTTP + Socket.IO bootstrap, graceful shutdown
│       ├── app.js               # Express app (security, CORS, routes, errors)
│       ├── config/
│       │   ├── env.js           # Validated environment config
│       │   ├── db.js            # MongoDB connection
│       │   ├── cloudinary.js    # Cloudinary upload/delete helpers
│       │   └── firebase.js      # Firebase Admin token verification
│       ├── models/
│       │   ├── User.js
│       │   ├── Guest.js
│       │   ├── Message.js
│       │   ├── PrivateMessage.js
│       │   └── Call.js
│       ├── controllers/         # auth, profile, message, private, upload, call
│       ├── routes/              # one router per resource + index.js
│       ├── middleware/          # auth, errorHandler, rateLimiter, upload, validate
│       ├── validators/          # Zod schemas
│       ├── services/            # imageExpiry.service.js
│       ├── jobs/                # cron.js (node-cron)
│       ├── socket/              # index, socketAuth, presence, chat & call handlers
│       └── utils/               # jwt, logger, ApiError, asyncHandler, constants
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    ├── eslint.config.js
    ├── .prettierrc.json
    └── src/
        ├── main.jsx
        ├── App.jsx              # Providers + Router + Toaster
        ├── index.css            # Tailwind + design tokens
        ├── config/              # constants.js, firebase.js
        ├── services/            # api, authService, chatService, socketService
        ├── context/             # Theme, Auth, Socket, Call (WebRTC) providers
        ├── hooks/               # useGlobalChat, usePrivateChat
        ├── routes/              # AppRoutes, ProtectedRoute
        ├── pages/               # Home, GlobalChat, PrivateChat, Profile
        ├── components/
        │   ├── common/          # Avatar, Spinner, Icon, Modal, Skeletons, ThemeToggle
        │   ├── chat/            # ChatHeader, MessageList, MessageBubble, MessageInput, EmojiButton, TypingIndicator
        │   ├── sidebar/         # Sidebar, ConversationList, OnlineUsers
        │   ├── call/            # IncomingCall, CallScreen
        │   └── layout/          # AppLayout, layoutContext
        └── utils/               # format.js
```

---

## 🚀 Installation

### Prerequisites
- **Node.js ≥ 18**
- A **MongoDB Atlas** cluster (or local MongoDB)
- A **Firebase** project with **Google** sign-in enabled (for registered users)
- A **Cloudinary** account (for image uploads)

### 1. Clone & install

```bash
# from the project root
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
# backend
cd backend
cp .env.example .env   # then fill in the values

# frontend
cd ../frontend
cp .env.example .env   # then fill in the values
```

(On Windows PowerShell use `copy .env.example .env`.)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret for signing JWTs |
| `JWT_EXPIRES_IN` | User token lifetime (e.g. `7d`) |
| `GUEST_JWT_EXPIRES_IN` | Guest token lifetime (e.g. `1d`) |
| `FIREBASE_PROJECT_ID` | Firebase service-account project id |
| `FIREBASE_CLIENT_EMAIL` | Firebase service-account client email |
| `FIREBASE_PRIVATE_KEY` | Firebase service-account private key (keep `\n` escapes) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | Folder for uploads (default `worldchat`) |
| `IMAGE_EXPIRY_MINUTES` | Image lifetime in minutes (spec: `5`) |

### Frontend (`frontend/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:5000`) |
| `VITE_SOCKET_URL` | Socket.IO base URL (usually same as API) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender id |
| `VITE_FIREBASE_APP_ID` | Firebase web app id |

> Firebase and Cloudinary are optional for **guest** chat. If they’re not configured, guest global chat still works; Google sign-in and image uploads are gracefully disabled.

---

## ▶️ Running the app

Open two terminals.

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev      # nodemon, or `npm start` for production

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Then open **http://localhost:5173**.

Other scripts:

```bash
# Backend
npm run lint        # eslint
npm run format      # prettier

# Frontend
npm run build       # production build -> dist/
npm run preview     # preview the build
npm run lint
npm run format
```

---

## 📡 API Documentation

Base URL: `/api`. All authenticated routes expect `Authorization: Bearer <JWT>`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Health check |
| `POST` | `/auth/google` | — | Verify Firebase ID token, upsert user, return JWT. Body: `{ idToken }` |
| `POST` | `/guest` | — | Create guest session, return JWT. Body: `{ name }` |
| `GET` | `/profile` | guest/user | Current principal’s profile |
| `PUT` | `/profile` | user | Update `{ name?, bio?, status?, avatar? }` |
| `GET` | `/messages` | user* | Global chat history (`?limit=&before=`) |
| `POST` | `/messages` | guest/user | Create a global message (REST fallback; sockets preferred) |
| `GET` | `/private/conversations` | user | Recent DM conversations with previews |
| `GET` | `/private/:userId` | user | Full DM history with a user |
| `DELETE` | `/private/message/:messageId` | user | Soft-delete own DM |
| `POST` | `/upload` | user | Upload temporary image (multipart field `image`) → `{ imageUrl, imagePublicId, expiresAt }` |
| `POST` | `/call` | user | Log a call. Body: `{ receiverId, callType }` |
| `GET` | `/call/history` | user | Recent calls |

\* Guests are intentionally blocked from global history per spec.

**Standard responses**

```jsonc
// success
{ "success": true, /* ...payload */ }

// error
{ "success": false, "message": "Human readable error", "details": [ /* optional */ ] }
```

**Security**: JWT auth, Zod input validation, `express-rate-limit` (global + auth + write + upload limiters), Helmet headers, CORS locked to `CLIENT_URL`, centralized error handling, secrets via env vars.

---

## 🔌 Socket.IO Events Documentation

Connect with the JWT in the handshake:

```js
io(SOCKET_URL, { auth: { token } });
```

### Server → Client

| Event | Payload | Meaning |
| --- | --- | --- |
| `online_users` | `User[]` | Current online roster |
| `user_joined` / `user_left` | `User` | Presence change |
| `global_message_new` | `Message` | New global message |
| `private_message_new` | `PrivateMessage` | New DM (also sent to receiver’s personal room) |
| `message_deleted` | `{ messageId, conversationId }` | A DM was deleted |
| `typing_update` | `{ userId, name, isTyping, scope?, conversationId? }` | Typing state |
| `image_expired` | `{ messageId, scope, conversationId?, text }` | Image expired → replace with text |
| `call:incoming` | `{ callId, callType, from }` | Incoming call |
| `call:accepted` / `call:rejected` / `call:ended` | `{ callId, from }` | Call lifecycle |
| `call:unavailable` | `{ receiverId, reason }` | Callee offline |
| `webrtc:offer` / `webrtc:answer` | `{ from, sdp, callId }` | SDP relay |
| `webrtc:ice-candidate` | `{ from, candidate, callId }` | ICE relay |

### Client → Server

| Event | Payload | Meaning |
| --- | --- | --- |
| `global_message` | `{ message, messageType, imageUrl?, expiresAt? }` (ack) | Send global message |
| `private_message` | `{ receiverId, message, messageType, imageUrl?, expiresAt? }` (ack) | Send DM |
| `private:join` | `{ conversationId }` | Join a DM room |
| `message_deleted` | `{ messageId, conversationId }` | Broadcast deletion |
| `typing` | `{ scope, conversationId?, isTyping }` | Typing signal |
| `call:initiate` | `{ receiverId, callType }` (ack) | Start a call |
| `call:accept` | `{ callId, callerId }` | Accept |
| `call:reject` | `{ callId, callerId }` | Reject |
| `call:end` | `{ callId, peerId, durationSec }` | End |
| `webrtc:offer` / `webrtc:answer` | `{ to, sdp, callId }` | Send SDP |
| `webrtc:ice-candidate` | `{ to, candidate, callId }` | Send ICE candidate |

---

## 📞 WebRTC Call Flow

Socket.IO is used **only for signaling**. Audio/video flows peer-to-peer.

```
Caller                         Server (Socket.IO)                    Callee
  | call:initiate ----------------> |                                   |
  |                                 | -- call:incoming ---------------> | (incoming popup)
  |                                 | <----------------- call:accept -- | (getUserMedia)
  | <--------------- call:accepted -|                                   |
  | createOffer + setLocalDesc      |                                   |
  | webrtc:offer ------------------>| -- webrtc:offer ----------------> | setRemoteDesc
  |                                 |                                   | createAnswer + setLocalDesc
  | <-- webrtc:answer --------------| <--------------- webrtc:answer -- |
  | setRemoteDesc                   |                                   |
  | <==== webrtc:ice-candidate (both directions, trickle ICE) ====>     |
  |                                                                     |
  |  🎥  Peer-to-peer media stream established (P2P)  🎙️                |
  |                                                                     |
  | call:end ---------------------->| -- call:ended ------------------> | cleanup
```

1. **Initiate** — caller grabs local media, emits `call:initiate`.
2. **Ring** — callee receives `call:incoming` and shows the popup.
3. **Accept** — callee grabs media, emits `call:accept`; server notifies caller (`call:accepted`).
4. **Offer/Answer** — caller creates the SDP **offer**, callee replies with an **answer** (relayed via sockets).
5. **ICE** — both sides trickle ICE candidates; STUN servers help NAT traversal. *(Add a TURN server in `ICE_SERVERS` for restrictive networks.)*
6. **Connected** — `ontrack` fires, media plays, the timer starts.
7. **Controls** — mute toggles the audio track’s `enabled`; camera toggles the video track.
8. **End** — either party emits `call:end`; both peers tear down the `RTCPeerConnection` and stop tracks. The call is logged with its duration.

---

## ☁️ Deployment Guide

### Database — MongoDB Atlas
1. Create a free cluster, add a database user, and allow network access.
2. Copy the connection string into `MONGODB_URI`.

### Storage — Cloudinary
1. Create an account; copy **cloud name / API key / API secret** into the backend env.

### Auth — Firebase
1. Create a Firebase project, enable **Google** under Authentication → Sign-in method.
2. Frontend: copy the **Web app** config into `VITE_FIREBASE_*`.
3. Backend: create a **service account** (Project settings → Service accounts → Generate key) and copy `project_id`, `client_email`, `private_key` into the backend env.
4. Add your deployed frontend domain to Firebase **Authorized domains**.

### Backend — Render / Railway
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add all backend env vars. Set `CLIENT_URL` to your deployed frontend URL.
- Both platforms support WebSockets (needed for Socket.IO) out of the box.

### Frontend — Vercel
- Root directory: `frontend`
- Framework preset: **Vite**
- Build command: `npm run build` — Output dir: `dist`
- Add all `VITE_*` env vars, pointing `VITE_API_URL` / `VITE_SOCKET_URL` at the deployed backend.

### Post-deploy checklist
- ✅ `CLIENT_URL` (backend) matches the Vercel URL — CORS + Socket.IO origin.
- ✅ Firebase authorized domains include the Vercel URL.
- ✅ For reliable calls behind strict NATs, add a TURN server to `ICE_SERVERS` (`frontend/src/config/constants.js`).

---

## 🧭 Quick Reference

```bash
# Install
cd backend && npm install
cd ../frontend && npm install

# Configure
# backend/.env and frontend/.env  (see .env.example in each)

# Run (two terminals)
cd backend  && npm run dev    # http://localhost:5000
cd frontend && npm run dev    # http://localhost:5173
```

---

## 📝 License

MIT — build something great. 🌍
