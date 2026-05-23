import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'
const http = axios.create({ baseURL: baseURL });

export const getAgents = () => http.get('/agents');
export const getAgent = (id) => http.get(`/agents/${id}`);
export const getAgentSummary = (id) => http.get(`/agents/${id}/summary`);
export const getAgentTranscripts = (id) => http.get(`/agents/${id}/transcripts`);
export const uploadTranscript = (payload) => http.post('/transcripts/upload', payload);
export const analyzeTranscript = (callId) => http.post(`/transcripts/${callId}/analyze`);
export const getTranscript = (callId) => http.get(`/transcripts/${callId}`);
export const updateAgentKpis = (id, kpis) => http.post(`/agents/${id}/kpis`, { kpis });
export const flagSegment = (callId, turn, action) => http.post(`/transcripts/${callId}/segments/${turn}/action`, { action });
export const getCallSegmentActions = (callId) => http.get(`/transcripts/${callId}/segment-actions`);
export const getAgentSegmentActions = (agentId) => http.get(`/agents/${agentId}/segment-actions`);
