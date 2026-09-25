# 🌿 AgriSmart — Intelligent Farming Application

AgriSmart is a full-stack intelligent mobile farming application that combines **React Native + Expo** on the frontend with a **Node.js + Express + PostgreSQL + Sequelize** backend, enriched with an **AI Agricultural Agent** powered by OpenAI, **RAG** (Retrieval-Augmented Generation), and **Plant Scan** capabilities using Vision AI.

---

## 🎯 Project Objectives

- Help farmers manage crops and agricultural tasks efficiently
- Provide intelligent AI-powered agricultural advice
- Enable plant disease detection via image scanning
- Offer context-aware answers using a RAG knowledge base
- Maintain full conversation history with an AI Agent

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT + Refresh Token with rotation |
| 🌱 My Crops | Full CRUD for managing crops |
| 📅 Agricultural Calendar | Task management with priority & due dates |
| 📷 Scan Plant | AI Vision diagnosis of plant diseases |
| 🤖 AI Agent | Conversational agent with function calling |
| 📚 RAG | Retrieval-Augmented Generation from agricultural documents |
| 🔒 AI Security | Guardrails, confirmation before actions, prompt injection resistance |

---

## 🛠️ Tech Stack

### Backend
| Technology | Role |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL | Relational database |
| Sequelize ORM | Database models & associations |
| JWT + bcrypt | Authentication & password hashing |
| Refresh Tokens | Secure token rotation |
| Zod | Request validation |
| Multer | Image upload handling |
| Axios | HTTP client |
| OpenAI SDK | AI Agent + Vision + Embeddings |
| Jest + Supertest | Testing |

### Frontend
| Technology | Role |
|---|---|
| React Native + Expo | Cross-platform mobile app |
| Expo Router | File-based navigation |
| TypeScript | Type safety |
| Axios | API communication |
| Zustand | Global state management |
| Expo SecureStore | Secure token storage |
| Expo Image Picker | Camera & gallery access |

---

## 🏗️ Architecture

```
React Native (Expo Router)
    ↓
Axios (with token interceptor)
    ↓
Express Routes
    ↓
Controllers
    ↓
Sequelize Models
    ↓
PostgreSQL
```

### AI Flow
```
User Message
    ↓
POST /api/agent/chat
    ↓
AI Agent (agent.js)
    ↓
RAG (rag.js) → Embeddings → Relevant Context
    ↓
Function Calling (tools.js)
    ↓
OpenAI GPT-4o
    ↓
Response → Saved to Conversation
```

---

## 📁 Project Structure

```
AgriSmart/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Sequelize + PostgreSQL connection
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── RefreshToken.js
│   │   │   ├── Crop.js
│   │   │   ├── Task.js
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   ├── Document.js
│   │   │   └── Embedding.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── crop.controller.js
│   │   │   ├── task.controller.js
│   │   │   ├── scan.controller.js
│   │   │   └── agent.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── crop.routes.js
│   │   │   ├── task.routes.js
│   │   │   ├── scan.routes.js
│   │   │   └── agent.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── errorHandler.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── crop.validator.js
│   │   │   └── task.validator.js
│   │   ├── ai/
│   │   │   ├── agent.js             # Main AI Agent with function calling loop
│   │   │   ├── rag.js               # RAG retrieval pipeline
│   │   │   ├── embeddings.js        # OpenAI embeddings + cosine similarity
│   │   │   └── tools.js             # Tool definitions & executors
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   └── integration/
│   │       ├── auth.test.js
│   │       └── crops-tasks.test.js
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
└── mobile/
    ├── app/
    │   ├── _layout.tsx              # Root layout with auth guard
    │   ├── index.tsx
    │   ├── (auth)/
    │   │   ├── login.tsx
    │   │   └── register.tsx
    │   └── (app)/
    │       ├── home.tsx
    │       ├── crops.tsx
    │       ├── calendar.tsx
    │       ├── scan.tsx
    │       ├── assistant.tsx
    │       └── profile.tsx
    ├── src/
    │   ├── services/api.ts          # Axios API client
    │   └── stores/auth.store.ts     # Zustand auth store
    └── package.json
```

---

## 🗄️ Database Entities

