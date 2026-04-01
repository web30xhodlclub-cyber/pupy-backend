/**
 * PUPY爪住 - 用户路由 (完整实现)
 * 用户资料、统计、搜索
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 模拟数据库
const users = new Map();
const pets = new Map();

// 默认用户示例
const defaultUsers = [
  { id: 'user-1', email: 'test@example.com', username: '艾琳娜', name: '艾琳娜', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', bio: '首席铲屎官', mbti_type: 'INFJ', user_level: 42, points: 12800, achievements: ['社交达人', '遛狗高手'], online_status: 'online' },
  { id: 'user-2', email: 'user2@example.com', username: '小明', name: '小明', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', bio: '爱狗人士', mbti_type: 'ENFP', user_level: 15, points: 3200, achievements: [], online_status: 'offline' }
];

// 初始化用户
defaultUsers.forEach(u => users.set(u.id, u));

/**
 * 获取当前用户资料
 * GET /api/v1/users/profile/me
 */
router.get('/profile/me', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const user = users.get(userId) || defaultUsers[0];

    // 获取用户的宠物
    const userPets = Array.from(pets.values()).filter(p => p.user_id === userId && !p.is_deleted);

    res.json({
      success: true,
      data: {
        ...user,
        pets: userPets
      }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取用户资料失败'
    });
  }
});

/**
 * 更新用户资料
 * PUT /api/v1/users/profile
 */
router.put('/profile', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const user = users.get(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found',
        message: '用户不存在'
      });
    }

    const { name, bio, mbti_type, avatar_url } = req.body;

    // 更新字段
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (mbti_type) user.mbti_type = mbti_type;
    if (avatar_url) user.avatar_url = avatar_url;

    users.set(userId, user);

    res.json({
      success: true,
      message: '资料更新成功',
      data: user
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '更新资料失败'
    });
  }
});

/**
 * 获取用户统计
 * GET /api/v1/users/profile/me/stats
 */
router.get('/profile/me/stats', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const user = users.get(userId) || defaultUsers[0];

    res.json({
      success: true,
      data: {
        level: user.user_level,
        points: user.points,
        achievements: user.achievements || [],
        socialCount: 128,
        matchCount: 42,
        matchRate: '86%',
        urgentSocialIndex: 'high'
      }
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取统计失败'
    });
  }
});

/**
 * 获取单个用户
 * GET /api/v1/users/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = users.get(id) || defaultUsers.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found',
        message: '用户不存在'
      });
    }

    // 获取用户的宠物
    const userPets = Array.from(pets.values()).filter(p => p.user_id === id && !p.is_deleted);

    res.json({
      success: true,
      data: {
        ...user,
        pets: userPets
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取用户信息失败'
    });
  }
});

/**
 * 更新用户
 * PUT /api/v1/users/:id
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (userId !== id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '无权修改此用户'
      });
    }

    const user = users.get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User Not Found',
        message: '用户不存在'
      });
    }

    const { name, bio, mbti_type, avatar_url } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (mbti_type) user.mbti_type = mbti_type;
    if (avatar_url) user.avatar_url = avatar_url;

    users.set(id, user);

    res.json({
      success: true,
      message: '用户更新成功',
      data: user
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '更新用户失败'
    });
  }
});

/**
 * 获取用户统计
 * GET /api/v1/users/:id/stats
 */
router.get('/:id/stats', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        level: 1,
        points: 0,
        socialCount: 0,
        matchCount: 0
      }
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取用户统计失败'
    });
  }
});

/**
 * 搜索用户
 * GET /api/v1/users/search?keyword=xxx
 */
router.get('/search', (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Missing Keyword',
        message: '请提供搜索关键词'
      });
    }

    const results = Array.from(users.values())
      .filter(u => 
        u.username.includes(String(keyword)) || 
        u.name.includes(String(keyword)) ||
        u.bio?.includes(String(keyword))
      )
      .slice(0, 20);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '搜索用户失败'
    });
  }
});

/**
 * 上传头像
 * POST /api/v1/users/avatar
 */
router.post('/avatar', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { avatar_url } = req.body;

    if (!avatar_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing URL',
        message: '请提供头像URL'
      });
    }

    const user = users.get(userId) || defaultUsers[0];
    user.avatar_url = avatar_url;
    users.set(userId, user);

    res.json({
      success: true,
      message: '头像上传成功',
      data: { avatar_url }
    });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '上传头像失败'
    });
  }
});

export default router;