import * as unipileService from '../services/unipile.service.js';

/**
 * Controller for account related requests
 */
export const connectAccount = async (req, res) => {
  try {
    const { type } = req.query;
    const url = await unipileService.getHostedAuthLink(type);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate connection link' });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const accounts = await unipileService.listConnectedAccounts(workspaceId);
    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    await unipileService.deleteAccount(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
