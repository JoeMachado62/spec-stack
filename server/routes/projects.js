const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createProject, listProjects, getProject, updateProject, deleteProject } = require('../controllers/projectController');

router.use(authenticate);

router.post('/', createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
