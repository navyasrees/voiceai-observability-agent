<template>
  <div class="agent-card" :class="healthClass">
    <div class="card-header">
      <div class="agent-avatar" :style="{ background: avatarColor }">
        {{ initials }}
      </div>
      <div class="agent-info">
        <h3 class="agent-name">{{ agent.name }}</h3>
        <p class="agent-goal">{{ agent.goal }}</p>
      </div>
      <ScoreBadge :score="summary?.average_score ?? null" size="md" />
    </div>

    <!-- Stats row -->
    <div class="card-stats">
      <div class="stat">
        <span class="stat-value">{{ summary?.total_calls ?? 0 }}</span>
        <span class="stat-label">Total Calls</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value">{{ summary?.analyzed_calls ?? 0 }}</span>
        <span class="stat-label">Analyzed</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value" :class="highCount > 0 ? 'value-red' : ''">{{ highCount }}</span>
        <span class="stat-label">High Flags</span>
      </div>
    </div>

    <!-- KPI pass rate bar -->
    <div v-if="summary?.analyzed_calls > 0" class="kpi-bar-section">
      <div class="kpi-bar-header">
        <span class="kpi-bar-label">KPI Pass Rate</span>
        <span class="kpi-bar-value" :class="passRateClass">{{ kpiPassRate }}%</span>
      </div>
      <div class="kpi-bar-track">
        <div class="kpi-bar-fill" :class="passRateClass" :style="{ width: kpiPassRate + '%' }"></div>
      </div>
    </div>

    <!-- Top failure KPI -->
    <div v-if="topFailingKpi" class="top-failure">
      <svg class="failure-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M8 2L14 13H2L8 2z" stroke-linejoin="round"/>
        <path d="M8 7v3" stroke-linecap="round"/>
        <circle cx="8" cy="11.5" r="0.5" fill="currentColor"/>
      </svg>
      <span class="failure-text">{{ truncate(topFailingKpi, 80) }}</span>
    </div>

    <div class="card-footer">
      <span class="footer-cta">View details</span>
      <svg class="card-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M6 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
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

const avatarColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const avatarColor = computed(() => {
  const i = props.agent.agent_id.charCodeAt(props.agent.agent_id.length - 1) % avatarColors.length;
  return avatarColors[i];
});

const initials = computed(() => {
  return props.agent.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
});

const highCount = computed(() => props.summary?.flagged_severity_counts?.high ?? 0);

const kpiPassRate = computed(() => {
  if (!props.summary?.kpi_pass_rates) return 0;
  const rates = Object.values(props.summary.kpi_pass_rates).map(v => v.pass_rate);
  if (!rates.length) return 0;
  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
});

const passRateClass = computed(() => {
  if (kpiPassRate.value >= 75) return 'rate-green';
  if (kpiPassRate.value >= 50) return 'rate-yellow';
  return 'rate-red';
});

const healthClass = computed(() => {
  const score = props.summary?.average_score;
  if (score === null || score === undefined) return '';
  if (score >= 80) return 'health-good';
  if (score >= 60) return 'health-warn';
  return 'health-bad';
});

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
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: box-shadow var(--transition), transform var(--transition), border-color var(--transition);
  position: relative;
}

.agent-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--border);
  transition: background var(--transition);
}
.health-good::before { background: var(--score-green); }
.health-warn::before { background: var(--score-yellow); }
.health-bad::before  { background: var(--score-red); }

.agent-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--border-strong);
}

/* ─── Header ─────────────────────────────────────── */
.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.agent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.agent-info { flex: 1; min-width: 0; }
.agent-name { font-size: 16px; font-weight: 700; margin-bottom: 3px; color: var(--text); }
.agent-goal {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── Stats ─────────────────────────────────────── */
.card-stats {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 14px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 14px;
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--border);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}
.value-red { color: var(--score-red); }

.stat-label {
  font-size: 10.5px;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

/* ─── KPI bar ────────────────────────────────────── */
.kpi-bar-section { margin-bottom: 12px; }

.kpi-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.kpi-bar-label {
  font-size: 11.5px;
  color: var(--text-muted);
  font-weight: 500;
}

.kpi-bar-value {
  font-size: 12px;
  font-weight: 700;
}
.rate-green { color: var(--score-green); }
.rate-yellow { color: var(--score-yellow); }
.rate-red { color: var(--score-red); }

.kpi-bar-track {
  height: 6px;
  background: var(--border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.kpi-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.kpi-bar-fill.rate-green  { background: var(--score-green); }
.kpi-bar-fill.rate-yellow { background: var(--score-yellow); }
.kpi-bar-fill.rate-red    { background: var(--score-red); }

/* ─── Top failure ────────────────────────────────── */
.top-failure {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 8px 10px;
}

.failure-icon {
  width: 13px;
  height: 13px;
  color: var(--score-red);
  flex-shrink: 0;
  margin-top: 1px;
}

.failure-text {
  font-size: 12px;
  color: #991b1b;
  line-height: 1.4;
}

/* ─── Footer ─────────────────────────────────────── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid var(--border);
}

.footer-cta {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-subtle);
  transition: color var(--transition);
}

.card-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-subtle);
  flex-shrink: 0;
  transition: color var(--transition), transform var(--transition);
}

.agent-card:hover .footer-cta,
.agent-card:hover .card-arrow {
  color: var(--primary);
}
.agent-card:hover .card-arrow {
  transform: translateX(2px);
}
</style>
