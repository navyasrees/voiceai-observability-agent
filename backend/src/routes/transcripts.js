import { Router } from 'express';
import { uploadTranscript, getTranscriptById, analyzeTranscript, flagSegment, getSegmentActionsForCall } from '../controllers/transcriptController.js';

const router = Router();

router.post('/upload', uploadTranscript);
router.get('/:call_id', getTranscriptById);
router.post('/:call_id/analyze', analyzeTranscript);
router.get('/:call_id/segment-actions', getSegmentActionsForCall);
router.post('/:call_id/segments/:turn/action', flagSegment);

export default router;
