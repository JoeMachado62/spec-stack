const { Specification, Project, Example, TestCase, Document } = require('../models');
const aiService = require('../services/aiService');
const { calculateCompletenessScore, getGapSummary } = require('../utils/completenessScoring');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

// Configure multer for document uploads
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.doc', '.txt', '.md', '.csv'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error(`File type ${ext} not supported. Allowed: ${allowed.join(', ')}`));
    },
});

/**
 * Get the current specification for a project
 */
const getSpecification = async (req, res) => {
    try {
        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{
                model: Project,
                as: 'project',
                where: { user_id: req.userId }
            }, {
                model: TestCase,
                as: 'testCases'
            }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        const gaps = getGapSummary(spec);
        res.json({
            specification: spec,
            completeness_score: spec.completeness_score,
            gaps
        });
    } catch (error) {
        console.error('Get specification error:', error);
        res.status(500).json({ error: 'Failed to retrieve specification.' });
    }
};

/**
 * Stage 1: Prompt Craft — Process raw idea
 */
const processStage1 = async (req, res) => {
    try {
        const { raw_input, business_type } = req.body;
        if (!raw_input || raw_input.trim().length < 5) {
            return res.status(400).json({ error: 'Please describe your idea in at least a sentence.' });
        }

        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        // Find domain match
        const examples = await Example.findAll();
        let matchedExample = null;
        let domainMatch = null;

        if (examples.length > 0) {
            domainMatch = await aiService.findDomainMatch(raw_input, business_type, examples);
            if (domainMatch?.best_match_id) {
                matchedExample = examples.find(e => e.example_id === domainMatch.best_match_id);
            }
        }

        // Generate structured prompt
        const structuredPrompt = await aiService.generateStructuredPrompt(raw_input, business_type, matchedExample);

        // Update specification
        const stage1Data = {
            raw_input,
            ...structuredPrompt
        };

        spec.stage_1_prompt = stage1Data;
        spec.current_stage = 2;
        spec.completeness_score = calculateCompletenessScore(spec);
        await spec.save();

        // Update project business type if provided
        if (business_type) {
            await Project.update({ business_type }, { where: { project_id: spec.project_id } });
        }

        res.json({
            stage_1: stage1Data,
            domain_match: domainMatch,
            matched_example: matchedExample ? {
                business_type: matchedExample.business_type,
                title: matchedExample.title,
                task_pattern: matchedExample.task_pattern
            } : null,
            completeness_score: spec.completeness_score,
            next_stage: 2
        });
    } catch (error) {
        console.error('Stage 1 error:', error);
        res.status(500).json({ error: 'Failed to process your idea. Please try again.' });
    }
};

/**
 * Stage 2: Context Engineering — Build context bundle
 */
const processStage2 = async (req, res) => {
    try {
        const { additional_context, interview_answers } = req.body;

        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        // Generate context bundle from Stage 1 + any user documents
        const contextBundle = await aiService.generateContextBundle(
            spec.stage_1_prompt,
            spec.project.business_type,
            [] // TODO: Integrate user documents
        );

        // Merge any additional context or interview answers
        if (additional_context) {
            contextBundle.system_prompt_components.push({
                type: 'user_provided',
                content: additional_context
            });
        }

        if (interview_answers) {
            contextBundle.interview_responses = interview_answers;
        }

        spec.stage_2_context = contextBundle;
        spec.current_stage = 3;
        spec.completeness_score = calculateCompletenessScore(spec);
        await spec.save();

        res.json({
            stage_2: contextBundle,
            completeness_score: spec.completeness_score,
            signal_level: contextBundle.token_budget?.signal_level || 'green',
            next_stage: 3
        });
    } catch (error) {
        console.error('Stage 2 error:', error);
        res.status(500).json({ error: 'Failed to build context. Please try again.' });
    }
};

/**
 * Stage 3: Intent Engineering — Extract goals and trade-offs
 */
const processStage3 = async (req, res) => {
    try {
        const { tradeoff_answers, worst_case_response } = req.body;

        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        const allAnswers = { ...tradeoff_answers };
        if (worst_case_response) {
            allAnswers.worst_case = worst_case_response;
        }

        const intentFramework = await aiService.generateIntentFramework(
            spec.stage_1_prompt,
            spec.stage_2_context,
            spec.project.business_type,
            allAnswers
        );

        spec.stage_3_intent = intentFramework;
        spec.current_stage = 4;
        spec.completeness_score = calculateCompletenessScore(spec);
        await spec.save();

        res.json({
            stage_3: intentFramework,
            completeness_score: spec.completeness_score,
            next_stage: 4
        });
    } catch (error) {
        console.error('Stage 3 error:', error);
        res.status(500).json({ error: 'Failed to build intent framework. Please try again.' });
    }
};

/**
 * Stage 4: Specification Engineering — Generate full spec + flowchart
 */
