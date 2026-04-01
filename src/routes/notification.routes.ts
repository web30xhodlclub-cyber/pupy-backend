/**
 * PUPY爪住 - 通知路由 (完整实现)
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 模拟数据库
const notifications = new Map();

// 默认通知示例
const defaultNotifications = [
  { id: 'notif-1', user_id: 'user-1', title: '配对成功', message: '你和棉花糖互相喜欢了！可以开始聊天了。', notification_type: 'match', related_id: 'conv-1', is_read: false, created_at: new Date().toISOString() },
  { id: 'notif-2', user_id: 'user-1', title: '新消息', message: '艾琳娜给你发来一条消息', notification_type: 'message', related_id: 'conv-1', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() }
];

defaultNotifications.forEach(n => notifications.set(n.id, n));

/**
 * 获取通知列表
 * GET /api/v1/notifications
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const userNotifications = Array.from(notifications.values())
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: userNotifications
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取通知失败'
    });
  }
});

/**
 * 标记通知为已读
 * PUT /api/v1/notifications/:id/read
 */
router.put('/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = notifications.get(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification Not Found',
        message: '通知不存在'
      });
    }

    notification.is_read = true;
    notification.read_at = new Date().toISOString();
    notifications.set(id, notification);

    res.json({
      success: true,
      message: '已标记为已读'
    });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '标记已读失败'
    });
  }
});

/**
 * 标记所有通知为已读
 * PUT /api/v1/notifications/read-all
 */
router.put('/read-all', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';

    notifications.forEach((notif, id) => {
      if (notif.user_id === userId && !notif.is_read) {
        notif.is_read = true;
        notif.read_at = new Date().toISOString();
        notifications.set(id, notif);
      }
    });

    res.json({
      success: true,
      message: '所有通知已标记为已读'
    });
  } catch (error: any) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '标记全部已读失败'
    });
  }
});

/**
 * 获取未读通知数量
 * GET /api/v1/notifications/unread-count
 */
router.get('/unread-count', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const count = Array.from(notifications.values())
      .filter(n => n.user_id === userId && !n.is_read)
      .length;

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取未读数失败'
    });
  }
});

export default router;