<template>
  <!-- Skeleton -->
  <div v-if="loading" class="drilldown-layout">
    <div class="skeleton sk-back"></div>
    <div class="skeleton sk-header-block"></div>
    <div class="split-layout">
      <div class="skeleton sk-panel"></div>
      <div class="skeleton sk-panel"></div>
    </div>
  </div>

  <div v-else-if="!transcript" class="empty-state-full">Transcript not found.</div>

  <div v-else class="drilldown-layout">
    <!-- Header -->
    <div class="page-header">
      <RouterLink :to="`/agents/${agentId}`" class="back-link">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 4L6 8l4 4"/>
        </svg>
        {{ agentName }}
      </RouterLink>

      <div class="header-main">
        <div class="header-left">
          <h1 class="page-title">Call Drilldown</h1>
          <div class="call-meta-row">
            <span class="meta-chip">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <rect x="2" y="2" width="10" height="10" rx="2"/>
                <path d="M5 5h4M5 8h2"/>
              </svg>
              {{ transcript.call_id }}
            </span>
            <span class="meta-chip">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="10" height="9" rx="1.5"/>
                <path d="M5 1v2M9 1v2M2 7h10"/>
              </svg>
              {{ formatDate(transcript.uploaded_at) }}
            </span>
            <span class="meta-chip">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <path d="M7 2v5l2.5 2.5"/>
                <circle cx="7" cy="7" r="5"/>
              </svg>
              {{ transcript.turns?.length ?? 0 }} turns
            </span>
          </div>
        </div>

        <div v-if="analysis" class="score-block">
          <ScoreBadge :score="analysis.overall_score" size="lg" />
          <span class="score-block-label">Overall Score</span>
        </div>
      </div>
    </div>

    <!-- No analysis banner -->
    <div v-if="!analysis" class="no-analysis-banner">
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="9" r="7"/>
        <path d="M9 6v3M9 12v.5"/>
      </svg>
      This call hasn't been analyzed yet. Go back to the agent page and click <strong>Analyze</strong>.
    </div>

    <!-- Split layout -->
    <div class="split-layout">
      <!-- Left: transcript -->
      <div class="panel panel-left">
        <div class="panel-header">
          <h2 class="panel-title">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 4h12M2 8h8M2 12h10"/>
            </svg>
            Transcript
          </h2>
          <span v-if="analysis?.flagged_segments?.length" class="flag-summary-chip high">
            {{ analysis.flagged_segments.length }} flagged
          </span>
        </div>
        <TranscriptViewer
          :turns="transcript.turns"
          :flagged-segments="analysis?.flagged_segments ?? []"
        />
      </div>

      <!-- Right: analysis panels -->
      <div class="panel panel-right">
        <template v-if="analysis">
          <!-- KPI Scorecard -->
          <div class="right-section">
            <div class="panel-header">
              <h2 class="panel-title">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8l3 3 7-7"/>
                </svg>
                KPI Scorecard
              </h2>
              <div class="kpi-pass-summary">
                <span class="pass-count">{{ passCount }} pass</span>
                <span class="sep">·</span>
                <span class="fail-count">{{ failCount }} fail</span>
              </div>
            </div>
            <div class="kpi-scorecard">
              <KpiResultRow
                v-for="(result, i) in analysis.kpi_results"
                :key="i"
                :result="result"
              />
            </div>
          </div>

          <!-- Flagged Segments -->
          <div class="right-section">
            <div class="panel-header">
              <h2 class="panel-title">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 2L14.5 13.5H1.5L8 2z"/>
                  <path d="M8 7v3"/>
                  <circle cx="8" cy="11.8" r="0.4" fill="currentColor" stroke="none"/>
                </svg>
                Flagged Segments
              </h2>
              <span v-if="analysis.flagged_segments?.length" class="count-chip">
                {{ analysis.flagged_segments.length }}
              </span>
            </div>
            <div v-if="!analysis.flagged_segments?.length" class="empty-section">
              <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" fill="#f0fdf4"/><path d="M10 16l4 4 8-8" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              No flagged segments — call looked clean.
            </div>
            <div v-else class="flagged-list">
              <FlaggedSegment
                v-for="(seg, i) in analysis.flagged_segments"
                :key="i"
                :segment="seg"
                :call-id="callId"
                :initial-actions="segmentActions"
              />
            </div>
          </div>

          <!-- Recommendations -->
          <div class="right-section">
            <div class="panel-header">
              <h2 class="panel-title">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 2a4 4 0 0 1 2.8 6.8c-.4.5-.6 1-.6 1.6H5.8c0-.6-.2-1.1-.6-1.6A4 4 0 0 1 8 2z"/>
                  <path d="M5.8 12h4.4M6.3 14h3.4"/>
                </svg>
                Recommendations
              </h2>
              <span v-if="analysis.recommendations?.length" class="count-chip">
                {{ analysis.recommendations.length }}
              </span>
            </div>
            <div v-if="!analysis.recommendations?.length" class="empty-section">
              No recommendations for this call.
            </div>
            <div v-else class="recs-list">
              <RecommendationCard
                v-for="(rec, i) in analysis.recommendations"
                :key="i"
                :recommendation="rec"
              />
            </div>
          </div>
        </template>

        <div v-else class="empty-state-panel">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" fill="#f3f4f6"/>
            <path d="M16 24h16M24 16v16" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <p>Run analysis to see KPI results, flagged segments, and recommendations.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { getTranscript, getCallSegmentActions } from '../api/index.js';
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
const segmentActions = ref([]);
const loading = ref(true);

