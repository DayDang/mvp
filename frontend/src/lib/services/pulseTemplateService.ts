const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface PulseTemplate {
  id: string;
  title: string;
  description?: string;
  content: string;
  platforms: string[];
  category: string;
  reply_format?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export const pulseTemplateService = {
  async getTemplates(workspaceId: string, limit = 20, offset = 0): Promise<{ items: PulseTemplate[], total: number }> {
    const res = await fetch(`${API_URL}/pulse-templates?limit=${limit}&offset=${offset}`, {
      headers: { 'x-workspace-id': workspaceId }
    });
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  },

  async createTemplate(workspaceId: string, data: Partial<PulseTemplate>): Promise<PulseTemplate> {
    const res = await fetch(`${API_URL}/pulse-templates`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-workspace-id': workspaceId 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create template');
    return res.json();
  },

  async updateTemplate(workspaceId: string, id: string, data: Partial<PulseTemplate>): Promise<PulseTemplate> {
    const res = await fetch(`${API_URL}/pulse-templates/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-workspace-id': workspaceId 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update template');
    return res.json();
  },

  async deleteTemplate(workspaceId: string, id: string): Promise<void> {
    const res = await fetch(`${API_URL}/pulse-templates/${id}`, {
      method: 'DELETE',
      headers: { 'x-workspace-id': workspaceId }
    });
    if (!res.ok) throw new Error('Failed to delete template');
  }
};
