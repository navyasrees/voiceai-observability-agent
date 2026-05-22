<template>
  <div class="transcript">
    <div
      v-for="turn in turns"
      :key="turn.turn"
      class="turn"
      :class="[
        turn.speaker.toLowerCase().includes('agent') ? 'turn-agent' : 'turn-caller',
        flaggedMap[turn.turn] ? `flagged flagged-${flaggedMap[turn.turn].severity}` : ''
      ]"
    >
      <!-- Turn meta row -->
      <div class="turn-meta">
        <div class="speaker-wrap">
          <div class="speaker-avatar" :class="turn.speaker.toLowerCase().includes('agent') ? 'avatar-agent' : 'avatar-caller'">
            <svg v-if="turn.speaker.toLowerCase().includes('agent')" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
              <rect x="3" y="4" width="8" height="7" rx="1.5"/>
              <path d="M5 7.5h.01M7 7.5h.01M9 7.5h.01" stroke-width="1.8"/>
              <path d="M7 4V3" />
              <circle cx="7" cy="2.5" r="0.7" fill="currentColor" stroke="none"/>
            </svg>
            <svg v-else viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7" cy="4.5" r="2"/>
              <path d="M2.5 12c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/>
            </svg>
          </div>
          <span class="speaker-label">{{ turn.speaker }}</span>
        </div>

        <div class="turn-right">
          <span class="timestamp">{{ turn.timestamp }}</span>
          <span v-if="flaggedMap[turn.turn]" class="flag-pill" :class="`flag-${flaggedMap[turn.turn].severity}`">
            <svg viewBox="0 0 10 10" fill="currentColor">
              <path d="M5 1L9 9H1L5 1z"/>
            </svg>
            {{ flaggedMap[turn.turn].severity }}
          </span>
        </div>
      </div>

      <!-- Turn text -->
      <p class="turn-text">{{ turn.text }}</p>

      <!-- Flag reason -->
      <div v-if="flaggedMap[turn.turn]" class="flag-reason">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 2L13 12H1L7 2z"/>
          <path d="M7 6v3"/>
          <circle cx="7" cy="10.5" r="0.4" fill="currentColor" stroke="none"/>
        </svg>
        {{ flaggedMap[turn.turn].reason }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  turns: { type: Array, required: true },
  flaggedSegments: { type: Array, default: () => [] },
});

const flaggedMap = computed(() => {
  const map = {};
  props.flaggedSegments.forEach((seg) => {
    map[seg.turn] = seg;
  });
  return map;
});
</script>

<style scoped>
.transcript {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 580px;
  overflow-y: auto;
  padding: 4px 2px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.transcript::-webkit-scrollbar { width: 5px; }
.transcript::-webkit-scrollbar-track { background: transparent; }
.transcript::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

/* Turn bubble */
.turn {
  padding: 10px 14px;
  border-radius: 10px;
  border-left: 3px solid transparent;
  transition: background var(--transition);
}

.turn-agent  { background: #f8fafc; border-left-color: #cbd5e1; }
.turn-caller { background: #f0f4ff; border-left-color: #a5b4fc; }

.flagged.flagged-low    { background: var(--flag-low);    border-left-color: var(--flag-low-border); }
.flagged.flagged-medium { background: var(--flag-medium); border-left-color: var(--flag-medium-border); }
.flagged.flagged-high   { background: var(--flag-high);   border-left-color: var(--flag-high-border); }

/* Meta row */
.turn-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.speaker-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
}

.speaker-avatar {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-agent  { background: #e0e7ff; color: #4338ca; }
.avatar-caller { background: #dcfce7; color: #16a34a; }
.speaker-avatar svg { width: 13px; height: 13px; }

.speaker-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}

.turn-right {
  display: flex;
  align-items: center;
  gap: 7px;
}

.timestamp {
  font-size: 10.5px;
  color: var(--text-subtle);
  font-family: monospace;
}

/* Flag pill */
.flag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 2px 7px;
  border-radius: var(--radius-full);
}
.flag-pill svg { width: 7px; height: 7px; }

.flag-low    { background: #fef08a; color: var(--flag-low-text); }
.flag-medium { background: #fed7aa; color: var(--flag-medium-text); }
.flag-high   { background: #fecaca; color: var(--flag-high-text); }

/* Turn text */
.turn-text {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text);
  padding-left: 29px;
}

/* Flag reason */
.flag-reason {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #92400e;
  margin-top: 8px;
  padding: 7px 10px;
  background: rgba(0,0,0,0.035);
  border-radius: 6px;
  line-height: 1.4;
}
.flag-reason svg { width: 13px; height: 13px; flex-shrink: 0; margin-top: 1px; color: #b45309; }

.flagged-high .flag-reason    { color: #7f1d1d; }
.flagged-high .flag-reason svg { color: #dc2626; }
.flagged-medium .flag-reason  { color: #7c2d12; }
.flagged-medium .flag-reason svg { color: #ea580c; }
</style>
