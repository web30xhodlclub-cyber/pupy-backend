/**
 * PUPY爪住 - 消息路由 (完整实现)
 * 对话和消息的发送、接收、管理
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 模拟数据库
const conversations = new Map();
const messages = new Map();

// 默认对话示例
const defaultConversations = [
  {
    id: 'conv-1',
    user1_id: 'user-1',
    user2_id: 'user-2',
    pet1_id: 'pet-1',
    pet2_id: 'pet-2',
    conversation_type: 'pet-to-pet',
    last_message: '你的麻薯真的太可爱了！下次一起遛狗吗？',
    last_message_at: new Date().toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'conv-2',
    user1_id: 'user-1',
    user2_id: 'user-3',
    pet1_id: 'pet-1',
    pet2_id: 'pet-3',
    conversation_type: 'pet-to-pet',
    last_message: '露娜刚才在躲雨深林玩得很开心。',
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 默认消息示例
const defaultMessages: Record<string, any[]> = {
  'conv-1': [
    { id: 'msg-1', conversation_id: 'conv-1', sender_id: 'user-2', sender_type: 'user', message_text: '嘿！库珀看起来超级友好！', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'msg-2', conversation_id: 'conv-1', sender_id: 'user-1', sender_type: 'user', message_text: '是的，他非常喜欢交新朋友。你们什么时候有空一起去公园？', is_read: true, created_at: new Date(Date.now() - 3000000).toISOString() },
    { id: 'msg-3', conversation_id: 'conv-1', sender_id: 'user-2', sender_type: 'user', message_text: '这周末怎么样？躲雨深林领域现在很漂亮。', is_read: false, created_at: new Date(Date.now() - 1800000).toISOString() }
  ],
  'conv-2': [
    { id: 'msg-4', conversation_id: 'conv-2', sender_id: 'user-3', sender_type: 'user', message_text: '露娜刚才在躲雨深林玩得很开心。', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() }
  ]
};

// 初始化
defaultConversations.forEach(c => conversations.set(c.id, c));
Object.entries(defaultMessages).forEach(([convId, msgs]) => messages.set(convId, msgs));

/**
 * 获取当前用户的所有对话
 * GET /api/v1/messages
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';

    const userConversations = Array.from(conversations.values())
      .filter(c => (c.user1_id === userId || c.user2_id === userId) && c.is_active)
      .map(c => {
        const convMessages = messages.get(c.id) || [];
        const unreadCount = convMessages.filter(m => m.sender_id !== userId && !m.is_read).length;
        
        // 获取对方信息
        const otherUserId = c.user1_id === userId ? c.user2_id : c.user1_id;
        const otherPetId = c.pet1_id === 'pet-1' || c.pet1_id === userId + '-pet' ? c.pet2_id : c.pet1_id;
        
        return {
          id: c.id,
          otherUserId,
          otherPetId,
          lastMessage: c.last_message,
          lastMessageAt: c.last_message_at,
          unreadCount,
          isActive: c.is_active,
          createdAt: c.created_at
        };
      })
      .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());

    res.json({
      success: true,
      data: userConversations
    });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取对话列表失败'
    });
  }
});

/**
 * 获取某个对话的所有消息
 * GET /api/v1/messages/:conversationId/messages
 */
router.get('/:conversationId/messages', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { conversationId } = req.params;

    const conversation = conversations.get(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation Not Found',
        message: '对话不存在'
      });
    }

    // 检查权限
    if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '无权访问此对话'
      });
    }

    const conversationMessages = messages.get(conversationId) || [];

    // 标记消息为已读
    conversationMessages.forEach(msg => {
      if (msg.sender_id !== userId) {
        msg.is_read = true;
        msg.read_at = new Date().toISOString();
      }
    });

    res.json({
      success: true,
      data: conversationMessages
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取消息失败'
    });
  }
});

