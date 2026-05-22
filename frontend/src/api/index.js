import axios from 'axios';

const http = axios.create({ baseURL: '/api' });

export const getAgents = () => http.get('/agents');
export const getAgent = (id) => http.get(`/agents/${id}`);
export const getAgentSummary = (id) => http.get(`/agents/${id}/summary`);
export const getAgentTranscripts = (id) => http.get(`/agents/${id}/transcripts`);
export const uploadTranscript = (payload) => http.post('/transcripts/upload', payload);
export const analyzeTranscript = (callId) => http.post(`/transcripts/${callId}/analyze`);
export const getTranscript = (callId) => http.get(`/transcripts/${callId}`);