const processStage4 = async (req, res) => {
    try {
        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        const fullSpec = await aiService.generateFullSpecification(
            spec.stage_1_prompt,
            spec.stage_2_context,
            spec.stage_3_intent,
            spec.project.business_type
        );

        // Update the spec with all five primitives
        spec.stage_4_spec = {
            problem_statement: fullSpec.problem_statement,
            acceptance_criteria: fullSpec.acceptance_criteria,
            constraint_architecture: fullSpec.constraint_architecture,
            break_patterns: fullSpec.break_patterns,
            evaluation_design: fullSpec.evaluation_design
        };

        spec.visual_flowchart = fullSpec.visual_flowchart || { nodes: [], edges: [] };
        spec.completeness_score = calculateCompletenessScore(spec);
        await spec.save();

        // Create test cases from evaluation design
        if (fullSpec.evaluation_design && fullSpec.evaluation_design.length > 0) {
            await TestCase.destroy({ where: { spec_id: spec.spec_id } });
            for (const testCase of fullSpec.evaluation_design) {
                await TestCase.create({
                    spec_id: spec.spec_id,
                    input_scenario: testCase.input_scenario || testCase.scenario || '',
                    expected_output: testCase.expected_output || testCase.expected || '',
                    pass_condition: testCase.pass_condition || testCase.condition || ''
                });
            }
        }

        const gaps = getGapSummary(spec);

        res.json({
            stage_4: spec.stage_4_spec,
            visual_flowchart: spec.visual_flowchart,
            completeness_score: spec.completeness_score,
            gaps,
            test_cases: fullSpec.evaluation_design
        });
    } catch (error) {
        console.error('Stage 4 error:', error);
        res.status(500).json({ error: 'Failed to generate specification. Please try again.' });
    }
};

/**
 * Update the visual flowchart
 */
const updateFlowchart = async (req, res) => {
    try {
        const { nodes, edges } = req.body;

        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        spec.visual_flowchart = { nodes: nodes || [], edges: edges || [] };
        spec.completeness_score = calculateCompletenessScore(spec);
        await spec.save();

        res.json({
            visual_flowchart: spec.visual_flowchart,
            completeness_score: spec.completeness_score
        });
    } catch (error) {
        console.error('Update flowchart error:', error);
        res.status(500).json({ error: 'Failed to update flowchart.' });
    }
};

/**
 * Export specification in various formats
 */
