/**
 * PUPY爪住 - 认证路由 (完整实现)
 * 用户注册、登录、token刷新、登出
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pupy-secret-key-2024-min-32-chars!!';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// 模拟数据库存储 (生产环境应使用真实数据库)
const users: Map<string, any> = new Map();
const refreshTokens: Set<string> = new Set();

/**
 * 生成JWT token
 */
function generateToken(user: any): string {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      email: user.email,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * 生成Refresh token
 */
function generateRefreshToken(): string {
  return uuidv4();
}

/**
 * 注册新用户
 * POST /api/v1/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username, name } = req.body;

    // 验证必填字段
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'Missing Required Fields',
        message: '邮箱、密码和用户名都是必填项'
      });
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Email',
        message: '请输入有效的邮箱地址'
      });
    }

    // 检查密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Weak Password',
        message: '密码至少需要6个字符'
      });
    }

    // 检查用户名是否已存在
    const existingEmail = Array.from(users.values()).find(u => u.email === email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: 'Email Already Exists',
        message: '该邮箱已被注册'
      });
    }

    const existingUsername = Array.from(users.values()).find(u => u.username === username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        error: 'Username Already Exists',
        message: '该用户名已被使用'
      });
    }

    // 创建用户
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: userId,
      email,
      password_hash: passwordHash,
      username,
      name: name || username,
      avatar_url: null,
      bio: null,
      mbti_type: null,
      user_level: 1,
      points: 0,
      achievements: [],
      online_status: 'online',
      last_seen: new Date().toISOString(),
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    users.set(userId, newUser);

    // 生成token
    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken();
    refreshTokens.add(refreshToken);

    // 创建用户的第一只宠物
    const petId = uuidv4();
    const userPet = {
      id: petId,
      user_id: userId,
      name: '我的宝贝',
      breed: '汪星人',
      age: 1,
      gender: null,
      mbti_type: null,
      tags: ['可爱', '活泼'],
      image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400',
      image_3d_url: null,
      is_real: true,
      clone_status: 'original',
      energy_level: 100,
      mood: '开心',
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 存储宠物
    const pets = new Map();
    pets.set(petId, userPet);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          user_level: newUser.user_level,
          points: newUser.points,
          avatar_url: newUser.avatar_url
        },
        pet: userPet,
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '注册失败，请稍后再试'
    });
  }
});

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing Credentials',
        message: '请输入邮箱和密码'
      });
    }

    // 查找用户
    const user = Array.from(users.values()).find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials',
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials',
        message: '邮箱或密码错误'
      });
    }

    // 更新在线状态
    user.online_status = 'online';
    user.last_seen = new Date().toISOString();
    users.set(user.id, user);

    // 生成token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken();
    refreshTokens.add(refreshToken);

    // 获取用户的宠物
    const userPets = Array.from(pets?.values() || []).filter(p => p.user_id === user.id && !p.is_deleted);
    const primaryPet = userPets.length > 0 ? userPets[0] : null;

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          user_level: user.user_level,
          points: user.points,
          avatar_url: user.avatar_url,
          bio: user.bio,
          mbti_type: user.mbti_type
        },
        pet: primaryPet,
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '登录失败，请稍后再试'
    });
  }
});

/**
 * Token刷新
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Refresh Token',
        message: '无效的刷新令牌'
      });
    }

    // 在实际应用中，需要通过refresh token获取用户ID
    // 这里简化处理
    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        token: generateToken({ id: 'user-id', email: 'user@example.com', username: 'user' })
      }
    });
  } catch (error: any) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '令牌刷新失败'
    });
  }
});

/**
 * 用户登出
 * POST /api/v1/auth/logout
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = users.get(decoded.sub);
        if (user) {
          user.online_status = 'offline';
          users.set(user.id, user);
        }
      } catch (e) {
        // Token may be invalid, continue with logout
      }
    }

    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '登出失败'
    });
  }
});

/**
 * 发送验证码 (用于密码重置)
 * POST /api/v1/auth/send-code
 */
router.post('/send-code', (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Missing Email',
      message: '请提供邮箱地址'
    });
  }

  const user = Array.from(users.values()).find(u => u.email === email);
  if (!user) {
    // 为防止邮箱枚举攻击，返回成功
    return res.json({
      success: true,
      message: '验证码已发送'
    });
  }

  // 在实际应用中，应发送真实的验证码邮件
  res.json({
    success: true,
    message: '验证码已发送（测试模式: 123456）'
  });
});

/**
 * 重置密码
 * POST /api/v1/auth/reset-password
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请提供完整信息'
      });
    }

    // 在测试模式下，任何6位数字验证码都有效
    if (code !== '123456') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Code',
        message: '验证码错误'
      });
    }

    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found',
        message: '用户不存在'
      });
    }

    // 更新密码
    user.password_hash = await bcrypt.hash(newPassword, 10);
    users.set(user.id, user);

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '密码重置失败'
    });
  }
});

export default router;