import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createPulse = async (workspaceId, data) => {
  const { title, description, message, platforms, status, recipients, metrics, template_id } = data;
  
  return await prisma.pulse.create({
    data: {
      title,
      description,
      message,
      platforms: typeof platforms === 'string' ? platforms : JSON.stringify(platforms || []),
      status: status || 'Sent',
      recipients: typeof recipients === 'string' ? recipients : JSON.stringify(recipients || []),
      metrics: typeof metrics === 'string' ? metrics : JSON.stringify(metrics || { delivered: 0, read: 0, replied: 0 }),
      workspace_id: workspaceId,
      template_id,
      automation_id: data.automation_id
    }
  });
};

export const listPulses = async (workspaceId, params = {}) => {
  const { limit = 10, offset = 0 } = params;
  
  const [items, total] = await Promise.all([
    prisma.pulse.findMany({
      where: {
        workspace_id: workspaceId
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { created_at: 'desc' },
      include: {
        template: {
          select: { title: true }
        },
        automation: {
          select: { name: true }
        }
      }
    }),
    prisma.pulse.count({
      where: {
        workspace_id: workspaceId
      }
    })
  ]);

  return { 
    items: items.map(item => ({
      ...item,
      platforms: item.platforms ? JSON.parse(item.platforms) : [],
      recipients: JSON.parse(item.recipients),
      metrics: JSON.parse(item.metrics)
    })), 
    total 
  };
};

export const getPulseById = async (id, workspaceId) => {
  const pulse = await prisma.pulse.findFirst({
    where: {
      id,
      workspace_id: workspaceId
    },
    include: {
      template: true
    }
  });

  if (pulse) {
    return {
      ...pulse,
      platforms: pulse.platforms ? JSON.parse(pulse.platforms) : [],
      recipients: JSON.parse(pulse.recipients),
      metrics: JSON.parse(pulse.metrics)
    };
  }
  return null;
};

export const updatePulse = async (id, workspaceId, data) => {
  const { title, description } = data;
  
  const pulse = await prisma.pulse.update({
    where: {
      id,
      workspace_id: workspaceId
    },
    data: {
      title,
      description
    }
  });

  return {
    ...pulse,
    platforms: pulse.platforms ? JSON.parse(pulse.platforms) : [],
    recipients: pulse.recipients ? JSON.parse(pulse.recipients) : [],
    metrics: pulse.metrics ? JSON.parse(pulse.metrics) : { delivered: 0, read: 0, replied: 0 }
  };
};

export const deletePulse = async (id, workspaceId) => {
  return await prisma.pulse.delete({
    where: {
      id,
      workspace_id: workspaceId
    }
  });
};
