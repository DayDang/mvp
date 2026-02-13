import { prisma } from '../config/database.js';

/**
 * Service to handle Tag operations
 */
export const createTag = async (workspaceId, data) => {
  return await prisma.tag.create({
    data: {
      ...data,
      workspace_id: workspaceId
    }
  });
};

export const listTags = async (workspaceId) => {
  return await prisma.tag.findMany({
    where: {
      workspace_id: workspaceId
    },
    include: {
      _count: {
        select: { contacts: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
};

export const updateTag = async (id, data) => {
  return await prisma.tag.update({
    where: { id },
    data
  });
};

export const deleteTag = async (id) => {
  return await prisma.tag.delete({
    where: { id }
  });
};

export const attachTagToContact = async (contactId, tagId) => {
  return await prisma.contact.update({
    where: { id: contactId },
    data: {
      tags: {
        connect: { id: tagId }
      }
    },
    include: {
      tags: true
    }
  });
};

export const detachTagFromContact = async (contactId, tagId) => {
  return await prisma.contact.update({
    where: { id: contactId },
    data: {
      tags: {
        disconnect: { id: tagId }
      }
    },
    include: {
      tags: true
    }
  });
};
