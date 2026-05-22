<template>
  <div class="agent-card">
    <div class="card-header">
      <div>
        <h3 class="agent-name">{{ agent.name }}</h3>
        <p class="agent-goal">{{ truncate(agent.goal, 90) }}</p>
      </div>
      <ScoreBadge :score="summary?.average_score ?? null" size="md" />
    </div>

    <div class="card-stats">
      <div class="stat">
        <span class="stat-value">{{ summary?.total_calls ?? 0 }}</span>
        <span class="stat-label">Total Calls</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ summary?.analyzed_calls ?? 0 }}</span>
        <span class="stat-label">Analyzed</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ highCount }}</span>
        <span class="stat-label">High Flags</span>
      </div>
    </div>

    <div v-if="topFailingKpi" class="top-failure">
      <span class="failure-label">Top Failure</span>
      <span class="failure-text">{{ truncate(topFailingKpi, 80) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ScoreBadge from './ScoreBadge.vue';

const props = defineProps({
  agent: { type: Object, required: true },
  summary: { type: Object, default: null },
});

const highCount = computed(() => props.summary?.flagged_severity_counts?.high ?? 0);

const topFailingKpi = computed(() => {
  if (!props.summary?.kpi_pass_rates) return null;
  const entries = Object.entries(props.summary.kpi_pass_rates);
  if (!entries.length) return null;
  const sorted = entries.sort((a, b) => a[1].pass_rate - b[1].pass_rate);
  return sorted[0][1].pass_rate < 100 ? sorted[0][0] : null;
});

function truncate(str, len) {
  return str?.length > len ? str.slice(0, len) + '…' : str;
}
</script>

<style scoped>
.agent-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}
.agent-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.agent-name { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.agent-goal { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

.card-stats {
  display: flex;
  gap: 20px;
  padding: 14px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 14px;
}
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-value { font-size: 20px; font-weight: 700; color: var(--text); }
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.top-failure { display: flex; flex-direction: column; gap: 4px; }
.failure-label { font-size: 11px; font-weight: 600; color: var(--score-red); text-transform: uppercase; letter-spacing: 0.05em; }
.failure-text { font-size: 12.5px; color: var(--text-muted); line-height: 1.4; }
</style>
