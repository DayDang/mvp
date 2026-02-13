const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Pulse {
  id: string;
  title: string;
  description?: string;
  message: string;
  platforms: ('WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM')[];
  status: 'Sent' | 'Draft' | 'Failed' | 'Processing';
  recipients: string[];
  metrics: {
    delivered: number;
    read: number;
    replied: number;
  };
  workspace_id: string;
  template_id?: string;
  template?: { title: string };
  automation_id?: string;
  automation?: { name: string };
  created_at: string;
  updated_at: string;
}

export const pulseService = {
  async getPulses(workspaceId: string, limit = 10, offset = 0): Promise<{ items: Pulse[], total: number }> {
    const res = await fetch(`${API_URL}/pulses?limit=${limit}&offset=${offset}`, {
      headers: { 'x-workspace-id': workspaceId }
    });
    if (!res.ok) throw new Error('Failed to fetch pulses');
    return res.json();
  },

  async createPulse(workspaceId: string, data: Partial<Pulse>): Promise<Pulse> {
    const res = await fetch(`${API_URL}/pulses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-workspace-id': workspaceId 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create pulse');
    return res.json();
  },

  async deletePulse(workspaceId: string, id: string): Promise<void> {
    const res = await fetch(`${API_URL}/pulses/${id}`, {
      method: 'DELETE',
      headers: { 'x-workspace-id': workspaceId }
    });
    if (!res.ok) throw new Error('Failed to delete pulse');
  },

  async updatePulse(workspaceId: string, id: string, data: Partial<Pulse>): Promise<Pulse> {
    const res = await fetch(`${API_URL}/pulses/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-workspace-id': workspaceId 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update pulse');
    return res.json();
  }
};
