<template>
  <!-- Skeleton loading -->
  <div v-if="loading" class="detail-layout">
    <div class="skeleton-header">
      <div class="skeleton sk-back"></div>
      <div class="sk-title-row">
        <div class="skeleton sk-avatar-lg"></div>
        <div class="sk-title-lines">
          <div class="skeleton sk-title"></div>
          <div class="skeleton sk-subtitle"></div>
        </div>
      </div>
    </div>
    <div class="skeleton sk-section"></div>
    <div class="skeleton sk-table"></div>
  </div>

  <div v-else-if="!agent" class="empty-state-full">
    <p>Agent not found.</p>
  </div>

  <div v-else class="detail-layout">
    <!-- Header -->
    <div class="page-header">
      <RouterLink to="/" class="back-link">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 4L6 8l4 4"/>
        </svg>
        Overview
      </RouterLink>

      <div class="agent-header-card">
        <div class="agent-avatar" :style="{ background: avatarColor }">{{ initials }}</div>
        <div class="agent-header-info">
          <h1 class="page-title">{{ agent.name }}</h1>
          <p class="agent-goal">{{ agent.goal }}</p>
        </div>
        <div v-if="summary" class="header-score">
          <ScoreBadge :score="summary.average_score ?? null" size="lg" />
          <span class="score-label">Avg Score</span>
        </div>
      </div>
    </div>

    <!-- KPIs -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">
          <svg class="section-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 2l2 5h5l-4 3 1.5 5L9 12l-4.5 3L6 10 2 7h5z"/>
          </svg>
          Success KPIs
        </h2>
        <div class="header-actions">
          <span class="count-badge">{{ agent.kpis.length }}</span>
          <button v-if="!isEditingKpis" class="btn-edit-kpis" @click="isEditingKpis = true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 2.5l2.5 2.5-7 7H4V9.5l7-7z"/>
            </svg>
            Edit KPIs
          </button>
        </div>
      </div>

      <KpiEditor
        v-if="isEditingKpis"
        :kpis="agent.kpis"
        :agent-id="agentId"
        @saved="onKpisSaved"
        @cancel="isEditingKpis = false"
      />
      <ul v-else class="kpi-list">
        <li v-for="(kpi, i) in agent.kpis" :key="i" class="kpi-item">
          <span class="kpi-index">{{ i + 1 }}</span>
          <span class="kpi-text">{{ kpi }}</span>
        </li>
      </ul>
    </section>

    <!-- Calls table -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">
          <svg class="section-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 9a5 5 0 0 1-5 5m5-5a5 5 0 0 0-5-5m5 5H3m6 5v-1.5M9 4V2.5"/>
            <circle cx="9" cy="9" r="1.5"/>
          </svg>
          Call History
        </h2>
        <div class="header-actions">
          <span v-if="transcripts.length > 0" class="count-badge">{{ transcripts.length }}</span>
          <button class="btn-upload" @click="showUploadModal = true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 10V3M5 6l3-3 3 3"/>
              <path d="M3 12h10"/>
            </svg>
            Upload Transcript
          </button>
        </div>
      </div>

      <!-- Empty call state -->
      <div v-if="transcripts.length === 0" class="empty-calls">
        <div class="empty-calls-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" fill="#f3f4f6"/>
            <rect x="14" y="18" width="20" height="14" rx="3" stroke="#d1d5db" stroke-width="2"/>
            <path d="M18 22h12M18 26h8" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-calls-text">No calls yet — upload a transcript to get started.</p>
        <button class="btn-upload-cta" @click="showUploadModal = true">Upload First Transcript</button>
      </div>

      <div v-else class="table-wrap">
        <table class="calls-table">
          <thead>
            <tr>
              <th>Call ID</th>
              <th>Date</th>
              <th>Score</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in transcripts"
              :key="t.call_id"
              class="call-row"
              :class="{ clickable: t.analysis }"
              @click="t.analysis && router.push(`/agents/${agentId}/calls/${t.call_id}`)"
            >
              <td class="call-id">{{ t.call_id }}</td>
              <td class="call-date">{{ formatDate(t.uploaded_at) }}</td>
              <td>
                <ScoreBadge v-if="t.analysis" :score="t.analysis.overall_score" size="sm" />
                <span v-else class="dash">—</span>
              </td>
              <td>
                <span class="status-tag" :class="t.analysis ? 'analyzed' : 'pending'">
                  <span class="status-dot"></span>
                  {{ t.analysis ? 'Analyzed' : 'Pending' }}
                </span>
              </td>
              <td class="action-cell" @click.stop>
                <button
                  v-if="!t.analysis"
                  class="btn-analyze"
                  :disabled="analyzingIds.has(t.call_id)"
                  @click="runAnalysis(t.call_id)"
                >
                  <svg v-if="!analyzingIds.has(t.call_id)" class="analyze-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="8" r="5.5"/>
                    <path d="M8 5.5v2.5l1.5 1.5"/>
                  </svg>
                  <span v-if="analyzingIds.has(t.call_id)" class="spinner" />
                  <span>{{ analyzingIds.has(t.call_id) ? 'Analyzing…' : 'Analyze' }}</span>
                </button>
                <RouterLink
                  v-else
                  :to="`/agents/${agentId}/calls/${t.call_id}`"
                  class="btn-view"
                >
                  View
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 3l4 4-4 4"/>
                  </svg>
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Aggregated Recommendations -->
    <section v-if="summary && summary.top_recommendations?.length" class="section">
      <div class="section-header">
        <h2 class="section-title">
          <svg class="section-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 2a5 5 0 0 1 3.5 8.5c-.5.6-.8 1.3-.8 2H6.3c0-.7-.3-1.4-.8-2A5 5 0 0 1 9 2z"/>
            <path d="M6.5 14h5M7 16h4"/>
          </svg>
          Aggregated Recommendations
        </h2>
        <span class="count-badge">{{ summary.top_recommendations.length }}</span>
      </div>
      <div class="recs-list">
        <RecommendationCard
          v-for="(rec, i) in summary.top_recommendations"
          :key="i"
          :recommendation="rec"
        />
      </div>
    </section>

    <UploadTranscriptModal
      v-if="showUploadModal"
      :agent-id="agentId"
      @close="showUploadModal = false"
      @uploaded="onUploaded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAgentsStore } from '../store/agents.js';
