import express from 'express';
import * as automationController from '../controllers/automation.controller.js';

const router = express.Router();

router.post('/', automationController.createAutomation);
router.get('/', automationController.getAutomations);
router.get('/:id', automationController.getAutomation);
router.put('/:id', automationController.updateAutomation);
router.delete('/:id', automationController.deleteAutomation);

export default router;
