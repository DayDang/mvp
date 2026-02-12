import { prisma } from '../config/database.js';

/**
 * Service to handle Workspace operations
 */
export const createWorkspace = async (data, creatorId) => {
  return await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        ...data,
        created_by: creatorId,
        updated_by: creatorId,
      }
    });

    await tx.workspaceMember.create({
      data: {
        user_id: creatorId,
        workspace_id: workspace.id,
        role: 'ADMIN',
        created_by: 'system',
        updated_by: 'system'
      }
    });

    return workspace;
  });
};

export const listWorkspaces = async (userId, skip = 0, take = 10) => {
  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      where: {
        members: {
          some: {
            user_id: userId,
            is_active: true
          }
        },
        is_active: true
      },
      skip,
      take,
      orderBy: { name: 'asc' }
    }),
    prisma.workspace.count({
      where: {
        members: {
          some: {
            user_id: userId,
            is_active: true
          }
        },
        is_active: true
      }
    })
  ]);
  
  return {
    workspaces,
    pagination: {
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      totalPages: Math.ceil(total / take)
    }
  };
};

export const getWorkspaceById = async (id) => {
  return await prisma.workspace.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true
        }
      },
      accounts: true
    }
  });
};

export const updateWorkspace = async (id, data, updaterId) => {
  return await prisma.workspace.update({
    where: { id },
    data: {
      ...data,
      updated_by: updaterId
    }
  });
};

export const deleteWorkspace = async (id, updaterId) => {
  // We perform a soft delete by deactivating
  return await prisma.workspace.update({
    where: { id },
    data: {
      is_active: false,
      updated_by: updaterId
    }
  });
};
