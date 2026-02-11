import { client } from '../config/unipile.js';

/**
 * Service to handle Unipile account operations
 */
export const getHostedAuthLink = async (type = 'WHATSAPP') => {
  try {
    // For MVP, we use the Hosted Auth Wizard
    // Ref: https://developer.unipile.com/docs/hosted-auth-wizard
    const expiresOn = new Date();
    expiresOn.setDate(expiresOn.getDate() + 7);

    const response = await client.account.createHostedAuthLink({
      type: 'create',
      providers: [type.toUpperCase()],
      api_url: process.env.UNIPILE_DSN,
      name: `Connection Link - ${type}`,
      expiresOn: expiresOn.toISOString(),
      sync_limit: {
        MESSAGING: {
          chats: 50,
          messages: 100
        }
      }
    });
    return response.url;
  } catch (error) {
    console.error('Unipile Service Error (getHostedAuthLink):', error);
    throw error;
  }
};

export const listConnectedAccounts = async () => {
  try {
    // Ref: https://developer.unipile.com/reference/accountscontroller_listaccounts
    const accounts = await client.account.getAll();
    return accounts;
  } catch (error) {
    console.error('Unipile Service Error (listConnectedAccounts):', error);
    throw error;
  }
};

export const deleteAccount = async (accountId) => {
  try {
    // Ref: https://developer.unipile.com/reference/accountscontroller_deleteaccount
    return await client.account.delete(accountId);
  } catch (error) {
    console.error('Unipile Service Error (deleteAccount):', error);
    throw error;
  }
};
