import express from 'express';
import * as pulseTemplateController from '../controllers/pulseTemplate.controller.js';

const router = express.Router();

router.post('/', pulseTemplateController.createPulseTemplate);
router.get('/', pulseTemplateController.getPulseTemplates);
router.get('/:id', pulseTemplateController.getPulseTemplate);
router.put('/:id', pulseTemplateController.updatePulseTemplate);
router.delete('/:id', pulseTemplateController.deletePulseTemplate);

export default router;
