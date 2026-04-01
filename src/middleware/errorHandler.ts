/**
 * 错误处理中间件
 */

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error instanceof AppError) {
    if (!isDevelopment) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
    return;
  }

  console.error('Unhandled error:', error);

  if (isDevelopment) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 请求日志中间件
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${statusCode} (${duration}ms)`);

    return originalSend.call(this, data);
  };

  next();
}
