import * as messagingService from '../services/messaging.service.js';

export const getChats = async (req, res) => {
  try {
    const { account_id } = req.query;
    const chats = await messagingService.listChats(account_id);
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await messagingService.getChatMessages(id);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, type } = req.body;
    const files = req.files || [];
    
    let attachments = null;
    let voice_message = null;

    if (files.length > 0) {
      if (type === 'VOICE') {
        voice_message = files[0].path;
      } else {
        attachments = files.map(f => f.path);
      }
    }

    if (!text && !attachments && !voice_message) {
      return res.status(400).json({ error: 'Text or attachment is required' });
    }

    const message = await messagingService.sendMessage(id, { 
      text, 
      attachments, 
      voice_message 
    });
    res.status(201).json({ message });
  } catch (error) {
    console.error('Controller Error (sendMessage):', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const message = await messagingService.editMessage(id, text);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

export const syncChats = async (req, res) => {
  try {
    const { account_id } = req.body;
    const result = await messagingService.syncConversations(account_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync conversations' });
  }
};
