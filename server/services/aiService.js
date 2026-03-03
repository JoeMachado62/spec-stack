/**
 * AI Service — LangChain Multi-Model Integration
 * Priority: Gemini 3.1 Pro → GPT-5.2 Codex → Claude Opus 4.5
 *
 * Model API IDs as of March 2026:
 *   Google:    gemini-3.1-pro-preview    (latest frontier, released Feb 19 2026)
 *   OpenAI:    gpt-5.2-codex             (most capable agentic coding model)
 *   Anthropic: claude-opus-4-6            (latest frontier, released Feb 5 2026)
 *
 * The getModel() factory tries the best available provider.
 * The invokeWithFallback() wrapper retries on the next provider if a call fails.
 */
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { PromptTemplate } = require('@langchain/core/prompts');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Valid Gemini keys start with AIzaSy and are 39 chars
const isValidGeminiKey = (k) => k && k.startsWith('AIzaSy') && k.length === 39;

/**
 * Build an ordered list of model instances to try.
 * Returns an array so invokeWithFallback can try each in order.
 */
const getModelChain = (temperature = 0.7) => {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const chain = [];

    if (isValidGeminiKey(geminiKey)) {
        chain.push({
            name: 'Gemini 3.1 Pro',
            instance: new ChatGoogleGenerativeAI({
                model: 'gemini-3.1-pro-preview',
                apiKey: geminiKey,
                temperature,
                maxOutputTokens: 8192,
            }),
        });
    }

    if (openaiKey) {
        chain.push({
            name: 'GPT-5.2 Codex',
            instance: new ChatOpenAI({
                model: 'gpt-5.2-codex',
                apiKey: openaiKey,
                temperature,
                maxTokens: 8192,
            }),
        });
    }

    if (anthropicKey) {
        chain.push({
            name: 'Claude Opus 4.6',
            instance: new ChatAnthropic({
                model: 'claude-opus-4-6',
                apiKey: anthropicKey,
                temperature,
                maxTokens: 8192,
            }),
        });
    }

    if (chain.length === 0) {
        throw new Error('No valid AI API keys. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in .env');
    }
    return chain;
};

// Backward-compat: return first available model
const getModel = (temperature = 0.7) => {
    const chain = getModelChain(temperature);
    console.log(`[AI] Using ${chain[0].name} (primary)`);
    return chain[0].instance;
};

/**
 * Invoke messages with automatic fallback through the model chain.
 * If the primary model fails (network, API key, quota, model retired, etc.),
 * it automatically tries the next provider.
 */
const invokeWithFallback = async (messages, temperature = 0.7) => {
    const chain = getModelChain(temperature);

    for (let i = 0; i < chain.length; i++) {
        const { name, instance } = chain[i];
        try {
            console.log(`[AI] Trying ${name}${i > 0 ? ' (fallback)' : ''}...`);
            const response = await instance.invoke(messages);
            console.log(`[AI] ✅ ${name} succeeded`);
            return response;
        } catch (err) {
            console.error(`[AI] ❌ ${name} failed: ${err.message?.substring(0, 120)}`);
            if (i === chain.length - 1) {
                throw err; // Last provider — rethrow
            }
            console.log(`[AI] Trying next provider...`);
        }
    }
};





/**
 * Stage 1: Prompt Craft — Transform raw idea into structured prompt
 */
async function generateStructuredPrompt(rawInput, businessType, matchedExample = null) {
    const exampleContext = matchedExample
        ? `Here is a similar example from a ${matchedExample.business_type} business:\n${JSON.stringify(matchedExample.full_spec?.stage_1 || {}, null, 2)}\n\nUse this as structural inspiration but adapt to the user's specific business.`
        : '';

    const messages = [
        new SystemMessage(`You are Spec Stack's Prompt Craft engine. Your job is to take a raw, unstructured business idea and transform it into a clear, structured prompt that an autonomous AI agent could execute.

You must produce a JSON response with these exact fields:
- instruction_block: A clear, detailed description of what the AI should do
- examples: Array of 2-3 specific examples of good output
- counter_examples: Array of 1-2 examples of what NOT to do
- output_format: Exact description of what the final output should look like
- ambiguity_rules: Array of rules for handling unclear situations
- guard_rails: Array of safety limits and boundaries

${exampleContext}

IMPORTANT:
- Use plain language the user would understand
- Be specific, not vague
- Include measurable outcomes where possible
- Do NOT use engineering jargon
- The prompt should be self-contained — someone with no context should understand it

Respond ONLY with valid JSON.`),
        new HumanMessage(`Business type: ${businessType || 'general'}
    
User's raw idea: "${rawInput}"

Transform this into a structured prompt.`)
    ];

    const response = await invokeWithFallback(messages, 0.7);

    try {
        const content = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(content);
    } catch (e) {
        console.error('Failed to parse AI response for Stage 1:', e.message);
        return {
            instruction_block: response.content,
            examples: [],
            counter_examples: [],
            output_format: '',
            ambiguity_rules: [],
            guard_rails: []
        };
    }
}