const analysis = computed(() => transcript.value?.analysis ?? null);
const agentName = computed(() => store.getAgentById(agentId.value)?.name ?? 'Agent');

const passCount = computed(() => analysis.value?.kpi_results?.filter(r => r.passed).length ?? 0);
const failCount = computed(() => analysis.value?.kpi_results?.filter(r => !r.passed).length ?? 0);

onMounted(async () => {
  await store.fetchAgents();
  const [transcriptRes, actionsRes] = await Promise.allSettled([
    getTranscript(callId.value),
    getCallSegmentActions(callId.value),
  ]);
  if (transcriptRes.status === 'fulfilled') {
    transcript.value = transcriptRes.value.data.data.transcript;
  }
  if (actionsRes.status === 'fulfilled') {
    segmentActions.value = actionsRes.value.data.data.actions ?? [];
  }
  loading.value = false;
});

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
.empty-state-full { color: var(--text-muted); margin-top: 60px; text-align: center; }
.drilldown-layout { max-width: 1200px; }

/* ─── Skeleton ───────────────────────────────────── */
.sk-back         { height: 14px; width: 90px; margin-bottom: 16px; }
.sk-header-block { height: 70px; margin-bottom: 24px; border-radius: var(--radius-lg); }
.sk-panel        { height: 400px; border-radius: var(--radius-lg); }

/* ─── Header ─────────────────────────────────────── */
.page-header { margin-bottom: 24px; }

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

.header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px 24px;
  box-shadow: var(--shadow);
}

.page-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.01em; }

.call-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-muted);
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-weight: 500;
}
.meta-chip svg { width: 12px; height: 12px; }

.score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}
.score-block-label {
  font-size: 10.5px;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

/* ─── Banner ─────────────────────────────────────── */
.no-analysis-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius);
  padding: 13px 16px;
  font-size: 13.5px;
  color: #92400e;
  margin-bottom: 24px;
}
.no-analysis-banner svg { width: 18px; height: 18px; flex-shrink: 0; }

/* ─── Split layout ───────────────────────────────── */
.split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

/* ─── Panels ─────────────────────────────────────── */
.panel {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: #fafafa;
}

.panel-left .panel-header { background: #fafafa; }

.panel-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}
.panel-title svg { width: 14px; height: 14px; color: var(--primary); }

.panel-left :deep(.transcript) { padding: 14px; }

/* ─── Right panel sections ───────────────────────── */
.right-section {
  border-bottom: 1px solid var(--border);
}
.right-section:last-child { border-bottom: none; }

.right-section .panel-header { background: transparent; }

.kpi-scorecard { padding: 10px 14px 14px; }
.flagged-list  { display: flex; flex-direction: column; gap: 8px; padding: 10px 14px 14px; }
.recs-list     { display: flex; flex-direction: column; gap: 8px; padding: 10px 14px 14px; }

/* ─── Count chips ────────────────────────────────── */
.count-chip {
  background: var(--primary-subtle);
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.flag-summary-chip {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: var(--radius-full);
}
.flag-summary-chip.high { background: #fee2e2; color: var(--score-red); }

.kpi-pass-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}
.pass-count { color: var(--score-green); }
.fail-count { color: var(--score-red); }
.sep { color: var(--text-subtle); }

/* ─── Empty states ───────────────────────────────── */
.empty-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 18px;
  font-size: 13px;
  color: var(--text-muted);
}
.empty-section svg { width: 28px; height: 28px; flex-shrink: 0; }

.empty-state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
  text-align: center;
}
.empty-state-panel svg { width: 56px; height: 56px; }
.empty-state-panel p { font-size: 13.5px; color: var(--text-muted); max-width: 240px; line-height: 1.5; }
</style>
