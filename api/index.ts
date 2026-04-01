import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/server.js';

export default (req: VercelRequest, res: VercelResponse) => {
  // Express 的 Handler 方法
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
