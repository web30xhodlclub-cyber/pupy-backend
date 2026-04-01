/**
 * PUPY爪住 - 宠物路由 (完整实现)
 * 宠物创建、查询、更新、删除
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 模拟数据库
const pets = new Map();
const users = new Map();

// 默认宠物示例数据
const defaultPets = [
  {
    id: uuidv4(),
    user_id: 'user-1',
    name: '小豆子',
    breed: '金毛寻回犬',
    age: 3,
    gender: 'male',
    mbti_type: 'ENFP',
    tags: ['活泼', '友好', '爱玩球'],
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
    image_3d_url: null,
    is_real: true,
    clone_status: 'original',
    energy_level: 85,
    mood: '开心',
    is_deleted: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    user_id: 'user-2',
    name: '棉花糖',
    breed: '萨摩耶',
    age: 2,
    gender: 'female',
    mbti_type: 'ESFJ',
    tags: ['可爱', '粘人', '微笑天使'],
    image_url: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&q=80&w=400',
    image_3d_url: null,
    is_real: true,
    clone_status: 'original',
    energy_level: 90,
    mood: '开心',
    is_deleted: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    user_id: 'user-3',
    name: '旺财',
    breed: '柴犬',
    age: 4,
    gender: 'male',
    mbti_type: 'ISTP',
    tags: ['独立', '忠诚', '网红同款'],
    image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
    image_3d_url: null,
    is_real: true,
    clone_status: 'original',
    energy_level: 75,
    mood: '平静',
    is_deleted: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    user_id: 'user-4',
    name: '小白',
    breed: '边境牧羊犬',
    age: 2,
    gender: 'female',
    mbti_type: 'INTJ',
    tags: ['高智商', '冠军后代', '学习快'],
    image_url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=400',
    image_3d_url: null,
    is_real: true,
    clone_status: 'original',
    energy_level: 95,
    mood: '兴奋',
    is_deleted: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    user_id: 'user-5',
    name: '布丁',
    breed: '比熊犬',
    age: 1,
    gender: 'female',
    mbti_type: 'INFP',
    tags: ['软萌', '安静', '不掉毛'],
    image_url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=400',
    image_3d_url: null,
    is_real: true,
    clone_status: 'original',
    energy_level: 70,
    mood: '开心',
    is_deleted: false,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 初始化默认宠物
defaultPets.forEach(pet => pets.set(pet.id, pet));

/**
 * 获取所有宠物 (支持筛选)
 * GET /api/v1/pets
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { breed, gender, age_min, age_max, tags, page = '1', limit = '20' } = req.query;

    let result = Array.from(pets.values()).filter(p => !p.is_deleted);

    // 筛选
    if (breed) {
      result = result.filter(p => p.breed?.toLowerCase().includes(String(breed).toLowerCase()));
    }
    if (gender) {
      result = result.filter(p => p.gender === gender);
    }
    if (age_min) {
      result = result.filter(p => p.age >= Number(age_min));
    }
    if (age_max) {
      result = result.filter(p => p.age <= Number(age_max));
    }
    if (tags) {
      const tagList = String(tags).split(',');
      result = result.filter(p => 
        tagList.some(tag => p.tags?.includes(tag))
      );
    }

    // 分页
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit))));
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginated = result.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.length,
        totalPages: Math.ceil(result.length / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get pets error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取宠物列表失败'
    });
  }
});

/**
 * 获取我的宠物列表
 * GET /api/v1/pets/my
 */
router.get('/my', (req: Request, res: Response) => {
  try {
    // 从auth中间件获取用户ID
    const userId = (req as any).user?.id || 'user-1';
    const userPets = Array.from(pets.values()).filter(p => p.user_id === userId && !p.is_deleted);

    res.json({
      success: true,
      data: userPets
    });
  } catch (error: any) {
    console.error('Get my pets error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取我的宠物失败'
    });
  }
});

