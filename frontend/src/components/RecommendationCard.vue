<template>
  <div class="rec-card">
    <div class="rec-icon-wrap">
      <!-- Lightbulb SVG -->
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 2a5 5 0 0 1 3.5 8.5c-.5.6-.8 1.3-.8 2H6.3c0-.7-.3-1.4-.8-2A5 5 0 0 1 9 2z"/>
        <path d="M6.5 14h5"/>
        <path d="M7 16h4"/>
      </svg>
    </div>
    <p class="rec-text">{{ recommendation }}</p>
  </div>
</template>

<script setup>
defineProps({
  recommendation: { type: String, required: true },
});
</script>

<style scoped>
.rec-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8faff;
  border: 1px solid #c7d2fe;
  border-radius: var(--radius);
  padding: 13px 16px;
  transition: box-shadow var(--transition), border-color var(--transition);
}

.rec-card:hover {
  box-shadow: var(--shadow-sm);
  border-color: #a5b4fc;
}

.rec-icon-wrap {
  width: 28px;
  height: 28px;
  background: #ede9fe;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6d28d9;
  margin-top: 1px;
}

.rec-icon-wrap svg {
  width: 15px;
  height: 15px;
}

.rec-text {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text);
  flex: 1;
}
</style>
