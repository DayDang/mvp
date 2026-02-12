import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import accountRoutes from './routes/account.routes.js';
import chatRoutes from './routes/chat.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

/**
 * Middleware setup
 */
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

/**
 * Routes setup
 */
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/users', userRoutes);

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * 404 Handler for debugging route mismatches
 */
app.use((req, res) => {
  console.log(`\n⚠️  404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

export default app;
