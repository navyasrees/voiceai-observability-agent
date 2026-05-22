<template>
  <div class="score-badge" :class="[colorClass, `size-${size}`]">
    <span class="score-num">{{ score ?? '—' }}</span>
    <span v-if="size === 'lg'" class="score-denom">/100</span>
  </div>
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
  align-items: baseline;
  justify-content: center;
  font-weight: 700;
  border-radius: var(--radius-full);
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.size-sm  { font-size: 11.5px; padding: 2px 9px; gap: 1px; }
.size-md  { font-size: 13.5px; padding: 4px 13px; gap: 2px; }
.size-lg  {
  font-size: 28px;
  padding: 10px 22px;
  border-radius: var(--radius);
  gap: 2px;
  min-width: 90px;
  justify-content: center;
}

.score-denom {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
  margin-left: 1px;
}

.green  { background: var(--score-green-bg); color: var(--score-green); border: 1.5px solid #bbf7d0; }
.yellow { background: var(--score-yellow-bg); color: var(--score-yellow); border: 1.5px solid #fde68a; }
.red    { background: var(--score-red-bg); color: var(--score-red); border: 1.5px solid #fecaca; }
.neutral { background: #f3f4f6; color: var(--text-muted); border: 1.5px solid var(--border); }
</style>
