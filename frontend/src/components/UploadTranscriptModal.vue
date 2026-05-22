<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Upload Transcript</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <p class="modal-hint">
          Paste a JSON array of turns. Each turn must have:
          <code>turn</code>, <code>speaker</code>, <code>timestamp</code>, <code>text</code>.
        </p>

        <label class="field-label">Agent ID</label>
        <input class="field-input" :value="agentId" disabled />

        <label class="field-label" style="margin-top: 14px;">Turns (JSON)</label>
        <textarea
          v-model="rawJson"
          class="field-textarea"
          placeholder='[{ "turn": 1, "speaker": "Agent", "timestamp": "00:00", "text": "Hello!" }]'
          rows="10"
        />

        <p v-if="parseError" class="error-msg">{{ parseError }}</p>
        <p v-if="serverError" class="error-msg">{{ serverError }}</p>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button class="btn-submit" :disabled="submitting" @click="submit">
          <span v-if="submitting" class="spinner" />
          <span v-else>Upload</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadTranscript } from '../api/index.js';

const props = defineProps({
  agentId: { type: String, required: true },
});

const emit = defineEmits(['close', 'uploaded']);

const rawJson = ref('');
const parseError = ref('');
const serverError = ref('');
const submitting = ref(false);

async function submit() {
  parseError.value = '';
  serverError.value = '';

  let turns;
  try {
    turns = JSON.parse(rawJson.value);
    if (!Array.isArray(turns) || turns.length === 0) throw new Error('Must be a non-empty array.');
  } catch (e) {
    parseError.value = `Invalid JSON: ${e.message}`;
    return;
  }

  submitting.value = true;
  try {
    await uploadTranscript({ agent_id: props.agentId, turns });
    emit('uploaded');
  } catch (e) {
    serverError.value = e.response?.data?.message ?? 'Upload failed. Check the backend.';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--card-bg);
  border-radius: var(--radius);
  width: 560px;
  max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}
.modal-title { font-size: 16px; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 16px; color: var(--text-muted); line-height: 1; }
.close-btn:hover { color: var(--text); }

.modal-body { padding: 20px 24px; }
.modal-hint { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5; }
.modal-hint code { font-family: monospace; background: #f3f4f6; padding: 1px 4px; border-radius: 3px; }

.field-label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--text-muted); }
.field-input {
  width: 100%; padding: 8px 12px;
  border: 1px solid var(--border); border-radius: 6px;
  font-size: 13px; background: #f9fafb; color: var(--text-muted);
}
.field-textarea {
  width: 100%; padding: 10px 12px;
  border: 1px solid var(--border); border-radius: 6px;
  font-size: 12.5px; font-family: monospace; resize: vertical;
  color: var(--text); background: #fafafa;
}
.field-textarea:focus { outline: 2px solid var(--primary); border-color: transparent; }

.error-msg { font-size: 12.5px; color: var(--score-red); margin-top: 10px; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.btn-cancel {
  padding: 8px 16px; font-size: 13px; font-weight: 500;
  background: white; color: var(--text); border: 1px solid var(--border);
  border-radius: 6px;
}
.btn-cancel:hover { background: #f9fafb; }

.btn-submit {
  padding: 8px 18px; font-size: 13px; font-weight: 500;
  background: var(--primary); color: white; border: none; border-radius: 6px;
  display: inline-flex; align-items: center; gap: 6px;
  transition: background 0.15s;
}
.btn-submit:hover:not(:disabled) { background: var(--primary-light); }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
