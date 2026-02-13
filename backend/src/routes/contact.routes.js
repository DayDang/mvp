import express from 'express';
import * as contactController from '../controllers/contact.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All contact routes require authentication
router.use(authenticateToken);

// Get all contacts in a workspace
router.get('/workspace/:workspaceId', contactController.getAllContactsByWorkspace);

// Create a new contact manually
router.post('/workspace/:workspaceId', contactController.createContact);

// Sync/Upsert contact from Unipile profile data
router.post('/workspace/:workspaceId/sync', contactController.syncContactFromUnipile);

// Get contact details
router.get('/:id', contactController.getContactDetails);

// Update contact
router.put('/:id', contactController.updateContact);

// Delete/Deactivate contact
router.delete('/:id', contactController.deleteContact);

export default router;
