/**
 * PUPY爪住 后端服务器入口
 * 宠物社交平台 & AI克隆 & 虚拟领域
 * 生产级架构 v1.0 - 已修复前后端联动
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 路由
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import petRoutes from './routes/pet.routes.js';
import matchRoutes from './routes/match.routes.js';
import messageRoutes from './routes/message.routes.js';
import realmRoutes from './routes/realm.routes.js';
import productRoutes from './routes/product.routes.js';
import diaryRoutes from './routes/diary.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import aiRoutes from './routes/ai.routes.js';

// 中间件
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';

dotenv.config();

export const app: Express = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// 全局中间件
// ============================================================================

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 静态文件服务 (用于上传的图片)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 日志
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// ============================================================================
// 健康检查端点 (公开)
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

app.get('/api/v1/status', (req: Request, res: Response) => {
  res.status(200).json({
    service: 'PUPY爪住 Backend',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// API 路由 (v1)
// ============================================================================

const apiV1 = express.Router();

// ========== 公开路由 (不需要认证) ==========

// 认证路由
apiV1.use('/auth', authRoutes);

// 健康检查
apiV1.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== 需要认证的路由 ==========

// 应用认证中间件
apiV1.use(authMiddleware);

// 用户路由
apiV1.use('/users', userRoutes);

// 宠物路由
apiV1.use('/pets', petRoutes);

// 匹配路由
apiV1.use('/matches', matchRoutes);

// 消息/对话路由
apiV1.use('/messages', messageRoutes);

// 领域路由 (包含小院儿)
apiV1.use('/realms', realmRoutes);

// 商品路由
apiV1.use('/products', productRoutes);

// 日志路由
apiV1.use('/diary', diaryRoutes);

// 通知路由
apiV1.use('/notifications', notificationRoutes);

// AI路由
apiV1.use('/ai', aiRoutes);

// ========== 文件上传路由 (需要认证) ==========

// 单文件上传
apiV1.post('/upload', (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing URL',
        message: '请提供文件URL'
      });
    }

    res.json({
      success: true,
      message: '文件上传成功',
      data: { url, filename: `upload_${Date.now()}.jpg` }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '上传失败'
    });
  }
});

// 多文件上传
apiV1.post('/upload/multiple', (req: Request, res: Response) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        error: 'Missing URLs',
        message: '请提供文件URL数组'
      });
    }

    res.json({
      success: true,
      message: '文件上传成功',
      data: { urls }
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: '上传失败'
    });
  }
});

// 挂载API路由
app.use('/api/v1', apiV1);

// ============================================================================
// 根路径
// ============================================================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'PUPY爪住 Backend API',
    version: '1.0.0',
    documentation: '/api/v1',
    health: '/health',
    status: '/api/v1/status'
  });
});

// ============================================================================
// 404 处理
// ============================================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// 全局错误处理
// ============================================================================

app.use(errorHandler);

// ============================================================================
// 服务器启动
// ============================================================================

async function startServer() {
  try {
    console.log('🚀 启动后端服务...');

    // 仅在非 Vercel 环境下启动监听
    if (process.env.VERCEL !== 'true' && process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║                 🐾 PUPY爪住 后端服务启动 🐾                 ║
╠════════════════════════════════════════════════════════════╣
║ 服务器地址: http://localhost:${PORT}                         ║
║ 环境: ${NODE_ENV === 'production' ? '生产' : '开发'}                                      ║
║ 健康检查: http://localhost:${PORT}/health                    ║
║ API状态: http://localhost:${PORT}/api/v1/status              ║
║ API文档: http://localhost:${PORT}/api/v1                     ║
╚════════════════════════════════════════════════════════════╝
        `);
      });
    }
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    if (process.env.VERCEL !== 'true') {
      process.exit(1);
    }
  }
}

if (process.env.VERCEL !== 'true') {
  startServer();
}