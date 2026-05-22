<template>
  <div v-if="loading" class="loading-state">Loading agent…</div>

  <div v-else-if="!agent" class="empty-state">Agent not found.</div>

  <div v-else class="detail-layout">
    <!-- Header -->
    <div class="page-header">
      <RouterLink to="/" class="back-link">← Overview</RouterLink>
      <h1 class="page-title">{{ agent.name }}</h1>
      <p class="agent-goal">{{ agent.goal }}</p>
    </div>

    <!-- KPIs -->
    <section class="section">
      <h2 class="section-title">Success KPIs</h2>
      <ul class="kpi-list">
        <li v-for="(kpi, i) in agent.kpis" :key="i" class="kpi-item">
          <span class="kpi-index">{{ i + 1 }}</span>
          {{ kpi }}
        </li>
      </ul>
    </section>

    <!-- Calls table -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Call History</h2>
        <button class="btn-upload" @click="showUploadModal = true">+ Upload Transcript</button>
      </div>

      <div v-if="transcripts.length === 0" class="empty-state small">
        No calls yet — upload a transcript to get started.
      </div>

      <table v-else class="calls-table">
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
              <ScoreBadge v-if="t.analysis" :score="t.analysis.overall_score" />
              <span v-else class="dash">—</span>
            </td>
            <td>
              <span class="status-tag" :class="t.analysis ? 'analyzed' : 'pending'">
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
                <span v-if="analyzingIds.has(t.call_id)" class="spinner" />
                <span v-else>Analyze</span>
              </button>
              <RouterLink
                v-else
                :to="`/agents/${agentId}/calls/${t.call_id}`"
                class="btn-view"
              >
                View →
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Recommendations -->
    <section v-if="summary && summary.top_recommendations?.length" class="section">
      <h2 class="section-title">Aggregated Recommendations</h2>
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

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
.loading-state, .empty-state { color: var(--text-muted); margin-top: 60px; text-align: center; }
.empty-state.small { margin-top: 20px; }

.detail-layout { max-width: 1100px; }

.page-header { margin-bottom: 32px; }
.back-link { font-size: 13px; color: var(--text-muted); display: inline-block; margin-bottom: 10px; }
.back-link:hover { color: var(--primary); }
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.agent-goal { color: var(--text-muted); max-width: 700px; line-height: 1.6; }

.section { margin-bottom: 36px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.section-header .section-title { margin-bottom: 0; }

.kpi-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.kpi-item {
  display: flex; align-items: flex-start; gap: 10px;
  background: var(--card-bg); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 16px;
  box-shadow: var(--shadow);
}
.kpi-index {
  min-width: 22px; height: 22px; border-radius: 50%;
  background: var(--primary); color: white;
  font-size: 11px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.calls-table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
.calls-table th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
.calls-table td { padding: 13px 16px; border-bottom: 1px solid var(--border); }
.call-row:last-child td { border-bottom: none; }
.call-row.clickable { cursor: pointer; }
.call-row.clickable:hover { background: #f9fafb; }
.call-id { font-family: monospace; font-size: 12px; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.call-date { white-space: nowrap; }
.dash { color: var(--text-muted); }

.status-tag { font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 12px; }
.status-tag.analyzed { background: #dcfce7; color: #166534; }
.status-tag.pending { background: #f3f4f6; color: var(--text-muted); }

.action-cell { text-align: right; }
.btn-analyze {
  padding: 6px 14px; font-size: 13px; font-weight: 500;
  background: var(--primary); color: white; border: none; border-radius: 6px;
  display: inline-flex; align-items: center; gap: 6px;
  transition: background 0.15s;
}
.btn-analyze:hover:not(:disabled) { background: var(--primary-light); }
.btn-analyze:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-view { font-size: 13px; font-weight: 500; color: var(--primary); }
.btn-view:hover { text-decoration: underline; }

.btn-upload {
  padding: 7px 14px; font-size: 13px; font-weight: 500;
  background: white; color: var(--primary); border: 1.5px solid var(--primary);
  border-radius: 6px; transition: background 0.15s;
}
.btn-upload:hover { background: #f0f4ff; }

.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.recs-list { display: flex; flex-direction: column; gap: 10px; }
</style>
