import { UnipileClient } from 'unipile-node-sdk';
import dotenv from 'dotenv';

dotenv.config();

const dsn = process.env.UNIPILE_DSN;
const token = process.env.UNIPILE_ACCESS_TOKEN;

if (!dsn || !token) {
  console.warn('WARNING: UNIPILE_DSN or UNIPILE_ACCESS_TOKEN is not set in .env');
}

export const client = new UnipileClient(dsn, token);
