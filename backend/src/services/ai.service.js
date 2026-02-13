import { prisma } from '../config/database.js';

/**
 * AI Service for Sentiment Analysis and Tactical Insights
 */

export const analyzeSentiment = async (text) => {
  if (!text) return { score: 50, label: 'NEUTRAL' };
  
  const lowerText = text.toLowerCase();
  
  // Tactical Keyword Mapping (Mock AI Logic)
  const positiveWords = ['great', 'awesome', 'love', 'thanks', 'thank', 'good', 'perfect', 'amazing', 'happy', 'yes', 'agree'];
  const negativeWords = ['bad', 'delay', 'issue', 'problem', 'broken', 'slow', 'fail', 'error', 'expensive', 'stop', 'no', 'disappoint'];
  
  let score = 50;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 10;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 15;
  });
  
  // Clamp score
  score = Math.max(0, Math.min(100, score));
  
  let label = 'NEUTRAL';
  if (score > 65) label = 'POSITIVE';
  if (score < 35) label = 'NEGATIVE';
  
  return { score, label };
};

export const generateAlert = async (workspaceId, { type, message, sourceId, actionText }) => {
  try {
    return await prisma.aIAlert.create({
      data: {
        workspace_id: workspaceId,
        type,
        message,
        source_id: sourceId,
        action_text: actionText
      }
    });
  } catch (error) {
    console.error('AI Service Error (generateAlert):', error);
    throw error;
  }
};

/**
 * Scans a message for critical alerts
 */
export const scanForAlerts = async (workspaceId, message) => {
  const { text, unipile_id } = message;
  const { score, label } = await analyzeSentiment(text);
  
  if (label === 'NEGATIVE') {
    await generateAlert(workspaceId, {
      type: 'NEGATIVE',
      message: `Negative sentiment detected: "${text.substring(0, 50)}..."`,
      sourceId: unipile_id,
      actionText: 'Neutralize Conflict'
    });
    
    // Check for specific keywords
    if (text.toLowerCase().includes('delay')) {
      await generateAlert(workspaceId, {
        type: 'WARNING',
        message: 'Multiple mentions of "delay" detected in incoming comms.',
        actionText: 'Check Logistics'
      });
    }
  }
  
  if (score > 90) {
    await generateAlert(workspaceId, {
      type: 'POSITIVE',
      message: 'High-intent positive engagement detected.',
      sourceId: unipile_id,
      actionText: 'Trigger Upsell'
    });
  }
  
  return { score, label };
};
