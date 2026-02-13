import * as contactService from '../services/contact.service.js';

/**
 * Controller for contact related requests
 */

export const getAllContactsByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const orderBy = req.query.orderBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'desc';
    const tagIds = req.query.tagIds ? req.query.tagIds.split(',') : [];
    const providers = req.query.providers ? req.query.providers.split(',') : [];
    const skip = (page - 1) * limit;
    
    const result = await contactService.listContacts(workspaceId, { 
      skip, 
      take: limit, 
      search, 
      orderBy, 
      sortOrder,
      tagIds,
      providers
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

export const createContact = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const contactData = req.body;
    const contact = await contactService.createContact(workspaceId, contactData);
    res.status(201).json({ contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

export const getContactDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactService.getContactById(id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ contact });
  } catch (error) {
    console.error('Error fetching contact details:', error);
    res.status(500).json({ error: 'Failed to fetch contact details' });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contactData = req.body;
    const contact = await contactService.updateContact(id, contactData);
    res.json({ contact });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await contactService.deleteContact(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

export const syncContactFromUnipile = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { unipileProfile } = req.body; // Expecting the response from Unipile API

    if (!unipileProfile || !unipileProfile.id) {
      return res.status(400).json({ error: 'Invalid Unipile profile data' });
    }

    // Map Unipile profile to our schema
    const data = {
      provider: unipileProfile.provider,
      public_identifier: unipileProfile.public_identifier,
      first_name: unipileProfile.first_name,
      last_name: unipileProfile.last_name,
      headline: unipileProfile.headline,
      summary: unipileProfile.summary,
      location: unipileProfile.location,
      profile_picture_url: unipileProfile.profile_picture_url,
      email: unipileProfile.contact_info?.emails?.[0]?.value || null,
      phone: unipileProfile.contact_info?.phones?.[0]?.value || null,
    };

    const contact = await contactService.upsertContactByUnipileId(workspaceId, unipileProfile.id, data);
    res.json({ contact });
  } catch (error) {
    console.error('Error syncing contact from Unipile:', error);
    res.status(500).json({ error: 'Failed to sync contact' });
  }
};
