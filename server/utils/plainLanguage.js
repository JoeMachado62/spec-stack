// Plain-Language Translation Engine (PRD Section 10)
// Maps internal engineering terms to user-facing plain language

const TRANSLATION_MAP = {
    'decomposition': "What are the pieces of this project?",
    'escalation_trigger': "What should the AI stop and ask you about?",
    'acceptance_criteria': "How would someone check if this work is done right?",
    'constraint_architecture': "What are the rules for how the AI should work?",
    'must_not': "What should the AI definitely NOT do?",
    'tradeoff_hierarchy': "When these two things conflict, which matters more?",
    'context_engineering': "What does the AI need to know?",
    'intent_engineering': "What should the AI care about?",
    'break_patterns': "How should big tasks get divided into smaller ones?",
    'evaluation_design': "How do we test if the AI did a good job?",
    'problem_statement': "Could someone with no background complete this from the description alone?",
    'specification_engineering': "The master plan for the AI",
    'prompt_craft': "Writing clear instructions for the AI",
    'guard_rails': "Safety limits for the AI",
    'counter_examples': "Things the AI should avoid doing",
    'ambiguity_rules': "How the AI handles unclear situations",
    'token_budget': "How much information the AI can handle",
    'signal_to_noise': "How focused and relevant the information is"
};

// Domain-contextual phrasing (PRD Section 10.4)
const DOMAIN_PHRASING = {
    'dog_groomer': {
        decomposition: "If you had to hand this off to a new groomer in bite-sized pieces, where would you draw the lines?",
        rejection: "What would make a pet owner complain about the service?",
        must_not: "What's something that could hurt a pet or scare an owner?"
    },
    'saas_founder': {
        decomposition: "If you had to assign this to a junior dev in tickets they could finish in an afternoon, how would you split it?",
        rejection: "What would make a user submit a support ticket?",
        must_not: "What could break the app or expose user data?"
    },
    'freelance_designer': {
        decomposition: "If you had to hand off individual pieces to a junior designer, where would you split the work?",
        rejection: "What would make a client request revisions?",
        must_not: "What would damage your brand or upset a client?"
    },
    'real_estate_agent': {
        decomposition: "If you had to have an assistant handle parts of this, which separate tasks would you create?",
        rejection: "What would make a buyer or seller lose trust?",
        must_not: "What could violate regulations or lose a deal?"
    },
    'business_coach': {
        decomposition: "If you had to break this down into individual coaching sessions, what would each cover?",
        rejection: "What would make a client feel they're not getting value?",
        must_not: "What could harm a client relationship or breach confidentiality?"
    },
    'default': {
        decomposition: "If you had to hand this to someone new, in chunks they could each handle independently, where would you draw the lines?",
        rejection: "What would make you look at the finished work and say 'this isn't right'?",
        must_not: "What should the AI absolutely never do when working on this?"
    }
};

/**
 * Get the plain-language translation for an internal term
 */
function translate(term, vocabularyLevel = 'plain') {
    if (vocabularyLevel === 'technical') {
        return term.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    if (vocabularyLevel === 'transitional') {
        const plain = TRANSLATION_MAP[term.toLowerCase()];
        const technical = term.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return plain ? `${plain} (${technical})` : technical;
    }
    return TRANSLATION_MAP[term.toLowerCase()] || term;
}

/**
 * Get domain-contextual phrasing for a question type
 */
function getDomainQuestion(businessType, questionType) {
    const normalizedType = businessType?.toLowerCase().replace(/[\s-]/g, '_') || 'default';
    const domain = DOMAIN_PHRASING[normalizedType] || DOMAIN_PHRASING['default'];
    return domain[questionType] || DOMAIN_PHRASING['default'][questionType];
}

/**
 * Strip all engineering jargon from user-facing text
 */
function sanitizeForUser(text) {
    let sanitized = text;
    Object.entries(TRANSLATION_MAP).forEach(([term, replacement]) => {
        const regex = new RegExp(term.replace(/_/g, '[\\s_-]'), 'gi');
        sanitized = sanitized.replace(regex, replacement);
    });
    return sanitized;
}

module.exports = {
    TRANSLATION_MAP,
    DOMAIN_PHRASING,
    translate,
    getDomainQuestion,
    sanitizeForUser
};
