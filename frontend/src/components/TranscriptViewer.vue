<template>
  <div class="transcript">
    <div
      v-for="turn in turns"
      :key="turn.turn"
      class="turn"
      :class="[turn.speaker.toLowerCase(), flaggedMap[turn.turn]?.severity]"
    >
      <div class="turn-meta">
        <span class="speaker">{{ turn.speaker }}</span>
        <span class="timestamp">{{ turn.timestamp }}</span>
        <span v-if="flaggedMap[turn.turn]" class="flag-indicator" :class="flaggedMap[turn.turn].severity">
          {{ flaggedMap[turn.turn].severity }}
        </span>
      </div>
      <p class="turn-text">{{ turn.text }}</p>
      <p v-if="flaggedMap[turn.turn]" class="flag-reason">
        ⚠ {{ flaggedMap[turn.turn].reason }}
      </p>
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
.transcript { display: flex; flex-direction: column; gap: 2px; max-height: 600px; overflow-y: auto; }

.turn {
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 3px solid transparent;
  transition: background 0.1s;
}

.turn.agent   { background: #f9fafb; border-left-color: #d1d5db; }
.turn.caller  { background: #f0f4ff; border-left-color: #a5b4fc; }

/* Flagged overrides */
.turn.low    { background: var(--flag-low);    border-left-color: var(--flag-low-border); }
.turn.medium { background: var(--flag-medium); border-left-color: var(--flag-medium-border); }
.turn.high   { background: var(--flag-high);   border-left-color: var(--flag-high-border); }

.turn-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.speaker {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.timestamp {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
}

.flag-indicator {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: 8px;
}
.flag-indicator.low    { background: #fef08a; color: #713f12; }
.flag-indicator.medium { background: #fed7aa; color: #7c2d12; }
.flag-indicator.high   { background: #fecaca; color: #7f1d1d; }

.turn-text {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--text);
}

.flag-reason {
  font-size: 12px;
  color: #92400e;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #fbbf24;
  line-height: 1.4;
}
</style>