import { analyzeTranscript } from '../api/index.js';
import ScoreBadge from '../components/ScoreBadge.vue';
import RecommendationCard from '../components/RecommendationCard.vue';
import UploadTranscriptModal from '../components/UploadTranscriptModal.vue';
import KpiEditor from '../components/KpiEditor.vue';

const route = useRoute();
const router = useRouter();
const store = useAgentsStore();

const agentId = computed(() => route.params.id);
const agent = computed(() => store.getAgentById(agentId.value));
const summary = computed(() => store.getSummaryById(agentId.value));
const transcripts = computed(() => store.getTranscriptsByAgent(agentId.value));

const loading = ref(true);
const showUploadModal = ref(false);
const analyzingIds = ref(new Set());
const isEditingKpis = ref(false);

const avatarColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const avatarColor = computed(() => {
  if (!agent.value) return '#3b82f6';
  const i = agent.value.agent_id.charCodeAt(agent.value.agent_id.length - 1) % avatarColors.length;
  return avatarColors[i];
});
const initials = computed(() => {
  if (!agent.value) return '?';
  return agent.value.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
});

onMounted(async () => {
  await Promise.all([
    store.fetchAgents(),
    store.fetchAgentSummary(agentId.value),
    store.fetchAgentTranscripts(agentId.value),
  ]);
  loading.value = false;
});

async function runAnalysis(callId) {
  analyzingIds.value = new Set([...analyzingIds.value, callId]);
  try {
    const { data } = await analyzeTranscript(callId);
    store.updateTranscriptAnalysis(agentId.value, callId, data.data.analysis);
    await store.fetchAgentSummary(agentId.value);
  } finally {
    const next = new Set(analyzingIds.value);
    next.delete(callId);
    analyzingIds.value = next;
  }
}

async function onUploaded() {
  showUploadModal.value = false;
  await store.fetchAgentTranscripts(agentId.value);
}

function onKpisSaved(newKpis) {
  agent.value.kpis = [...newKpis];
  isEditingKpis.value = false;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
.empty-state-full { color: var(--text-muted); margin-top: 60px; text-align: center; }
.detail-layout { max-width: 1100px; }

/* ─── Skeleton ───────────────────────────────────── */
.skeleton-header { margin-bottom: 32px; }
.sk-back  { height: 14px; width: 80px; margin-bottom: 14px; }
.sk-title-row { display: flex; align-items: center; gap: 16px; }
.sk-avatar-lg { width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0; }
.sk-title-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk-title    { height: 22px; width: 40%; }
.sk-subtitle { height: 13px; width: 70%; }
.sk-section  { height: 100px; margin-bottom: 20px; }
.sk-table    { height: 160px; }

/* ─── Header ─────────────────────────────────────── */
.page-header { margin-bottom: 32px; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 14px;
  transition: color var(--transition);
}
.back-link svg { width: 14px; height: 14px; }
.back-link:hover { color: var(--primary); }

.agent-header-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: var(--shadow);
}

