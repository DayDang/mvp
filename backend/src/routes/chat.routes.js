import express from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', chatController.getChats);
router.get('/:id/messages', chatController.getChatMessages);
router.post('/:id/messages', upload.array('files'), chatController.sendMessage);
router.patch('/messages/:id', chatController.editMessage);
router.post('/sync', chatController.syncChats);

export default router;
