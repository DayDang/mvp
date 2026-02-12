import { Router } from 'express';
const router = Router();
import * as workspaceController from '../controllers/workspace.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

router.use(authenticateToken); // Protect all workspace routes

router.get('/', workspaceController.getAllWorkspaces);
router.post('/', workspaceController.createWorkspace);
router.get('/:id', workspaceController.getWorkspaceDetails);
router.patch('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

export default router;
