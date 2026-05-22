import { createRouter, createWebHistory } from 'vue-router';
import AgentsOverview from '../views/AgentsOverview.vue';
import AgentDetail from '../views/AgentDetail.vue';
import CallDrilldown from '../views/CallDrilldown.vue';

const routes = [
  { path: '/', component: AgentsOverview },
  { path: '/agents/:id', component: AgentDetail },
  { path: '/agents/:id/calls/:call_id', component: CallDrilldown },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
