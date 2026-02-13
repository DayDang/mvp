import { prisma } from '../config/database.js';

/**
 * Service to handle Contact operations
 */
export const createContact = async (workspaceId, data) => {
  const { tags, ...contactData } = data;
  
  return await prisma.contact.create({
    data: {
      ...contactData,
      workspace_id: workspaceId,
      ...(tags && tags.length > 0 && {
        tags: {
          connect: tags.map(id => ({ id }))
        }
      })
    },
    include: {
      tags: true
    }
  });
};

export const listContacts = async (workspaceId, { 
  skip = 0, 
  take = 50, 
  search = '', 
  orderBy = 'created_at', 
  sortOrder = 'desc',
  tagIds = [],
  providers = [] 
} = {}) => {
  const where = {
    workspace_id: workspaceId,
    is_active: true,
  };

  // Search logic
  if (search) {
    where.OR = [
      { first_name: { contains: search } },
      { last_name: { contains: search } },
      { public_identifier: { contains: search } },
      { email: { contains: search } },
      { headline: { contains: search } },
      { tags: { some: { name: { contains: search } } } }
    ];
  }

  // Tag filter logic
  if (tagIds && tagIds.length > 0) {
    where.tags = {
      some: {
        id: { in: tagIds }
      }
    };
  }

  // Provider filter logic
  if (providers && providers.length > 0) {
    where.provider = {
      in: providers,
    };
  }

  // Sorting logic - basic mapping to ensure safety
  const validSortFields = ['first_name', 'last_name', 'created_at', 'updated_at', 'provider', 'invitation_status'];
  const finalOrderBy = validSortFields.includes(orderBy) ? { [orderBy]: sortOrder } : { created_at: 'desc' };

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: finalOrderBy,
      include: {
        tags: true
      }
    }),
    prisma.contact.count({ where })
  ]);

  return {
    contacts,
    pagination: {
      total,
      skip: parseInt(skip),
      take: parseInt(take),
      totalPages: Math.ceil(total / take)
    }
  };
};

export const getContactById = async (id) => {
  return await prisma.contact.findUnique({
    where: { id },
    include: {
      tags: true
    }
  });
};

export const getContactByUnipileId = async (unipileId) => {
  return await prisma.contact.findUnique({
    where: { unipile_id: unipileId },
    include: {
      tags: true
    }
  });
};

export const updateContact = async (id, data) => {
  const { tags, ...updateData } = data;

  const updatePayload = {
    ...updateData
  };

  if (tags) {
    updatePayload.tags = {
      set: tags.map(tagId => ({ id: tagId }))
    };
  }

  return await prisma.contact.update({
    where: { id },
    data: updatePayload,
    include: {
      tags: true
    }
  });
};

export const upsertContactByUnipileId = async (workspaceId, unipileId, data) => {
  const { tags, ...contactData } = data;

  return await prisma.contact.upsert({
    where: { unipile_id: unipileId },
    update: {
      ...contactData,
      workspace_id: workspaceId,
      ...(tags && {
        tags: {
          set: tags.map(id => ({ id }))
        }
      })
    },
    create: {
      ...contactData,
      unipile_id: unipileId,
      workspace_id: workspaceId,
      ...(tags && {
        tags: {
          connect: tags.map(id => ({ id }))
        }
      })
    },
    include: {
      tags: true
    }
  });
};

export const deleteContact = async (id) => {
  return await prisma.contact.update({
    where: { id },
    data: { is_active: false }
  });
};
