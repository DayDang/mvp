import * as pulseService from '../services/pulse.service.js';

export const createPulse = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const pulse = await pulseService.createPulse(workspaceId, req.body);
    res.status(201).json(pulse);
  } catch (error) {
    console.error('Create Pulse Error:', error);
    res.status(500).json({ error: 'Failed to create pulse' });
  }
};

export const getPulses = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ error: 'Workspace ID is required' });

    const { limit, offset } = req.query;
    const result = await pulseService.listPulses(workspaceId, { limit, offset });
    res.json(result);
  } catch (error) {
    console.error('Get Pulses Error:', error);
    res.status(500).json({ error: 'Failed to fetch pulses' });
  }
};

export const getPulse = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const pulse = await pulseService.getPulseById(req.params.id, workspaceId);
    
    if (!pulse) return res.status(404).json({ error: 'Pulse not found' });
    res.json(pulse);
  } catch (error) {
    console.error('Get Pulse Error:', error);
    res.status(500).json({ error: 'Failed to fetch pulse' });
  }
};

export const updatePulse = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const pulse = await pulseService.updatePulse(req.params.id, workspaceId, req.body);
    res.json(pulse);
  } catch (error) {
    console.error('Update Pulse Error:', error);
    res.status(500).json({ error: 'Failed to update pulse' });
  }
};

export const deletePulse = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    await pulseService.deletePulse(req.params.id, workspaceId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete Pulse Error:', error);
    res.status(500).json({ error: 'Failed to delete pulse' });
  }
};
