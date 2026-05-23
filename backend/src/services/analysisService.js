import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a Voice AI Quality Assurance evaluator. You will be given a Voice AI agent's goal, its success KPIs, and a call transcript. Your job is to evaluate the call strictly against the KPIs and return a structured JSON analysis. Be specific about which turn in the transcript caused a failure. Do not invent information that is not present in the transcript. Return ONLY valid JSON — no markdown, no explanation, no code fences.

Each recommendation must be one of three types:
PROMPT CHANGE — suggest exact wording to add or change in the agent system prompt.
SCRIPT CHANGE — suggest a specific step or line to add to the agent call script.
AGENT ADJUSTMENT — suggest a specific behavioral change for the agent.

Format every recommendation as: "[TYPE]: [specific actionable change]"
Example: "PROMPT CHANGE: Add to system prompt — Always collect the caller email address before discussing pricing or scheduling."
Example: "SCRIPT CHANGE: After greeting, add — Can I get your full name and email so I can pull up your account?"
Example: "AGENT ADJUSTMENT: When the caller expresses hesitation, pause and ask an open-ended question before continuing the pitch."

Never write vague suggestions. Every recommendation must be immediately actionable by the agent developer.`;

/**
 * Formats transcript turns into a readable string for the prompt.
 * @param {Array<{ turn: number, speaker: string, timestamp: string, text: string }>} turns
 * @returns {string}
 */
function formatTranscript(turns) {
  return turns
    .map((t) => `[${t.timestamp}] Turn ${t.turn} — ${t.speaker}: ${t.text}`)
    .join('\n');
}

/**
 * Builds the user prompt by injecting agent and transcript data.
 * @param {{ goal: string, kpis: string[] }} agent
 * @param {{ turns: Array }} transcript
 * @returns {string}
 */
function buildUserPrompt(agent, transcript) {
  const kpiList = agent.kpis.map((kpi, i) => `${i + 1}. ${kpi}`).join('\n');

  return `Agent Goal: ${agent.goal}

Agent KPIs:
${kpiList}

Call Transcript:
${formatTranscript(transcript.turns)}

Return a JSON object with this exact shape:
{
  "overall_score": <integer 0-100>,
  "kpi_results": [
    {
      "kpi": "<the KPI text>",
      "passed": <true | false>,
      "reason": "<why it passed or failed>",
      "turn_ref": <turn number where evidence was found, or null>
    }
  ],
  "flagged_segments": [
    {
      "turn": <turn number>,
      "text": "<exact utterance from the transcript>",
      "reason": "<why this is flagged>",
      "severity": "<low | medium | high>"
    }
  ],
  "recommendations": [
    "PROMPT CHANGE: Add to agent system prompt — [exact wording to add]",
    "SCRIPT CHANGE: Add step to call script — [exact step wording]",
    "AGENT ADJUSTMENT: [specific behavioral change for the agent]"
  ]
}`;
}

/**
 * Strips markdown code fences from a string, if present.
 * @param {string} raw
 * @returns {string}
 */
function stripCodeFences(raw) {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

/**
 * Calls Groq to analyze a transcript against agent KPIs.
 * Returns a parsed analysis object, or { error: string } on failure.
 *
 * @param {{ agent_id: string, goal: string, kpis: string[] }} agent
 * @param {{ call_id: string, turns: Array }} transcript
 * @returns {Promise<object>}
 */
export async function analyzeTranscript(agent, transcript) {
  let rawContent;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(agent, transcript) },
      ],
    });
    rawContent = completion.choices[0]?.message?.content ?? '';
  } catch (err) {
    return { error: `Groq API call failed: ${err.message}` };
  }

  try {
    return JSON.parse(stripCodeFences(rawContent));
  } catch {
    return { error: 'Failed to parse Groq response as JSON', raw: rawContent };
  }
}
