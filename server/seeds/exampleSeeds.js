/**
 * Seed Example Library — Top 20 Business Types (PRD Section 7.2)
 * Each example contains a complete 4-stage spec for domain matching
 */
const { Example } = require('../models');

const SEED_EXAMPLES = [
    {
        business_type: 'Freelance Designer',
        task_pattern: 'onboarding',
        complexity_tier: 'standard',
        title: 'Client Onboarding Flow',
        description: 'Automated client onboarding process for freelance designers including intake forms, project scoping, and welcome package delivery.',
        domain_keywords: ['design', 'client', 'onboarding', 'intake', 'freelance', 'portfolio', 'brand'],
        full_spec: {
            stage_1: {
                instruction_block: 'Create an automated client onboarding flow that collects project requirements, sets expectations, and delivers a welcome package — all without manual intervention.',
                examples: ['Send a branded welcome email within 1 hour of contract signing', 'Auto-generate a project brief from intake form responses'],
                counter_examples: ['Do not send generic templates without personalization', 'Do not commit to timelines not validated by the designer'],
                output_format: 'A step-by-step onboarding sequence with email templates, form fields, and timing rules',
                ambiguity_rules: ['If project scope is unclear, ask for 3 reference examples', 'Default to the designer\'s standard timeline unless the client specifies urgency'],
                guard_rails: ['Never share portfolio piece pricing publicly', 'Always require a signed contract before starting work']
            },
            stage_2: {
                system_prompt_components: ['Brand voice guide', 'Standard service packages and pricing tiers', 'Typical project timeline by service type'],
                tool_definitions: ['Email sending service', 'Form builder', 'Calendar scheduling'],
                document_references: [],
                memory_config: { retain: 'client_preferences', duration: 'project_lifetime' },
                exclusion_list: ['Financial records', 'Other client data'],
                token_budget: { target: 40000, current: 15000, signal_level: 'green' }
            },
            stage_3: {
                ranked_goals: [
                    { rank: 1, goal: 'Professional first impression', description: 'Client feels confident they chose the right designer' },
                    { rank: 2, goal: 'Complete information capture', description: 'All project requirements documented before kickoff' },
                    { rank: 3, goal: 'Speed', description: 'Onboarding complete within 24 hours of contract' }
                ],
                tradeoff_rules: [
                    { when: 'Client provides incomplete info', choose: 'Ask clarifying questions', over: 'Making assumptions' },
                    { when: 'Speed vs. personalization', choose: 'Personalized response', over: 'Fast generic reply' }
                ],
                escalation_triggers: ['Budget exceeds standard packages', 'Client requests services outside scope', 'Urgent timeline (under 48 hours)']
            },
            stage_4: {},
            visual_flowchart: { nodes: [], edges: [] },
            eval_test_cases: [
                { input_scenario: 'New client signs contract for logo design', expected_output: 'Welcome email + intake form sent within 1 hour', pass_condition: 'Email personalized with client name and project type' },
                { input_scenario: 'Client fills intake form with incomplete info', expected_output: 'Follow-up email asking 2-3 specific clarifying questions', pass_condition: 'Questions are relevant and not generic' },
                { input_scenario: 'Client requests rush delivery', expected_output: 'Escalation to designer with rush pricing options', pass_condition: 'Designer notified, client informed of rush fees' }
            ]
        }
    },
    {
        business_type: 'Solo SaaS Founder',
        task_pattern: 'triage',
        complexity_tier: 'standard',
        title: 'Customer Support Routing',
        description: 'Intelligent customer support ticket routing that categorizes, prioritizes, and routes support requests to the right response path.',
        domain_keywords: ['saas', 'support', 'tickets', 'routing', 'customer', 'helpdesk', 'bugs'],
        full_spec: {
            stage_1: {
                instruction_block: 'Build an automated support routing system that reads incoming support requests, categorizes them by type and urgency, and routes them to the appropriate response path.',
                examples: ['Bug report about login → High priority, route to technical queue', 'Feature request → Low priority, log and acknowledge'],
                counter_examples: ['Do not auto-close tickets without resolution', 'Do not send canned responses to urgent bugs'],
                output_format: 'Categorized ticket with priority level, assigned queue, and initial response',
                ambiguity_rules: ['If category is unclear, default to general support', 'If urgency is uncertain, treat as medium'],
                guard_rails: ['Never expose internal system details to customers', 'Always acknowledge receipt within 5 minutes']
            },
            stage_2: { system_prompt_components: ['Product knowledge base', 'Known issues list', 'Response templates by category'], tool_definitions: ['Help desk API', 'Notification system'], document_references: [], memory_config: { retain: 'customer_history', duration: 'indefinite' }, exclusion_list: ['Source code', 'Internal roadmap'], token_budget: { target: 50000, current: 20000, signal_level: 'green' } },
            stage_3: { ranked_goals: [{ rank: 1, goal: 'Fast acknowledgment', description: 'Every customer knows their issue was received' }, { rank: 2, goal: 'Accurate categorization', description: 'Tickets reach the right queue 95% of the time' }, { rank: 3, goal: 'Customer satisfaction', description: 'Responses feel helpful, not robotic' }], tradeoff_rules: [{ when: 'Speed vs accuracy', choose: 'Accuracy', over: 'Speed' }], escalation_triggers: ['Customer threatens to cancel', 'Security-related issue', 'Data loss reported'] },
            stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: []
        }
    },
    {
        business_type: 'Real Estate Agent',
        task_pattern: 'follow_up',
        complexity_tier: 'standard',
        title: 'Lead Follow-up Sequence',
        description: 'Automated lead nurturing sequence for real estate prospects including initial response, drip campaigns, and re-engagement.',
        domain_keywords: ['real estate', 'leads', 'follow-up', 'nurture', 'properties', 'listings', 'buyers'],
        full_spec: { stage_1: { instruction_block: 'Create a lead follow-up sequence that responds to new inquiries, nurtures prospects over time, and re-engages cold leads — keeping the agent\'s personal touch.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Response speed', description: 'New leads get a personal response within 15 minutes' }, { rank: 2, goal: 'Relationship building', description: 'Each touchpoint adds value' }, { rank: 3, goal: 'Conversion', description: 'Move leads toward a showing or consultation' }], tradeoff_rules: [{ when: 'Personalization vs volume', choose: 'Personalization', over: 'Volume' }], escalation_triggers: ['Lead ready to make offer', 'Lead asks about financing', 'Lead hasn\'t responded in 30 days'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] }
    },
    {
        business_type: 'Business Coach',
        task_pattern: 'onboarding',
        complexity_tier: 'standard',
        title: 'Program Enrollment Pipeline',
        description: 'Coaching program enrollment pipeline from lead capture through payment to first session scheduling.',
        domain_keywords: ['coaching', 'enrollment', 'program', 'clients', 'sessions', 'transformation'],
        full_spec: { stage_1: { instruction_block: 'Build a coaching program enrollment pipeline that guides prospects from initial interest to payment and first session.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Trust building', description: 'Prospects feel understood before enrolling' }, { rank: 2, goal: 'Clear expectations', description: 'Program outcomes are specific and honest' }, { rank: 3, goal: 'Smooth enrollment', description: 'Payment and scheduling happen without friction' }], tradeoff_rules: [{ when: 'Speed vs trust', choose: 'Trust building', over: 'Fast close' }], escalation_triggers: ['Prospect has budget concerns', 'Prospect needs custom program', 'Prospect mentions mental health issues'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] }
    },
    {
        business_type: 'E-commerce Store',
        task_pattern: 'transformation',
        complexity_tier: 'standard',
        title: 'Product Listing Optimization',
        description: 'Automated product listing optimization for better search visibility and conversion rates.',
        domain_keywords: ['ecommerce', 'products', 'listings', 'seo', 'conversion', 'shopify', 'amazon'],
        full_spec: { stage_1: { instruction_block: 'Optimize existing product listings for search visibility and conversion by improving titles, descriptions, images, and metadata.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Search visibility', description: 'Listings appear in top 10 for target keywords' }, { rank: 2, goal: 'Conversion rate', description: 'Listings convert browsers to buyers' }, { rank: 3, goal: 'Brand consistency', description: 'All listings maintain brand voice' }], tradeoff_rules: [{ when: 'SEO keywords vs readability', choose: 'Readability', over: 'Keyword stuffing' }], escalation_triggers: ['Product has legal restrictions', 'Pricing changes needed', 'Competitor makes misleading claims'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] }
    },
    {
        business_type: 'Content Agency',
        task_pattern: 'reporting',
        complexity_tier: 'standard',
        title: 'Content Audit and Calendar',
        description: 'Comprehensive content audit and editorial calendar creation based on performance data and audience insights.',
        domain_keywords: ['content', 'audit', 'calendar', 'editorial', 'publishing', 'social media', 'blog'],
        full_spec: { stage_1: { instruction_block: 'Conduct a content audit of existing assets, score them by performance, and create an editorial calendar for the next quarter.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Data-driven decisions', description: 'Calendar based on performance metrics, not guesses' }, { rank: 2, goal: 'Consistency', description: 'Regular publishing schedule maintained' }, { rank: 3, goal: 'Audience relevance', description: 'Content matches what the audience wants' }], tradeoff_rules: [], escalation_triggers: ['Performance data is incomplete', 'Major industry event changes priorities'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] }
    },
    {
        business_type: 'Bookkeeper',
        task_pattern: 'transformation',
        complexity_tier: 'complex',
        title: 'Monthly Close Process',
        description: 'Automated monthly close process including reconciliation, categorization, and report generation.',
        domain_keywords: ['bookkeeping', 'accounting', 'reconciliation', 'close', 'financial', 'reports'],
        full_spec: { stage_1: { instruction_block: 'Automate the monthly close process: reconcile bank statements, categorize transactions, generate P&L and balance sheet.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Accuracy', description: 'Zero tolerance for miscategorized transactions' }, { rank: 2, goal: 'Completeness', description: 'Every transaction accounted for' }, { rank: 3, goal: 'Timeliness', description: 'Close completed within 5 business days of month end' }], tradeoff_rules: [{ when: 'Speed vs accuracy', choose: 'Accuracy', over: 'Speed' }], escalation_triggers: ['Discrepancy over $100', 'Unusual transaction pattern', 'Missing bank data'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] }
    },
    {
        business_type: 'Photographer',
        task_pattern: 'scheduling',
        complexity_tier: 'simple',
        title: 'Booking and Scheduling',
        description: 'Automated booking flow for photography sessions including availability check, deposit collection, and confirmation.',
        domain_keywords: ['photography', 'booking', 'scheduling', 'sessions', 'availability', 'deposits'],
        full_spec: { stage_1: { instruction_block: 'Create a booking system that shows availability, collects session details, processes deposits, and sends confirmations.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Easy booking', description: 'Client books in under 5 minutes' }, { rank: 2, goal: 'No double-booking', description: 'Calendar accuracy is non-negotiable' }, { rank: 3, goal: 'Professional communication', description: 'All client communications reflect the brand' }], tradeoff_rules: [], escalation_triggers: ['Client requests date outside availability', 'Custom session type', 'Group booking over 10 people'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] }
    },
    {
        business_type: 'Consultant',
        task_pattern: 'creation',
        complexity_tier: 'complex',
        title: 'Proposal Generation',
        description: 'AI-driven proposal generation from discovery call notes, including scope, timeline, pricing, and terms.',
        domain_keywords: ['consulting', 'proposal', 'scope', 'pricing', 'discovery', 'engagement'],
        full_spec: { stage_1: { instruction_block: 'Generate a professional consulting proposal from discovery call notes and client requirements.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Scope accuracy', description: 'Proposal reflects what was actually discussed' }, { rank: 2, goal: 'Professional presentation', description: 'Proposal looks polished and inspires confidence' }, { rank: 3, goal: 'Clear pricing', description: 'No ambiguity about costs and what\'s included' }], tradeoff_rules: [{ when: 'Speed vs customization', choose: 'Customization', over: 'Speed' }], escalation_triggers: ['Project scope exceeds $50K', 'Client requests unusual terms', 'Legal review needed'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] }
    },
    {
        business_type: 'Marketing Freelancer',
        task_pattern: 'reporting',
        complexity_tier: 'standard',
        title: 'Campaign Performance Report',
        description: 'Automated campaign performance reporting with insights, recommendations, and client-ready presentation.',
        domain_keywords: ['marketing', 'campaign', 'analytics', 'reporting', 'performance', 'roi'],
        full_spec: { stage_1: { instruction_block: 'Generate weekly campaign performance reports with key metrics, trend analysis, and actionable recommendations.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Actionable insights', description: 'Every report includes specific next steps' }, { rank: 2, goal: 'Data accuracy', description: 'Metrics verified against source platforms' }, { rank: 3, goal: 'Client clarity', description: 'Non-technical clients understand the report' }], tradeoff_rules: [], escalation_triggers: ['Performance drops more than 20%', 'Budget overrun detected', 'Platform API changes'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] }
    },
    { business_type: 'Virtual Assistant', task_pattern: 'triage', complexity_tier: 'standard', title: 'Email Triage and Routing', description: 'Automated email triage that categorizes, prioritizes, and routes emails to appropriate folders or response queues.', domain_keywords: ['email', 'triage', 'inbox', 'routing', 'prioritization', 'assistant'], full_spec: { stage_1: { instruction_block: 'Triage incoming emails by urgency and category, draft responses for routine items, and flag important items for review.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Nothing falls through cracks', description: 'Every email gets a response or is routed' }, { rank: 2, goal: 'Urgency detection', description: 'Time-sensitive items are flagged immediately' }, { rank: 3, goal: 'Accurate categorization', description: 'Emails land in the right folder' }], tradeoff_rules: [], escalation_triggers: ['Email from VIP contact', 'Legal or compliance content', 'Angry or threatening tone'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Dog Groomer', task_pattern: 'scheduling', complexity_tier: 'simple', title: 'Appointment Booking Flow', description: 'Pet grooming appointment booking with breed-specific service selection, scheduling, and reminder sequences.', domain_keywords: ['grooming', 'pets', 'appointments', 'booking', 'scheduling', 'dogs'], full_spec: { stage_1: { instruction_block: 'Create an appointment booking system for a dog grooming business that handles breed-specific services, timing, and reminders.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Pet safety', description: 'Breed-specific needs are captured before the appointment' }, { rank: 2, goal: 'No-show reduction', description: 'Reminder sequence reduces cancellations' }, { rank: 3, goal: 'Efficient scheduling', description: 'Appointments optimized for service duration by breed' }], tradeoff_rules: [], escalation_triggers: ['Aggressive dog history noted', 'Medical conditions reported', 'First-time client with large breed'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Online Course Creator', task_pattern: 'onboarding', complexity_tier: 'standard', title: 'Student Onboarding', description: 'Course student onboarding flow from enrollment through first module completion.', domain_keywords: ['course', 'online learning', 'students', 'onboarding', 'modules', 'education'], full_spec: { stage_1: { instruction_block: 'Onboard new course students from enrollment to first module completion with orientation, community access, and milestone tracking.' }, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'First win', description: 'Students complete first module within 48 hours' }, { rank: 2, goal: 'Community connection', description: 'Students join community and introduce themselves' }, { rank: 3, goal: 'Clear expectations', description: 'Students know what to expect and how to get help' }], tradeoff_rules: [], escalation_triggers: ['Student reports technical issues', 'Student goes inactive for 7+ days', 'Refund request'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Social Media Manager', task_pattern: 'routing', complexity_tier: 'standard', title: 'Content Approval Workflow', description: 'Social media content approval workflow with multi-stakeholder review and scheduled publishing.', domain_keywords: ['social media', 'content', 'approval', 'publishing', 'scheduling', 'review'], full_spec: { stage_1: {}, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Brand safety', description: 'No content goes live without approval' }, { rank: 2, goal: 'Consistent posting', description: 'Publishing schedule maintained despite review delays' }, { rank: 3, goal: 'Stakeholder visibility', description: 'Everyone sees what\'s being published and when' }], tradeoff_rules: [], escalation_triggers: ['Content touches sensitive topic', 'Legal review needed', 'Client changes brand guidelines'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Copywriter', task_pattern: 'creation', complexity_tier: 'standard', title: 'Brief-to-Draft Pipeline', description: 'Automated pipeline from client brief to polished first draft with research, outline, and revision loops.', domain_keywords: ['copywriting', 'brief', 'draft', 'writing', 'content', 'revision'], full_spec: { stage_1: {}, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Brief fidelity', description: 'Draft matches what the client asked for' }, { rank: 2, goal: 'Quality writing', description: 'Draft is polished, not rough' }, { rank: 3, goal: 'Speed', description: 'First draft delivered within 24 hours' }], tradeoff_rules: [], escalation_triggers: ['Brief is contradictory', 'Topic requires subject matter expertise', 'Client requests multiple revisions beyond scope'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Web Developer', task_pattern: 'onboarding', complexity_tier: 'standard', title: 'Client Project Kickoff', description: 'Web development project kickoff process including requirements gathering, technical scoping, and sprint planning.', domain_keywords: ['web development', 'kickoff', 'requirements', 'scoping', 'sprint', 'project'], full_spec: { stage_1: {}, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Scope clarity', description: 'What will and won\'t be built is documented' }, { rank: 2, goal: 'Client alignment', description: 'Client and developer agree on deliverables' }, { rank: 3, goal: 'Realistic timeline', description: 'Timeline accounts for complexity and unknowns' }], tradeoff_rules: [], escalation_triggers: ['Scope exceeds budget', 'Client needs custom integrations', 'Security requirements unclear'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Personal Trainer', task_pattern: 'creation', complexity_tier: 'standard', title: 'Client Programming', description: 'Personalized training program creation based on client goals, fitness level, and available equipment.', domain_keywords: ['fitness', 'training', 'programming', 'workouts', 'clients', 'goals'], full_spec: { stage_1: {}, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Safety', description: 'Program appropriate for client\'s fitness level' }, { rank: 2, goal: 'Goal alignment', description: 'Exercises directly support stated goals' }, { rank: 3, goal: 'Progressive overload', description: 'Program builds difficulty over time' }], tradeoff_rules: [], escalation_triggers: ['Client reports pain or injury', 'Client has medical conditions', 'Client is pregnant or post-surgery'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Event Planner', task_pattern: 'routing', complexity_tier: 'complex', title: 'Vendor Coordination', description: 'Multi-vendor coordination for events including communication, timeline management, and logistics.', domain_keywords: ['events', 'vendors', 'coordination', 'logistics', 'planning', 'timeline'], full_spec: { stage_1: {}, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Timeline adherence', description: 'Every vendor delivers on schedule' }, { rank: 2, goal: 'Communication clarity', description: 'All vendors have the same information' }, { rank: 3, goal: 'Contingency readiness', description: 'Backup plans exist for critical vendors' }], tradeoff_rules: [], escalation_triggers: ['Vendor cancels within 48 hours', 'Budget overrun', 'Weather emergency'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Recruiter', task_pattern: 'triage', complexity_tier: 'standard', title: 'Candidate Screening', description: 'Automated candidate screening pipeline from resume review through initial qualification to interview scheduling.', domain_keywords: ['recruiting', 'candidates', 'screening', 'hiring', 'resumes', 'interviews'], full_spec: { stage_1: {}, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Qualification accuracy', description: 'Right candidates advance, wrong ones don\'t' }, { rank: 2, goal: 'Candidate experience', description: 'Every applicant gets a timely, respectful response' }, { rank: 3, goal: 'Speed to interview', description: 'Qualified candidates reach interview stage in under 5 days' }], tradeoff_rules: [], escalation_triggers: ['Candidate may have discrimination concerns', 'Role requires security clearance', 'Executive-level position'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } },
    { business_type: 'Accountant', task_pattern: 'transformation', complexity_tier: 'complex', title: 'Tax Prep Document Collection', description: 'Tax preparation document collection system that tracks required documents, sends reminders, and flags missing items.', domain_keywords: ['tax', 'accounting', 'documents', 'collection', 'preparation', 'filing', 'irs'], full_spec: { stage_1: {}, stage_2: {}, stage_3: { ranked_goals: [{ rank: 1, goal: 'Document completeness', description: 'All required documents collected before filing deadline' }, { rank: 2, goal: 'Client convenience', description: 'Easy upload and tracking for clients' }, { rank: 3, goal: 'Deadline compliance', description: 'Filing deadlines never missed' }], tradeoff_rules: [], escalation_triggers: ['Client has foreign income', 'Business structure change', 'Audit notice received'] }, stage_4: {}, visual_flowchart: { nodes: [], edges: [] }, eval_test_cases: [] } }
];

async function seedExamples() {
    try {
        const count = await Example.count();
        if (count > 0) {
            console.log(`⏭️  Example library already seeded (${count} examples). Skipping.`);
            return;
        }

        for (const example of SEED_EXAMPLES) {
            await Example.create(example);
        }

        console.log(`✅ Seeded ${SEED_EXAMPLES.length} example specs into the library.`);
    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    }
}

module.exports = { seedExamples, SEED_EXAMPLES };
