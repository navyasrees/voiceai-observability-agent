<template>
  <span class="score-badge" :class="[colorClass, `size-${size}`]">
    {{ score ?? '—' }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: { type: Number, default: null },
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
});

const colorClass = computed(() => {
  if (props.score === null) return 'neutral';
  if (props.score >= 80) return 'green';
  if (props.score >= 60) return 'yellow';
  return 'red';
});
</script>

<style scoped>
.score-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border-radius: 20px;
  white-space: nowrap;
}

.size-sm { font-size: 11px; padding: 2px 8px; }
.size-md { font-size: 13px; padding: 4px 12px; }
.size-lg { font-size: 22px; padding: 8px 20px; min-width: 70px; }

.green  { background: #dcfce7; color: #166534; }
.yellow { background: #fef9c3; color: #854d0e; }
.red    { background: #fee2e2; color: #991b1b; }
.neutral { background: #f3f4f6; color: var(--text-muted); }
</style>
