import { Router } from 'express';
import { uploadTranscript, getTranscriptById, analyzeTranscript } from '../controllers/transcriptController.js';

const router = Router();

router.post('/upload', uploadTranscript);
router.get('/:call_id', getTranscriptById);
router.post('/:call_id/analyze', analyzeTranscript);

export default router;
