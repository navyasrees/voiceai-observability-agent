# Voice AI Observability Copilot

An AI-powered observability tool that automates the monitoring and analysis of Voice AI agent call transcripts. Instead of manually reviewing calls, this copilot scores transcripts against agent KPIs, flags problem segments, and surfaces actionable recommendations — all powered by Groq (LLaMA 3.3 70B).

Built for the HighLevel FSB Q2 2026 assignment.

---

## Architecture

```
voiceai-observability-copilot/
├── backend/      Node.js + Express REST API
└── frontend/     Vue 3 + Vite SPA
```

**Two observability loops:**
- **Monitor** — Ingest call transcripts, evaluate each turn against the agent's KPIs, flag deviations with severity scores
- **Analyze** — Dashboard view of all agents and calls, AI-generated recommendations, flagged segment highlighting

**Stack:**
| Layer | Technology |
|---|---|
| Backend | Node.js (ESM), Express |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Frontend | Vue 3, Vite, Vue Router, Pinia, Axios |
| State | In-memory store (no database) |

**What's real vs. mocked:**
- ✅ Real — LLM analysis via Groq, KPI scoring, all API endpoints, frontend dashboard
- 🟡 Mocked — Real-time transcript streaming from HighLevel (transcripts are uploaded manually via the UI or API); in-memory store resets on server restart

---

## Prerequisites

- Node.js v18 or later
- A free [Groq API key](https://console.groq.com)

---

## Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd voiceai-observability-copilot
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set your Groq key:

```
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

> Get a free key at https://console.groq.com — no credit card required.

### 3. Install dependencies

```bash
# From the project root, run both:
cd backend && npm install
cd ../frontend && npm install
```

---

## Running locally

Open two terminal tabs from the project root.

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```
Server starts at `http://localhost:3001`

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
Dashboard opens at `http://localhost:5173`

The Vite dev server proxies all `/api` requests to the backend automatically — no CORS setup needed.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/agents` | List all agents with KPIs |
| `GET` | `/api/agents/:id` | Single agent |
| `GET` | `/api/agents/:id/transcripts` | All calls for an agent |
| `GET` | `/api/agents/:id/summary` | Aggregate metrics (avg score, KPI pass rates, top recs) |
| `POST` | `/api/agents/:id/kpis` | Update agent KPIs |
| `POST` | `/api/transcripts/upload` | Upload a new transcript |
| `GET` | `/api/transcripts/:call_id` | Single transcript + analysis result |
| `POST` | `/api/transcripts/:call_id/analyze` | Run LLM analysis on a transcript |

All responses follow the same envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "...", "code": 400 }
```

---

## Project Structure

```
backend/
├── server.js                   Entry point — Express app setup
├── .env                        API key + port config
├── mock-data/
│   ├── agents.json             Seed agents with goals and KPIs
│   └── transcripts.json        Seed call transcripts
└── src/
    ├── routes/
    │   ├── agents.js
    │   └── transcripts.js
    ├── controllers/
    │   ├── agentController.js
    │   └── transcriptController.js
    ├── services/
    │   └── analysisService.js  Groq prompt + JSON parsing
    ├── store/
    │   └── index.js            In-memory data store
    └── utils/
        └── response.js         Consistent success/error helpers

frontend/
├── vite.config.js              Vite config + /api proxy
├── index.html
└── src/
    ├── main.js
    ├── App.vue                 Sidebar layout + router outlet
    ├── api/index.js            Axios instance — all API calls live here
    ├── router/index.js         3 routes: Overview, AgentDetail, CallDrilldown
    ├── store/agents.js         Pinia store — agents, summaries, transcripts
    ├── views/
    │   ├── AgentsOverview.vue  All agents, score badges, top failure
    │   ├── AgentDetail.vue     KPI list, call history table, analyze button
    │   └── CallDrilldown.vue   Transcript viewer, KPI scorecard, recommendations
    └── components/
        ├── ScoreBadge.vue      Color-coded score pill (green/yellow/red)
        ├── AgentCard.vue       Agent summary card for overview grid
        ├── KpiResultRow.vue    Pass/fail row with reason text
        ├── FlaggedSegment.vue  Color-coded flagged turn card
        ├── RecommendationCard.vue
        ├── TranscriptViewer.vue   Turn-by-turn view with flagged highlights
        └── UploadTranscriptModal.vue
```

---

## Team of One — Ownership Notes

This was built as a solo "Team of One" project covering Product, Design, Engineering, and QA:

- **Product** — Scoped to the two core loops (Monitor + Analyze) from the requirements. Mocked transcript ingestion is clearly documented; all other logic is real.
- **Design** — Consistent design system (color tokens, typography scale, spacing) defined in `global.css`. No external UI library — all components are hand-written.
- **Engineering** — ESM throughout, clean separation of concerns (routes → controllers → services → store), single API layer on the frontend, no logic in templates.
- **QA** — All endpoints manually verified via curl. Frontend verified via production build (`vite build` — zero errors). Error states and loading states on every page and async action.