### Relationships
```
User
 ├── hasMany Crops
 ├── hasMany Tasks
 ├── hasMany RefreshTokens
 └── hasMany Conversations

Crop
 ├── belongsTo User
 └── hasMany Tasks

Conversation
 ├── belongsTo User
 └── hasMany Messages

Document
 └── hasMany Embeddings
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login & get tokens |
| POST | `/api/auth/refresh` | ❌ | Refresh access token |
| POST | `/api/auth/logout` | ❌ | Revoke refresh token |
| GET | `/api/auth/me` | ✅ | Get current user |

### Crops
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/crops` | ✅ | List all crops |
| GET | `/api/crops/:id` | ✅ | Get crop details |
| POST | `/api/crops` | ✅ | Create crop |
| PUT | `/api/crops/:id` | ✅ | Update crop |
| DELETE | `/api/crops/:id` | ✅ | Delete crop |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks` | ✅ | List tasks (filterable) |
| POST | `/api/tasks` | ✅ | Create task |
| PUT | `/api/tasks/:id` | ✅ | Update task |
| DELETE | `/api/tasks/:id` | ✅ | Delete task |

### Scan
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/scan` | ✅ | Analyze plant image |

### AI Agent
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/agent/chat` | ✅ | Chat with AI Agent |
| GET | `/api/agent/conversations` | ✅ | List conversations |

---

## 🔐 Authentication Flow

```
1. Register/Login → Access Token (15min) + Refresh Token (7d)
2. API Request → Authorization: Bearer <accessToken>
3. Token Expired → POST /api/auth/refresh with refreshToken
4. Refresh Token Rotation → Old token revoked, new tokens issued
5. Logout → Refresh token revoked in DB
```

---

## 🤖 AI Agent

The AgriSmart Agent uses OpenAI's **function calling** to interact with the user's farming data.

### Available Tools
| Tool | Description |
|---|---|
| `getUserCrops()` | Fetches user's crop list |
| `getCropDetails(cropId)` | Gets details + tasks for a crop |
| `getAgriculturalTasks(filters?)` | Lists tasks with optional filters |
| `createTask(data)` | Creates a task (requires confirmation) |
| `updateTask(taskId, data)` | Updates a task (requires confirmation) |

### Confirmation Pattern
```
User: "Add tomato watering tomorrow."
Agent: "Would you like me to add 'Tomato watering' to your calendar for tomorrow? Please confirm."
User: "Yes, go ahead."
Agent: [Calls createTask()] "Done! The task has been added to your calendar."
```

---

## 📚 RAG Pipeline

```
1. Agricultural documents stored in Document table
2. Document chunks embedded using text-embedding-3-small
3. Embeddings stored in Embedding table (as float arrays)
4. User question → generate query embedding
5. Cosine similarity search → retrieve top-3 relevant chunks
6. Chunks injected as context into agent system prompt
7. Agent answers with grounded, accurate information
```

---

## 🔒 AI Security

- **Agriculture-only**: Off-topic questions are redirected
- **No secrets exposed**: API keys, internals never revealed
- **Confirmation required**: `createTask`/`updateTask` only after user confirmation
- **Uncertainty acknowledged**: Agent says "I'm not sure" when needed
- **Prompt injection resistant**: System prompt enforces strict behavior
- **Tool access controlled**: Only allowed tools available

---

## 🧪 Tests

```bash
cd backend
npm test
```

Tests cover:
- ✅ User registration
- ✅ User login
- ✅ Protected routes (401 without token)
- ✅ Crops CRUD
- ✅ Tasks CRUD

---

## 🐳 Docker

```dockerfile
# Build
docker build -t agrismart-backend ./backend

# Run with environment variables
docker run -p 5000:5000 \
  -e DB_HOST=your_db_host \
  -e DB_NAME=agrismart_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=yourpassword \
  -e JWT_SECRET=yoursecret \
  -e OPENAI_API_KEY=sk-... \
  agrismart-backend
```

---

## 🚀 Installation

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

---

## ⚙️ Environment Variables

```env
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agrismart_db
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-key
AI_MODEL=gpt-4o
```

---

## 🔮 Future Improvements

- [ ] Weather API integration
- [ ] Push notifications for task reminders
- [ ] Offline mode with local SQLite sync
- [ ] Multi-language support (Arabic, French, English)
- [ ] More agricultural document ingestion for RAG
- [ ] Agent streaming responses (SSE)
- [ ] Farm analytics dashboard
- [ ] Crop growth tracking with photo timeline

---

## 👥 Team

**AgriSmart** — Built as a final year project demonstrating full-stack development with AI integration.


