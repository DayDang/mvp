import * as tagService from '../services/tag.service.js';

/**
 * Controller for tag related requests
 */

export const getAllTags = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const result = await tagService.listTags(workspaceId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

export const createTag = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, color } = req.body;
    const tag = await tagService.createTag(workspaceId, { name, color });
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const tag = await tagService.updateTag(id, { name, color });
    res.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    await tagService.deleteTag(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};

export const attachTag = async (req, res) => {
  try {
    const { contactId, tagId } = req.body;
    const contact = await tagService.attachTagToContact(contactId, tagId);
    res.json(contact);
  } catch (error) {
    console.error('Error attaching tag:', error);
    res.status(500).json({ error: 'Failed to attach tag' });
  }
};

export const detachTag = async (req, res) => {
  try {
    const { contactId, tagId } = req.body;
    const contact = await tagService.detachTagFromContact(contactId, tagId);
    res.json(contact);
  } catch (error) {
    console.error('Error detaching tag:', error);
    res.status(500).json({ error: 'Failed to detach tag' });
  }
};
