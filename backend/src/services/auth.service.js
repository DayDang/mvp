import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateTokens, verifyRefreshToken } from '../utils/auth.utils.js';

const prisma = new PrismaClient();

export const register = async (email, password, name) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password_hash: passwordHash,
      updated_by: 'system',
      created_by: 'system' // Self-registered
    }
  });

  return user;
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { 
      memberships: {
        where: {
          workspace: {
            is_active: true
          }
        },
        include: {
          workspace: true
        }
      } 
    }
  });

  if (!user || !user.is_active) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  // Strip sensitive data before returning
  const { password_hash: _, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
};

export const refresh = async (token) => {
  if (!token) throw new Error('Refresh token required');

  // Verify signature
  const decoded = verifyRefreshToken(token);
  
  // Check db for existence and status
  const savedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { 
      user: { 
        include: { 
          memberships: {
            where: {
              workspace: {
                is_active: true
              }
            },
            include: {
              workspace: true
            }
          } 
        } 
      } 
    }
  });

  if (!savedToken || savedToken.revoked || savedToken.expires_at < new Date()) {
    // If token is reused or invalid, we could revoke all tokens for user (Reuse Detection)
    if (savedToken && !savedToken.revoked) {
      // It was valid but expired, just clean up? 
      // Reuse detection implies if we get a valid signature but it's not in DB or marked revoked
    }
    throw new Error('Invalid refresh token');
  }

  // Revoke used token (Token Rotation)
  await prisma.refreshToken.update({
    where: { id: savedToken.id },
    data: { revoked: true }
  });

  // Generate new tokens
  const { accessToken, refreshToken } = generateTokens(savedToken.user);

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: savedToken.user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken };
};

export const logout = async (token) => {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true }
  });
};

export const updateProfile = async (userId, data) => {
  const { name, avatar_url } = data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, avatar_url },
    include: {
      memberships: {
        where: {
          workspace: {
            is_active: true
          }
        },
        include: {
          workspace: true
        }
      }
    }
  });

  const { password_hash: _, ...safeUser } = user;
  return safeUser;
};
