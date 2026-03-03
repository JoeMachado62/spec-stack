const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
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
} = require('../controllers/specController');

router.use(authenticate);

// Get specification
router.get('/:specId', getSpecification);

// Four-stage workflow
router.post('/:specId/stage/1', processStage1);
router.post('/:specId/stage/2', processStage2);
router.post('/:specId/stage/3', processStage3);
router.post('/:specId/stage/4', processStage4);

// Edit stage data (user tweaks AI responses)
router.patch('/:specId/stage/:stageNum', updateStageData);

// Document upload for Stage 2
router.post('/:specId/documents', upload.array('files', 10), uploadDocuments);

// Visual flowchart
router.put('/:specId/flowchart', updateFlowchart);

// Export
router.get('/:specId/export/:format', exportSpec);

module.exports = router;