const exportSpec = async (req, res) => {
    try {
        const { format } = req.params;

        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        let content;
        let contentType;
        let filename;

        switch (format) {
            case 'markdown':
                content = await aiService.generateMarkdownExport(spec);
                contentType = 'text/markdown';
                filename = `${spec.project.title.replace(/\s+/g, '-')}-spec.md`;
                break;

            case 'claude-md':
                content = await aiService.generateClaudeMdExport(spec);
                contentType = 'text/markdown';
                filename = `claude.md`;
                break;

            case 'json':
                content = JSON.stringify({
                    project: spec.project.title,
                    prompt: spec.stage_1_prompt,
                    context: spec.stage_2_context,
                    intent: spec.stage_3_intent,
                    specification: spec.stage_4_spec,
                    flowchart: spec.visual_flowchart,
                    completeness_score: spec.completeness_score
                }, null, 2);
                contentType = 'application/json';
                filename = `${spec.project.title.replace(/\s+/g, '-')}-spec.json`;
                break;

            default:
                return res.status(400).json({ error: 'Unsupported format. Use: markdown, claude-md, or json' });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(content);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export specification.' });
    }
};

/**
 * PATCH: Edit stage data — allows users to tweak/fix AI responses
 */
const updateStageData = async (req, res) => {
    try {
        const { stageNum } = req.params;
        const { data } = req.body;
        const stage = parseInt(stageNum);

        if (![1, 2, 3, 4].includes(stage)) {
            return res.status(400).json({ error: 'Invalid stage number. Must be 1-4.' });
        }

        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        const fieldMap = {
            1: 'stage_1_prompt',
            2: 'stage_2_context',
            3: 'stage_3_intent',
            4: 'stage_4_spec',
        };

        const field = fieldMap[stage];
        const currentData = spec[field] || {};

        // Merge the edits into existing data (deep merge top-level keys)
        spec[field] = { ...currentData, ...data };
        spec.completeness_score = calculateCompletenessScore(spec);
        await spec.save();

        res.json({
            [`stage_${stage}`]: spec[field],
            completeness_score: spec.completeness_score,
        });
    } catch (error) {
        console.error('Update stage error:', error);
        res.status(500).json({ error: 'Failed to update stage data.' });
    }
};

/**
 * Upload documents for Stage 2 context
 */
const uploadDocuments = async (req, res) => {
    try {
        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        const uploaded = [];
        for (const file of req.files) {
            // Read text content from file
            let contentText = '';
            const ext = path.extname(file.originalname).toLowerCase();
            if (['.txt', '.md', '.csv'].includes(ext)) {
                contentText = fs.readFileSync(file.path, 'utf-8');
            } else {
                contentText = `[Binary file: ${file.originalname} — ${(file.size / 1024).toFixed(1)}KB]`;
            }

            // Save to documents table
            const doc = await Document.create({
                user_id: req.userId,
                project_id: spec.project_id,
                source: 'upload',
                filename: file.originalname,
                content_text: contentText.substring(0, 50000), // cap at 50k chars
                metadata: { size: file.size, mimetype: file.mimetype, path: file.path },
            });

            uploaded.push({
                document_id: doc.document_id,
                filename: doc.filename,
                size: file.size,
                content_preview: contentText.substring(0, 200),
            });
        }

        res.json({ documents: uploaded, count: uploaded.length });
    } catch (error) {
        console.error('Upload documents error:', error);
        res.status(500).json({ error: 'Failed to upload documents.' });
    }
};

/**
 * Scrape a URL and save its text content as a document
 */
const scrapeUrl = async (req, res) => {
    try {
        let { url } = req.body;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'Please provide a valid URL.' });
        }

        // Normalize URL
        url = url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        // Handle Google Docs/Sheets shared links → convert to plain text export
        let fetchUrl = url;
        const gdocMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
        const gsheetMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        if (gdocMatch) {
            fetchUrl = `https://docs.google.com/document/d/${gdocMatch[1]}/export?format=txt`;
        } else if (gsheetMatch) {
            fetchUrl = `https://docs.google.com/spreadsheets/d/${gsheetMatch[1]}/export?format=csv`;
        }

        console.log(`[Scrape] Fetching: ${fetchUrl}`);

        // Allow self-signed certs in dev for outgoing HTTP fetches
        const origTLS = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        if (process.env.NODE_ENV !== 'production') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        const response = await fetch(fetchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SpecStack/1.0; +https://prdwizard.com)',
                'Accept': 'text/html,application/xhtml+xml,text/plain,text/csv,*/*',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(15000), // 15s timeout
        });

        // Restore TLS setting
        if (origTLS === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        else process.env.NODE_TLS_REJECT_UNAUTHORIZED = origTLS;

        if (!response.ok) {
            return res.status(422).json({
                error: `Could not fetch URL (HTTP ${response.status}). Make sure the page is publicly accessible.`
            });
        }

        const contentType = response.headers.get('content-type') || '';
        const rawBody = await response.text();

        let extractedText = '';
        let title = url;

        if (contentType.includes('text/html')) {
            // Parse HTML and extract readable text
            const $ = cheerio.load(rawBody);

            // Remove non-content elements
            $('script, style, nav, footer, header, iframe, noscript, svg, [role="navigation"], [role="banner"]').remove();

            // Try to get title
            title = $('title').text().trim() || $('h1').first().text().trim() || url;

            // Extract main content (try article/main first, fall back to body)
            let contentEl = $('article').first();
            if (contentEl.length === 0) contentEl = $('main').first();
            if (contentEl.length === 0) contentEl = $('[role="main"]').first();
            if (contentEl.length === 0) contentEl = $('body');

            extractedText = contentEl.text()
                .replace(/\s+/g, ' ')          // collapse whitespace
                .replace(/\n\s*\n/g, '\n\n')   // normalize paragraphs
                .trim();
        } else {
            // Plain text, CSV, etc.
            extractedText = rawBody.trim();
            title = gdocMatch ? 'Google Doc' : gsheetMatch ? 'Google Sheet' : new URL(url).hostname;
        }

        if (!extractedText || extractedText.length < 10) {
            return res.status(422).json({
                error: 'Could not extract meaningful text from this URL. The page may be empty or require login.'
            });
        }

        // Cap at 50k chars
        const cappedText = extractedText.substring(0, 50000);

        // Save to documents table
        const doc = await Document.create({
            user_id: req.userId,
            project_id: spec.project_id,
            source: 'upload',
            filename: title.substring(0, 200),
            content_text: cappedText,
            source_ref: url,
            metadata: {
                source_type: 'url',
                original_url: url,
                content_type: contentType,
                chars_extracted: cappedText.length,
                scraped_at: new Date().toISOString(),
            },
        });

        console.log(`[Scrape] ✅ Extracted ${cappedText.length} chars from ${url}`);

        res.json({
            document: {
                document_id: doc.document_id,
                filename: title.substring(0, 200),
                source_url: url,
                chars: cappedText.length,
                content_preview: cappedText.substring(0, 300),
            },
        });
    } catch (error) {
        console.error('Scrape URL error:', error);
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            return res.status(422).json({ error: 'URL took too long to respond (15s timeout). Try a different page.' });
        }
        res.status(500).json({ error: 'Failed to scrape URL. Make sure it is publicly accessible.' });
    }
};

module.exports = {
    getSpecification,
    processStage1,
    processStage2,
    processStage3,
    processStage4,
    updateFlowchart,
    exportSpec,
    updateStageData,
    uploadDocuments,
    upload,
    scrapeUrl,
};
