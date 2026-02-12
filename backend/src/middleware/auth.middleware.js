import { verifyAccessToken } from '../utils/auth.utils.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};
