<template>
  <div class="rec-card">
    <span class="rec-icon">→</span>
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
  gap: 10px;
  background: #f0f4ff;
  border: 1px solid #c7d2fe;
  border-radius: var(--radius);
  padding: 12px 14px;
}

.rec-icon {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  margin-top: 1px;
  flex-shrink: 0;
}

.rec-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text);
}
</style>
