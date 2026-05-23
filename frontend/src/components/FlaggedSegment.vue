<template>
  <div class="flagged-card" :class="segment.severity">
    <div class="card-header">
      <div class="severity-wrap">
        <svg class="severity-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 2L14.5 13.5H1.5L8 2z"/>
          <path d="M8 7v3"/>
          <circle cx="8" cy="11.8" r="0.4" fill="currentColor" stroke="none"/>
        </svg>
        <span class="severity-badge" :class="segment.severity">{{ segment.severity }}</span>
      </div>
      <span class="turn-ref">Turn {{ segment.turn }}</span>
    </div>

    <blockquote class="segment-text">"{{ segment.text }}"</blockquote>
    <p class="segment-reason">{{ segment.reason }}</p>

    <!-- Use Actions -->
    <div class="segment-actions">
      <button
        class="action-btn review-btn"
        :class="{ flagged: reviewFlagged }"
        :disabled="reviewFlagged || actionLoading !== null"
        @click="handleAction('review')"
      >
        <span v-if="actionLoading === 'review'" class="action-spinner"></span>
        <svg v-else-if="reviewFlagged" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 7l4 4 6-6"/>
        </svg>
        {{ reviewFlagged ? 'Flagged for Review' : 'Flag for Human Review' }}
      </button>
      <button
        class="action-btn training-btn"
        :class="{ flagged: trainingFlagged }"
        :disabled="trainingFlagged || actionLoading !== null"
        @click="handleAction('training')"
      >
        <span v-if="actionLoading === 'training'" class="action-spinner"></span>
        <svg v-else-if="trainingFlagged" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 7l4 4 6-6"/>
        </svg>
        {{ trainingFlagged ? 'Added to Training' : 'Add to Script Training' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { flagSegment as flagSegmentApi } from '../api/index.js';

const props = defineProps({
  segment:        { type: Object,  required: true },
  callId:         { type: String,  default: null },
  initialActions: { type: Array,   default: () => [] }, // existing actions from server
});

const reviewFlagged   = ref(false);
const trainingFlagged = ref(false);
const actionLoading   = ref(null); // 'review' | 'training' | null

watch(() => props.initialActions, (actions) => {
  if (actions && actions.length > 0) {
    reviewFlagged.value = actions.some(a => Number(a.turn) === Number(props.segment.turn) && a.action === 'review');
    trainingFlagged.value = actions.some(a => Number(a.turn) === Number(props.segment.turn) && a.action === 'training');
  }
}, { immediate: true });

async function handleAction(action) {
  if (!props.callId) return;
  actionLoading.value = action;
  try {
    await flagSegmentApi(props.callId, props.segment.turn, action);
    if (action === 'review')   reviewFlagged.value   = true;
    if (action === 'training') trainingFlagged.value = true;
  } catch (e) {
    console.error('Failed to flag segment', e);
  } finally {
    actionLoading.value = null;
  }
}
</script>

<style scoped>
.flagged-card {
  border-radius: var(--radius);
  padding: 13px 14px;
  border: 1.5px solid transparent;
}
.flagged-card.low    { background: var(--flag-low);    border-color: var(--flag-low-border); }
.flagged-card.medium { background: var(--flag-medium); border-color: var(--flag-medium-border); }
.flagged-card.high   { background: var(--flag-high);   border-color: var(--flag-high-border); }

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.severity-wrap { display: flex; align-items: center; gap: 6px; }

.severity-icon { width: 14px; height: 14px; }
.low    .severity-icon { color: var(--flag-low-text); }
.medium .severity-icon { color: var(--flag-medium-text); }
.high   .severity-icon { color: var(--flag-high-text); }

.severity-badge {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.severity-badge.low    { background: #fef08a; color: var(--flag-low-text); }
.severity-badge.medium { background: #fed7aa; color: var(--flag-medium-text); }
.severity-badge.high   { background: #fecaca; color: var(--flag-high-text); }

.turn-ref { font-size: 11.5px; color: var(--text-muted); font-weight: 500; }

.segment-text {
  font-size: 13px;
  font-style: italic;
  color: var(--text);
  margin-bottom: 7px;
  line-height: 1.55;
  border-left: 2px solid currentColor;
  padding-left: 10px;
  opacity: 0.85;
}
.low    .segment-text { border-color: var(--flag-low-text); }
.medium .segment-text { border-color: var(--flag-medium-text); }
.high   .segment-text { border-color: var(--flag-high-text); }

.segment-reason {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.45;
  margin-bottom: 10px;
}

/* ─── Use Actions ────────────────────────────────── */
.segment-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, opacity 0.2s;
  font-family: inherit;
}
.action-btn:disabled { opacity: 0.7; cursor: default; }
.action-btn svg { width: 12px; height: 12px; flex-shrink: 0; }

.review-btn         { background: #fff3e0; color: #e65100; }
.review-btn:hover:not(:disabled) { background: #ffe0b2; }
.review-btn.flagged { background: #e65100; color: white; }

.training-btn         { background: #e3f2fd; color: #0277bd; }
.training-btn:hover:not(:disabled) { background: #bbdefb; }
.training-btn.flagged { background: #0277bd; color: white; }

/* ─── Spinner ────────────────────────────────────── */
.action-spinner {
  width: 11px;
  height: 11px;
  border: 1.5px solid rgba(0,0,0,0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
