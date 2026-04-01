/**
 * PUPY爪住 - 商品路由 (完整实现)
 * 遛狗服务、繁育服务、产品订单
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 模拟数据库
const products = new Map();
const orders = new Map();
const walkingServices = new Map();
const breedingServices = new Map();

// 默认繁育服务示例
const defaultBreedingServices = [
  {
    id: 'breeding-1',
    seller_id: 'user-2',
    pet_id: 'pet-2',
    pet_name: '金毛寻回犬',
    pet_image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
    age: 3,
    price: 2500,
    payment_type: 'full',
    description: '血统纯正，健康检查，专业护理',
    tags: ['血统纯正', '健康检查', '专业护理'],
    rating: 4.9,
    created_at: new Date().toISOString()
  },
  {
    id: 'breeding-2',
    seller_id: 'user-3',
    pet_id: 'pet-3',
    pet_name: '边境牧羊犬',
    pet_image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=400',
    age: 2,
    price: 3200,
    payment_type: 'aa',
    description: '高智商，冠军后代，性格温顺',
    tags: ['高智商', '冠军后代', '性格温顺'],
    rating: 5.0,
    created_at: new Date().toISOString()
  },
  {
    id: 'breeding-3',
    seller_id: 'user-4',
    pet_id: 'pet-4',
    pet_name: '柴犬',
    pet_image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
    age: 4,
    price: 4500,
    payment_type: 'other',
    description: '网红同款，双血统，包邮',
    tags: ['网红同款', '双血统', '包邮'],
    rating: 4.8,
    created_at: new Date().toISOString()
  }
];

// 初始化繁育服务
defaultBreedingServices.forEach(s => breedingServices.set(s.id, s));

/**
 * 获取所有产品 (遛狗服务 + 繁育服务)
 * GET /api/v1/products
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    let result: any[] = [];

    if (!category || category === 'walking') {
      const walkingList = Array.from(walkingServices.values());
      result = [...result, ...walkingList.map(w => ({ ...w, productType: 'walking' }))];
    }

    if (!category || category === 'breeding') {
      const breedingList = Array.from(breedingServices.values());
      result = [...result, ...breedingList.map(b => ({ ...b, productType: 'breeding' }))];
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取产品列表失败'
    });
  }
});

/**
 * 获取单个产品
 * GET /api/v1/products/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const walkingService = walkingServices.get(id);
    if (walkingService) {
      return res.json({
        success: true,
        data: { ...walkingService, productType: 'walking' }
      });
    }

    const breedingService = breedingServices.get(id);
    if (breedingService) {
      return res.json({
        success: true,
        data: { ...breedingService, productType: 'breeding' }
      });
    }

    const product = products.get(id);
    if (product) {
      return res.json({
        success: true,
        data: product
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Product Not Found',
      message: '产品不存在'
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取产品信息失败'
    });
  }
});

/**
 * 发布遛狗服务
 * POST /api/v1/products/walking
 * Body: { name, bio, availability, pricePerSession, images? }
 */
router.post('/walking', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { name, bio, availability, pricePerSession, images } = req.body;

    if (!name || !bio || !availability || !pricePerSession) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请提供完整的服务信息'
      });
    }

    const serviceId = uuidv4();
    const newService = {
      id: serviceId,
      seller_id: userId,
      name,
      bio,
      availability,
      price_per_session: parseFloat(pricePerSession),
      images: images || [],
      rating: 5.0,
      reviews_count: 0,
      order_count: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    walkingServices.set(serviceId, newService);

    res.status(201).json({
      success: true,
      message: '遛狗服务发布成功',
      data: newService
    });
  } catch (error: any) {
    console.error('Publish walking service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '发布遛狗服务失败'
    });
  }
});

/**
 * 发布繁育服务
 * POST /api/v1/products/breeding
 * Body: { petId, petImage, breed, age, price, paymentType, description, tags? }
 */
