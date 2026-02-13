import express from 'express';
import * as pulseController from '../controllers/pulse.controller.js';

const router = express.Router();

router.post('/', pulseController.createPulse);
router.get('/', pulseController.getPulses);
router.get('/:id', pulseController.getPulse);
router.put('/:id', pulseController.updatePulse);
router.delete('/:id', pulseController.deletePulse);

export default router;
