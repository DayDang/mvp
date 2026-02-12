import { prisma } from '../config/database.js';

/**
 * Service to handle User and Membership operations
 */
export const createUser = async (data, creatorId) => {
  return await prisma.user.create({
    data: {
      ...data,
      created_by: creatorId,
      updated_by: creatorId,
    }
  });
};

export const listWorkspaceMembers = async (workspaceId, skip = 0, take = 10) => {
  const [members, total] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { 
        workspace_id: workspaceId,
        is_active: true
      },
      skip,
      take,
      include: {
        user: true
      }
    }),
    prisma.workspaceMember.count({
      where: { 
        workspace_id: workspaceId,
        is_active: true
      }
    })
  ]);
  
  return {
    members,
    pagination: {
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      totalPages: Math.ceil(total / take)
    }
  };
};

export const addMemberToWorkspace = async (workspaceId, { userId, role }, creatorId) => {
  return await prisma.workspaceMember.create({
    data: {
      workspace_id: workspaceId,
      user_id: userId,
      role: role || 'MANAGER',
      created_by: creatorId,
      updated_by: creatorId,
    }
  });
};

export const updateMemberRole = async (memberId, role, updaterId) => {
  return await prisma.workspaceMember.update({
    where: { id: memberId },
    data: {
      role,
      updated_by: updaterId
    }
  });
};

export const deactivateMember = async (memberId, updaterId) => {
  return await prisma.workspaceMember.update({
    where: { id: memberId },
    data: {
      is_active: false,
      updated_by: updaterId
    }
  });
};

export const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: {
          workspace: true
        }
      }
    }
  });
};
