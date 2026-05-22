# Voice AI Observability Copilot

An AI-powered observability tool that automates the monitoring and analysis of Voice AI agent call transcripts — scoring them against agent KPIs, flagging problem segments, and surfacing actionable recommendations, all powered by Groq (LLaMA 3.3 70B), embedded directly inside HighLevel via a lightweight custom JS widget.

---

## Architecture

The system has two layers — a Node.js/Express backend that runs LLM analysis, and a Vue 3 frontend dashboard that visualizes results. A self-contained JavaScript widget embeds the dashboard into HighLevel as a side panel.

```
HighLevel UI
└── Custom JS Widget  (highlevel-widget.js)
    └── iframe → Vue 3 Dashboard  (Vercel)
                └── Axios → Express Backend  (Railway)
                            └── Groq LLM API
```

**How it works end-to-end:**

1. A call transcript is uploaded (via the dashboard UI or API)
2. The backend stores it in-memory and associates it with the agent
3. The analyst clicks "Analyze" — the backend sends the transcript + agent KPIs to Groq (LLaMA 3.3 70B) via a structured prompt
4. Groq returns a JSON object: overall score, per-KPI pass/fail, flagged segments with severity, and recommendations
5. The dashboard renders the analysis: color-coded score badge, KPI scorecard, flagged turn highlighting in the transcript viewer, and recommendation cards
6. The HighLevel widget embeds the entire dashboard as an iframe in a fixed side panel — accessible from any HL page without leaving the CRM

**Stack:**

| Layer | Technology |
|---|---|
| Backend | Node.js (ESM), Express |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Frontend | Vue 3, Vite, Vue Router, Pinia, Axios |
| State | In-memory store (no database) |
| Embed | HL Marketplace App (OAuth iframe) + Vanilla JS widget fallback |
| Hosting | Railway (backend), Vercel (frontend) |

---

## What is Real vs Mocked

**Real (fully functional):**
- Transcript upload via UI and REST API
- LLM analysis via Groq — real API calls, real JSON responses
- KPI scoring — per-KPI pass/fail evaluation with reason text
- Flagged segment detection with low/medium/high severity
- Actionable recommendations generated per call
- Full dashboard — Overview, Agent Detail, Call Drilldown views
- HighLevel embed — both Marketplace App (OAuth iframe) and Custom JS widget paths are implemented
- OAuth 2.0 flow — `/oauth/initiate`, `/oauth/callback`, `/oauth/status` endpoints are real and functional

**Mocked / Simplified:**
- Real-time transcript streaming from HighLevel's live call API — transcripts are uploaded manually via the UI or API instead; in-memory store resets on server restart
- OAuth token persistence — tokens are stored in-memory only (no database); resets on server restart

---

## How to Run Locally

