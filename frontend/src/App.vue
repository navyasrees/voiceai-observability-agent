<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon-wrap">
        <!-- Audio waveform icon -->
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
          <rect x="1"  y="11" width="3" height="6"  rx="1.5" fill="#7ec8e3"/>
          <rect x="6"  y="7"  width="3" height="14" rx="1.5" fill="#7ec8e3"/>
          <rect x="11" y="3"  width="3" height="22" rx="1.5" fill="#ffffff"/>
          <rect x="16" y="7"  width="3" height="14" rx="1.5" fill="#7ec8e3"/>
          <rect x="21" y="11" width="3" height="6"  rx="1.5" fill="#7ec8e3"/>
          <circle cx="24" cy="6" r="3" fill="#4f8ef7"/>
        </svg>
      </div>
      <div class="logo-text-wrap">
        <span class="logo-name">Voice AI</span>
        <span class="logo-sub">Observability Copilot</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <p class="nav-section-label">Dashboard</p>
      <RouterLink to="/" class="nav-link" :class="{ active: route.path === '/' }">
        <!-- Grid / overview icon -->
        <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
          <rect x="2" y="2" width="7" height="7" rx="1.5"/>
          <rect x="11" y="2" width="7" height="7" rx="1.5"/>
          <rect x="2" y="11" width="7" height="7" rx="1.5"/>
          <rect x="11" y="11" width="7" height="7" rx="1.5"/>
        </svg>
        Overview
      </RouterLink>

      <template v-if="agents.length">
        <p class="nav-section-label" style="margin-top: 20px;">Agents</p>
        <RouterLink
          v-for="agent in agents"
          :key="agent.agent_id"
          :to="`/agents/${agent.agent_id}`"
          class="nav-link"
          :class="{ active: route.path.startsWith(`/agents/${agent.agent_id}`) }"
        >
          <!-- Bot / agent icon -->
          <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
            <rect x="4" y="6" width="12" height="9" rx="2"/>
            <path d="M7 10h.01M10 10h.01M13 10h.01" stroke-linecap="round" stroke-width="2"/>
            <path d="M10 6V4" stroke-linecap="round"/>
            <circle cx="10" cy="3.5" r="1"/>
          </svg>
          {{ agent.name }}
        </RouterLink>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div class="footer-badge">
        <span class="footer-dot"></span>
        Live
      </div>
    </div>
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
  border-right: 1px solid rgba(255,255,255,0.06);
}

/* ─── Logo ─────────────────────────────────────────── */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.logo-icon-wrap {
  width: 38px;
  height: 38px;
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-svg {
  width: 22px;
  height: 22px;
}

.logo-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.logo-name {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.logo-sub {
  font-size: 10.5px;
  color: rgba(255,255,255,0.45);
  letter-spacing: 0.02em;
}

/* ─── Nav ─────────────────────────────────────────── */
.sidebar-nav {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-section-label {
  font-size: 10.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  padding: 0 10px;
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255,255,255,0.68);
  transition: background var(--transition), color var(--transition);
  position: relative;
}

.nav-link:hover {
  background: rgba(255,255,255,0.08);
  color: #ffffff;
}

.nav-link.active {
  background: rgba(255,255,255,0.13);
  color: #ffffff;
  font-weight: 600;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--primary-accent);
  border-radius: 0 3px 3px 0;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.8;
}
.nav-link.active .nav-icon,
.nav-link:hover .nav-icon { opacity: 1; }

/* ─── Footer ─────────────────────────────────────── */
.sidebar-footer {
  padding: 14px 18px;
  border-top: 1px solid rgba(255,255,255,0.07);
}

.footer-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
}

.footer-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
  50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0.1); }
}

/* ─── Main ───────────────────────────────────────── */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 36px;
  background: var(--bg);
}
</style>
