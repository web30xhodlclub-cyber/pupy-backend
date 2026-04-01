/**
 * PUPY爪住 - 虚拟领域路由 (完整实现)
 * 小院儿创建、加入、管理
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 模拟数据库
const realms = new Map(); // 虚拟领域 (预定义的)
const rooms = new Map(); // 用户创建的小院儿

// 默认虚拟领域
const defaultRealms = [
  {
    id: 'realm-1',
    name: '躲雨深林',
    description: '神秘的森林小院儿，宠物可以在这里相遇',
    story: '古老的森林中住着许多神秘的生物，它们在这里等待着新朋友的到来。',
    function_description: '宠物在这里可以进行社交互动',
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
    icon_name: 'forest',
    realm_type: 'fantasy',
    online_count: 12,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'realm-2',
    name: '阳光海滩',
    description: '温暖的海边小院儿，适合玩耍和休息',
    story: '金色的沙滩上，海浪轻轻拍打着岸边，宠物们在这里享受阳光。',
    function_description: '宠物可以在海边进行社交和放松',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    icon_name: 'beach_access',
    realm_type: 'beach',
    online_count: 8,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'realm-3',
    name: '高山牧场',
    description: '宽敞的牧场小院儿，空间无限',
    story: '高山之上，有一片宁静的牧场，宠物们可以自由奔跑。',
    function_description: '宠物可以在牧场中进行户外活动',
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    icon_name: 'terrain',
    realm_type: 'mountain',
    online_count: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'realm-4',
    name: '泡泡失重海',
    description: '奇妙的水下世界，失重漂浮体验',
    story: '在一个神秘的水底世界，重力消失了，宠物们可以自由漂浮。',
    function_description: '宠物可以在失重环境中体验漂浮乐趣',
    image_url: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=800',
    icon_name: 'water',
    realm_type: 'underwater',
    online_count: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 初始化虚拟领域
defaultRealms.forEach(realm => realms.set(realm.id, realm));

/**
 * 获取所有虚拟领域
 * GET /api/v1/realms
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const allRealms = Array.from(realms.values()).filter(r => r.is_active);
    res.json({
      success: true,
      data: allRealms
    });
  } catch (error: any) {
    console.error('Get realms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取领域列表失败'
    });
  }
});

/**
 * 获取单个虚拟领域
 * GET /api/v1/realms/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const realm = realms.get(id);

    if (!realm || !realm.is_active) {
      return res.status(404).json({
        success: false,
        error: 'Realm Not Found',
        message: '领域不存在'
      });
    }

    res.json({
      success: true,
      data: realm
    });
  } catch (error: any) {
    console.error('Get realm error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取领域信息失败'
    });
  }
});

/**
 * 获取领域在线用户
 * GET /api/v1/realms/:id/online-users
 */
router.get('/:id/online-users', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const realm = realms.get(id);

    if (!realm) {
      return res.status(404).json({
        success: false,
        error: 'Realm Not Found',
        message: '领域不存在'
      });
    }

    // 模拟在线用户
    const onlineUsers = [
      { id: 'user-1', name: '小豆子的铲屎官', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100', petName: '小豆子' },
      { id: 'user-2', name: '棉花糖的主人', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', petName: '棉花糖' }
    ];

    res.json({
      success: true,
      data: {
        count: realm.online_count,
        users: onlineUsers
      }
    });
  } catch (error: any) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取在线用户失败'
    });
  }
});

/**
 * 创建小院儿
 * POST /api/v1/realms/rooms
 * Body: { name, map, roomCode, roomPassword, capacity? }
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { name, map, roomCode, roomPassword, capacity } = req.body;

    if (!name || !map || !roomCode || !roomPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请提供完整的小院儿信息'
      });
    }

    // 检查房间代号是否已存在
    const existingRoom = Array.from(rooms.values()).find(r => r.room_code === roomCode);
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        error: 'Room Code Exists',
        message: '该房间代号已被使用'
      });
    }

    // 获取地图对应的领域
    const realm = Array.from(realms.values()).find(r => r.id === map || r.realm_type === map);
    
    const roomId = uuidv4();
    const newRoom = {
      id: roomId,
      owner_id: userId,
      name,
      map: map,
      map_name: realm?.name || map,
      map_image: realm?.image_url || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
      room_code: roomCode,
      room_password: roomPassword, // 生产环境应该加密
      capacity: capacity || 10,
      current_users: [userId],
      online_count: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    rooms.set(roomId, newRoom);

    res.status(201).json({
      success: true,
      message: '小院儿创建成功',
      data: {
        id: newRoom.id,
        name: newRoom.name,
        map: newRoom.map,
        map_name: newRoom.map_name,
        roomCode: newRoom.room_code,
        capacity: newRoom.capacity,
        onlineCount: newRoom.online_count,
        createdAt: newRoom.created_at
      }
    });
  } catch (error: any) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '创建小院儿失败'
    });
  }
});

/**
 * 加入小院儿
 * POST /api/v1/realms/rooms/join
 * Body: { roomCode, roomPassword }
 */
