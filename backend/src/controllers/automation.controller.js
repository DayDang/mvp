import * as automationService from '../services/automation.service.js';

export const createAutomation = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const automation = await automationService.createAutomation(workspaceId, req.body);
    res.status(201).json(automation);
  } catch (error) {
    console.error('Create Automation Error:', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
};

export const getAutomations = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const automations = await automationService.listAutomations(workspaceId);
    res.json(automations);
  } catch (error) {
    console.error('Get Automations Error:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
};

export const getAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers['x-workspace-id'];
    
    const automation = await automationService.getAutomationById(id, workspaceId);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });

    res.json(automation);
  } catch (error) {
    console.error('Get Automation Error:', error);
    res.status(500).json({ error: 'Failed to fetch automation' });
  }
};

export const updateAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers['x-workspace-id'];
    
    const automation = await automationService.updateAutomation(id, workspaceId, req.body);
    res.json(automation);
  } catch (error) {
    console.error('Update Automation Error:', error);
    res.status(500).json({ error: 'Failed to update automation' });
  }
};

export const deleteAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers['x-workspace-id'];

    await automationService.deleteAutomation(id, workspaceId);
    res.json({ message: 'Automation deleted successfully' });
  } catch (error) {
    console.error('Delete Automation Error:', error);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
};
