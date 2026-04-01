# 🐾 PUPY爪住 后端 v1.0 - 完整生产级API

**宠物社交平台 & AI克隆 & 虚拟领域系统的完整Express后端服务**

---

## 📋 快速概览

| 项目 | 详情 |
|------|------|
| **状态** | ✅ 生产就绪 |
| **版本** | v1.0.0 |
| **技术栈** | Express.js + TypeScript + Supabase (PostgreSQL) |
| **API端点** | 20+ 个生产级端点 |
| **数据库表** | 16 张表，完整关系设计 |
| **认证** | JWT + Bcrypt |
| **中间件** | 认证、错误处理、日志、CORS |

---

## 🚀 快速开始 (5分钟)

### 1. 环境准备

```bash
# 克隆项目
cd 后端V3-COMPLETE

# 安装依赖
npm install

# 创建.env文件
cp .env.example .env
```

### 2. 配置Supabase

编辑 `.env` 文件：

```env
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT密钥
JWT_SECRET=your_jwt_secret_key_min_32_characters

# 前端URL
FRONTEND_URL=http://localhost:3000
```

### 3. 初始化数据库

```bash
# 在Supabase SQL编辑器中执行database/schema.sql
# 或使用迁移命令（如果配置了迁移工具）
npm run migrate
```

### 4. 启动开发服务器

```bash
npm run dev

# 输出：
# ✅ Supabase 已连接
# 🐾 PUPY爪住 后端服务启动
# 服务器地址: http://localhost:3001
```

### 5. 测试API

```bash
# 健康检查
curl http://localhost:3001/health

# 注册用户
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "user123"
  }'
```

---

## 📚 API文档

### 认证接口 (Public)

#### 注册

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "user123"
}

Response:
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": { "id", "email", "username" },
    "token": "eyJhbGc..."
  }
}
```

#### 登录

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### 用户接口 (Protected)

#### 获取当前用户信息

```
GET /api/v1/users/profile/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "pets": [ ... ]
  }
}
```

#### 获取用户信息

```
GET /api/v1/users/:id
```

#### 更新用户信息

```
PUT /api/v1/users/:id
Authorization: Bearer {token}

{
  "username": "新用户名",
  "bio": "个人简介",
  "mbti_type": "ENFP",
  "avatar_url": "https://..."
}
```

#### 获取用户统计

```
GET /api/v1/users/:id/stats
```

### 宠物接口 (Protected)

#### 获取宠物列表

```
GET /api/v1/pets?limit=10&offset=0&breed=金毛&is_real=true
```

#### 创建宠物

```
POST /api/v1/pets
Authorization: Bearer {token}

{
  "name": "库珀",
  "breed": "金毛寻回犬",
  "age": 2,
  "gender": "弟弟",
  "mbti_type": "E系宠物",
  "tags": ["活泼", "社交达人"],
  "image_url": "https://...",
  "is_real": true
}
```

#### 获取宠物详情

```
GET /api/v1/pets/:id
```

#### 更新宠物

```
PUT /api/v1/pets/:id
Authorization: Bearer {token}
```

#### 删除宠物

```
DELETE /api/v1/pets/:id
Authorization: Bearer {token}
```

### 匹配接口 (Protected)

#### 提交喜欢/无感

```
POST /api/v1/matches
Authorization: Bearer {token}

{
  "petId": "pet-uuid",
  "targetUserId": "target-user-uuid",
  "targetPetId": "target-pet-uuid",
  "direction": "like" // or "dislike"
}

Response:
{
  "success": true,
  "data": {
    "match": { ... },
    "isMutual": true // 双向匹配时为true
  }
}
```

#### 获取匹配历史

```
GET /api/v1/matches/history?limit=20&offset=0
Authorization: Bearer {token}
```

#### 获取成功匹配

```
GET /api/v1/matches/successful?limit=20&offset=0
Authorization: Bearer {token}
```

---

## 🗄️ 数据库架构

### 主要表结构

```
users (用户)
├── id, email, password_hash
├── username, avatar_url, bio
├── mbti_type, age
├── user_level, points, achievements
└── online_status, last_seen

pets (宠物)
├── id, user_id (FK)
├── name, breed, age, gender
├── mbti_type, tags[]
├── image_url, image_3d_url
├── is_real (真实/AI克隆)
└── energy_level, mood, happiness_score

matches (匹配)
├── id, user_id (FK), pet_id (FK)
├── target_user_id (FK), target_pet_id (FK)
├── direction (like/dislike)
├── is_mutual, compatibility_score
└── created_at

conversations (对话)
├── id, user1_id (FK), user2_id (FK)
├── pet1_id (FK), pet2_id (FK)
├── conversation_type
└── last_message, last_message_at

messages (消息)
├── id, conversation_id (FK)
├── sender_id, sender_type, recipient_id
├── message_text, translated_text
└── read_at, created_at

realms (虚拟领域)
├── id, name
├── description, story, function_description
├── image_url, icon_name
└── online_count

diary_entries (日志)
├── id, user_id (FK), pet_id (FK)
├── content, image_url
├── mood, tags, visibility
└── likes_count, comments_count

