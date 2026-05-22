<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Agent Overview</h1>
        <p class="page-subtitle">Monitor all Voice AI agents and their call performance at a glance.</p>
      </div>
      <div v-if="!loading && agents.length > 0" class="header-stats">
        <div class="header-stat">
          <span class="header-stat-num">{{ agents.length }}</span>
          <span class="header-stat-label">Agents</span>
        </div>
        <div class="header-stat">
          <span class="header-stat-num">{{ totalCalls }}</span>
          <span class="header-stat-label">Total Calls</span>
        </div>
        <div class="header-stat">
          <span class="header-stat-num">{{ analyzedCalls }}</span>
          <span class="header-stat-label">Analyzed</span>
        </div>
      </div>
    </div>

    <!-- Skeleton loading -->
    <div v-if="loading" class="agents-grid">
      <div v-for="i in 2" :key="i" class="skeleton-card">
        <div class="sk-header">
          <div class="skeleton sk-avatar"></div>
          <div class="sk-lines">
            <div class="skeleton sk-line-lg"></div>
            <div class="skeleton sk-line-sm"></div>
          </div>
          <div class="skeleton sk-badge"></div>
        </div>
        <div class="skeleton sk-stats"></div>
        <div class="skeleton sk-bar"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="agents.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#f3f4f6"/>
          <rect x="20" y="28" width="4" height="8"  rx="2" fill="#d1d5db"/>
          <rect x="27" y="22" width="4" height="20" rx="2" fill="#d1d5db"/>
          <rect x="34" y="18" width="4" height="28" rx="2" fill="#9ca3af"/>
          <rect x="41" y="24" width="4" height="16" rx="2" fill="#d1d5db"/>
        </svg>
      </div>
      <h3 class="empty-title">No agents found</h3>
      <p class="empty-desc">Make sure the backend is running and agents are seeded.</p>
    </div>

    <!-- Agent grid -->
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
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAgentsStore } from '../store/agents.js';
import AgentCard from '../components/AgentCard.vue';

const router = useRouter();
const store = useAgentsStore();
const { agents } = storeToRefs(store);
const { getSummaryById } = store;
const loading = ref(true);

const totalCalls = computed(() =>
  agents.value.reduce((sum, a) => sum + (getSummaryById(a.agent_id)?.total_calls ?? 0), 0)
);
const analyzedCalls = computed(() =>
  agents.value.reduce((sum, a) => sum + (getSummaryById(a.agent_id)?.analyzed_calls ?? 0), 0)
);

onMounted(async () => {
  await store.fetchAgents();
  await Promise.all(agents.value.map((a) => store.fetchAgentSummary(a.agent_id)));
  loading.value = false;
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 14px;
}

/* ─── Header stats ───────────────────────────────── */
.header-stats {
  display: flex;
  gap: 0;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.header-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 22px;
  gap: 2px;
  border-right: 1px solid var(--border);
}
.header-stat:last-child { border-right: none; }

.header-stat-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}
.header-stat-label {
  font-size: 11px;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

/* ─── Grid ───────────────────────────────────────── */
.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  max-width: 1100px;
}

/* ─── Skeleton ───────────────────────────────────── */
.skeleton-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.sk-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.sk-avatar { width: 40px; height: 40px; border-radius: 10px; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; padding-top: 4px; }
.sk-line-lg { height: 14px; width: 65%; }
.sk-line-sm { height: 10px; width: 90%; }
.sk-badge { width: 52px; height: 28px; border-radius: 20px; }
.sk-stats { height: 48px; margin-bottom: 12px; }
.sk-bar { height: 20px; }

/* ─── Empty ──────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}
.empty-icon svg { width: 100%; height: 100%; }

.empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13.5px;
  color: var(--text-muted);
}
</style>
