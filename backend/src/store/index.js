import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load seed data from JSON files
const agents = JSON.parse(readFileSync(join(__dirname, '../../mock-data/agents.json'), 'utf8'));
const transcripts = JSON.parse(readFileSync(join(__dirname, '../../mock-data/transcripts.json'), 'utf8'));

// Ensure seed transcripts have a null analysis slot
transcripts.forEach((t) => {
  if (!('analysis' in t)) t.analysis = null;
});

// ─── Agent accessors ──────────────────────────────────────────────────────────

export function getAgents() {
  return agents;
}

export function getAgentById(id) {
  return agents.find((a) => a.agent_id === id) ?? null;
}

export function updateAgentKPIs(id, kpis) {
  const agent = getAgentById(id);
  if (!agent) return null;
  agent.kpis = kpis;
  return agent;
}

// ─── Transcript accessors ─────────────────────────────────────────────────────

export function getTranscripts() {
  return transcripts;
}

export function getTranscriptById(callId) {
  return transcripts.find((t) => t.call_id === callId) ?? null;
}

export function saveTranscript(transcript) {
  transcripts.push(transcript);
  return transcript;
}

export function saveAnalysis(callId, analysis) {
  const transcript = getTranscriptById(callId);
  if (!transcript) return null;
  transcript.analysis = analysis;
  return transcript;
}

export function getTranscriptsByAgent(agentId) {
  return transcripts.filter((t) => t.agent_id === agentId);
}
