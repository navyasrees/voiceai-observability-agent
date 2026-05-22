<template>
  <div class="flagged-card" :class="segment.severity">
    <div class="card-header">
      <span class="severity-badge" :class="segment.severity">{{ segment.severity }}</span>
      <span class="turn-ref">Turn {{ segment.turn }}</span>
    </div>
    <p class="segment-text">"{{ segment.text }}"</p>
    <p class="segment-reason">{{ segment.reason }}</p>
  </div>
</template>

<script setup>
defineProps({
  segment: { type: Object, required: true },
});
</script>

<style scoped>
.flagged-card {
  border-radius: var(--radius);
  padding: 12px 14px;
  border: 1px solid transparent;
}
.flagged-card.low    { background: var(--flag-low);    border-color: var(--flag-low-border); }
.flagged-card.medium { background: var(--flag-medium); border-color: var(--flag-medium-border); }
.flagged-card.high   { background: var(--flag-high);   border-color: var(--flag-high-border); }

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.severity-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 10px;
}
.severity-badge.low    { background: #fef08a; color: #713f12; }
.severity-badge.medium { background: #fed7aa; color: #7c2d12; }
.severity-badge.high   { background: #fecaca; color: #7f1d1d; }

.turn-ref { font-size: 12px; color: var(--text-muted); }

.segment-text {
  font-size: 13px;
  font-style: italic;
  color: var(--text);
  margin-bottom: 6px;
  line-height: 1.5;
}

.segment-reason {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>