**Prerequisites:**
- Node.js v18 or later
- A free [Groq API key](https://console.groq.com) — no credit card required

### Step 1 — Clone the repo

```bash
git clone <your-repo-url>
cd voiceai-observability-copilot
```

### Step 2 — Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and add your Groq key:

```
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

### Step 3 — Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 4 — Start the backend

```bash
cd backend
npm run dev
```

Server starts at `http://localhost:3001`

### Step 5 — Start the frontend

Open a second terminal tab:

```bash
cd frontend
npm run dev
```

Dashboard opens at `http://localhost:5173`

The Vite dev server proxies all `/api` requests to the backend — no CORS config needed.

---

## Deployed URLs

| Service | URL |
|---|---|
| Frontend (Vercel) | https://voiceai-observability-agent-fronten.vercel.app |
| Backend (Railway) | https://voiceai-observability-agent-production.up.railway.app |

---

## API Reference

**Transcript & Agent endpoints:**

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

**OAuth endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/oauth/initiate` | Redirect to HL OAuth consent page |
| `GET` | `/oauth/callback` | Receive auth code, exchange for token, store it |
| `GET` | `/oauth/status` | Returns `{ connected: true/false }` |

All API responses follow the same envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "...", "code": 400 }
```

---

## HighLevel Integration

There are two integration paths — a full Marketplace App (recommended) and a Custom JS widget fallback.

### Option A — Marketplace App (Native Embed)

This is the primary integration. The Vue dashboard loads as a native HL app panel via OAuth.

**Step 1 — Register the app** at [marketplace.gohighlevel.com](https://marketplace.gohighlevel.com):
- App Name: `Voice AI Observability Copilot`
- App Type: `Private`, Distribution: `Agency & Sub-account`
- Redirect URL: `https://voiceai-observability-agent-production.up.railway.app/oauth/callback`
- Copy **Client ID** and **Client Secret** → add to `backend/.env`
- Under App Config, set iframe URL: `https://voiceai-observability-agent-fronten.vercel.app`

**Step 2 — Install the app** in your HL sub-account:
- Go to App Marketplace → find Voice AI Copilot → click Install
- HL redirects to `/oauth/initiate` → backend redirects to HL's consent page
- Approve the app → HL sends auth code to `/oauth/callback`
- Backend exchanges code for token, shows "App connected successfully"

**Step 3 — Use the app:**
- Navigate inside the HL sub-account — Voice AI Copilot appears in the HL sidebar
- Clicking it loads the iframe with the full Vue dashboard natively inside HL

### Option B — Custom JS Widget (Fallback)

For quick testing without a Marketplace listing, paste `highlevel-widget.js` into HL:

**Step 1:** Log into your HighLevel sub-account

**Step 2:** Go to **Settings → Company → Custom JavaScript**

**Step 3:** Paste the full contents of `highlevel-widget.js`

**Step 4:** Save — the Voice AI Copilot panel appears on the right side of every HL page

The panel opens by default. Click the header bar to collapse it — a "Voice AI Copilot" button appears in the bottom-right corner to reopen it.

---

## Project Structure

```
voiceai-observability-copilot/
├── highlevel-widget.js             HighLevel embed widget (paste into HL Custom JS)
├── README.md                       This file
├── backend/
│   ├── server.js                   Entry point — Express app setup
│   ├── .env.example                API key + port template
│   ├── mock-data/
│   │   ├── agents.json             Seed agents with goals and KPIs
│   │   └── transcripts.json        Seed call transcripts
│   └── src/
│       ├── routes/
│       │   ├── agents.js
│       │   ├── transcripts.js
│       │   └── oauth.js            HL OAuth flow (initiate, callback, status)
│       ├── controllers/
│       │   ├── agentController.js
│       │   └── transcriptController.js
│       ├── services/
│       │   └── analysisService.js  Groq prompt + JSON parsing
│       ├── store/
│       │   └── index.js            In-memory data store
│       └── utils/
│           └── response.js         Consistent success/error helpers
└── frontend/
    ├── vite.config.js              Vite config + /api proxy
    └── src/
        ├── api/index.js            Axios instance — all API calls
        ├── router/index.js         3 routes: Overview, AgentDetail, CallDrilldown
        ├── store/agents.js         Pinia store
        ├── views/
        │   ├── AgentsOverview.vue
        │   ├── AgentDetail.vue
        │   └── CallDrilldown.vue
        └── components/
            ├── ScoreBadge.vue
            ├── AgentCard.vue
            ├── KpiResultRow.vue
            ├── FlaggedSegment.vue
            ├── RecommendationCard.vue
            ├── TranscriptViewer.vue
            └── UploadTranscriptModal.vue
```

---

## Team of One — Ownership Notes

**Product:** This tool solves a real operational problem — Voice AI teams have no scalable way to monitor agent quality across hundreds of calls. The key product decision was to scope to two tight loops (Monitor + Analyze) rather than overengineer a full platform. The HighLevel embed was chosen as an iframe widget over a full Marketplace app because it ships in hours, not weeks, and demonstrates the core value proposition without requiring HL OAuth approval — the right call for a time-boxed assignment.

**Design:** The UI is intentionally minimal and information-dense — no external component library, just a hand-built design system with CSS custom properties. Color-coded score badges (green/yellow/red thresholds), severity-banded flagged turn highlighting, and a fixed sidebar layout were all chosen to let analysts process call quality at a glance without clicking into every row. The HighLevel widget mirrors HL's own dark-navy `#0f3460` brand color so the panel feels native rather than foreign.

**Engineering:** The backend uses a clean separation of concerns — routes → controllers → services → in-memory store — making it easy to swap the store for a real database later. Groq was chosen over OpenAI for zero-cost LLM calls with comparable quality on structured JSON output tasks. The Vite dev proxy eliminates CORS complexity entirely, and the Pinia store on the frontend caches per-agent data to avoid redundant API calls. The widget is a vanilla JS IIFE — no build step, no dependencies, paste-and-go.

**QA:** All 8 API endpoints were manually verified via curl against live seed data. The frontend was verified against a production Vite build (zero errors). Every async action has a loading state and error state. Known limitations: the in-memory store resets on server restart (by design — no persistence layer scoped for this phase), and real-time transcript ingestion from HighLevel's live call API is mocked with manually uploaded JSON.
