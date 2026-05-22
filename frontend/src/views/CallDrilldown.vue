<template>
  <div v-if="loading" class="loading-state">Loading call…</div>

  <div v-else-if="!transcript" class="empty-state">Transcript not found.</div>

  <div v-else class="drilldown-layout">
    <!-- Header -->
    <div class="page-header">
      <RouterLink :to="`/agents/${agentId}`" class="back-link">← {{ agentName }}</RouterLink>
      <div class="header-row">
        <div>
          <h1 class="page-title">Call Drilldown</h1>
          <p class="call-meta">{{ transcript.call_id }} &nbsp;·&nbsp; {{ formatDate(transcript.uploaded_at) }}</p>
        </div>
        <ScoreBadge v-if="analysis" :score="analysis.overall_score" size="lg" />
      </div>
    </div>

    <div v-if="!analysis" class="no-analysis-banner">
      This call has not been analyzed yet. Go back to the agent page and click Analyze.
    </div>

    <!-- Split layout -->
    <div class="split-layout">
      <!-- Left: transcript -->
      <div class="panel panel-left">
        <h2 class="panel-title">Transcript</h2>
        <TranscriptViewer
          :turns="transcript.turns"
          :flagged-segments="analysis?.flagged_segments ?? []"
        />
      </div>

      <!-- Right: KPI scorecard + use actions + recommendations -->
      <div class="panel panel-right">
        <template v-if="analysis">
          <h2 class="panel-title">KPI Scorecard</h2>
          <div class="kpi-scorecard">
            <KpiResultRow
              v-for="(result, i) in analysis.kpi_results"
              :key="i"
              :result="result"
            />
          </div>

          <h2 class="panel-title" style="margin-top: 28px;">Use Actions</h2>
          <div v-if="analysis.flagged_segments?.length === 0" class="empty-state small">
            No flagged segments.
          </div>
          <div class="flagged-list">
            <FlaggedSegment
              v-for="(seg, i) in analysis.flagged_segments"
              :key="i"
              :segment="seg"
            />
          </div>

          <h2 class="panel-title" style="margin-top: 28px;">Recommendations</h2>
          <div v-if="analysis.recommendations?.length === 0" class="empty-state small">
            No recommendations.
          </div>
          <div class="recs-list">
            <RecommendationCard
              v-for="(rec, i) in analysis.recommendations"
              :key="i"
              :recommendation="rec"
            />
          </div>
        </template>

        <div v-else class="empty-state small">Run analysis to see KPI results.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { getTranscript } from '../api/index.js';
import { useAgentsStore } from '../store/agents.js';
import ScoreBadge from '../components/ScoreBadge.vue';
import TranscriptViewer from '../components/TranscriptViewer.vue';
import KpiResultRow from '../components/KpiResultRow.vue';
import FlaggedSegment from '../components/FlaggedSegment.vue';
import RecommendationCard from '../components/RecommendationCard.vue';

const route = useRoute();
const store = useAgentsStore();

const agentId = computed(() => route.params.id);
const callId = computed(() => route.params.call_id);

const transcript = ref(null);
const loading = ref(true);

const analysis = computed(() => transcript.value?.analysis ?? null);
const agentName = computed(() => store.getAgentById(agentId.value)?.name ?? 'Agent');

onMounted(async () => {
  await store.fetchAgents();
  const { data } = await getTranscript(callId.value);
  transcript.value = data.data.transcript;
  loading.value = false;
});

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
.loading-state, .empty-state { color: var(--text-muted); margin-top: 60px; text-align: center; }
.empty-state.small { margin-top: 12px; text-align: left; }

.drilldown-layout { max-width: 1100px; }

.page-header { margin-bottom: 24px; }
.back-link { font-size: 13px; color: var(--text-muted); display: inline-block; margin-bottom: 10px; }
.back-link:hover { color: var(--primary); }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.call-meta { font-size: 13px; color: var(--text-muted); font-family: monospace; }

.no-analysis-banner {
  background: #fffbeb; border: 1px solid #fde68a;
  border-radius: var(--radius); padding: 12px 16px;
  font-size: 13px; color: #92400e; margin-bottom: 24px;
}

.split-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }

.panel { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
.panel-title { font-size: 14px; font-weight: 600; margin-bottom: 14px; color: var(--text); }

.kpi-scorecard { display: flex; flex-direction: column; gap: 1px; }
.flagged-list { display: flex; flex-direction: column; gap: 10px; }
.recs-list { display: flex; flex-direction: column; gap: 10px; }
</style>