/**
 * 发送消息
 * POST /api/v1/messages
 * Body: { conversationId?, recipientId?, content, petId? }
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { conversationId, recipientId, content, petId } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Empty Message',
        message: '消息内容不能为空'
      });
    }

    let targetConversationId = conversationId;

    // 如果没有conversationId，需要创建或查找对话
    if (!targetConversationId) {
      if (!recipientId) {
        return res.status(400).json({
          success: false,
          error: 'Missing Recipient',
          message: '请提供接收者ID或对话ID'
        });
      }

      // 查找是否存在对话
      let existingConv = Array.from(conversations.values()).find(c =>
        (c.user1_id === userId && c.user2_id === recipientId) ||
        (c.user1_id === recipientId && c.user2_id === userId)
      );

      if (!existingConv) {
        // 创建新对话
        const newConvId = uuidv4();
        existingConv = {
          id: newConvId,
          user1_id: userId,
          user2_id: recipientId,
          pet1_id: petId || 'user-pet-1',
          pet2_id: 'recipient-pet',
          conversation_type: 'user-to-user',
          last_message: null,
          last_message_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        conversations.set(newConvId, existingConv);
        messages.set(newConvId, []);
      }

      targetConversationId = existingConv.id;
    }

    // 创建消息
    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      conversation_id: targetConversationId,
      sender_id: userId,
      sender_type: 'user',
      message_text: content.trim(),
      translated_text: null,
      message_type: 'text',
      attachment_url: null,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 存储消息
    if (!messages.has(targetConversationId)) {
      messages.set(targetConversationId, []);
    }
    messages.get(targetConversationId).push(newMessage);

    // 更新对话的最后消息
    const conversation = conversations.get(targetConversationId);
    if (conversation) {
      conversation.last_message = content.trim();
      conversation.last_message_at = new Date().toISOString();
      conversations.set(targetConversationId, conversation);
    }

    res.status(201).json({
      success: true,
      message: '消息已发送',
      data: newMessage
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '发送消息失败'
    });
  }
});

/**
 * 给宠物发送消息
 * POST /api/v1/messages/pet
 * Body: { petId, content }
 */
router.post('/pet', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { petId, content } = req.body;

    if (!petId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请提供宠物ID和消息内容'
      });
    }

    // 模拟AI回复
    const responses = [
      '汪汪！我也很想你呢！',
      '太好了！让我们去公园玩吧！',
      '主人，能给我加餐吗？😋',
      '我现在很开心！我们一起溜溜吧！',
      '谢谢你的爱，主人！',
      '今天的天气真好啊！',
      '我爱你，主人！❤️',
      '我想和你一起睡觉~',
      '什么时候带我去见新朋友？'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    res.json({
      success: true,
      data: {
        petId,
        userMessage: content,
        response: randomResponse,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Send pet message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '发送宠物消息失败'
    });
  }
});

/**
 * 标记对话消息为已读
 * PUT /api/v1/messages/:conversationId/read
 */
router.put('/:conversationId/read', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { conversationId } = req.params;

    const conversationMessages = messages.get(conversationId) || [];
    let readCount = 0;

    conversationMessages.forEach(msg => {
      if (msg.sender_id !== userId && !msg.is_read) {
        msg.is_read = true;
        msg.read_at = new Date().toISOString();
        readCount++;
      }
    });

    res.json({
      success: true,
      message: `已标记 ${readCount} 条消息为已读`
    });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '标记已读失败'
    });
  }
});

/**
 * 删除对话
 * DELETE /api/v1/messages/:conversationId
 */
router.delete('/:conversationId', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { conversationId } = req.params;

    const conversation = conversations.get(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation Not Found',
        message: '对话不存在'
      });
    }

    // 检查权限
    if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '无权删除此对话'
      });
    }

    // 软删除 - 设置为非活跃
    conversation.is_active = false;
    conversations.set(conversationId, conversation);

    res.json({
      success: true,
      message: '对话已删除'
    });
  } catch (error: any) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '删除对话失败'
    });
  }
});

/**
 * 获取未读消息数量
 * GET /api/v1/messages/unread/count
 */
router.get('/unread/count', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';

    let unreadCount = 0;
    messages.forEach((conversationMessages, conversationId) => {
      const conversation = conversations.get(conversationId);
      if (conversation && (conversation.user1_id === userId || conversation.user2_id === userId)) {
        unreadCount += conversationMessages.filter(m => m.sender_id !== userId && !m.is_read).length;
      }
    });

    res.json({
      success: true,
      data: { unreadCount }
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