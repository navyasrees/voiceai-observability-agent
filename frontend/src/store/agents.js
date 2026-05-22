import { defineStore } from 'pinia';
import * as api from '../api/index.js';

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agents: [],
    summaries: {},      // agentId -> summary object
    transcripts: {},    // agentId -> [transcript array]
  }),

  getters: {
    getAgentById: (state) => (id) => state.agents.find((a) => a.agent_id === id) ?? null,
    getSummaryById: (state) => (id) => state.summaries[id] ?? null,
    getTranscriptsByAgent: (state) => (id) => state.transcripts[id] ?? [],
  },

  actions: {
    async fetchAgents() {
      const { data } = await api.getAgents();
      this.agents = data.data.agents;
    },

    async fetchAgentSummary(id) {
      const { data } = await api.getAgentSummary(id);
      this.summaries[id] = data.data;
    },

    async fetchAgentTranscripts(id) {
      const { data } = await api.getAgentTranscripts(id);
      this.transcripts[id] = data.data.transcripts;
    },

    updateTranscriptAnalysis(agentId, callId, analysis) {
      const list = this.transcripts[agentId];
      if (!list) return;
      const transcript = list.find((t) => t.call_id === callId);
      if (transcript) transcript.analysis = analysis;
    },
  },
});
