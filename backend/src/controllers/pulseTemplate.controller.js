import * as pulseTemplateService from '../services/pulseTemplate.service.js';

export const createPulseTemplate = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const template = await pulseTemplateService.createPulseTemplate(workspaceId, req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Create Pulse Template Error:', error);
    res.status(500).json({ error: 'Failed to create pulse template' });
  }
};

export const getPulseTemplates = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const { limit, offset } = req.query;
    const result = await pulseTemplateService.listPulseTemplates(workspaceId, { limit, offset });
    res.json(result);
  } catch (error) {
    console.error('Get Pulse Templates Error:', error);
    res.status(500).json({ error: 'Failed to fetch pulse templates' });
  }
};

export const getPulseTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers['x-workspace-id'];
    
    const template = await pulseTemplateService.getPulseTemplateById(id, workspaceId);
    if (!template) return res.status(404).json({ error: 'Pulse template not found' });

    res.json(template);
  } catch (error) {
    console.error('Get Pulse Template Error:', error);
    res.status(500).json({ error: 'Failed to fetch pulse template' });
  }
};

export const updatePulseTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers['x-workspace-id'];
    
    const template = await pulseTemplateService.updatePulseTemplate(id, workspaceId, req.body);
    res.json(template);
  } catch (error) {
    console.error('Update Pulse Template Error:', error);
    res.status(500).json({ error: 'Failed to update pulse template' });
  }
};

export const deletePulseTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers['x-workspace-id'];

    await pulseTemplateService.deletePulseTemplate(id, workspaceId);
    res.json({ message: 'Pulse template deleted successfully' });
  } catch (error) {
    console.error('Delete Pulse Template Error:', error);
    res.status(500).json({ error: 'Failed to delete pulse template' });
  }
};