/**
 * Stage 2: Context Engineering — Build context bundle
 */
async function generateContextBundle(stage1Prompt, businessType, userDocuments = []) {

    const docContext = userDocuments.length > 0
        ? `The user has provided these documents:\n${userDocuments.map(d => `- ${d.filename}: ${d.content_text?.substring(0, 500) || 'No content'}`).join('\n')}`
        : 'The user has not provided any documents. Generate a context bundle from the prompt alone.';

    const messages = [
        new SystemMessage(`You are Spec Stack's Context Engineering engine. Build a complete information environment that an AI agent needs to execute the task autonomously.

Produce a JSON response with:
- system_prompt_components: Array of system prompt sections the agent needs
- tool_definitions: Array of tools/APIs the agent might need
- document_references: Array of relevant information from provided documents (with relevance_score 0-100)
- memory_config: Object describing what the agent should remember across sessions
- exclusion_list: Array of things the agent should NOT access or modify
- token_budget: Object with { target: number (tokens), current: number, signal_level: "green"|"yellow"|"red" }
- interview_questions: Array of 0-5 questions to fill gaps (fewer if documents cover the topic)

${docContext}

RULES:
- If documents cover a topic, do NOT ask about it
- Maximum 5 interview questions, fewer is better
- Use plain language
- token budget target should be 30000-80000 for standard tasks
- Signal level: green = under 50% budget, yellow = 50-80%, red = over 80%

Respond ONLY with valid JSON.`),
        new HumanMessage(`Business type: ${businessType || 'general'}
    
Structured prompt from Stage 1:
${JSON.stringify(stage1Prompt, null, 2)}

Build the context bundle.`)
    ];

    const response = await invokeWithFallback(messages, 0.5);

    try {
        const content = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(content);
    } catch (e) {
        console.error('Failed to parse AI response for Stage 2:', e.message);
        return {
            system_prompt_components: [],
            tool_definitions: [],
            document_references: [],
            memory_config: {},
            exclusion_list: [],
            token_budget: { target: 50000, current: 0, signal_level: 'green' },
            interview_questions: []
        };
    }
}

/**
 * Stage 3: Intent Engineering — Extract goals, trade-offs, escalation triggers
 */
async function generateIntentFramework(stage1Prompt, stage2Context, businessType, tradeoffAnswers = {}) {

    const tradeoffContext = Object.keys(tradeoffAnswers).length > 0
        ? `The user has answered these trade-off questions:\n${JSON.stringify(tradeoffAnswers, null, 2)}`
        : '';

    const messages = [
        new SystemMessage(`You are Spec Stack's Intent Engineering engine. Extract what the agent should optimize for, what trade-offs to make, and where to stop and ask the human.

Produce a JSON response with:
- ranked_goals: Array of at least 3 goals in priority order, each with { rank, goal, description }
- tradeoff_rules: Array of at least 2 trade-off rules, each with { when, choose, over, reasoning }
- decision_boundaries: Array of { situation, agent_can_decide: boolean, action }
- success_metrics: Array of measurable success criteria
- failure_modes: Array of specific failure scenarios
- escalation_triggers: Array of at least 3 situations where the AI must stop and ask
- tradeoff_questions: Array of plain-language either/or questions to ask the user (only if tradeoff answers not provided)
- worst_case_prompt: A domain-specific version of "Tell me how this could go wrong even if it technically looks finished"

${tradeoffContext}

RULES:
- Minimum 3 ranked goals, 2 trade-off rules, 3 escalation triggers
- All questions in plain language — no jargon
- Trade-offs as simple either/or choices
- Use the "worst case" prompt pattern for constraint extraction

Respond ONLY with valid JSON.`),
        new HumanMessage(`Business type: ${businessType || 'general'}

Stage 1 Prompt: ${JSON.stringify(stage1Prompt, null, 2)}
Stage 2 Context: ${JSON.stringify(stage2Context, null, 2)}

Generate the intent framework.`)
    ];

    const response = await invokeWithFallback(messages, 0.6);

    try {
        const content = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(content);
    } catch (e) {
        console.error('Failed to parse AI response for Stage 3:', e.message);
        return {
            ranked_goals: [],
            tradeoff_rules: [],
            decision_boundaries: [],
            success_metrics: [],
            failure_modes: [],
            escalation_triggers: [],
            tradeoff_questions: [],
            worst_case_prompt: "Tell me how this could go wrong even if it technically looks finished."
        };
    }
}

/**
 * Stage 4: Specification Engineering — Assemble five primitives + flowchart
 */
async function generateFullSpecification(stage1, stage2, stage3, businessType) {

    const messages = [
        new SystemMessage(`You are Spec Stack's Specification Engineering engine. Assemble a complete, agent-executable specification from the outputs of Stages 1-3.

Produce a JSON response with:

1. problem_statement: A self-contained problem statement (test: could someone with zero context execute this?)
2. acceptance_criteria: Array of at least 3 verifiable criteria, each with { criterion, verification_method, pass_condition }
3. constraint_architecture:
   - musts: Array of non-negotiable requirements
   - must_nots: Array of things the agent must never do
   - preferences: Array of nice-to-have behaviors
   - escalation_triggers: Array of situations requiring human input
4. break_patterns: Array of rules for decomposing the task, each with { rule, example, scope }
5. evaluation_design: Array of 3-5 test cases, each with { input_scenario, expected_output, pass_condition }
6. visual_flowchart: Object with:
   - nodes: Array of { id, type: "action"|"decision"|"escalation", label, constraint_type: "must"|"must_not"|"escalation"|null, phase: number, parent_phase: string|null }
   - edges: Array of { id, source, target, label }

RULES:
- The spec must be SELF-CONTAINED — no references to external documents not included
- All language must be actionable and specific
- Acceptance criteria must be measurable, not subjective
- Break patterns are RULES, not manual task lists
- Visual flowchart should have max 7 top-level phase nodes
- Include constraint badges on flowchart nodes

Respond ONLY with valid JSON.`),
        new HumanMessage(`Business type: ${businessType || 'general'}

Stage 1 (Prompt Craft): ${JSON.stringify(stage1, null, 2)}
Stage 2 (Context): ${JSON.stringify(stage2, null, 2)}
Stage 3 (Intent): ${JSON.stringify(stage3, null, 2)}

Generate the complete specification with all five primitives and a visual flowchart.`)
    ];

    const response = await invokeWithFallback(messages, 0.4);

    try {
        const content = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(content);
    } catch (e) {
        console.error('Failed to parse AI response for Stage 4:', e.message);
        return {
            problem_statement: '',
            acceptance_criteria: [],
            constraint_architecture: { musts: [], must_nots: [], preferences: [], escalation_triggers: [] },
            break_patterns: [],
            evaluation_design: [],
            visual_flowchart: { nodes: [], edges: [] }
        };
    }
}

/**
 * Export: Generate Markdown spec
 */
async function generateMarkdownExport(specification) {

    const messages = [
        new SystemMessage(`Convert the following specification JSON into a clean, well-structured Markdown document suitable for an autonomous AI agent to execute against.

Format it as a professional specification document with clear headers, bullet points, and structured sections. Include:
- Title and project summary
- Problem Statement
- Acceptance Criteria (numbered list)
- Constraint Architecture (organized by category)
- Break Patterns
- Evaluation Test Cases

Use markdown formatting: headers (#, ##, ###), bullet points, numbered lists, bold for emphasis, and code blocks where appropriate.

Output ONLY the markdown content, nothing else.`),
        new HumanMessage(JSON.stringify(specification, null, 2))
    ];

    const response = await invokeWithFallback(messages, 0.3);
    return response.content;
}

/**
 * Export: Generate claude.md format
 */
async function generateClaudeMdExport(specification) {

    const messages = [
        new SystemMessage(`Convert the following specification into a claude.md-compatible format. This is the format used by Claude Code and Claude agents as their operating instructions.

Structure it as:
1. # Project Identity section
2. ## Objectives section with ranked priorities
3. ## Context section with all relevant information
4. ## Constraints section with Musts, Must-Nots, Preferences
5. ## Escalation Rules section
6. ## Evaluation Criteria section
7. ## Working Patterns section with break patterns

Use clear, imperative language. The agent reading this file should be able to start work immediately without asking questions.

Output ONLY the claude.md content, nothing else.`),
        new HumanMessage(JSON.stringify(specification, null, 2))
    ];

    const response = await invokeWithFallback(messages, 0.3);
    return response.content;
}

/**
 * Domain Matching — Find best example match for a business type
 */
async function findDomainMatch(rawInput, businessType, examples) {
    if (!examples || examples.length === 0) return null;
    const messages = [
        new SystemMessage(`You are a domain-matching engine. Given a user's business type and task description, identify which example from the library is the best structural match.

Consider:
1. Business type similarity
2. Task pattern similarity (triage, creation, transformation, etc.)
3. Structural similarity of the workflow

Return a JSON response with:
- best_match_id: The example_id of the best match
- similarity_score: A float 0.0-1.0 indicating structural similarity
- explanation: One sentence explaining why this match was chosen
- cross_domain: boolean indicating if this is a cross-domain analogy

If no good match exists (similarity < 0.5), set best_match_id to null.

Respond ONLY with valid JSON.`),
        new HumanMessage(`User's business type: ${businessType}
User's task: ${rawInput}

Available examples:
${examples.map(e => `- ID: ${e.example_id}, Business: ${e.business_type}, Task: ${e.title}, Pattern: ${e.task_pattern}`).join('\n')}`)
    ];

    const response = await invokeWithFallback(messages, 0.3);
    try {
        const content = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(content);
    } catch (e) {
        return null;
    }
}

module.exports = {
    generateStructuredPrompt,
    generateContextBundle,
    generateIntentFramework,
    generateFullSpecification,
    generateMarkdownExport,
    generateClaudeMdExport,
    findDomainMatch
};
