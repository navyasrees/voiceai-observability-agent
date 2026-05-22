<template>
  <div class="kpi-row" :class="result.passed ? 'pass' : 'fail'">
    <!-- SVG icon -->
    <div class="icon-wrap" :class="result.passed ? 'icon-pass' : 'icon-fail'">
      <svg v-if="result.passed" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8" cy="8" r="6.5"/>
        <path d="M5 8.5l2 2 4-4"/>
      </svg>
      <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="8" cy="8" r="6.5"/>
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5"/>
      </svg>
    </div>

    <div class="kpi-body">
      <p class="kpi-text">{{ result.kpi }}</p>
      <p class="kpi-reason">{{ result.reason }}</p>
    </div>

    <div class="meta-col">
      <span class="pass-label" :class="result.passed ? 'pass-label-green' : 'pass-label-red'">
        {{ result.passed ? 'Pass' : 'Fail' }}
      </span>
      <span v-if="result.turn_ref" class="turn-ref">T{{ result.turn_ref }}</span>
    </div>
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
  padding: 11px 14px;
  border-radius: 8px;
  margin-bottom: 5px;
  border: 1px solid transparent;
  transition: box-shadow var(--transition);
}

.pass { background: #f0fdf4; border-color: #bbf7d0; }
.fail { background: #fff1f2; border-color: #fecaca; }

/* Icon */
.icon-wrap {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}
.icon-pass { color: var(--score-green); }
.icon-fail { color: var(--score-red); }
.icon-wrap svg { width: 100%; height: 100%; }

/* Body */
.kpi-body { flex: 1; min-width: 0; }
.kpi-text {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 3px;
  color: var(--text);
  line-height: 1.4;
}
.kpi-reason {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.45;
}

/* Meta */
.meta-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.pass-label {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: var(--radius-full);
}
.pass-label-green { background: #dcfce7; color: var(--score-green); }
.pass-label-red   { background: #fee2e2; color: var(--score-red); }

.turn-ref {
  font-size: 10px;
  color: var(--text-subtle);
  font-family: monospace;
}
</style>
