const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { listModels, runSpec } = require('../controllers/executionController');

router.use(authenticate);

router.get('/models', listModels);
router.post('/:specId/run', runSpec);

module.exports = router;
