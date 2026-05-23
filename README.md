# Voice AI Observability Copilot

An AI-powered observability tool for HighLevel Voice AI agents that automatically monitors call transcripts, scores performance against custom KPIs, flags deviations, and surfaces actionable script and prompt recommendations — embedded natively inside HighLevel.

---

## Architecture

```
HighLevel UI (Agency Dashboard)
  └── Marketplace App (OAuth 2.0 install)
        └── Custom Page iframe → Vue 3 Dashboard (Vercel)
                    └── Axios → Express Backend (Railway)
                                  └── Groq LLM API
```

The backend is a Node.js Express server with an in-memory store that handles transcript ingestion, per-agent KPI management, and LLM orchestration via the Groq API. The frontend is a Vue 3 single-page application (Vite + Pinia + Vue Router) providing an agent overview dashboard, per-agent call history, and a full call drilldown view with transcript viewer and analysis panels. Call analysis is powered by Groq's `llama-3.3-70b-versatile` model, which evaluates each transcript against the agent's configured KPIs and returns a structured JSON object containing an overall score, per-KPI pass/fail results, flagged segments with severity ratings, and typed recommendations. The tool is embedded inside HighLevel as a private Marketplace App — it installs via OAuth 2.0 and loads the Vue dashboard as an iframe in the HL agency sidebar, making it feel native to the platform.

---

## What is Real vs Mocked

**Real (fully functional):**

- Transcript upload and ingestion via dashboard UI and REST API
- LLM-based call analysis via Groq — KPI scoring, flagged segment detection, typed recommendations
- Editable KPIs per agent directly from the dashboard UI
- Use Actions — flagging segments for human review or script training, persisted in-memory and confirmed via API
- Aggregate metrics across all analyzed calls (average score, KPI pass rates, top recommendations)
- HighLevel Marketplace App install with OAuth 2.0 (initiate → consent → callback → token storage)
- Full Vue 3 dashboard embedded natively inside HighLevel as an iframe

**Mocked (documented limitations):**

- Real-time transcript streaming from the HighLevel live call API — transcripts are uploaded manually via the UI or REST API instead
- Persistent database — the in-memory store resets on server restart; no database is connected
- HighLevel Marketplace App review — the app is private/draft status; install is via direct link rather than the public marketplace

---

## How to Run Locally

**Prerequisites:** Node.js 18+, a free Groq API key from [console.groq.com](https://console.groq.com)

**Backend:**

```bash
git clone https://github.com/navyasrees/voiceai-observability-agent
cd voiceai-observability-agent/backend
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
npm start
# Backend runs on http://localhost:3001
```

**Frontend:**

```bash
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

The Vite dev server proxies all `/api` requests to `http://localhost:3001` — no CORS configuration needed locally.

---

## Deployed URLs

| Service | URL |
|---|---|
| Frontend (Vercel) | https://voiceai-observability-agent-fronten.vercel.app |
| Backend (Railway) | https://voiceai-observability-agent-production.up.railway.app |

---

## HighLevel Integration

This tool is embedded inside HighLevel as a private Marketplace App. To install:

1. Open your HighLevel agency account
2. Navigate to the install link: https://marketplace.gohighlevel.com/v2/oauth/chooselocation?response_type=code&redirect_uri=https%3A%2F%2Fvoiceai-observability-agent-production.up.railway.app%2Foauth%2Fcallback&scope=locations.readonly&version_id=6a1052a70b5e7f83ed23c187
3. Click **Install** and approve the OAuth permissions
4. You will see "Voice AI Copilot connected successfully"
5. Return to your HighLevel agency dashboard
6. Scroll down the left sidebar — click **Observability Copilot**
7. The full dashboard loads natively inside HighLevel

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
| `POST` | `/api/transcripts/:call_id/segments/:turn/action` | Flag a segment for review or training |
| `GET` | `/oauth/initiate` | Redirect to HL OAuth consent page |
| `GET` | `/oauth/callback` | Exchange auth code for token |
| `GET` | `/oauth/status` | Returns `{ connected: true/false }` |

All responses follow the envelope: `{ "success": true, "data": { ... } }` or `{ "success": false, "message": "...", "code": 400 }`.

---

## Team of One: Ownership Notes

**Product.** The core product decision was to build around two tight loops — Monitor (upload transcripts, view aggregate health) and Analyze (score against KPIs, surface flags and recommendations) — rather than overengineer a full platform in a time-boxed assignment. The iframe embed approach was chosen over a full Marketplace App submission because it ships in hours rather than weeks and demonstrates the value proposition without waiting for HL app review; a proper Marketplace listing would be the next step for a production release. KPI editing from the UI was added to close the observability parameter loop required by the assignment — users can now define what "good" looks like for each agent and immediately run analysis against those updated criteria. Groq was chosen over OpenAI because it offers zero-cost LLM calls with comparable structured JSON output quality, which matters when you need to iterate quickly on prompt design without burning API credits.

**Design.** The color-coded score badge system uses green (≥80), yellow (≥60), and red (<60) thresholds with matching background fills and borders, so quality is scannable at a glance without reading a number. The transcript viewer uses left-border severity coloring on flagged turns rather than inline highlights because it avoids disrupting the reading flow — the eye catches the border first and then reads into the reason callout below. Recommendations appear in two places by design: per-call in the drilldown view (for immediate action after reviewing a specific call) and aggregated on the agent page (for identifying systemic patterns across many calls). The Use Actions buttons use orange for human review and blue for script training because these map to conventional urgency associations — orange signals "a person needs to look at this" while blue signals "add this to the training pipeline."

**Engineering.** The in-memory store was a deliberate scope decision: it eliminates the database setup and schema migration overhead that would be irrelevant for an assignment demo, while the clean separation of routes → controllers → services → store makes it straightforward to swap in a real database later by replacing only the store layer. The LLM prompt is designed around typed recommendations — `PROMPT CHANGE`, `SCRIPT CHANGE`, and `AGENT ADJUSTMENT` — because requiring a type prefix forces the model to think categorically about what kind of change is needed before writing the specific wording, which consistently produces more actionable output than open-ended instruction. In development, the Vite dev proxy routes `/api` to `localhost:3001`, eliminating CORS complexity; in production, the `VITE_API_URL` environment variable overrides this to point at the Railway deployment. Component size was kept under 150 lines wherever possible by extracting sub-components — for example, `KpiEditor.vue` handles all edit-mode logic so `AgentDetail.vue` stays focused on layout and data fetching.

**QA.** All 12 API endpoints were manually verified via curl against live seed data, including the new segment action endpoint which correctly rejects invalid action values and non-existent call IDs. The frontend was verified against a production Vite build with zero errors. Every async action has a loading state (spinner) and error state (inline message). The known limitations are: the in-memory store resets on server restart (by design — no persistence layer in this phase), there is no authentication on API endpoints (single-tenant demo environment only), and the app is single-tenant (one HighLevel location per server instance). For a production deployment the next steps would be: add a persistent database (PostgreSQL or MongoDB) for transcripts and analysis results, set up a webhook listener for HighLevel's live call API to replace manual upload, add per-request API key authentication, and implement multi-tenant isolation keyed by HL location ID.