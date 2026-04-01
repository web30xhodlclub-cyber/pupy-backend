/**
 * PUPY爪住 - 日记路由 (完整实现)
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 模拟数据库
const diaryEntries = new Map();

/**
 * 获取日记列表
 * GET /api/v1/diary
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const entries = Array.from(diaryEntries.values())
      .filter(e => e.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: entries
    });
  } catch (error: any) {
    console.error('Get diary entries error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取日记列表失败'
    });
  }
});

/**
 * 创建日记
 * POST /api/v1/diary
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { title, content, petId, images, mood } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请提供标题和内容'
      });
    }

    const entryId = uuidv4();
    const newEntry = {
      id: entryId,
      user_id: userId,
      pet_id: petId || null,
      title,
      content,
      mood: mood || '开心',
      image_url: images?.[0] || null,
      images: images || [],
      is_public: false,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    diaryEntries.set(entryId, newEntry);

    res.status(201).json({
      success: true,
      message: '日记创建成功',
      data: newEntry
    });
  } catch (error: any) {
    console.error('Create diary entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '创建日记失败'
    });
  }
});

/**
 * 获取单个日记
 * GET /api/v1/diary/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = diaryEntries.get(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entry Not Found',
        message: '日记不存在'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error: any) {
    console.error('Get diary entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取日记失败'
    });
  }
});

/**
 * 删除日记
 * DELETE /api/v1/diary/:id
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { id } = req.params;
    const entry = diaryEntries.get(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entry Not Found',
        message: '日记不存在'
      });
    }

    if (entry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '无权删除此日记'
      });
    }

    diaryEntries.delete(id);

    res.json({
      success: true,
      message: '日记已删除'
    });
  } catch (error: any) {
    console.error('Delete diary entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '删除日记失败'
    });
  }
});

export default router;