.agent-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.agent-header-info { flex: 1; min-width: 0; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.01em; }
.agent-goal { color: var(--text-muted); font-size: 13.5px; line-height: 1.5; max-width: 600px; }

.header-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.score-label {
  font-size: 11px;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

/* ─── Section ────────────────────────────────────── */
.section { margin-bottom: 36px; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.section-icon {
  width: 16px;
  height: 16px;
  color: var(--primary);
  flex-shrink: 0;
}

.count-badge {
  background: var(--primary-subtle);
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: var(--radius-full);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ─── Edit KPIs button ───────────────────────────── */
.btn-edit-kpis {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  background: white;
  border: 1.5px solid var(--primary);
  border-radius: 6px;
  transition: background 0.15s;
}
.btn-edit-kpis:hover { background: var(--primary-subtle); }
.btn-edit-kpis svg { width: 11px; height: 11px; }

/* ─── KPI list ───────────────────────────────────── */
.kpi-list { list-style: none; display: flex; flex-direction: column; gap: 7px; }

.kpi-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition);
}
.kpi-item:hover { border-color: var(--border-strong); }

.kpi-index {
  min-width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.kpi-text { font-size: 13.5px; line-height: 1.5; color: var(--text); }

/* ─── Calls table ────────────────────────────────── */
.table-wrap {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow);
}

.calls-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
}

.calls-table th {
  text-align: left;
  padding: 11px 16px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1.5px solid var(--border);
  background: #fafafa;
}

.calls-table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.call-row:last-child td { border-bottom: none; }
.call-row.clickable { cursor: pointer; }
.call-row.clickable:hover td { background: #f9fafb; }

.call-id {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-muted);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.call-date { white-space: nowrap; font-size: 13.5px; }
.dash { color: var(--text-subtle); }

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: var(--radius-full);
}
.status-tag.analyzed { background: #dcfce7; color: #15803d; }
.status-tag.pending  { background: #f3f4f6; color: var(--text-muted); }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-tag.analyzed .status-dot { background: #16a34a; }
.status-tag.pending  .status-dot { background: #9ca3af; }

/* ─── Action buttons ─────────────────────────────── */
.action-cell { text-align: right; }

.btn-analyze {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 7px;
  transition: background var(--transition), box-shadow var(--transition);
}
.btn-analyze:hover:not(:disabled) {
  background: var(--primary-light);
  box-shadow: 0 2px 8px rgba(15,52,96,0.25);
}
.btn-analyze:disabled { opacity: 0.65; cursor: not-allowed; }

.analyze-icon { width: 14px; height: 14px; }

.btn-view {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
  padding: 7px 12px;
  border-radius: 7px;
  transition: background var(--transition);
}
.btn-view:hover { background: var(--primary-subtle); }
.btn-view svg { width: 12px; height: 12px; }

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  background: white;
  color: var(--primary);
  border: 1.5px solid var(--primary);
  border-radius: 7px;
  transition: background var(--transition);
}
.btn-upload svg { width: 14px; height: 14px; }
.btn-upload:hover { background: var(--primary-subtle); }

/* ─── Empty calls ────────────────────────────────── */
.empty-calls {
  background: var(--card-bg);
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 48px 20px;
  text-align: center;
}
.empty-calls-icon { width: 60px; height: 60px; margin: 0 auto 14px; }
.empty-calls-icon svg { width: 100%; height: 100%; }
.empty-calls-text { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; }
.btn-upload-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  font-size: 13.5px;
  font-weight: 600;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  transition: background var(--transition), box-shadow var(--transition);
}
.btn-upload-cta:hover {
  background: var(--primary-light);
  box-shadow: 0 2px 8px rgba(15,52,96,0.25);
}

/* ─── Spinner ─────────────────────────────────────── */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Recs ────────────────────────────────────────── */
.recs-list { display: flex; flex-direction: column; gap: 10px; }
</style>
