import * as workspaceService from '../services/workspace.service.js';

/**
 * Controller for workspace related requests
 */

export const getAllWorkspaces = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const result = await workspaceService.listWorkspaces(req.user.id, skip, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
};

export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const creatorId = req.user.id; 
    const workspace = await workspaceService.createWorkspace({ name }, creatorId);
    res.status(201).json({ workspace });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workspace' });
  }
};

export const getWorkspaceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await workspaceService.getWorkspaceById(id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ workspace });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspace details' });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;
    const updaterId = req.user.id;
    const workspace = await workspaceService.updateWorkspace(id, { name, is_active }, updaterId);
    res.json({ workspace });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update workspace' });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const updaterId = req.user.id;
    await workspaceService.deleteWorkspace(id, updaterId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate workspace' });
  }
};