router.post('/rooms/join', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { roomCode, roomPassword } = req.body;

    if (!roomCode || !roomPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请输入房间代号和密码'
      });
    }

    // 查找房间
    const room = Array.from(rooms.values()).find(r => 
      r.room_code === roomCode && r.is_active
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room Not Found',
        message: '房间不存在或代号错误'
      });
    }

    // 验证密码
    if (room.room_password !== roomPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Password',
        message: '房间密码错误'
      });
    }

    // 检查是否已满员
    if (room.current_users.length >= room.capacity) {
      return res.status(403).json({
        success: false,
        error: 'Room Full',
        message: '小院儿已满员'
      });
    }

    // 检查用户是否已在房间中
    if (!room.current_users.includes(userId)) {
      room.current_users.push(userId);
      room.online_count++;
      rooms.set(room.id, room);
    }

    res.json({
      success: true,
      message: '加入小院儿成功',
      data: {
        id: room.id,
        name: room.name,
        map: room.map,
        map_name: room.map_name,
        map_image: room.map_image,
        roomCode: room.room_code,
        currentUsers: room.current_users.length,
        capacity: room.capacity
      }
    });
  } catch (error: any) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '加入小院儿失败'
    });
  }
});

/**
 * 获取我的小院儿
 * GET /api/v1/realms/rooms/my
 */
router.get('/rooms/my', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';

    // 获取我创建的
    const myOwned = Array.from(rooms.values()).filter(r => 
      r.owner_id === userId && r.is_active
    );

    // 获取我加入的
    const myJoined = Array.from(rooms.values()).filter(r => 
      r.current_users.includes(userId) && r.owner_id !== userId && r.is_active
    );

    res.json({
      success: true,
      data: {
        owned: myOwned.map(r => ({
          id: r.id,
          name: r.name,
          map: r.map,
          map_name: r.map_name,
          roomCode: r.room_code,
          currentUsers: r.current_users.length,
          capacity: r.capacity,
          onlineCount: r.online_count,
          createdAt: r.created_at
        })),
        joined: myJoined.map(r => ({
          id: r.id,
          name: r.name,
          map: r.map,
          map_name: r.map_name,
          ownerId: r.owner_id,
          currentUsers: r.current_users.length,
          capacity: r.capacity,
          onlineCount: r.online_count
        }))
      }
    });
  } catch (error: any) {
    console.error('Get my rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取我的小院儿失败'
    });
  }
});

/**
 * 获取小院儿成员
 * GET /api/v1/realms/rooms/:id/members
 */
router.get('/rooms/:id/members', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = rooms.get(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room Not Found',
        message: '小院儿不存在'
      });
    }

    // 模拟成员信息
    const members = room.current_users.map((userId, index) => ({
      id: userId,
      name: index === 0 ? '小院儿主人' : `成员 ${index}`,
      avatar: `https://images.unsplash.com/photo-${index === 0 ? '1535713875002-d1d0cf377fde' : '1494790108377-be9c29b29330'}?auto=format&fit=crop&q=80&w=100`,
      petName: ['小豆子', '棉花糖', '旺财'][index] || '汪星人',
      isOwner: index === 0
    }));

    res.json({
      success: true,
      data: {
        roomId: room.id,
        roomName: room.name,
        members,
        currentCount: room.current_users.length,
        capacity: room.capacity
      }
    });
  } catch (error: any) {
    console.error('Get room members error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取小院儿成员失败'
    });
  }
});

/**
 * 离开小院儿
 * POST /api/v1/realms/rooms/:id/leave
 */
router.post('/rooms/:id/leave', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { id } = req.params;
    const room = rooms.get(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room Not Found',
        message: '小院儿不存在'
      });
    }

    // 从当前用户列表中移除
    room.current_users = room.current_users.filter(u => u !== userId);
    room.online_count = Math.max(0, room.online_count - 1);
    rooms.set(id, room);

    // 如果房间空了，标记为非活跃
    if (room.current_users.length === 0) {
      room.is_active = false;
      rooms.set(id, room);
    }

    res.json({
      success: true,
      message: '已离开小院儿'
    });
  } catch (error: any) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '离开小院儿失败'
    });
  }
});

/**
 * 获取所有小院儿 (公开列表)
 * GET /api/v1/realms/rooms
 */
router.get('/rooms', (req: Request, res: Response) => {
  try {
    const allRooms = Array.from(rooms.values())
      .filter(r => r.is_active && r.current_users.length < r.capacity)
      .map(r => ({
        id: r.id,
        name: r.name,
        map_name: r.map_name,
        map_image: r.map_image,
        roomCode: r.room_code,
        currentUsers: r.current_users.length,
        capacity: r.capacity,
        onlineCount: r.online_count
      }));

    res.json({
      success: true,
      data: allRooms
    });
  } catch (error: any) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取小院儿列表失败'
    });
  }
});

export default router;