/**
 * PUPY爪住 - 匹配路由 (完整实现)
 * 左右滑动配对逻辑，支持双向喜欢触发配对成功
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 模拟数据库
const matches = new Map();
const conversations = new Map();
const messages = new Map();

// 用户滑动的记录: Map<userId, Map<targetPetId, action>>
const userSwipes = new Map();

// 默认宠物示例 (用于生成推荐)
const defaultPets = [
  { id: 'pet-1', user_id: 'user-1', name: '小豆子', breed: '金毛', age: 3, image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400', tags: ['活泼', '友好'] },
  { id: 'pet-2', user_id: 'user-2', name: '棉花糖', breed: '萨摩耶', age: 2, image: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&q=80&w=400', tags: ['可爱', '粘人'] },
  { id: 'pet-3', user_id: 'user-3', name: '旺财', breed: '柴犬', age: 4, image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400', tags: ['独立', '忠诚'] },
  { id: 'pet-4', user_id: 'user-4', name: '小白', breed: '边牧', age: 2, image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=400', tags: ['高智商', '爱学习'] },
  { id: 'pet-5', user_id: 'user-5', name: '布丁', breed: '比熊', age: 1, image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=400', tags: ['软萌', '安静'] },
];

/**
 * 创建匹配记录 (滑动操作)
 * POST /api/v1/matches
 * Body: { targetPetId, action: 'like' | 'dislike' }
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'current-user';
    const { targetPetId, action } = req.body;

    if (!targetPetId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请提供目标宠物ID和操作类型'
      });
    }

    if (!['like', 'dislike'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Action',
        message: '操作类型必须是 like 或 dislike'
      });
    }

    // 记录用户的滑动
    if (!userSwipes.has(userId)) {
      userSwipes.set(userId, new Map());
    }
    userSwipes.get(userId).set(targetPetId, action);

    // 创建匹配记录
    const matchId = uuidv4();
    const newMatch = {
      id: matchId,
      user_id: userId,
      target_pet_id: targetPetId,
      direction: action,
      is_mutual: false,
      compatibility_score: Math.floor(Math.random() * 20) + 80,
      mutual_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    matches.set(matchId, newMatch);

    // 检查是否双方都喜欢 (模拟对方也喜欢当前用户)
    let isMatched = false;
    
    if (action === 'like') {
      // 模拟：随机30%概率对方也喜欢
      const otherLiked = Math.random() < 0.3;
      
      if (otherLiked) {
        isMatched = true;
        newMatch.is_mutual = true;
        newMatch.mutual_at = new Date().toISOString();
        
        // 创建对话
        const convId = uuidv4();
        const conversation = {
          id: convId,
          user1_id: userId,
          user2_id: targetPetId.split('-')[0] + '-' + targetPetId.split('-')[1], // 简化
          pet1_id: 'user-pet-1',
          pet2_id: targetPetId,
          conversation_type: 'pet-to-pet',
          last_message: null,
          last_message_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        conversations.set(convId, conversation);

        // 初始化消息数组
        messages.set(convId, []);
      }
    }

    res.status(201).json({
      success: true,
      message: action === 'like' ? '已标记为喜欢' : '已标记为无感',
      data: {
        matchId: newMatch.id,
        action: newMatch.direction,
        isMatched,
        compatibilityScore: newMatch.compatibility_score,
        conversationId: isMatched ? conversations.keys().next().value : null
      }
    });
  } catch (error: any) {
    console.error('Create match error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '记录匹配失败'
    });
  }
});

/**
 * 获取推荐宠物列表 (排除已滑动过的)
 * GET /api/v1/matches/recommendations
 */
router.get('/recommendations', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'current-user';
    const userSwipedPets = userSwipes.get(userId);

    // 过滤掉已滑动的宠物
    const recommendations = defaultPets.filter(pet => {
      if (userSwipedPets) {
        return !userSwipedPets.has(pet.id);
      }
      return true;
    });

    // 添加距离和主人信息
    const enrichedRecommendations = recommendations.map(pet => ({
      ...pet,
      distance: `${Math.floor(Math.random() * 5) + 1}公里`,
      ownerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      ownerName: pet.name + '的铲屎官',
      ownerMbti: ['ENFP', 'INFJ', 'ISTP', 'ESFJ'][Math.floor(Math.random() * 4)],
      ownerSignature: '热爱生活，热爱宠物 ❤️',
      mbti: pet.mbti || 'ENFP'
    }));

    res.json({
      success: true,
      data: enrichedRecommendations
    });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取推荐失败'
    });
  }
});

/**
 * 获取匹配历史
 * GET /api/v1/matches/history
 */
router.get('/history', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'current-user';
    const userMatches = Array.from(matches.values())
      .filter(m => m.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: userMatches
    });
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取历史记录失败'
    });
  }
});

/**
 * 获取配对成功的列表
 * GET /api/v1/matches/successful
 */
router.get('/successful', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'current-user';
    const successfulMatches = Array.from(matches.values())
      .filter(m => m.user_id === userId && m.is_mutual)
      .map(m => {
        const pet = defaultPets.find(p => p.id === m.target_pet_id);
        return {
          matchId: m.id,
          petId: m.target_pet_id,
          petName: pet?.name || '未知宠物',
          petImage: pet?.image || '',
          matchedAt: m.mutual_at,
          conversationId: conversations.keys().next().value
        };
      });

    res.json({
      success: true,
      data: successfulMatches
    });
  } catch (error: any) {
    console.error('Get successful matches error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取成功配对失败'
    });
  }
});

/**
 * 获取或创建对话
 * GET /api/v1/matches/conversation/:targetPetId
 */
router.get('/conversation/:targetPetId', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'current-user';
    const { targetPetId } = req.params;

    // 查找是否存在对话
    let conversation = Array.from(conversations.values()).find(c => 
      (c.user1_id === userId && c.pet2_id === targetPetId) ||
      (c.user2_id === userId && c.pet1_id === targetPetId)
    );

    if (!conversation) {
      // 创建新对话
      const convId = uuidv4();
      conversation = {
        id: convId,
        user1_id: userId,
        user2_id: targetPetId.split('-')[0] + '-' + targetPetId.split('-')[1],
        pet1_id: 'user-pet-1',
        pet2_id: targetPetId,
        conversation_type: 'pet-to-pet',
        last_message: null,
        last_message_at: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      conversations.set(convId, conversation);
      messages.set(convId, []);
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取对话失败'
    });
  }
});

/**
 * 获取匹配统计
 * GET /api/v1/matches/stats
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'current-user';
    const userMatches = Array.from(matches.values()).filter(m => m.user_id === userId);
    
    const likes = userMatches.filter(m => m.direction === 'like').length;
    const dislikes = userMatches.filter(m => m.direction === 'dislike').length;
    const matches = userMatches.filter(m => m.is_mutual).length;

    res.json({
      success: true,
      data: {
        totalLikes: likes,
        totalDislikes: dislikes,
        totalMatches: matches,
        matchRate: likes > 0 ? ((matches / likes) * 100).toFixed(1) + '%' : '0%'
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

export default router;