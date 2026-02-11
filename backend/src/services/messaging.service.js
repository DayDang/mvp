import { client as unipileClient } from '../config/unipile.js';
import { prisma } from '../config/database.js';

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

    // 3. Save to DB
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
        attachments: attachments || voice_message ? JSON.stringify(unipileResponse.attachments || []) : null
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
    // 1. Fetch from Unipile
    const chatsResponse = await unipileClient.messaging.getAllChats({
      account_id: accountId
    });

    const chats = chatsResponse.items || [];

    // 2. Update DB
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
          account_id: chatData.account_id,
          name: chatData.name,
          type: chatData.type,
          unread_count: chatData.unread_count,
          last_message: chatData.last_message_text,
          timestamp: chatData.timestamp ? new Date(chatData.timestamp) : undefined,
        }
      });
      
      // For MVP, we only sync chats. To sync messages, we would loop through messages here.
    }

    return { synced_count: chats.length };
  } catch (error) {
    console.error('Messaging Service Error (syncConversations):', error);
    throw error;
  }
};
