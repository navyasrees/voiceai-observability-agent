<template>
  <div class="kpi-editor">
    <ul class="kpi-edit-list">
      <li v-for="(kpi, i) in editableKpis" :key="i" class="kpi-edit-row">
        <span class="kpi-index">{{ i + 1 }}</span>
        <input
          v-model="editableKpis[i]"
          class="kpi-input"
          :class="{ 'input-error': submitted && !editableKpis[i].trim() }"
          type="text"
          placeholder="Describe a KPI…"
        />
        <button
          class="btn-delete"
          title="Remove KPI"
          @click="removeKpi(i)"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4"/>
          </svg>
        </button>
      </li>
    </ul>

    <button class="btn-add" @click="addKpi">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M8 3v10M3 8h10"/>
      </svg>
      Add KPI
    </button>

    <p v-if="kpiError" class="error-msg">{{ kpiError }}</p>

    <div class="editor-footer">
      <button class="btn-cancel" @click="$emit('cancel')">Cancel</button>
      <button class="btn-save" :disabled="kpiSaving" @click="save">
        <span v-if="kpiSaving" class="spinner"></span>
        {{ kpiSaving ? 'Saving…' : 'Save KPIs' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { updateAgentKpis } from '../api/index.js';

const props = defineProps({
  kpis:    { type: Array,  required: true },
  agentId: { type: String, required: true },
});
const emit = defineEmits(['saved', 'cancel']);

const editableKpis = ref([...props.kpis]);
const kpiSaving    = ref(false);
const kpiError     = ref(null);
const submitted    = ref(false);

function addKpi() {
  editableKpis.value.push('');
}

function removeKpi(i) {
  editableKpis.value.splice(i, 1);
}

async function save() {
  submitted.value = true;
  kpiError.value  = null;

  const trimmed = editableKpis.value.map(k => k.trim());

  if (trimmed.length === 0) {
    kpiError.value = 'At least one KPI is required.';
    return;
  }
  if (trimmed.some(k => !k)) {
    kpiError.value = 'Remove or fill in all empty KPI fields before saving.';
    return;
  }
  const unique = new Set(trimmed);
  if (unique.size !== trimmed.length) {
    kpiError.value = 'Duplicate KPIs found — each KPI must be unique.';
    return;
  }

  kpiSaving.value = true;
  try {
    await updateAgentKpis(props.agentId, trimmed);
    emit('saved', trimmed);
  } catch {
    kpiError.value = 'Failed to save KPIs. Please try again.';
  } finally {
    kpiSaving.value = false;
  }
}
</script>

<style scoped>
.kpi-editor {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow);
}

/* ─── Edit list ──────────────────────────────────── */
.kpi-edit-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.kpi-edit-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kpi-index {
  min-width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13.5px;
  color: var(--text);
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.kpi-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(15,52,96,0.08); }
.kpi-input.input-error { border-color: var(--score-red); }

.btn-delete {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fecaca;
  background: #fff5f5;
  border-radius: 6px;
  color: var(--score-red);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
}
.kpi-edit-row:hover .btn-delete { opacity: 1; }
.btn-delete:hover { background: #fee2e2; }
.btn-delete svg { width: 13px; height: 13px; }

/* ─── Add button ─────────────────────────────────── */
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
  background: white;
  border: 1.5px solid var(--primary);
  border-radius: 7px;
  margin-bottom: 12px;
  transition: background 0.15s;
}
.btn-add:hover { background: var(--primary-subtle); }
.btn-add svg { width: 13px; height: 13px; }

/* ─── Error ──────────────────────────────────────── */
.error-msg {
  font-size: 13px;
  color: var(--score-red);
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

/* ─── Footer ─────────────────────────────────────── */
.editor-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.btn-cancel {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  padding: 7px 10px;
  border-radius: 6px;
  transition: color 0.15s;
}
.btn-cancel:hover { color: var(--text); }

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  font-size: 13.5px;
  font-weight: 600;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 7px;
  transition: background 0.15s, box-shadow 0.15s;
}
.btn-save:hover:not(:disabled) {
  background: var(--primary-light);
  box-shadow: 0 2px 8px rgba(15,52,96,0.25);
}
.btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

/* ─── Spinner ────────────────────────────────────── */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
