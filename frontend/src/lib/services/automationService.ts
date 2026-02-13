import api from '../api';

export interface Automation {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  viewport: any;
  status: 'Active' | 'Inactive' | 'Error';
  is_active: boolean;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export const automationService = {
  create: async (data: Partial<Automation>): Promise<Automation> => {
    const response = await api.post('/automations', data);
    return response.data;
  },

  list: async (): Promise<Automation[]> => {
    const response = await api.get('/automations');
    return response.data;
  },

  getById: async (id: string): Promise<Automation> => {
    const response = await api.get(`/automations/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Automation>): Promise<Automation> => {
    const response = await api.put(`/automations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/automations/${id}`);
  }
};
