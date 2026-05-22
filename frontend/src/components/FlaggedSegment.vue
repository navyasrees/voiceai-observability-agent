<template>
  <div class="flagged-card" :class="segment.severity">
    <div class="card-header">
      <div class="severity-wrap">
        <!-- Warning triangle SVG -->
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

.severity-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.severity-icon {
  width: 14px;
  height: 14px;
}
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
}
</style>
