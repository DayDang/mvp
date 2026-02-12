import { Router } from 'express';
const router = Router();
import * as userController from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

router.use(authenticateToken);

router.get('/:workspaceId/members', userController.getWorkspaceMembers);
router.post('/:workspaceId/members', userController.createAndAddUser);
router.patch('/members/:memberId', userController.updateMember);
router.delete('/members/:memberId', userController.removeMember);

export default router;
