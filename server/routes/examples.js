const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Example } = require('../models');

// Get all examples (public for browsing)
router.get('/', async (req, res) => {
    try {
        const { business_type, task_pattern, complexity_tier } = req.query;
        const where = {};
        if (business_type) where.business_type = business_type;
        if (task_pattern) where.task_pattern = task_pattern;
        if (complexity_tier) where.complexity_tier = complexity_tier;

        const examples = await Example.findAll({
            where,
            attributes: ['example_id', 'business_type', 'task_pattern', 'complexity_tier', 'title', 'description', 'source', 'eval_success_rate', 'domain_keywords'],
            order: [['eval_success_rate', 'DESC']]
        });

        res.json({ examples });
    } catch (error) {
        console.error('List examples error:', error);
        res.status(500).json({ error: 'Failed to list examples.' });
    }
});

// Get single example with full spec
router.get('/:id', async (req, res) => {
    try {
        const example = await Example.findByPk(req.params.id);
        if (!example) return res.status(404).json({ error: 'Example not found.' });
        res.json({ example });
    } catch (error) {
        console.error('Get example error:', error);
        res.status(500).json({ error: 'Failed to retrieve example.' });
    }
});

module.exports = router;
