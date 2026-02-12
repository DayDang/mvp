import * as userService from '../services/user.service.js';
import jwt from 'jsonwebtoken';

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

export const getPersonnel = async (req, res) => {
  try {
    const adminId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await userService.listScopedUsers(adminId, skip, limit);
    res.json(result);
  } catch (error) {
    console.error("ERROR [getPersonnel]:", error);
    res.status(500).json({ error: 'Failed to fetch personnel' });
  }
};

export const createAndAddUser = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, name, role } = req.body;
    const creatorId = req.user.id;

    // 1. Check if user exists
    let user = await userService.getUserByEmail(email);
    let isNewUser = false;
    
    // 2. If not, create user (inactive by default)
    if (!user) {
      user = await userService.createUser({ 
        email, 
        name: name || email.split('@')[0],
        is_active: false 
      }, creatorId);
      isNewUser = true;
    }

    // 3. Add to workspace
    const membership = await userService.addMemberToWorkspace(workspaceId, { 
      userId: user.id, 
      role 
    }, creatorId);

    // 4. Generate invitation token if it's a new user or user has no password
    let invitationToken = null;
    if (isNewUser || !user.password_hash) {
      invitationToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'invitation' },
        process.env.ACCESS_TOKEN_SECRET || 'access-secret-key-change-me',
        { expiresIn: '7d' }
      );
    }

    res.status(201).json({ 
      user, 
      membership, 
      invitationToken,
      invitationLink: invitationToken ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation?token=${invitationToken}` : null
    });
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

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updaterId = req.user.id;
    
    await userService.globalDeactivateUser(userId, updaterId);
    res.json({ success: true });
  } catch (error) {
    console.error("ERROR [deactivateUser]:", error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};
