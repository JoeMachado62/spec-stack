const { Specification, Project, User } = require('../models');
const { executeSpec, getAvailableModels } = require('../services/executionService');

/**
 * GET /api/execution/models — List available AI models for the current user
 */
const listModels = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        const models = getAvailableModels(user?.api_keys || {});

        res.json({
            models,
            default_model: models.find(m => m.isDefault)?.id || 'gemini',
        });
    } catch (error) {
        console.error('List models error:', error);
        res.status(500).json({ error: 'Failed to list available models.' });
    }
};

/**
 * POST /api/execution/:specId/run — Execute a specification
 * Body: { platform: 'gemini' | 'openai' | 'anthropic' | 'auto' }
 */
const runSpec = async (req, res) => {
    try {
        const { platform = 'auto' } = req.body;

        const spec = await Specification.findOne({
            where: { spec_id: req.params.specId },
            include: [{ model: Project, as: 'project', where: { user_id: req.userId } }]
        });

        if (!spec) return res.status(404).json({ error: 'Specification not found.' });

        // Check that spec has enough content to execute
        if (!spec.stage_1_prompt || !spec.stage_4_spec) {
            return res.status(400).json({
                error: 'This specification isn\'t ready to run yet. Complete all 4 stages first.'
            });
        }

        // Get user's API keys for the cascade
        const user = await User.findByPk(req.userId);
        const userApiKeys = user?.api_keys || {};

        // Execute with cascade fallback
        const result = await executeSpec(spec, platform, userApiKeys);

        res.json({
            success: true,
            response: result.response,
            model_used: result.model_used,
            platform: result.platform,
            execution_time_ms: result.execution_time_ms,
            spec_confirmed: result.spec_confirmed,
        });
    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({
            error: 'Failed to run your specification. Please check your API keys and try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

module.exports = { listModels, runSpec };
