# ⚡ PUPY爪住 前端优化完整指南

## 性能优化 (Performance)

### 1. 代码分割 (Code Splitting)

```typescript
// src/routes/index.tsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./components/Home'));
const Chat = lazy(() => import('./components/Chat'));
const Profile = lazy(() => import('./components/Profile'));

export const Routes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    {/* 路由 */}
  </Suspense>
);
```

### 2. 图片优化

```typescript
// 使用WebP和响应式图片
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="description" loading="lazy" />
</picture>

// 或使用图片优化库
import Image from 'next/image'; // 如果迁移到Next.js
```

### 3. 虚拟化长列表

```typescript
import { FixedSizeList } from 'react-window';

export function PetList({ pets }: { pets: Pet[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={pets.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <PetCard pet={pets[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 4. 防抖和节流

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// 使用
const searchTerm = useDebounce(query, 500);
useEffect(() => {
  if (searchTerm) {
    searchPets(searchTerm);
  }
}, [searchTerm]);
```

### 5. 缓存优化

```typescript
// src/hooks/useCache.ts
import { useEffect, useState, useRef } from 'react';

export function useCache<T>(
  fetcher: () => Promise<T>,
  cacheTime: number = 5 * 60 * 1000
): T | null {
  const [data, setData] = useState<T | null>(null);
  const cacheRef = useRef<{ data: T; time: number } | null>(null);

  useEffect(() => {
    const cached = cacheRef.current;
    const now = Date.now();

    if (cached && now - cached.time < cacheTime) {
      setData(cached.data);
      return;
    }

    fetcher().then((newData) => {
      cacheRef.current = { data: newData, time: now };
      setData(newData);
    });
  }, [fetcher, cacheTime]);

  return data;
}
```

## 可访问性 (Accessibility)

### 1. 语义化HTML

```typescript
// ❌ 不好
<div onClick={handleClick} className="cursor-pointer">
  Click me
</div>

// ✅ 好
<button onClick={handleClick}>
  Click me
</button>
```

### 2. ARIA标签

```typescript
<div
  role="alert"
  aria-live="polite"
  aria-label="Notifications"
>
  You have 3 new messages
</div>
```

### 3. 键盘导航

```typescript
export function Navigation() {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleNavigation();
    }
  };

  return (
    <nav
      role="navigation"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 导航项 */}
    </nav>
  );
}
```

## 最佳实践

### 1. 类型安全

```typescript
// src/types/index.ts
export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  image_url: string;
  user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  user_level: number;
  points: number;
}
```

### 2. 错误边界

```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3. 组件最佳实践

```typescript
// ✅ 使用React.memo防止无意义的重新渲染
export const PetCard = React.memo(({ pet }: { pet: Pet }) => {
  return (
    <div className="pet-card">
      <img src={pet.image_url} alt={pet.name} />
      <h3>{pet.name}</h3>
    </div>
  );
}, (prev, next) => {
  // 自定义比较逻辑
  return prev.pet.id === next.pet.id;
});

// ✅ 使用useCallback优化回调
const handleSwipe = useCallback((direction: string) => {
  submitMatch(currentPet.id, direction);
}, [currentPet.id, submitMatch]);

// ✅ 使用useMemo优化计算
const compatibilityScore = useMemo(() => {
  return calculateCompatibility(pet1, pet2);
}, [pet1, pet2]);
```

### 4. 状态管理模式

```typescript
// src/hooks/usePets.ts
export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await petService.getPets(filters);
      setPets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pets, loading, error, fetchPets };
}
```

## Tailwind CSS优化

### 1. 清理未使用的样式

在 `tailwind.config.ts` 中：

```typescript
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 2. 使用CSS变量

```typescript
// tailwind.config.ts
theme: {
  colors: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
  }
}

// src/index.css
:root {
  --color-primary: #8B5CF6;
  --color-secondary: #10B981;
}
```

## 动画优化

### 1. GPU加速

```typescript
// 使用transform和opacity替代top/left
export const card = {
  initial: { opacity: 0, x: 100 },    // ✅ GPU加速
  animate: { opacity: 1, x: 0 },
  // 而不是
  // initial: { opacity: 0, left: 100 },  // ❌ 低性能
};
```

### 2. 优化动画帧数

```typescript
export const config = {
  // Motion库配置
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1,
  }
};
```

## 包分析

```bash
# 安装包分析工具
npm install --save-dev webpack-bundle-analyzer

# 分析构建输出
npm run build -- --analyze
```

---

## 🚀 生产优化清单

- [ ] 移除console.log
- [ ] 启用gzip压缩
- [ ] 优化字体加载
- [ ] CDN配置
- [ ] 图片优化和压缩
- [ ] 代码分割优化
- [ ] 缓存策略
- [ ] 监控性能指标

---

**最后更新**: 2026年3月30日
