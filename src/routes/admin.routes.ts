import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// 初始化 Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  SUPABASE_URL || 'https://jminexbqkkfwnlagghha.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaW5leGJxa2tmd25sYWdnaGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2OTc4NiwiZXhwIjoyMDkwNDQ1Nzg2fQ.aUJHwnNUBwqiL0rQpNuvH84L4cqXJ95KwvPq3dBlgV4'
);

// 通用响应格式
const sendResponse = (res: Response, status: number, data: any = null, message: string = '') => {
  res.status(status).json({
    success: status < 400,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

// ==================== 用户管理 ====================

router.get('/users', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log('✅ 获取用户列表:', data?.length);
    sendResponse(res, 200, data, '用户列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取用户列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, username, name, user_level, online_status } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email,
        username,
        bio: name,
        password_hash: 'temp', // 实际应该使用加密
        user_level: user_level || 1,
        online_status: online_status || 'offline'
      }])
      .select();

    if (error) throw error;
    sendResponse(res, 201, data, '用户创建成功');
  } catch (error: any) {
    console.error('❌ 创建用户失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    sendResponse(res, 200, data, '用户更新成功');
  } catch (error: any) {
    console.error('❌ 更新用户失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '用户删除成功');
  } catch (error: any) {
    console.error('❌ 删除用户失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 宠物管理 ====================

router.get('/pets', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log('✅ 获取宠物列表:', data?.length);
    sendResponse(res, 200, data, '宠物列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取宠物列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.post('/pets', async (req: Request, res: Response) => {
  try {
    const { user_id, name, breed, gender, is_real, energy_level } = req.body;

    const { data, error } = await supabase
      .from('pets')
      .insert([{
        user_id: user_id || '00000000-0000-0000-0000-000000000000',
        name,
        breed,
        gender,
        is_real: is_real === 'true' || is_real === true,
        energy_level: energy_level || 100
      }])
      .select();

    if (error) throw error;
    sendResponse(res, 201, data, '宠物创建成功');
  } catch (error: any) {
    console.error('❌ 创建宠物失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.put('/pets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 处理布尔值
    if (updates.is_real !== undefined) {
      updates.is_real = updates.is_real === 'true' || updates.is_real === true;
    }

    const { data, error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    sendResponse(res, 200, data, '宠物更新成功');
  } catch (error: any) {
    console.error('❌ 更新宠物失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/pets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '宠物删除成功');
  } catch (error: any) {
    console.error('❌ 删除宠物失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 配对管理 ====================

router.get('/matches', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    sendResponse(res, 200, data, '配对列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取配对列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/matches/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '配对删除成功');
  } catch (error: any) {
    console.error('❌ 删除配对失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 对话管理 ====================

router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    sendResponse(res, 200, data, '对话列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取对话列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '对话删除成功');
  } catch (error: any) {
    console.error('❌ 删除对话失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 消息管理 ====================

router.get('/messages', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    sendResponse(res, 200, data, '消息列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取消息列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/messages/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '消息删除成功');
  } catch (error: any) {
    console.error('❌ 删除消息失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 商品管理 ====================

router.get('/products', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    sendResponse(res, 200, data, '商品列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取商品列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.post('/products', async (req: Request, res: Response) => {
  try {
    const { seller_id, title, description, price, inventory, is_available } = req.body;

    const { data, error } = await supabase
      .from('products')
      .insert([{
        seller_id: seller_id || '00000000-0000-0000-0000-000000000000',
        title,
        description,
        price,
        inventory: inventory || 0,
        is_available: is_available === 'true' || is_available === true
      }])
      .select();

    if (error) throw error;
    sendResponse(res, 201, data, '商品创建成功');
  } catch (error: any) {
    console.error('❌ 创建商品失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.is_available !== undefined) {
      updates.is_available = updates.is_available === 'true' || updates.is_available === true;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    sendResponse(res, 200, data, '商品更新成功');
  } catch (error: any) {
    console.error('❌ 更新商品失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '商品删除成功');
  } catch (error: any) {
    console.error('❌ 删除商品失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 通知管理 ====================

router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    sendResponse(res, 200, data, '通知列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取通知列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/notifications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '通知删除成功');
  } catch (error: any) {
    console.error('❌ 删除通知失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 虚拟领域管理 ====================

router.get('/realms', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('realms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    sendResponse(res, 200, data, '虚拟领域列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取虚拟领域列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.post('/realms', async (req: Request, res: Response) => {
  try {
    const { name, description, story, realm_type, image_url, icon_name } = req.body;

    const { data, error } = await supabase
      .from('realms')
      .insert([{
        name,
        description,
        story,
        realm_type: realm_type || 'fantasy',
        image_url,
        icon_name,
        is_active: true
      }])
      .select();

    if (error) throw error;
    sendResponse(res, 201, data, '虚拟领域创建成功');
  } catch (error: any) {
    console.error('❌ 创建虚拟领域失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.put('/realms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('realms')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    sendResponse(res, 200, data, '虚拟领域更新成功');
  } catch (error: any) {
    console.error('❌ 更新虚拟领域失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/realms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('realms')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '虚拟领域删除成功');
  } catch (error: any) {
    console.error('❌ 删除虚拟领域失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 宠物社交记录管理 ====================

router.get('/pet-social-records', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('pet_social_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    sendResponse(res, 200, data, '宠物社交记录列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取宠物社交记录列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/pet-social-records/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pet_social_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '宠物社交记录删除成功');
  } catch (error: any) {
    console.error('❌ 删除宠物社交记录失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 订单管理 ====================

router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    sendResponse(res, 200, data, '订单列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取订单列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.post('/orders', async (req: Request, res: Response) => {
  try {
    const { buyer_id, product_id, quantity, total_price, payment_method } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        buyer_id,
        product_id,
        quantity,
        total_price,
        payment_method: payment_method || 'unknown',
        order_status: 'pending'
      }])
      .select();

    if (error) throw error;
    sendResponse(res, 201, data, '订单创建成功');
  } catch (error: any) {
    console.error('❌ 创建订单失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.put('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    sendResponse(res, 200, data, '订单更新成功');
  } catch (error: any) {
    console.error('❌ 更新订单失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '订单删除成功');
  } catch (error: any) {
    console.error('❌ 删除订单失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 收养管理 ====================

router.get('/adoptions', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('adoptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    sendResponse(res, 200, data, '收养列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取收养列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.post('/adoptions', async (req: Request, res: Response) => {
  try {
    const { pet_id, previous_owner_id, new_owner_id, reason } = req.body;

    const { data, error } = await supabase
      .from('adoptions')
      .insert([{
        pet_id,
        previous_owner_id,
        new_owner_id,
        reason,
        adoption_status: 'pending'
      }])
      .select();

    if (error) throw error;
    sendResponse(res, 201, data, '收养申请创建成功');
  } catch (error: any) {
    console.error('❌ 创建收养申请失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.put('/adoptions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('adoptions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    sendResponse(res, 200, data, '收养信息更新成功');
  } catch (error: any) {
    console.error('❌ 更新收养信息失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/adoptions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('adoptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '收养记录删除成功');
  } catch (error: any) {
    console.error('❌ 删除收养记录失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 日记管理 ====================

router.get('/diary-entries', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    sendResponse(res, 200, data, '日记列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取日记列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.put('/diary-entries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('diary_entries')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    sendResponse(res, 200, data, '日记更新成功');
  } catch (error: any) {
    console.error('❌ 更新日记失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/diary-entries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '日记删除成功');
  } catch (error: any) {
    console.error('❌ 删除日记失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== AI祈愿管理 ====================

router.get('/ai-prayers', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ai_prayers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    sendResponse(res, 200, data, 'AI祈愿列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取AI祈愿列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.put('/ai-prayers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('ai_prayers')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    sendResponse(res, 200, data, 'AI祈愿更新成功');
  } catch (error: any) {
    console.error('❌ 更新AI祈愿失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/ai-prayers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('ai_prayers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, 'AI祈愿删除成功');
  } catch (error: any) {
    console.error('❌ 删除AI祈愿失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 评论管理 ====================

router.get('/comments', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    sendResponse(res, 200, data, '评论列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取评论列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/comments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '评论删除成功');
  } catch (error: any) {
    console.error('❌ 删除评论失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 点赞管理 ====================

router.get('/likes', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    sendResponse(res, 200, data, '点赞列表获取成功');
  } catch (error: any) {
    console.error('❌ 获取点赞列表失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

router.delete('/likes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    sendResponse(res, 200, null, '点赞删除成功');
  } catch (error: any) {
    console.error('❌ 删除点赞失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

// ==================== 统计数据端点 ====================

router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const [users, pets, products, orders, messages] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('pets').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true })
    ]);

    sendResponse(res, 200, {
      totalUsers: users.count || 0,
      totalPets: pets.count || 0,
      totalProducts: products.count || 0,
      totalOrders: orders.count || 0,
      totalMessages: messages.count || 0
    }, '概览数据获取成功');
  } catch (error: any) {
    console.error('❌ 获取概览数据失败:', error.message);
    sendResponse(res, 500, null, error.message);
  }
});

export default router;
