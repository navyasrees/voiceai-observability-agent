<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-icon">◈</span>
      <span class="logo-text">Observability<br />Copilot</span>
    </div>

    <nav class="sidebar-nav">
      <p class="nav-label">Navigation</p>
      <RouterLink to="/" class="nav-link" :class="{ active: route.path === '/' }">
        Overview
      </RouterLink>

      <template v-if="agents.length">
        <p class="nav-label" style="margin-top: 20px;">Agents</p>
        <RouterLink
          v-for="agent in agents"
          :key="agent.agent_id"
          :to="`/agents/${agent.agent_id}`"
          class="nav-link"
          :class="{ active: route.path.startsWith(`/agents/${agent.agent_id}`) }"
        >
          {{ agent.name }}
        </RouterLink>
      </template>
    </nav>
  </aside>

  <main class="main-content">
    <RouterView />
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAgentsStore } from './store/agents.js';

const route = useRoute();
const store = useAgentsStore();
const { agents } = storeToRefs(store);

onMounted(() => store.fetchAgents());
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--primary);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  font-size: 22px;
  color: #7ec8e3;
}

.logo-text {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
  letter-spacing: 0.01em;
}

.sidebar-nav {
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 8px;
  margin-bottom: 4px;
}

.nav-link {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}
</style>
