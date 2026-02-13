import api from '../api';

export interface Tag {
  id: string;
  name: string;
  color: string;
  _count?: {
    contacts: number;
  };
}

export interface Contact {
  id: string;
  unipile_id?: string;
  workspace_id: string;
  provider?: string;
  public_identifier?: string;
  first_name?: string;
  last_name?: string;
  headline?: string;
  summary?: string;
  location?: string;
  profile_picture_url?: string;
  email?: string;
  phone?: string;
  invitation_status?: string;
  tags: Tag[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListContactsParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  sortOrder?: 'asc' | 'desc';
  tagIds?: string[];
  providers?: string[];
}

export interface ListContactsResponse {
  contacts: Contact[];
  pagination: {
    total: number;
    skip: number;
    take: number;
    totalPages: number;
  };
}

export const contactService = {
  list: async (workspaceId: string, params: ListContactsParams = {}): Promise<ListContactsResponse> => {
    const queryParams = {
      ...params,
      tagIds: params.tagIds?.join(','),
      providers: params.providers?.join(',')
    };
    const response = await api.get(`/contacts/workspace/${workspaceId}`, { params: queryParams });
    return response.data;
  },

  getById: async (id: string): Promise<Contact> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data.contact;
  },

  create: async (workspaceId: string, data: Partial<Contact>): Promise<Contact> => {
    const response = await api.post(`/contacts/workspace/${workspaceId}`, data);
    return response.data.contact;
  },

  update: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data.contact;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },

  syncFromUnipile: async (workspaceId: string, unipileProfile: any): Promise<Contact> => {
    const response = await api.post(`/contacts/workspace/${workspaceId}/sync`, { unipileProfile });
    return response.data.contact;
  }
};

export const tagService = {
  list: async (workspaceId: string): Promise<Tag[]> => {
    const response = await api.get(`/tags/workspace/${workspaceId}`);
    return response.data;
  },

  create: async (workspaceId: string, data: { name: string, color?: string }): Promise<Tag> => {
    const response = await api.post(`/tags/workspace/${workspaceId}`, data);
    return response.data;
  },

  update: async (id: string, data: { name?: string, color?: string }): Promise<Tag> => {
    const response = await api.put(`/tags/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },

  attach: async (contactId: string, tagId: string): Promise<Contact> => {
    const response = await api.post(`/tags/attach`, { contactId, tagId });
    return response.data;
  },

  detach: async (contactId: string, tagId: string): Promise<Contact> => {
    const response = await api.post(`/tags/detach`, { contactId, tagId });
    return response.data;
  }
};
