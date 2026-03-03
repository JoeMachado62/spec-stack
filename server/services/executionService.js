/**
 * Execution Service — One-Click "Run This Spec" (PRD Section 14.3)
 * 
 * Model Priority Chain:
 *   1. Gemini 3.1 Pro Preview (Google Ultra — default)
 *   2. GPT 5.3 Codex (OpenAI — first backup)
 *   3. Claude (Anthropic — second backup)
 * 
 * The user never sees a terminal, CLI, or raw API payload.
 * The agent's first response confirms spec receipt and summarizes its plan.
 */
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// ============================================================
// Model Initialization — Cascade Priority
// ============================================================

function getGeminiModel(userApiKey) {
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
        return new ChatGoogleGenerativeAI({
            modelName: 'gemini-2.0-flash',
            apiKey,
            temperature: 0.3,
            maxOutputTokens: 8192,
        });
    } catch (e) {
        console.warn('Gemini init failed:', e.message);
        return null;
    }
}

async function callOpenAI(apiKey, systemPrompt, userMessage) {
    // Direct fetch to OpenAI API — no SDK dependency needed
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.3,
            max_tokens: 8192,
        }),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API error: ${response.status} — ${err}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callAnthropic(apiKey, systemPrompt, userMessage) {
    // Direct fetch to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            system: systemPrompt,
            messages: [
                { role: 'user', content: userMessage },
            ],
        }),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic API error: ${response.status} — ${err}`);
    }
    const data = await response.json();
    return data.content[0].text;
}

// ============================================================
// Build the Spec Injection Payload
// ============================================================

function buildSpecPayload(specification) {
    const spec = specification;
    const stage1 = spec.stage_1_prompt || {};
    const stage2 = spec.stage_2_context || {};
    const stage3 = spec.stage_3_intent || {};
    const stage4 = spec.stage_4_spec || {};

    // Build the complete system prompt from the 4 stages
    const systemPrompt = `You are an autonomous AI agent executing a structured specification. You must follow this specification precisely.

=== CONTEXT BUNDLE ===
${stage2.system_prompt_components ? stage2.system_prompt_components.map(c => typeof c === 'string' ? c : c.content || JSON.stringify(c)).join('\n\n') : 'No additional context provided.'}

=== INTENT FRAMEWORK ===
Goals (in priority order):
${stage3.ranked_goals ? stage3.ranked_goals.map((g, i) => `${i + 1}. ${g.goal}: ${g.description}`).join('\n') : 'No goals specified.'}

Trade-off Rules:
${stage3.tradeoff_rules ? stage3.tradeoff_rules.map(t => `- When "${t.when}": Choose "${t.choose}" over "${t.over}"`).join('\n') : 'No trade-offs specified.'}

Escalation Triggers (STOP and ask the user if any of these occur):
${stage3.escalation_triggers ? stage3.escalation_triggers.map(t => `- ${t}`).join('\n') : 'No escalation triggers.'}

=== CONSTRAINT ARCHITECTURE ===
MUST do:
${stage4.constraint_architecture?.musts ? stage4.constraint_architecture.musts.map(m => `- ${m}`).join('\n') : '(none)'}

MUST NOT do:
${stage4.constraint_architecture?.must_nots ? stage4.constraint_architecture.must_nots.map(m => `- ${m}`).join('\n') : '(none)'}

Preferences:
${stage4.constraint_architecture?.preferences ? stage4.constraint_architecture.preferences.map(m => `- ${m}`).join('\n') : '(none)'}

=== BREAK PATTERNS ===
${stage4.break_patterns ? (Array.isArray(stage4.break_patterns) ? stage4.break_patterns.map(bp => `- ${bp.rule || bp}`).join('\n') : JSON.stringify(stage4.break_patterns)) : 'Execute as a single workflow.'}

=== ACCEPTANCE CRITERIA ===
${stage4.acceptance_criteria ? stage4.acceptance_criteria.map((ac, i) => {
        const criterion = ac.criterion || ac;
        const method = ac.verification_method ? ` (Verify: ${ac.verification_method})` : '';
        return `${i + 1}. ${criterion}${method}`;
    }).join('\n') : 'No acceptance criteria specified.'}

IMPORTANT: Your FIRST response must:
1. Confirm that you have loaded and understood the specification
2. Summarize your planned approach based on the break patterns
3. List the acceptance criteria you will be working toward
4. Begin executing the first phase of work`;

    // Build the user message from Stage 1
    const userMessage = `Execute the following specification:

=== TASK ===
${stage4.problem_statement || stage1.instruction_block || 'No task specified.'}

