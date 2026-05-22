<template>
  <div class="kpi-row" :class="result.passed ? 'pass' : 'fail'">
    <span class="icon">{{ result.passed ? '✓' : '✗' }}</span>
    <div class="kpi-body">
      <p class="kpi-text">{{ result.kpi }}</p>
      <p class="kpi-reason">{{ result.reason }}</p>
    </div>
    <span v-if="result.turn_ref" class="turn-ref">Turn {{ result.turn_ref }}</span>
  </div>
</template>

<script setup>
defineProps({
  result: { type: Object, required: true },
});
</script>

<style scoped>
.kpi-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
}

.pass { background: #f0fdf4; border-left: 3px solid var(--score-green); }
.fail { background: #fff1f2; border-left: 3px solid var(--score-red); }

.icon {
  font-size: 14px;
  font-weight: 700;
  min-width: 16px;
  margin-top: 1px;
}
.pass .icon { color: var(--score-green); }
.fail .icon { color: var(--score-red); }

.kpi-body { flex: 1; }
.kpi-text { font-size: 13px; font-weight: 500; margin-bottom: 3px; }
.kpi-reason { font-size: 12px; color: var(--text-muted); line-height: 1.4; }

.turn-ref {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  padding-top: 2px;
}
</style>
