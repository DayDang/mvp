import { client as unipileClient } from '../config/unipile.js';
import { prisma } from '../config/database.js';
import * as aiService from './ai.service.js';

/**
 * Service to handle Unipile messaging operations and database synchronization
 */

export const listChats = async (accountId) => {
  try {
    // If accountId is provided, filter by it, otherwise return all
    const where = accountId ? { account_id: accountId } : {};
    return await prisma.chat.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: { _count: { select: { messages: true } } }
    });
  } catch (error) {
    console.error('Messaging Service Error (listChats):', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    return await prisma.message.findMany({
      where: { chat_id: chatId },
      orderBy: { timestamp: 'asc' }
    });
  } catch (error) {
    console.error('Messaging Service Error (getChatMessages):', error);
    throw error;
  }
};

export const sendMessage = async (chatId, { text, attachments, voice_message }) => {
  try {
    // 1. Prepare data for Unipile
    const sendData = {
      chat_id: chatId,
    };
    if (text) sendData.text = text;
    if (attachments) sendData.attachments = attachments;
    if (voice_message) sendData.voice_message = voice_message;

    // 2. Send via Unipile
    const unipileResponse = await unipileClient.messaging.sendMessage(sendData);

    // 3. AI Analysis
    const { score, label } = await aiService.analyzeSentiment(text);

    // 4. Save to DB
    const message = await prisma.message.create({
      data: {
        unipile_id: unipileResponse.id,
        chat_id: chatId,
        account_id: unipileResponse.account_id,
        text: text || null,
        sender_id: unipileResponse.sender_id,
        timestamp: new Date(unipileResponse.timestamp),
        is_from_me: true,
        type: voice_message ? 'VOICE' : (attachments ? 'FILE' : 'TEXT'),
        attachments: attachments || voice_message ? JSON.stringify(unipileResponse.attachments || []) : null,
        sentiment_score: score,
        sentiment_label: label
      }
    });

    // 4. Update Chat last message
    await prisma.chat.update({
      where: { unipile_id: chatId },
      data: {
        last_message: text || (voice_message ? '[Voice Message]' : '[Attachment]'),
        timestamp: new Date(unipileResponse.timestamp)
      }
    });

    return message;
  } catch (error) {
    console.error('Messaging Service Error (sendMessage):', error);
    throw error;
  }
};

export const editMessage = async (messageId, text) => {
  try {
    // 1. Edit via Unipile
    // Ref: https://developer.unipile.com/reference/messagingcontroller_editmessage
    await unipileClient.messaging.editMessage(messageId, { text });

    // 2. Update DB
    return await prisma.message.update({
      where: { unipile_id: messageId },
      data: { text }
    });
  } catch (error) {
    console.error('Messaging Service Error (editMessage):', error);
    throw error;
  }
};

export const syncConversations = async (accountId) => {
  try {
    // 1. Fetch the Account from our DB to ensure it exists and get workspace context
    // This also serves as a check that the account is authorized for our platform
    let dbAccount = await prisma.account.findUnique({
      where: { unipile_id: accountId }
    });

    // For now, if it doesn't exist, we'll try to find the first workspace and auto-assign 
    // This helps in transition/initial setup, but in prod we'd want strict workspace assignment
    if (!dbAccount) {
      const firstWorkspace = await prisma.workspace.findFirst();
      if (!firstWorkspace) throw new Error('No workspaces found. Please seed the database.');
      
      const unipileData = await unipileClient.account.getOne(accountId);
      
      dbAccount = await prisma.account.create({
        data: {
          unipile_id: accountId,
          workspace_id: firstWorkspace.id,
          name: unipileData.name || 'Unknown Account',
          provider: unipileData.type || 'UNKNOWN'
        }
      });
      console.log(`✅ Auto-registered account ${accountId} to default workspace`);
    }

    // 2. Fetch chats from Unipile
    const chatsResponse = await unipileClient.messaging.getAllChats({
      account_id: accountId
    });

    const chats = chatsResponse.items || [];

    // 3. Update DB
    for (const chatData of chats) {
      await prisma.chat.upsert({
        where: { unipile_id: chatData.id },
        update: {
          name: chatData.name,
          unread_count: chatData.unread_count,
          last_message: chatData.last_message_text,
          timestamp: chatData.timestamp ? new Date(chatData.timestamp) : undefined,
        },
        create: {
          unipile_id: chatData.id,
          account_id: chatData.account_id, // This links via the unique unipile_id in Account model
          name: chatData.name,
          type: chatData.type,
          unread_count: chatData.unread_count,
          last_message: chatData.last_message_text,
          timestamp: chatData.timestamp ? new Date(chatData.timestamp) : undefined,
        }
      });
    }

    return { synced_count: chats.length };
  } catch (error) {
    console.error('Messaging Service Error (syncConversations):', error);
    throw error;
  }
};

export const syncMessages = async (chatId) => {
  try {
    // 1. Fetch Chat to get workspace context
    const chat = await prisma.chat.findUnique({
      where: { unipile_id: chatId },
      include: { account: true }
    });
    if (!chat) throw new Error('Chat not found');

    // 2. Fetch messages from Unipile
    const messagesResponse = await unipileClient.messaging.getMessages({
      chat_id: chatId,
      limit: 20 // Adjust as needed
    });

    const messages = messagesResponse.items || [];
    let processed = 0;

    for (const msgData of messages) {
      // 3. Check if already exists
      const existing = await prisma.message.findUnique({
        where: { unipile_id: msgData.id }
      });

      if (!existing) {
        // 4. AI Sentiment & Alert Scanning
        const { score, label } = await aiService.scanForAlerts(chat.account.workspace_id, {
          text: msgData.text || '',
          unipile_id: msgData.id
        });

        await prisma.message.create({
          data: {
            unipile_id: msgData.id,
            chat_id: chatId,
            account_id: msgData.account_id,
            text: msgData.text || null,
            sender_id: msgData.sender_id,
            timestamp: new Date(msgData.timestamp),
            is_from_me: msgData.sender_id === msgData.account_id, // Simplified check
            type: msgData.type,
            attachments: msgData.attachments ? JSON.stringify(msgData.attachments) : null,
            sentiment_score: score,
            sentiment_label: label
          }
        });
        processed++;
      }
    }

    return { processed_count: processed };
  } catch (error) {
    console.error('Messaging Service Error (syncMessages):', error);
    throw error;
  }
};
