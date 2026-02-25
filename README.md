# Intervue Poll — Live Polling System

A real-time live polling application where teachers can create polls and students can answer them in real-time. Built with React, Node.js, Socket.io, and MongoDB.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express_5-green) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8-purple) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

---

## Features

- **Role-Based Access** — Users choose between Teacher or Student role
- **Real-Time Polling** — Teachers create polls; students answer live with countdown timer
- **Live Results** — Bar chart results update in real-time as students vote
- **Poll History** — All past polls stored in MongoDB and viewable via history page
- **Live Chat** — Real-time chat between all participants, persisted to database
- **Participant Management** — Teachers can view connected students and kick them
- **Session Persistence** — Users automatically rejoin on page refresh
- **Atomic Vote** — MongoDB atomic operations prevent duplicate votes

---

## Architecture Overview

```mermaid
graph TB
    subgraph Client["Client (React + Vite)"]
        App["App.tsx<br/>React Router"]
        RS["RoleSelect"]
        TL["TeacherLanding"]
        SL["StudentLanding"]
        TD["TeacherDashboard"]
        SD["StudentDashboard"]
        CP["ChatPanel"]
        PH["PollHistory"]
        KO["KickedOut"]
        CTX["AppContext<br/>(useReducer)"]
        SK["socket.ts<br/>(socket.io-client)"]
        
        App --> RS
        App --> TL --> TD
        App --> SL --> SD
        App --> KO
        TD --> CP
        TD --> PH
        SD --> CP
        TD --> CTX
        SD --> CTX
        CTX --> SK
    end

    subgraph Server["Server (Express + Socket.io)"]
        IDX["index.ts<br/>Express Server"]
        SIO["Socket Handler"]
        PR["Poll Routes<br/>REST API"]
        CR["Chat Routes<br/>REST API"]
        PS["PollService"]
        CS["ChatService"]
        PaS["ParticipantService"]
        
        IDX --> SIO
        IDX --> PR
        IDX --> CR
        SIO --> PS
        SIO --> CS
        SIO --> PaS
        PR --> PS
        CR --> CS
    end

    subgraph DB["MongoDB"]
        PM["Polls Collection"]
        CM["ChatMessages Collection"]
    end

    SK <-->|WebSocket| SIO
    Client -->|REST API| PR
    Client -->|REST API| CR
    PS --> PM
    CS --> CM
```

---

## Application Flow

```mermaid
sequenceDiagram
    participant T as Teacher
    participant S as Student
    participant Srv as Server
    participant DB as MongoDB

    Note over T,S: 1. Role Selection & Join
    T->>Srv: join_poll (role: teacher)
    Srv-->>T: joined (participants list)
    S->>Srv: join_poll (role: student, name)
    Srv-->>S: joined (participants list)
    Srv-->>T: student_joined (updated list)

    Note over T,S: 2. Poll Creation
    T->>Srv: create_poll (question, options, timer)
    Srv->>DB: Save Poll to MongoDB
    Srv-->>T: new_poll (pollId, question, options)
    Srv-->>S: new_poll (pollId, question, options)
    
    Note over T,S: 3. Timer & Answering
    loop Every second
        Srv-->>T: timer_update (remaining)
        Srv-->>S: timer_update (remaining)
    end
    S->>Srv: submit_answer (pollId, optionIndex)
    Srv->>DB: Atomic update (prevent duplicates)
    Srv-->>S: answer_submitted
    Srv-->>T: live_results (percentages)

    Note over T,S: 4. Results
    Srv->>DB: Calculate final results
    Srv-->>T: poll_results (final percentages)
    Srv-->>S: poll_results (final percentages)

    Note over T,S: 5. Chat (anytime)
    S->>Srv: send_message (text)
    Srv->>DB: Save ChatMessage
    Srv-->>T: new_chat_message
    Srv-->>S: new_chat_message
```

---

## Poll Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Idle: App loaded
    Idle --> Creating: Teacher fills form
    Creating --> Active: "Ask Question" clicked
    Active --> Active: Students submit answers
    Active --> Active: Live results update
    Active --> TimerEnd: Timer reaches 0
    TimerEnd --> Results: Final results calculated
    Results --> Idle: "Ask New Question"
    Results --> History: "View Poll History"
    History --> Results: Back
