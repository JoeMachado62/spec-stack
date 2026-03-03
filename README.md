# 🧬 Spec Stack

**Turn your plain-language business ideas into AI-ready specifications.**

Spec Stack is a SaaS application that guides solopreneurs and small teams from a raw idea to a complete, agent-executable specification — a structured document that an autonomous AI agent can execute without human intervention.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Google Gemini API key

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/JoeMachado62/spec-stack.git
cd spec-stack

# 2. Set up environment
cp .env.example .env
# Edit .env with your database URL and API keys

# 3. Install dependencies
cd server && npm install
cd ../client && npm install

# 4. Set up database
cd ../server && npm run db:seed

# 5. Start the backend
npm run dev

# 6. Start the frontend (new terminal)
cd ../client && npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Architecture

```
spec-stack/
├── client/                    # React (Vite) + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # ScoreRing, StageProgress, LoadingOverlay
│   │   │   ├── layout/        # AppLayout (sidebar + main content)
│   │   │   └── stages/        # Stage1-4 workflow components
│   │   ├── pages/             # Route-level pages
│   │   ├── services/          # API service layer (Axios)
│   │   ├── store/             # Zustand state management
│   │   └── index.css          # Design system (Tailwind + custom)
│   └── vite.config.js
├── server/                    # Node.js (Express) backend
│   ├── config/                # Database configuration
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth, rate limiting
│   ├── models/                # Sequelize models
│   ├── routes/                # Express routes
│   ├── seeds/                 # Seed data (20 example specs)
│   ├── services/              # AI service (LangChain + Gemini)
│   └── utils/                 # Plain-language engine, scoring
└── .env                       # Environment configuration
```

## 📋 The Four-Stage Workflow

| Stage | Plain Language | What It Does |
|-------|---------------|--------------|
| **1. Prompt Craft** | "Clear Instructions" | Transform raw ideas into structured prompts |
| **2. Context Eng.** | "What the AI Needs to Know" | Build the AI's knowledge base |
| **3. Intent Eng.** | "What the AI Should Care About" | Define priorities and trade-offs |
| **4. Spec Eng.** | "The Master Plan" | Generate complete agent-executable specification |

## 🎯 Key Features (Phase 1)

- **4-Stage Workflow** — Guided process from idea to spec
- **Domain Matching** — 20 pre-built example specs across business types
- **Plain-Language Engine** — Zero engineering jargon in the UI
- **Visual Flowchart** — React Flow-powered spec visualization
- **Completeness Scoring** — Real-time 0-100 spec quality score
- **Multi-Format Export** — Markdown, claude.md, JSON
- **Signal-to-Noise Meter** — Token budget visualization
- **Constraint Badges** — Visual must/must-not/escalation indicators

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS v4, React Flow |
| Backend | Node.js (Express) |
| Database | PostgreSQL (Sequelize ORM) |
| AI | LangChain + Google Gemini |
| State | Zustand |
| API | Axios + React Query |

## 📄 License

MIT
