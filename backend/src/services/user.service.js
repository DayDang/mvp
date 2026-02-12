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

export const listScopedUsers = async (adminId, skip = 0, take = 10) => {
  // Get all workspace IDs where the admin is a member
  const adminMemberships = await prisma.workspaceMember.findMany({
    where: { user_id: adminId, is_active: true },
    select: { workspace_id: true }
  });
  const workspaceIds = adminMemberships.map(m => m.workspace_id);

  const where = {
    OR: [
      { created_by: adminId },
      { 
        memberships: {
          some: {
            workspace_id: { in: workspaceIds },
            is_active: true
          }
        }
      }
    ]
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        memberships: {
          where: { is_active: true },
          include: { workspace: true }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    users,
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

export const globalDeactivateUser = async (userId, updaterId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      is_active: false,
      updated_by: updaterId
    }
  });
};
