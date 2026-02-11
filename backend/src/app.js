import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import accountRoutes from './routes/account.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

/**
 * Middleware setup
 */
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

/**
 * Routes setup
 */
app.use('/api/accounts', accountRoutes);
app.use('/api/chats', chatRoutes);

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
