import * as store from '../store/index.js';
import { success, error } from '../utils/response.js';

/**
 * GET /api/agents
 * Returns all agents with their KPIs.
 */
export function getAllAgents(req, res) {
  const agents = store.getAgents();
  return success(res, { agents });
}

/**
 * GET /api/agents/:id
 * Returns a single agent by ID.
 */
export function getAgentById(req, res) {
  const { id } = req.params;
  const agent = store.getAgentById(id);
  if (!agent) {
    return error(res, `Agent with id '${id}' not found`, 404);
  }
  return success(res, { agent });
}

/**
 * POST /api/agents/:id/kpis
 * Body: { kpis: string[] }
 * Replaces the agent's KPI list and returns the updated agent.
 */
export function updateAgentKPIs(req, res) {
  const { id } = req.params;
  const { kpis } = req.body;

  if (!kpis || !Array.isArray(kpis) || kpis.length === 0) {
    return error(res, 'Request body must include a non-empty "kpis" array', 400);
  }

  const updated = store.updateAgentKPIs(id, kpis);
  if (!updated) {
    return error(res, `Agent with id '${id}' not found`, 404);
  }

  return success(res, { agent: updated });
}

/**
 * GET /api/agents/:id/transcripts
 * Returns all transcripts (with analysis results) for a given agent.
 */
export function getAgentTranscripts(req, res) {
  const { id } = req.params;
  if (!store.getAgentById(id)) {
    return error(res, `Agent with id '${id}' not found`, 404);
  }
  const transcripts = store.getTranscriptsByAgent(id);
  return success(res, { transcripts });
}

/**
 * GET /api/agents/:id/summary
 * Aggregates analysis results across all analyzed transcripts for an agent.
 */
export function getAgentSummary(req, res) {
  const { id } = req.params;
  const agent = store.getAgentById(id);
  if (!agent) {
    return error(res, `Agent with id '${id}' not found`, 404);
  }

  const transcripts = store.getTranscriptsByAgent(id);
  const analyzed = transcripts.filter((t) => t.analysis !== null);

  if (analyzed.length === 0) {
    return success(res, {
      agent_id: id,
      total_calls: transcripts.length,
      analyzed_calls: 0,
      average_score: null,
      kpi_pass_rates: {},
      top_recommendations: [],
      flagged_severity_counts: { low: 0, medium: 0, high: 0 },
    });
  }

  const scores = analyzed.map((t) => t.analysis.overall_score);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // KPI pass rates
  const kpiTotals = {};
  const kpiPasses = {};
  analyzed.forEach((t) => {
    (t.analysis.kpi_results ?? []).forEach((k) => {
      kpiTotals[k.kpi] = (kpiTotals[k.kpi] ?? 0) + 1;
      if (k.passed) kpiPasses[k.kpi] = (kpiPasses[k.kpi] ?? 0) + 1;
    });
  });
  const kpiPassRates = Object.fromEntries(
    Object.keys(kpiTotals).map((k) => [
      k,
      { pass_rate: Math.round(((kpiPasses[k] ?? 0) / kpiTotals[k]) * 100), total: kpiTotals[k] },
    ])
  );

  // Top 5 most-repeated recommendations
  const recCounts = {};
  analyzed.forEach((t) => {
    (t.analysis.recommendations ?? []).forEach((r) => {
      recCounts[r] = (recCounts[r] ?? 0) + 1;
    });
  });
  const topRecommendations = Object.entries(recCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([rec]) => rec);

  // Flagged segment severity counts
  const severityCounts = { low: 0, medium: 0, high: 0 };
  analyzed.forEach((t) => {
    (t.analysis.flagged_segments ?? []).forEach((s) => {
      const sev = s.severity?.toLowerCase();
      if (sev in severityCounts) severityCounts[sev]++;
    });
  });

  return success(res, {
    agent_id: id,
    agent_name: agent.name,
    total_calls: transcripts.length,
    analyzed_calls: analyzed.length,
    average_score: averageScore,
    kpi_pass_rates: kpiPassRates,
    top_recommendations: topRecommendations,
    flagged_severity_counts: severityCounts,
  });
}
