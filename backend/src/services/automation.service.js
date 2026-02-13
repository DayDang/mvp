import { prisma } from '../config/database.js';

/**
 * Service to handle Automation operations
 */

export const createAutomation = async (workspaceId, data) => {
  const { name, description, nodes, edges, viewport, status } = data;
  return await prisma.automation.create({
    data: {
      name: name || 'Untitled Automation',
      description: description || '',
      nodes: JSON.stringify(nodes || []),
      edges: JSON.stringify(edges || []),
      viewport: JSON.stringify(viewport || {}),
      status: status || 'Draft',
      workspace_id: workspaceId
    }
  });
};

export const listAutomations = async (workspaceId) => {
  const automations = await prisma.automation.findMany({
    where: {
      workspace_id: workspaceId,
      is_active: true
    },
    orderBy: { updated_at: 'desc' }
  });

  return automations.map(auto => ({
    ...auto,
    nodes: JSON.parse(auto.nodes),
    edges: JSON.parse(auto.edges),
    viewport: auto.viewport ? JSON.parse(auto.viewport) : null
  }));
};

export const getAutomationById = async (id, workspaceId) => {
  const auto = await prisma.automation.findUnique({
    where: { 
      id,
      workspace_id: workspaceId
    }
  });

  if (!auto) return null;

  return {
    ...auto,
    nodes: JSON.parse(auto.nodes),
    edges: JSON.parse(auto.edges),
    viewport: auto.viewport ? JSON.parse(auto.viewport) : null
  };
};

export const updateAutomation = async (id, workspaceId, data) => {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.nodes !== undefined) updateData.nodes = JSON.stringify(data.nodes);
  if (data.edges !== undefined) updateData.edges = JSON.stringify(data.edges);
  if (data.viewport !== undefined) updateData.viewport = JSON.stringify(data.viewport);
  if (data.status !== undefined) updateData.status = data.status;

  const auto = await prisma.automation.update({
    where: { 
      id,
      workspace_id: workspaceId
    },
    data: updateData
  });

  return {
    ...auto,
    nodes: JSON.parse(auto.nodes),
    edges: JSON.parse(auto.edges),
    viewport: auto.viewport ? JSON.parse(auto.viewport) : null
  };
};

export const deleteAutomation = async (id, workspaceId) => {
  return await prisma.automation.update({
    where: { 
      id,
      workspace_id: workspaceId
    },
    data: {
      is_active: false
    }
  });
};
