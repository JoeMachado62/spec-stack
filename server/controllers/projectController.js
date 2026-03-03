const { Project, Specification } = require('../models');

const createProject = async (req, res) => {
    try {
        const { title, description, business_type } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Project title is required.' });
        }

        const project = await Project.create({
            user_id: req.userId,
            title,
            description,
            business_type
        });

        // Auto-create initial specification (version 1)
        const spec = await Specification.create({
            project_id: project.project_id,
            version: 1,
            current_stage: 1
        });

        res.status(201).json({
            project,
            specification: spec
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Failed to create project.' });
    }
};

const listProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: { user_id: req.userId },
            include: [{
                model: Specification,
                as: 'specifications',
                attributes: ['spec_id', 'version', 'current_stage', 'completeness_score', 'created_at', 'updated_at']
            }],
            order: [['updated_at', 'DESC']]
        });

        res.json({ projects });
    } catch (error) {
        console.error('List projects error:', error);
        res.status(500).json({ error: 'Failed to list projects.' });
    }
};

const getProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { project_id: req.params.id, user_id: req.userId },
            include: [{
                model: Specification,
                as: 'specifications',
                order: [['version', 'DESC']]
            }]
        });

        if (!project) return res.status(404).json({ error: 'Project not found.' });
        res.json({ project });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Failed to retrieve project.' });
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { project_id: req.params.id, user_id: req.userId }
        });

        if (!project) return res.status(404).json({ error: 'Project not found.' });

        const { title, description, status, business_type } = req.body;
        if (title) project.title = title;
        if (description !== undefined) project.description = description;
        if (status) project.status = status;
        if (business_type) project.business_type = business_type;

        await project.save();
        res.json({ project });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Failed to update project.' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { project_id: req.params.id, user_id: req.userId }
        });

        if (!project) return res.status(404).json({ error: 'Project not found.' });
        await project.destroy();
        res.json({ message: 'Project deleted.' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Failed to delete project.' });
    }
};

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };
