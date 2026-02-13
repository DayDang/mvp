import { client } from '../config/unipile.js';
import { prisma } from '../config/database.js';

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

export const listConnectedAccounts = async (workspaceId = null) => {
  try {
    // 1. Fetch from Unipile
    let accountsList = [];
    try {
      const unipileResponse = await client.account.getAll();
      accountsList = Array.isArray(unipileResponse) 
        ? unipileResponse 
        : (unipileResponse?.items || unipileResponse?.data || []);
    } catch (apiError) {
      console.warn('Unipile API unreachable, returning DB-only accounts:', apiError.message);
      const dbAccounts = await prisma.account.findMany({
        where: workspaceId ? { workspace_id: workspaceId } : {},
      });
      return dbAccounts;
    }
    
    // 2. Sync with our DB
    // If no workspaceId provided, we try to find the first one to assign new accounts to
    // In a real app, we might want to force workspace selection or handle this differently
    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
      const firstWorkspace = await prisma.workspace.findFirst();
      if (firstWorkspace) targetWorkspaceId = firstWorkspace.id;
    }

    const syncedAccounts = [];
    for (const ua of accountsList) {
      // If we have a targetWorkspaceId, we use it for upserting
      // If not, we still sync but without workspace assignment (might cause issues later)
      const dbAccount = await prisma.account.upsert({
        where: { unipile_id: ua.id },
        update: {
          name: ua.name || 'Unknown Account',
          provider: ua.type || 'UNKNOWN',
          // Only update workspace_id if it's currently missing or we want to reassign
          ...(targetWorkspaceId && { workspace_id: targetWorkspaceId })
        },
        create: {
          unipile_id: ua.id,
          workspace_id: targetWorkspaceId || '', // Fallback to empty if absolutely none found
          name: ua.name || 'Unknown Account',
          provider: ua.type || 'UNKNOWN'
        }
      });
      syncedAccounts.push(dbAccount);
    }

    // 3. Filter by workspace if requested
    if (workspaceId) {
      return syncedAccounts.filter(a => a.workspace_id === workspaceId);
    }

    return syncedAccounts;
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

/**
 * Fetch a contact profile from Unipile
 * Ref: https://developer.unipile.com/reference/userscontroller_getprofilebyidentifier
 */
export const getContactProfile = async (identifier, accountId = null) => {
  try {
    const params = { identifier };
    if (accountId) params.account_id = accountId;
    
    // Using the SDK method that matches the endpoint
    // Note: client.users might vary depending on SDK version, fallback to manual fetch if needed
    const profile = await client.users.getProfile(params);
    return profile;
  } catch (error) {
    console.error('Unipile Service Error (getContactProfile):', error);
    throw error;
  }
};
