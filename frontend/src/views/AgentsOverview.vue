<template>
  <div>
    <h1 class="page-title">Overview</h1>
    <p class="page-subtitle">All Voice AI agents and their performance at a glance.</p>

    <div v-if="loading" class="loading-state">Loading agents…</div>

    <div v-else-if="agents.length === 0" class="empty-state">
      No agents found. Check your backend connection.
    </div>

    <div v-else class="agents-grid">
      <AgentCard
        v-for="agent in agents"
        :key="agent.agent_id"
        :agent="agent"
        :summary="getSummaryById(agent.agent_id)"
        @click="router.push(`/agents/${agent.agent_id}`)"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAgentsStore } from '../store/agents.js';
import AgentCard from '../components/AgentCard.vue';

const router = useRouter();
const store = useAgentsStore();
const { agents } = storeToRefs(store);
const { getSummaryById } = store;
const loading = ref(true);

onMounted(async () => {
  await store.fetchAgents();
  await Promise.all(agents.value.map((a) => store.fetchAgentSummary(a.agent_id)));
  loading.value = false;
});
</script>

<style scoped>
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.page-subtitle {
  color: var(--text-muted);
  margin-bottom: 28px;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  max-width: 1100px;
}

.loading-state,
.empty-state {
  color: var(--text-muted);
  margin-top: 60px;
  text-align: center;
}
</style>
