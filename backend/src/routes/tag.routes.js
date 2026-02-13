import express from 'express';
import * as tagController from '../controllers/tag.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All tag routes require authentication
router.use(authenticateToken);

// Get all tags in a workspace
router.get('/workspace/:workspaceId', tagController.getAllTags);

// Create a new tag
router.post('/workspace/:workspaceId', tagController.createTag);

// Update a tag
router.put('/:id', tagController.updateTag);

// Delete a tag
router.delete('/:id', tagController.deleteTag);

// Attach/Detach tags to contacts
router.post('/attach', tagController.attachTag);
router.post('/detach', tagController.detachTag);

export default router;