... 更多10张表（详见schema.sql）
```

---

## 🔐 认证流程

### JWT Token结构

```javascript
{
  "sub": "user_id",
  "id": "user_id",
  "email": "user@example.com",
  "username": "username",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### 使用Token

所有受保护的端点都需要在请求头中添加Authorization：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛠️ 项目结构

```
后端V3-COMPLETE/
├── src/
│   ├── server.ts              # Express服务器入口
│   ├── config/
│   │   └── supabase.ts        # Supabase配置
│   ├── middleware/
│   │   ├── auth.ts           # JWT认证
│   │   └── errorHandler.ts   # 错误处理
│   ├── routes/
│   │   ├── auth.routes.ts    # 认证
│   │   ├── user.routes.ts    # 用户
│   │   ├── pet.routes.ts     # 宠物
│   │   ├── match.routes.ts   # 匹配
│   │   ├── message.routes.ts # 消息
│   │   ├── realm.routes.ts   # 领域
│   │   ├── product.routes.ts # 商品
│   │   ├── diary.routes.ts   # 日志
│   │   ├── notification.routes.ts # 通知
│   │   └── ai.routes.ts      # AI
│   └── database/
│       └── schema.sql        # 数据库架构
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 📦 依赖项

### 核心依赖

- **express** ^4.21.2 - Web框架
- **typescript** ^5.8.2 - TypeScript支持
- **@supabase/supabase-js** ^2.45.0 - Supabase客户端
- **bcryptjs** ^2.4.3 - 密码加密
- **jsonwebtoken** ^9.1.2 - JWT处理
- **dotenv** ^17.2.3 - 环境变量
- **cors** ^2.8.5 - CORS支持
- **helmet** ^7.2.0 - 安全头
- **compression** ^1.7.4 - 压缩中间件
- **morgan** ^1.10.0 - HTTP日志

---

## 🔧 可用命令

```bash
# 开发模式（自动重启）
npm run dev

# 构建
npm run build

# 生产模式运行
npm start

# 数据库迁移
npm run migrate

# 数据库种子
npm run seed

# 测试
npm run test

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

---

## 🌐 前端集成指南

### 1. 配置API基础URL

```typescript
// src/config/api.ts
const API_BASE_URL = 'http://localhost:3001/api/v1';

export const api = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
  },
  users: {
    getProfile: `${API_BASE_URL}/users/profile/me`,
    updateProfile: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  pets: {
    list: `${API_BASE_URL}/pets`,
    create: `${API_BASE_URL}/pets`,
    get: (id: string) => `${API_BASE_URL}/pets/${id}`,
  },
  // ... 更多端点
};
```

### 2. 创建HTTP客户端

```typescript
// src/utils/http.ts
import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1'
});

// 添加认证令牌
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default httpClient;
```

### 3. 创建服务层

```typescript
// src/services/AuthService.ts
import httpClient from '../utils/http';

export const AuthService = {
  register: (email: string, password: string, username: string) => {
    return httpClient.post('/auth/register', {
      email, password, username
    });
  },
  
  login: (email: string, password: string) => {
    return httpClient.post('/auth/login', {
      email, password
    });
  }
};

export const PetService = {
  getPets: (filters?: any) => {
    return httpClient.get('/pets', { params: filters });
  },
  
  createPet: (data: any) => {
    return httpClient.post('/pets', data);
  },
  
  updatePet: (id: string, data: any) => {
    return httpClient.put(`/pets/${id}`, data);
  }
};
```

### 4. 在组件中使用

```typescript
// src/components/Home.tsx
import { useState, useEffect } from 'react';
import { PetService } from '../services/PetService';

export default function Home() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await PetService.getPets({
          limit: 10
        });
        setPets(response.data.data);
      } catch (error) {
        console.error('加载宠物失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, []);

  // 其余代码...
}
```

---

## 🚀 部署指南

### Vercel部署

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署
vercel --prod

# 4. 设置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
```

### Docker部署

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# 构建镜像
docker build -t pupy-backend .

# 运行容器
docker run -p 3001:3001 \
  -e SUPABASE_URL=... \
  -e SUPABASE_ANON_KEY=... \
  -e JWT_SECRET=... \
  pupy-backend
```

---

## 🐛 常见问题

### Q: 如何重置数据库?
A: 在Supabase控制面板中，选择项目 > SQL编辑器，运行 `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`，然后重新运行 `schema.sql`。

### Q: 如何处理跨域问题?
A: 后端已配置CORS。在`.env`中修改`FRONTEND_URL`以匹配你的前端地址。

### Q: 如何添加新的API端点?
A: 
1. 在 `src/routes/` 中创建新路由文件
2. 实现路由处理器
3. 在 `src/server.ts` 中注册路由

### Q: 生产环境如何优化性能?
A: 
- 启用数据库连接池
- 添加Redis缓存
- 使用CDN分发静态文件
- 配置负载均衡

---

## 📞 支持

如有问题，请：
1. 检查环境变量配置
2. 查看服务器日志 (`npm run dev`)
3. 验证Supabase连接
4. 检查数据库权限 (RLS策略)

---

## ✅ 交付清单

- ✅ 完整Express框架
- ✅ 16张关系数据库表
- ✅ 20+个生产级API端点
- ✅ JWT认证系统
- ✅ 错误处理中间件
- ✅ CORS和安全头
- ✅ TypeScript类型安全
- ✅ 完整文档
- ✅ 前后端集成指南
- ✅ 部署脚本

---

**🎉 PUPY爪住后端已准备好投入生产！**

**版本**: v1.0.0  
**最后更新**: 2026年3月30日  
**状态**: ✅ 生产就绪