router.post('/breeding', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { petId, petImage, breed, age, price, paymentType, description, tags } = req.body;

    if (!petId || !breed || !age) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请提供宠物信息和配种费用'
      });
    }

    const serviceId = uuidv4();
    const newService = {
      id: serviceId,
      seller_id: userId,
      pet_id: petId,
      pet_name: breed,
      pet_image: petImage || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400',
      age: parseInt(age),
      price: price ? parseFloat(price) : 399, // 默认399元/次
      payment_type: paymentType || 'full',
      description: description || '',
      tags: tags || [],
      rating: 5.0,
      created_at: new Date().toISOString()
    };

    breedingServices.set(serviceId, newService);

    res.status(201).json({
      success: true,
      message: '繁育服务发布成功',
      data: newService
    });
  } catch (error: any) {
    console.error('Publish breeding service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '发布繁育服务失败'
    });
  }
});

/**
 * 获取遛狗服务列表
 * GET /api/v1/products/walking-services
 */
router.get('/walking-services/list', (req: Request, res: Response) => {
  try {
    const walkingList = Array.from(walkingServices.values());
    res.json({
      success: true,
      data: walkingList
    });
  } catch (error: any) {
    console.error('Get walking services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取遛狗服务列表失败'
    });
  }
});

/**
 * 获取繁育服务列表
 * GET /api/v1/products/breeding-services
 */
router.get('/breeding-services/list', (req: Request, res: Response) => {
  try {
    const breedingList = Array.from(breedingServices.values());
    res.json({
      success: true,
      data: breedingList
    });
  } catch (error: any) {
    console.error('Get breeding services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取繁育服务列表失败'
    });
  }
});

/**
 * 创建订单
 * POST /api/v1/products/orders
 * Body: { productId, productType, quantity }
 */
router.post('/orders', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { productId, productType, quantity = 1 } = req.body;

    if (!productId || !productType) {
      return res.status(400).json({
        success: false,
        error: 'Missing Fields',
        message: '请提供产品信息'
      });
    }

    // 获取产品信息
    let product: any;
    if (productType === 'walking') {
      product = walkingServices.get(productId);
    } else if (productType === 'breeding') {
      product = breedingServices.get(productId);
    } else {
      product = products.get(productId);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product Not Found',
        message: '产品不存在'
      });
    }

    // 计算总价
    const price = product.price || product.price_per_session || 0;
    const totalPrice = price * quantity;

    const orderId = uuidv4();
    const newOrder = {
      id: orderId,
      buyer_id: userId,
      product_id: productId,
      product_type: productType,
      quantity,
      order_status: 'pending',
      total_price: totalPrice,
      payment_method: null,
      delivery_address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    orders.set(orderId, newOrder);

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: newOrder
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '创建订单失败'
    });
  }
});

/**
 * 获取我的订单
 * GET /api/v1/products/orders/my
 */
router.get('/orders/my', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';

    const userOrders = Array.from(orders.values())
      .filter(o => o.buyer_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: userOrders
    });
  } catch (error: any) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取订单列表失败'
    });
  }
});

/**
 * 获取我发布的服务
 * GET /api/v1/products/my-services
 */
router.get('/my-services', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';

    const walkingList = Array.from(walkingServices.values()).filter(s => s.seller_id === userId);
    const breedingList = Array.from(breedingServices.values()).filter(s => s.seller_id === userId);

    res.json({
      success: true,
      data: {
        walkingServices: walkingList,
        breedingServices: breedingList
      }
    });
  } catch (error: any) {
    console.error('Get my services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '获取我发布的服务失败'
    });
  }
});

/**
 * 上传产品图片
 * POST /api/v1/products/upload
 * Body: { url, productId, productType }
 */
router.post('/upload', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'user-1';
    const { url, productId, productType } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing URL',
        message: '请提供图片URL'
      });
    }

    // 记录上传
    const uploadId = uuidv4();
    const uploadRecord = {
      id: uploadId,
      user_id: userId,
      url,
      product_id: productId,
      product_type: productType,
      created_at: new Date().toISOString()
    };

    // 更新产品图片
    if (productId && productType === 'walking') {
      const service = walkingServices.get(productId);
      if (service) {
        service.images = [...(service.images || []), url];
        walkingServices.set(productId, service);
      }
    } else if (productId && productType === 'breeding') {
      const service = breedingServices.get(productId);
      if (service) {
        service.pet_image = url;
        breedingServices.set(productId, service);
      }
    }

    res.json({
      success: true,
      message: '图片上传成功',
      data: uploadRecord
    });
  } catch (error: any) {
    console.error('Upload product image error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '上传图片失败'
    });
  }
});

export default router;