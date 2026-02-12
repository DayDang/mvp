import express from 'express';
import * as accountController from '../controllers/account.controller.js';

import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/connect', accountController.connectAccount);
router.get('/', accountController.getAccounts);
router.delete('/:id', accountController.deleteAccount);

export default router;