```

---

## Socket Events

```mermaid
flowchart LR
    subgraph ClientToServer["Client → Server"]
        A1[join_poll]
        A2[create_poll]
        A3[submit_answer]
        A4[send_message]
        A5[kick_student]
    end

    subgraph ServerToClient["Server → Client"]
        B1[joined]
        B2[new_poll]
        B3[answer_submitted]
        B4[live_results]
        B5[poll_results]
        B6[timer_update]
        B7[new_chat_message]
        B8[chat_history]
        B9[student_joined]
        B10[student_left]
        B11[kicked]
    end
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 3, React Router 7 |
| **Backend** | Node.js, Express 5, TypeScript |
| **Real-Time** | Socket.io 4.8 (client + server) |
| **Database** | MongoDB Atlas, Mongoose 9 |
| **State** | React Context + useReducer |
| **Notifications** | react-hot-toast |

---

## Project Structure

```
├── client/                     # React frontend
│   ├── src/
│   │   ├── App.tsx             # Router setup
│   │   ├── socket.ts           # Socket.io client instance
│   │   ├── components/
│   │   │   ├── RoleSelect.tsx        # Role selection page
│   │   │   ├── TeacherLanding.tsx    # Teacher join page
│   │   │   ├── StudentLanding.tsx    # Student name + join page
│   │   │   ├── TeacherDashboard.tsx  # Poll creation, results, live view
│   │   │   ├── StudentDashboard.tsx  # Answer polls, view results
│   │   │   ├── ChatPanel.tsx         # Chat + participants panel
│   │   │   ├── PollHistory.tsx       # Historical poll results
│   │   │   └── KickedOut.tsx         # Kicked student page
│   │   ├── context/
│   │   │   └── AppContext.tsx        # Global state (useReducer)
│   │   ├── hooks/
│   │   │   ├── useSocketEvents.ts    # Socket event listeners
│   │   │   └── useSessionPersistence.ts  # Auto-rejoin on refresh
│   │   └── types/
│   │       └── index.ts              # TypeScript interfaces
│   └── package.json
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── config/
│   │   │   └── db.ts           # MongoDB connection (retry logic)
│   │   ├── models/
│   │   │   ├── Poll.ts         # Poll Mongoose schema
│   │   │   └── ChatMessage.ts  # Chat Mongoose schema
│   │   ├── routes/
│   │   │   ├── pollRoutes.ts   # GET /api/polls, GET /api/polls/:id
│   │   │   └── chatRoutes.ts   # GET /api/chat
│   │   ├── services/
│   │   │   ├── PollService.ts        # Poll business logic
│   │   │   ├── ChatService.ts        # Chat business logic
│   │   │   └── ParticipantService.ts # In-memory participant tracking
│   │   └── socket/
│   │       └── index.ts        # Socket.io event handlers
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas connection string)

### 1. Clone & Install

```bash
git clone <repo-url>
cd Intervue_assignment

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

**Server** — create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intervue_poll
CLIENT_URL=http://localhost:5173
```

**Client** — optionally create `client/.env`:

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

> Defaults to `http://localhost:5000` if not set.

### 3. Run

```bash
# Terminal 1 — Start server
cd server
npm run dev

# Terminal 2 — Start client
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/polls` | Get all polls with calculated results |
| `GET` | `/api/polls/:id` | Get a specific poll by ID |
| `GET` | `/api/chat` | Get all chat messages |

---

## Key Design Decisions

1. **Atomic Voting** — Uses MongoDB `findOneAndUpdate` with `$addToSet` to prevent duplicate votes per student per poll
2. **Server-Side Timer** — Timer runs on the server to prevent client-side manipulation; emits updates every second
3. **Service Layer Pattern** — Business logic separated into `PollService`, `ChatService`, `ParticipantService` for clean architecture
4. **Session Persistence** — `sessionStorage` stores user role/name; auto-rejoins via socket on page refresh
5. **Single Teacher Enforcement** — Only one teacher allowed at a time; stale socket detection prevents lockout
6. **In-Memory Participants** — Connected users tracked in-memory `Map` for fast lookups (polls/chat persisted to MongoDB)

---
