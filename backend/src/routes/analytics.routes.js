import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', analyticsController.getDashboardAnalytics);

export default router;