${stage1.examples ? `\nExamples of good output:\n${stage1.examples.map(e => `- ${e}`).join('\n')}` : ''}

${stage1.counter_examples ? `\nExamples of BAD output (avoid these):\n${stage1.counter_examples.map(e => `- ${e}`).join('\n')}` : ''}

${stage1.output_format ? `\nExpected output format: ${stage1.output_format}` : ''}

Begin autonomous execution now. Follow the break patterns to structure your work. Confirm receipt and start.`;

    return { systemPrompt, userMessage };
}

// ============================================================
// Execute Spec — Cascade through models
// ============================================================

/**
 * Execute a specification against the model cascade
 * @param {Object} specification - The full specification object
 * @param {string} preferredPlatform - 'gemini' | 'openai' | 'anthropic' | 'auto'
 * @param {Object} userApiKeys - { gemini, openai, anthropic } from user's stored keys
 * @returns {Object} { response, model_used, execution_time_ms }
 */
async function executeSpec(specification, preferredPlatform = 'auto', userApiKeys = {}) {
    const { systemPrompt, userMessage } = buildSpecPayload(specification);
    const startTime = Date.now();
    const errors = [];

    // Determine model order based on preference
    let modelOrder;
    switch (preferredPlatform) {
        case 'openai':
            modelOrder = ['openai', 'gemini', 'anthropic'];
            break;
        case 'anthropic':
            modelOrder = ['anthropic', 'gemini', 'openai'];
            break;
        case 'gemini':
        case 'auto':
        default:
            modelOrder = ['gemini', 'openai', 'anthropic'];
            break;
    }

    for (const model of modelOrder) {
        try {
            let response;
            let modelName;

            switch (model) {
                case 'gemini': {
                    const geminiKey = userApiKeys.gemini || process.env.GEMINI_API_KEY;
                    if (!geminiKey) { errors.push('Gemini: No API key'); continue; }
                    const gemini = getGeminiModel(geminiKey);
                    if (!gemini) { errors.push('Gemini: Init failed'); continue; }
                    const result = await gemini.invoke([
                        { role: 'system', content: systemPrompt },
                        { role: 'human', content: userMessage },
                    ]);
                    response = result.content;
                    modelName = 'Gemini 2.0 Flash';
                    break;
                }

                case 'openai': {
                    const openaiKey = userApiKeys.openai || process.env.OPENAI_API_KEY;
                    if (!openaiKey) { errors.push('OpenAI: No API key'); continue; }
                    response = await callOpenAI(openaiKey, systemPrompt, userMessage);
                    modelName = 'GPT-4o';
                    break;
                }

                case 'anthropic': {
                    const anthropicKey = userApiKeys.anthropic || process.env.ANTHROPIC_API_KEY;
                    if (!anthropicKey) { errors.push('Anthropic: No API key'); continue; }
                    response = await callAnthropic(anthropicKey, systemPrompt, userMessage);
                    modelName = 'Claude Sonnet 4';
                    break;
                }
            }

            if (response) {
                return {
                    response,
                    model_used: modelName,
                    platform: model,
                    execution_time_ms: Date.now() - startTime,
                    spec_confirmed: response.toLowerCase().includes('specification') ||
                        response.toLowerCase().includes('spec') ||
                        response.toLowerCase().includes('understood'),
                };
            }
        } catch (err) {
            console.error(`Execution failed on ${model}:`, err.message);
            errors.push(`${model}: ${err.message}`);
            continue; // Fall through to next model
        }
    }

    throw new Error(`All models failed. Errors: ${errors.join('; ')}`);
}

// ============================================================
// Get available models for a user
// ============================================================

function getAvailableModels(userApiKeys = {}) {
    const models = [];

    if (userApiKeys.gemini || process.env.GEMINI_API_KEY) {
        models.push({
            id: 'gemini',
            name: 'Google Gemini',
            description: 'Gemini 2.0 Flash — Fast, powerful, default choice',
            available: true,
            isDefault: true,
        });
    }

    if (userApiKeys.openai || process.env.OPENAI_API_KEY) {
        models.push({
            id: 'openai',
            name: 'ChatGPT',
            description: 'GPT-4o — Reliable alternative',
            available: true,
            isDefault: false,
        });
    }

    if (userApiKeys.anthropic || process.env.ANTHROPIC_API_KEY) {
        models.push({
            id: 'anthropic',
            name: 'Claude',
            description: 'Claude Sonnet 4 — Deep reasoning',
            available: true,
            isDefault: false,
        });
    }

    return models;
}

module.exports = { executeSpec, getAvailableModels, buildSpecPayload };
