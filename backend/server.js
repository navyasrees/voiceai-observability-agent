import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import transcriptRoutes from './src/routes/transcripts.js';
import agentRoutes from './src/routes/agents.js';
import { error } from './src/utils/response.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/agents', agentRoutes);

// 404 handler
app.use((req, res) => {
  error(res, `Route ${req.method} ${req.path} not found`, 404);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  error(res, err.message || 'Internal server error', 500);
});

app.listen(PORT, () => {
  console.log(`Voice AI Observability Copilot running on port ${PORT}`);
});

export default app;
