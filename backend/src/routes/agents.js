import { Router } from 'express';
import { getAllAgents, getAgentById, getAgentTranscripts, updateAgentKPIs, getAgentSummary } from '../controllers/agentController.js';

const router = Router();

router.get('/', getAllAgents);
router.get('/:id', getAgentById);
router.get('/:id/transcripts', getAgentTranscripts);
router.post('/:id/kpis', updateAgentKPIs);
router.get('/:id/summary', getAgentSummary);

export default router;
