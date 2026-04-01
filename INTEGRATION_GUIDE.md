# 🔗 PUPY爪住 前后端完整集成指南

**实现无缝交互的生产级前后端集成方案**

---

## 📘 快速导航

- [环境配置](#环境配置)
- [同时运行前后端](#同时运行前后端)
- [API集成步骤](#api集成步骤)
- [实时功能集成](#实时功能集成)
- [测试与验证](#测试与验证)
- [常见问题排查](#常见问题排查)

---

## 🔧 环境配置

### 后端配置 (.env)

```env
# 后端服务配置
PORT=3001
NODE_ENV=development
API_URL=http://localhost:3001

# 前端URL（CORS）
FRONTEND_URL=http://localhost:3000

# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT配置
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
JWT_EXPIRY=7d

# 日志
LOG_LEVEL=debug
```

### 前端配置

在 `src/config/api.ts` 中：

```typescript
// 开发环境
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// 生产环境（使用相对URL或产品域名）
// const API_BASE_URL = '/api/v1';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

---

## 🚀 同时运行前后端

### 方案A: 两个终端

**终端1 - 后端：**
```bash
cd 后端V3-COMPLETE
npm install
npm run dev
# 输出: Server listening on http://localhost:3001
```

**终端2 - 前端：**
```bash
cd 前端V3
npm install
npm run dev
# 输出: Port 3000 is in use by http://localhost:3001 (accept y/n)
# 答y，前端会使用3000或其他端口
```

### 方案B: 使用Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    image: node:20-alpine
    working_dir: /app/backend
    volumes:
      - ./后端V3-COMPLETE:/app/backend
    ports:
      - "3001:3001"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=http://localhost:3000
    command: npm install && npm run dev
    networks:
      - pupy-network

  frontend:
    image: node:20-alpine
    working_dir: /app/frontend
    volumes:
      - ./前端V3:/app/frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001/api/v1
    command: npm install && npm run dev
    depends_on:
      - backend
    networks:
      - pupy-network

networks:
  pupy-network:
    driver: bridge
```

启动：
```bash
docker-compose up
```

---

## 🔌 API集成步骤

### 1. 创建HTTP客户端

**src/utils/http.ts**
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截：添加token
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截：处理错误
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token过期，清除并重定向到登录
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
```

### 2. 创建服务层

**src/services/index.ts**
```typescript
import httpClient from '../utils/http';

// ============================================================================
// 认证服务
// ============================================================================

export const authService = {
  register: async (email: string, password: string, username: string) => {
    const response = await httpClient.post('/auth/register', {
      email,
      password,
      username
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await httpClient.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

// ============================================================================
// 用户服务
// ============================================================================

export const userService = {
  getProfile: async () => {
    const response = await httpClient.get('/users/profile/me');
    return response.data.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await httpClient.put(`/users/${userId}`, data);
    return response.data.data;
  },

  getStats: async (userId: string) => {
    const response = await httpClient.get(`/users/${userId}/stats`);
    return response.data.data;
  }
};

// ============================================================================
// 宠物服务
// ============================================================================

export const petService = {
  getPets: async (filters?: any) => {
    const response = await httpClient.get('/pets', { params: filters });
    return response.data.data;
  },

  createPet: async (data: any) => {
    const response = await httpClient.post('/pets', data);
    return response.data.data;
  },

  getPet: async (petId: string) => {
    const response = await httpClient.get(`/pets/${petId}`);
    return response.data.data;
  },

  updatePet: async (petId: string, data: any) => {
    const response = await httpClient.put(`/pets/${petId}`, data);
    return response.data.data;
  },

  deletePet: async (petId: string) => {
    await httpClient.delete(`/pets/${petId}`);
  }
};

// ============================================================================
// 匹配服务
// ============================================================================

export const matchService = {
  submitMatch: async (petId: string, targetUserId: string, targetPetId: string, direction: 'like' | 'dislike') => {
    const response = await httpClient.post('/matches', {
      petId,
      targetUserId,
      targetPetId,
      direction
    });
    return response.data.data;
  },

  getHistory: async (limit?: number, offset?: number) => {
    const response = await httpClient.get('/matches/history', {
      params: { limit, offset }
    });
    return response.data.data;
  },

  getSuccessful: async (limit?: number, offset?: number) => {
    const response = await httpClient.get('/matches/successful', {
      params: { limit, offset }
    });
    return response.data.data;
  }
};

// ============================================================================
// 消息服务
// ============================================================================

export const messageService = {
  getConversations: async () => {
    const response = await httpClient.get('/messages/conversations');
    return response.data.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await httpClient.get(`/messages/conversations/${conversationId}`);
    return response.data.data;
  },

  sendMessage: async (conversationId: string, message: string) => {
    const response = await httpClient.post('/messages', {
      conversationId,
      message
    });
    return response.data.data;
  }
};
```

### 3. 在组件中使用服务

**src/components/Home.tsx**
```typescript
import { useState, useEffect } from 'react';
import { petService } from '../services';
import { Pet } from '../types';

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await petService.getPets({ limit: 10 });
      setPets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载宠物失败');
      console.error('加载宠物失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      {pets.map(pet => (
        <div key={pet.id} className="pet-card">
          {/* 宠物卡片内容 */}
        </div>
      ))}
    </div>
  );
}
```

### 4. 集成认证流程

**src/context/AuthContext.tsx**
```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services';

interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：检查本地存储的token
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const response = await authService.register(email, password, username);
      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 5. 更新App.tsx使用认证

**src/App.tsx**
```typescript
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home, Chat, ... } from './components';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="text-4xl">🐾 PUPY爪住</span>
          <p className="text-slate-400 mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Onboarding />;
  }

  return (
    <div className="relative min-h-screen">
      {/* 应用内容 */}
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && <Home />}
        {currentScreen === 'chat' && <Chat />}
        {/* 更多屏幕 */}
      </AnimatePresence>

      {/* 导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0">
        {/* 导航项 */}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

---

## 🔄 实时功能集成

### 使用Supabase Realtime

**src/hooks/useRealtimeMessages.ts**
```typescript
import { useEffect, useState } from 'react';
import { getSupabase } from '../config/supabase';

export function useRealtimeMessages(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const supabase = getSupabase();

    // 订阅消息变化
    const subscription = supabase
      .from(`messages:conversation_id=eq.${conversationId}`)
      .on('*', (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  return messages;
}
```

使用：
```typescript
const messages = useRealtimeMessages(conversationId);
```

---

## ✅ 测试与验证

### 集成测试清单

- [ ] **认证流程**
  - [ ] 注册成功
  - [ ] 登录成功
  - [ ] Token保存到localStorage
  - [ ] 登出清除token

- [ ] **宠物功能**
  - [ ] 获取宠物列表
  - [ ] 创建新宠物
  - [ ] 更新宠物信息
  - [ ] 删除宠物

- [ ] **匹配功能**
  - [ ] 提交喜欢
  - [ ] 检测互相喜欢
  - [ ] 创建对话

- [ ] **消息功能**
  - [ ] 获取对话列表
  - [ ] 发送消息
  - [ ] 实时接收消息

### 使用Postman测试

1. **导入API集合**：
   - 创建 `PUPY.postman_collection.json`
   - 导入到Postman

2. **测试认证端点**：
   ```
   POST http://localhost:3001/api/v1/auth/login
   Body:
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **使用返回的token**：
   ```
   Authorization: Bearer {token}
   ```

---

## 🐛 常见问题排查

### Q1: CORS错误

**错误**：
```
Access to XMLHttpRequest at 'http://localhost:3001/api/v1/...' 
has been blocked by CORS policy
```

**解决**：
1. 检查后端 `.env` 中的 `FRONTEND_URL`
2. 确保后端CORS配置正确
3. 前端请求添加正确的headers

```typescript
// 如果需要，手动设置CORS headers
httpClient.defaults.headers.common['Content-Type'] = 'application/json';
```

### Q2: 401 Unauthorized

**错误**：API返回401

**解决**：
1. 检查token是否保存
2. 检查token是否过期
3. 检查Authorization header格式

```typescript
// 调试：打印token
console.log('Token:', localStorage.getItem('auth_token'));
```

### Q3: 网络超时

**错误**：请求超时

**解决**：
1. 检查后端是否运行
2. 增加timeout时间
3. 检查网络连接

```typescript
// 增加超时时间
httpClient.defaults.timeout = 30000; // 30秒
```

### Q4: 数据库连接错误

**错误**：
```
Error: 'SUPABASE_URL' or 'SUPABASE_ANON_KEY' not configured
```

**解决**：
1. 检查 `.env` 文件是否正确
2. 重启后端服务
3. 验证Supabase证书

---

## 📊 完整集成检查表

```
前端准备：
□ Create HTTP client with interceptors
□ Create service layer
□ Setup Auth context
□ Create environment config
□ Configure API base URL

后端准备：
□ .env配置完整
□ 数据库已初始化
□ 开发服务器运行
□ CORS已配置

集成验证：
□ 注册流程可用
□ 登录流程可用
□ Token正确保存和使用
□ API请求返回正确响应
□ 错误处理工作正常
□ 实时功能工作正常

性能检查：
□ API响应时间 < 200ms
□ 前端加载时间 < 3s
□ 内存使用正常
□ 网络请求优化
```

---

## 🎯 下一步优化

1. **添加错误边界**
   - 实现React Error Boundary
   - 添加全局错误处理

2. **性能优化**
   - 实现API缓存
   - 添加请求防抖
   - 优化大列表渲染

3. **监测与分析**
   - 集成Sentry或类似工具
   - 添加用户分析
   - 性能监测

4. **安全加固**
   - 添加CSRF保护
   - 实现刷新token机制
   - API请求签名

---

**✅ 前后端无缝集成完毕！**

**最后更新**: 2026年3月30日