/**
 * 获取单个宠物
 * GET /api/v1/pets/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pet = pets.get(id);

    if (!pet || pet.is_deleted) {
      return res.status(404).json({
        success: false,
        error: 'Pet Not Found',
        message: '宠物不存在'
      });
    }

    // 获取宠物的主人信息
    const owner = users.get(pet.user_id) || {
      id: pet.user_id,
      username: '铲屎官',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
    };

    res.json({
      success: true,
      data: {
        ...pet,
        owner
      }
    });
  } catch (error: any) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取宠物信息失败'
    });
  }
});

/**
 * 创建宠物
 * POST /api/v1/pets
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { name, breed, age, gender, mbti_type, tags, image_url, is_real, clone_status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing Name',
        message: '请提供宠物名称'
      });
    }

    const petId = uuidv4();
    const newPet = {
      id: petId,
      user_id: userId,
      name,
      breed: breed || null,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      mbti_type: mbti_type || null,
      tags: tags || [],
      image_url: image_url || null,
      image_3d_url: null,
      is_real: is_real !== undefined ? is_real : true,
      clone_status: clone_status || (is_real ? 'original' : 'clone'),
      energy_level: 100,
      mood: '开心',
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    pets.set(petId, newPet);

    res.status(201).json({
      success: true,
      message: '宠物创建成功',
      data: newPet
    });
  } catch (error: any) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '创建宠物失败'
    });
  }
});

/**
 * 更新宠物信息
 * PUT /api/v1/pets/:id
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const pet = pets.get(id);

    if (!pet || pet.is_deleted) {
      return res.status(404).json({
        success: false,
        error: 'Pet Not Found',
        message: '宠物不存在'
      });
    }

    // 检查权限
    if (pet.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '无权修改此宠物信息'
      });
    }

    const { name, breed, age, gender, mbti_type, tags, image_url, image_3d_url, energy_level, mood } = req.body;

    // 更新字段
    const updatedPet = {
      ...pet,
      name: name !== undefined ? name : pet.name,
      breed: breed !== undefined ? breed : pet.breed,
      age: age !== undefined ? parseInt(age) : pet.age,
      gender: gender !== undefined ? gender : pet.gender,
      mbti_type: mbti_type !== undefined ? mbti_type : pet.mbti_type,
      tags: tags !== undefined ? tags : pet.tags,
      image_url: image_url !== undefined ? image_url : pet.image_url,
      image_3d_url: image_3d_url !== undefined ? image_3d_url : pet.image_3d_url,
      energy_level: energy_level !== undefined ? energy_level : pet.energy_level,
      mood: mood !== undefined ? mood : pet.mood,
      updated_at: new Date().toISOString()
    };

    pets.set(id, updatedPet);

    res.json({
      success: true,
      message: '宠物信息已更新',
      data: updatedPet
    });
  } catch (error: any) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '更新宠物信息失败'
    });
  }
});

/**
 * 删除宠物 (软删除)
 * DELETE /api/v1/pets/:id
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const pet = pets.get(id);

    if (!pet || pet.is_deleted) {
      return res.status(404).json({
        success: false,
        error: 'Pet Not Found',
        message: '宠物不存在'
      });
    }

    // 检查权限
    if (pet.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '无权删除此宠物'
      });
    }

    // 软删除
    pet.is_deleted = true;
    pet.deleted_at = new Date().toISOString();
    pets.set(id, pet);

    res.json({
      success: true,
      message: '宠物已删除'
    });
  } catch (error: any) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '删除宠物失败'
    });
  }
});

/**
 * 上传宠物图片
 * POST /api/v1/pets/:id/image
 */
router.post('/:id/image', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;
    const pet = pets.get(id);

    if (!pet || pet.is_deleted) {
      return res.status(404).json({
        success: false,
        error: 'Pet Not Found',
        message: '宠物不存在'
      });
    }

    if (!image_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing Image URL',
        message: '请提供图片URL'
      });
    }

    pet.image_url = image_url;
    pet.updated_at = new Date().toISOString();
    pets.set(id, pet);

    res.json({
      success: true,
      message: '图片上传成功',
      data: { image_url: pet.image_url }
    });
  } catch (error: any) {
    console.error('Upload pet image error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '上传图片失败'
    });
  }
});

export default router;