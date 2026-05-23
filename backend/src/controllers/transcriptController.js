import { v4 as uuidv4 } from 'uuid';
import * as store from '../store/index.js';
import { analyzeTranscript as runAnalysis } from '../services/analysisService.js';
import { success, error } from '../utils/response.js';

/**
 * POST /api/transcripts/upload
 * Body: { agent_id: string, turns: Array<{ turn, speaker, timestamp, text }> }
 * Validates, assigns a call_id, and saves to the in-memory store.
 */
export function uploadTranscript(req, res) {
  const { agent_id, turns } = req.body;

  if (!agent_id || typeof agent_id !== 'string') {
    return error(res, 'Request body must include a non-empty "agent_id" string', 400);
  }

  if (!turns || !Array.isArray(turns) || turns.length === 0) {
    return error(res, 'Request body must include a non-empty "turns" array', 400);
  }

  if (!store.getAgentById(agent_id)) {
    return error(res, `No agent found with id '${agent_id}'`, 404);
  }

  const transcript = {
    call_id: `call-${uuidv4()}`,
    agent_id,
    uploaded_at: new Date().toISOString(),
    turns,
    analysis: null,
  };

  store.saveTranscript(transcript);

  return success(res, { call_id: transcript.call_id, transcript }, 201);
}

/**
 * GET /api/transcripts/:call_id
 * Returns a single transcript (with its analysis result if available).
 */
export function getTranscriptById(req, res) {
  const { call_id } = req.params;
  const transcript = store.getTranscriptById(call_id);
  if (!transcript) {
    return error(res, `Transcript with call_id '${call_id}' not found`, 404);
  }
  return success(res, { transcript });
}

/**
 * POST /api/transcripts/:call_id/analyze
 * Fetches the transcript and its agent, runs LLM analysis, and persists the result.
 */
export async function analyzeTranscript(req, res) {
  const { call_id } = req.params;

  const transcript = store.getTranscriptById(call_id);
  if (!transcript) {
    return error(res, `Transcript with call_id '${call_id}' not found`, 404);
  }

  const agent = store.getAgentById(transcript.agent_id);
  if (!agent) {
    return error(res, `Agent '${transcript.agent_id}' associated with this transcript was not found`, 404);
  }

  const analysisResult = await runAnalysis(agent, transcript);

  if (analysisResult.error) {
    return error(res, `LLM analysis failed: ${analysisResult.error}`, 502);
  }

  // Override LLM's holistic score with a deterministic KPI-based score so the
  // number always matches the pass/fail pills the user sees on screen.
  if (Array.isArray(analysisResult.kpi_results) && analysisResult.kpi_results.length > 0) {
    const passed = analysisResult.kpi_results.filter(r => r.passed).length;
    analysisResult.overall_score = Math.round((passed / analysisResult.kpi_results.length) * 100);
  }

  store.saveAnalysis(call_id, analysisResult);

  return success(res, { call_id, agent_id: agent.agent_id, analysis: analysisResult });
}

/**
 * GET /api/transcripts/:call_id/segment-actions
 * Returns all flagged segment actions for a specific call.
 */
export function getSegmentActionsForCall(req, res) {
  const { call_id } = req.params;
  const transcript = store.getTranscriptById(call_id);
  if (!transcript) {
    return error(res, `Transcript with call_id '${call_id}' not found`, 404);
  }
  const actions = store.getSegmentActions(call_id);
  return success(res, { call_id, actions });
}

/**
 * POST /api/transcripts/:call_id/segments/:turn/action
 * Body: { action: "review" | "training" }
 * Flags a specific transcript turn for human review or script training.
 */
export function flagSegment(req, res) {
  const { call_id, turn } = req.params;
  const { action } = req.body;

  if (!['review', 'training'].includes(action)) {
    return error(res, 'Invalid action. Must be review or training', 400);
  }

  const transcript = store.getTranscriptById(call_id);
  if (!transcript) {
    return error(res, `Transcript with call_id '${call_id}' not found`, 404);
  }

  const turnNum = parseInt(turn, 10);
  if (isNaN(turnNum)) {
    return error(res, 'Turn must be a valid integer', 400);
  }

  const result = store.saveSegmentAction(call_id, turnNum, action);
  return success(res, result);
}
