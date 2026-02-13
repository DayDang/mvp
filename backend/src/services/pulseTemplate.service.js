import { prisma } from '../config/database.js';

/**
 * Service to handle Pulse Template operations
 */

export const createPulseTemplate = async (workspaceId, data) => {
  const { title, description, content, platforms, category, reply_format } = data;
  return await prisma.pulseTemplate.create({
    data: {
      title,
      description,
      content,
      platforms: typeof platforms === 'string' ? platforms : JSON.stringify(platforms || []),
      category,
      reply_format,
      workspace_id: workspaceId
    }
  });
};

export const listPulseTemplates = async (workspaceId, params = {}) => {
  const { limit = 20, offset = 0 } = params;
  
  const [items, total] = await Promise.all([
    prisma.pulseTemplate.findMany({
      where: {
        workspace_id: workspaceId
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { updated_at: 'desc' }
    }),
    prisma.pulseTemplate.count({
      where: {
        workspace_id: workspaceId
      }
    })
  ]);

  return { 
    items: items.map(item => ({
      ...item,
      platforms: item.platforms ? JSON.parse(item.platforms) : []
    })), 
    total 
  };
};

export const getPulseTemplateById = async (id, workspaceId) => {
  const template = await prisma.pulseTemplate.findUnique({
    where: { 
      id,
      workspace_id: workspaceId
    }
  });

  if (template) {
    return {
      ...template,
      platforms: template.platforms ? JSON.parse(template.platforms) : []
    };
  }
  return null;
};

export const updatePulseTemplate = async (id, workspaceId, data) => {
  const { title, description, content, platforms, category, reply_format } = data;
  return await prisma.pulseTemplate.update({
    where: { 
      id,
      workspace_id: workspaceId
    },
    data: {
      title,
      description,
      content,
      platforms: typeof platforms === 'string' ? platforms : JSON.stringify(platforms || []),
      category,
      reply_format
    }
  });
};

export const deletePulseTemplate = async (id, workspaceId) => {
  return await prisma.pulseTemplate.delete({
    where: { 
      id,
      workspace_id: workspaceId
    }
  });
};
