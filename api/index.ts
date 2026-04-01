import { createServer } from 'http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/server';

const server = createServer(app);

let isServerRunning = false;

function ensureServerRunning() {
  if (!isServerRunning) {
    isServerRunning = true;
  }
}

export default (req: VercelRequest, res: VercelResponse) => {
  ensureServerRunning();
  app(req, res);
};
