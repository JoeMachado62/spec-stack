/**
 * Completeness Scoring Engine (PRD Section 12 & 18)
 * 
 * Scores a specification 0-100 based on coverage of all five primitives
 * and overall structural integrity.
 */

const WEIGHTS = {
    stage_1_prompt: 20,      // Prompt Craft
    stage_2_context: 20,     // Context Engineering
    stage_3_intent: 25,      // Intent Engineering (higher weight - most impactful)
    stage_4_spec: 25,        // Specification Engineering
    visual_flowchart: 10     // Visual representation
};

function scoreStage1(stage1) {
    if (!stage1) return 0;
    let score = 0;
    const total = 5;

    if (stage1.raw_input && stage1.raw_input.length > 10) score++;
    if (stage1.instruction_block && stage1.instruction_block.length > 20) score++;
    if (stage1.examples && stage1.examples.length > 0) score++;
    if (stage1.output_format && stage1.output_format.length > 10) score++;
    if (stage1.guard_rails && stage1.guard_rails.length > 0) score++;

    return (score / total) * WEIGHTS.stage_1_prompt;
}

function scoreStage2(stage2) {
    if (!stage2) return 0;
    let score = 0;
    const total = 5;

    if (stage2.system_prompt_components && stage2.system_prompt_components.length > 0) score++;
    if (stage2.document_references && stage2.document_references.length > 0) score++;
    if (stage2.exclusion_list && stage2.exclusion_list.length > 0) score++;
    if (stage2.token_budget && stage2.token_budget.target > 0) score++;
    if (stage2.memory_config && Object.keys(stage2.memory_config).length > 0) score++;

    return (score / total) * WEIGHTS.stage_2_context;
}

function scoreStage3(stage3) {
    if (!stage3) return 0;
    let score = 0;
    const total = 5;

    // Minimum: 3 ranked goals (PRD Section 18)
    if (stage3.ranked_goals && stage3.ranked_goals.length >= 3) score++;
    else if (stage3.ranked_goals && stage3.ranked_goals.length > 0) score += 0.5;

    // Minimum: 2 trade-off rules
    if (stage3.tradeoff_rules && stage3.tradeoff_rules.length >= 2) score++;
    else if (stage3.tradeoff_rules && stage3.tradeoff_rules.length > 0) score += 0.5;

    // Minimum: 3 escalation triggers
    if (stage3.escalation_triggers && stage3.escalation_triggers.length >= 3) score++;
    else if (stage3.escalation_triggers && stage3.escalation_triggers.length > 0) score += 0.5;

    if (stage3.success_metrics && stage3.success_metrics.length > 0) score++;
    if (stage3.failure_modes && stage3.failure_modes.length > 0) score++;

    return (score / total) * WEIGHTS.stage_3_intent;
}

function scoreStage4(stage4) {
    if (!stage4) return 0;
    let score = 0;
    const total = 5;

    // Five Primitives
    if (stage4.problem_statement && stage4.problem_statement.length > 20) score++;
    if (stage4.acceptance_criteria && stage4.acceptance_criteria.length >= 3) score++;
    if (stage4.constraint_architecture) {
        const ca = stage4.constraint_architecture;
        if (ca.musts?.length > 0 && ca.must_nots?.length > 0) score++;
    }
    if (stage4.break_patterns && stage4.break_patterns.length > 0) score++;
    if (stage4.evaluation_design && stage4.evaluation_design.length > 0) score++;

    return (score / total) * WEIGHTS.stage_4_spec;
}

function scoreVisual(visual) {
    if (!visual) return 0;
    let score = 0;
    const total = 2;

    if (visual.nodes && visual.nodes.length > 0) score++;
    if (visual.edges && visual.edges.length > 0) score++;

    return (score / total) * WEIGHTS.visual_flowchart;
}

/**
 * Calculate overall completeness score (0-100)
 */
function calculateCompletenessScore(specification) {
    const s1 = scoreStage1(specification.stage_1_prompt);
    const s2 = scoreStage2(specification.stage_2_context);
    const s3 = scoreStage3(specification.stage_3_intent);
    const s4 = scoreStage4(specification.stage_4_spec);
    const vis = scoreVisual(specification.visual_flowchart);

    return Math.round(s1 + s2 + s3 + s4 + vis);
}

/**
 * Get gap summary in plain language
 */
function getGapSummary(specification) {
    const gaps = [];

    const s1 = specification.stage_1_prompt || {};
    if (!s1.instruction_block) gaps.push("Your idea needs to be turned into clear instructions.");
    if (!s1.examples || s1.examples.length === 0) gaps.push("Adding examples of what good output looks like would help the AI understand your goal.");

    const s2 = specification.stage_2_context || {};
    if (!s2.system_prompt_components || s2.system_prompt_components.length === 0)
        gaps.push("The AI needs to know more about your business and this project.");
    if (!s2.exclusion_list || s2.exclusion_list.length === 0)
        gaps.push("Consider specifying what the AI should NOT access or change.");

    const s3 = specification.stage_3_intent || {};
    if (!s3.ranked_goals || s3.ranked_goals.length < 3)
        gaps.push("Define at least 3 priorities for what the AI should optimize for.");
    if (!s3.escalation_triggers || s3.escalation_triggers.length < 3)
        gaps.push("Set at least 3 situations where the AI should stop and ask you before continuing.");

    const s4 = specification.stage_4_spec || {};
    if (!s4.acceptance_criteria || s4.acceptance_criteria.length < 3)
        gaps.push("Add at least 3 ways to check if the AI did the work correctly.");
    if (!s4.break_patterns || s4.break_patterns.length === 0)
        gaps.push("Define rules for how the AI should break large tasks into smaller pieces.");

    return gaps;
}

module.exports = {
    calculateCompletenessScore,
    getGapSummary,
    WEIGHTS
};
