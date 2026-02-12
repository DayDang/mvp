import * as userService from '../services/user.service.js';

/**
 * Controller for user and membership related requests
 */

export const getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const result = await userService.listWorkspaceMembers(workspaceId, skip, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspace members' });
  }
};

export const createAndAddUser = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, name, role } = req.body;
    const creatorId = req.user.id;

    // 1. Check if user exists
    let user = await userService.getUserByEmail(email);
    
    // 2. If not, create user
    if (!user) {
      user = await userService.createUser({ email, name }, creatorId);
    }

    // 3. Add to workspace
    const membership = await userService.addMemberToWorkspace(workspaceId, { 
      userId: user.id, 
      role 
    }, creatorId);

    res.status(201).json({ user, membership });
  } catch (error) {
    console.error("ERROR [createAndAddUser]:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This user is already a member of this workspace' });
    }
    res.status(500).json({ error: 'Failed to add user to workspace' });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const updaterId = req.user.id;
    
    const membership = await userService.updateMemberRole(memberId, role, updaterId);
    res.json({ membership });
  } catch (error) {
    console.error("ERROR [updateMember]:", error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const updaterId = req.user.id;
    
    await userService.deactivateMember(memberId, updaterId);
    res.json({ success: true });
  } catch (error) {
    console.error("ERROR [removeMember]:", error);
    res.status(500).json({ error: 'Failed to remove member from workspace' });
  }
};
