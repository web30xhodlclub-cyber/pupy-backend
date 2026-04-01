/**
 * JWT 认证中间件
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-min-32-characters';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    iat: number;
    exp: number;
  };
}

/**
 * 验证JWT token
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: '缺少授权令牌'
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        username: decoded.username,
        iat: decoded.iat,
        exp: decoded.exp
      };
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          error: 'Token Expired',
          message: '令牌已过期'
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid Token',
          message: '无效的令牌'
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication Error',
      message: '认证错误'
    });
  }
}

/**
 * 可选的认证中间件（不强制）
 */
export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = {
          id: decoded.sub || decoded.id,
          email: decoded.email,
          username: decoded.username,
          iat: decoded.iat,
          exp: decoded.exp
        };
      } catch (error) {
        // 忽略token错误，继续
      }
    }
    
    next();
  } catch (error) {
    next();
  }
}

/**
 * 生成JWT token
 */
export function generateToken(userId: string, email: string, username: string): string {
  const expiresIn = process.env.JWT_EXPIRY || '7d';
  
  return jwt.sign(
    {
      sub: userId,
      id: userId,
      email,
      username
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * 验证token（不在中间件中使用）
 */
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * 解码token不验证
 */
export function decodeToken(token: string) {
  return jwt.decode(token);
}
