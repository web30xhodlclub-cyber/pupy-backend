# 🐾 PUPY 爪住 - 管理后台完整数据模块清单

## 📊 数据库完整架构分析

### **数据库总览**
- **总表数**: 15 个核心表
- **总字段数**: 180+ 个字段
- **关系数**: 20+ 个外键关系
- **索引数**: 40+ 个性能索引

---

## ✅ 已实现的管理模块 (7个)

### 1. **👥 用户管理** 
- **表名**: `users`
- **已支持操作**: CREATE, READ, UPDATE, DELETE, SEARCH ✅
- **可管理字段**: 
  - email (邮箱)
  - username (用户名)
  - avatar_url (头像)
  - bio (简介/昵称)
  - mbti_type (人格类型)
  - user_level (用户等级)
  - points (积分)
  - achievements (成就数组)
  - online_status (在线状态)
  - last_seen (最后在线时间)
  - is_deleted (删除标记)

---

### 2. **🐾 宠物管理**
- **表名**: `pets`
- **已支持操作**: CREATE, READ, UPDATE, DELETE, SEARCH ✅
- **可管理字段**:
  - user_id (所属用户)
  - name (宠物名)
  - breed (品种)
  - age (年龄)
  - gender (性别)
  - mbti_type (宠物人格)
  - tags (标签数组)
  - image_url (头像URL)
  - image_3d_url (3D模型URL)
  - is_real (是否真实)
  - clone_status (克隆状态)
  - energy_level (能量等级)
  - mood (心情)
  - is_deleted (删除标记)

---

### 3. **💕 配对管理**
- **表名**: `matches`
- **已支持操作**: READ, DELETE ✅
- **可管理字段**:
  - user_id (用户ID)
  - pet_id (宠物ID)
  - target_user_id (目标用户ID)
  - target_pet_id (目标宠物ID)
  - direction (配对方向)
  - is_mutual (是否相互配对)
  - compatibility_score (兼容度评分)
  - mutual_at (相互配对时间)

---

### 4. **💬 对话管理**
- **表名**: `conversations`
- **已支持操作**: READ, DELETE ✅
- **可管理字段**:
  - user1_id (用户1)
  - user2_id (用户2)
  - pet1_id (宠物1)
  - pet2_id (宠物2)
  - conversation_type (对话类型)
  - last_message (最后消息)
  - last_message_at (最后消息时间)
  - is_active (是否活跃)

---

### 5. **💌 消息管理**
- **表名**: `messages`
- **已支持操作**: READ, DELETE, SEARCH ✅
- **可管理字段**:
  - conversation_id (对话ID)
  - sender_id (发送者)
  - sender_type (发送者类型)
  - recipient_id (接收者)
  - message_text (消息内容)
  - translated_text (翻译文本)
  - message_type (消息类型)
  - attachment_url (附件URL)
  - is_read (是否已读)
  - read_at (读取时间)

---

### 6. **🛍️ 商品管理**
- **表名**: `products`
- **已支持操作**: CREATE, READ, UPDATE, DELETE, SEARCH ✅
- **可管理字段**:
  - seller_id (卖家ID)
  - title (商品名)
  - description (描述)
  - category (分类)
  - price (价格)
  - image_url (图片URL)
  - inventory (库存)
  - is_available (是否可用)
  - product_type (商品类型)
  - ratings (评分)
  - reviews_count (评论数)

---

### 7. **🔔 通知管理**
- **表名**: `notifications`
- **已支持操作**: READ, DELETE, SEARCH ✅
- **可管理字段**:
  - user_id (用户ID)
  - title (标题)
  - message (消息内容)
  - notification_type (通知类型)
  - related_id (相关ID)
  - is_read (是否已读)
  - read_at (读取时间)

---

## ❌ 待实现的管理模块 (8个)

### **第一优先级 - 🔴 核心功能**

### 8. **🌍 虚拟领域管理** 
- **表名**: `realms`
- **待支持操作**: CREATE, READ, UPDATE, DELETE ❌
- **需管理字段**:
  - name (领域名)
  - description (描述)
  - story (故事背景)
  - function_description (功能描述)
  - image_url (背景图URL)
  - icon_name (图标名)
  - realm_type (领域类型: fantasy/space/castle)
  - online_count (在线人数)
  - is_active (是否活跃)
- **关联**: 
  - pet_social_records (宠物社交记录)
- **示例领域**:
  - 幻想森林 (fantasy)
  - 星际空间 (space)
  - 梦幻城堡 (castle)

---

### 9. **📝 宠物社交记录管理**
- **表名**: `pet_social_records`
- **待支持操作**: READ, DELETE ❌
- **需管理字段**:
  - pet_id (宠物ID)
  - user_id (用户ID)
  - realm_id (领域ID)
  - action_type (行为类型)
  - action_data (行为数据 - JSON)
- **用途**: 记录宠物在虚拟领域中的所有活动
- **示例行为类型**: 
  - 社交互动
  - 探险
  - 表演
  - 交易

---

### **第二优先级 - 🟡 交易系统**

### 10. **📦 订单管理**
- **表名**: `orders`
- **待支持操作**: CREATE, READ, UPDATE, DELETE ❌
- **需管理字段**:
  - buyer_id (买家ID)
  - product_id (商品ID)
  - quantity (数量)
  - order_status (订单状态: pending/paid/shipped/delivered/cancelled)
  - total_price (总价)
  - payment_method (支付方式)
  - delivery_address (配送地址)
- **关联**:
  - products (商品)
  - users (用户)
- **需要统计**:
  - 订单总数
  - 待处理订单
  - 已完成订单
  - 营收总额

---

### 11. **🐕‍🦺 收养管理**
- **表名**: `adoptions`
- **待支持操作**: CREATE, READ, UPDATE, DELETE ❌
- **需管理字段**:
  - pet_id (宠物ID)
  - previous_owner_id (前主人)
  - new_owner_id (新主人)
  - adoption_status (收养状态: pending/approved/completed/rejected)
  - reason (原因)
  - completed_at (完成时间)
- **关联**:
  - pets (宠物)
  - users (用户)
- **工作流**:
  1. 审批收养请求
  2. 验证双方身份
  3. 转移宠物所有权
  4. 记录收养历史

---

### **第三优先级 - 🟢 内容管理**

### 12. **📔 日记管理**
- **表名**: `diary_entries`
- **待支持操作**: READ, UPDATE (is_public), DELETE ❌
- **需管理字段**:
  - user_id (用户ID)
  - pet_id (宠物ID)
  - title (标题)
  - content (内容)
  - mood (心情)
  - image_url (配图URL)
  - is_public (是否公开)
  - views_count (浏览数)
- **可审核内容**:
  - 不当言论过滤
  - 隐私违规检查
  - 垃圾内容标记
- **统计数据**:
  - 总日记数
  - 公开日记数
  - 平均浏览数

---

### 13. **🙏 AI祈愿管理**
- **表名**: `ai_prayers`
- **待支持操作**: READ, UPDATE (is_fulfilled), DELETE ❌
- **需管理字段**:
  - user_id (用户ID)
  - pet_id (宠物ID)
  - prayer_text (祈愿文本)
  - generated_response (AI生成回应)
  - prayer_type (祈愿类型)
  - is_fulfilled (是否实现)
  - fulfilled_at (实现时间)
- **祈愿类型示例**:
  - 希望宠物健康
  - 希望与宠物相聚
  - 希望宠物幸福
  - 其他祝愿
- **可操作**:
  - 审阅祈愿内容
  - 标记祈愿已实现
  - 生成AI回应
  - 删除不当祈愿

---

### **第四优先级 - 💬 社交管理**

### 14. **💬 评论管理**
- **表名**: `comments`
- **待支持操作**: READ, DELETE ❌
- **需管理字段**:
  - user_id (评论者ID)
  - target_id (目标ID: 日记/宠物/商品)
  - target_type (目标类型: diary/pet/product)
  - content (评论内容)
  - likes_count (点赞数)
- **审核功能**:
  - 过滤不当评论
  - 隐藏垃圾评论
  - 删除恶意评论
- **统计**:
  - 总评论数
  - 每天新评论数
  - 最受欢迎评论

---

### 15. **👍 点赞管理**
- **表名**: `likes`
- **待支持操作**: READ, DELETE ❌
- **需管理字段**:
  - user_id (点赞用户)
  - target_id (目标ID)
  - target_type (目标类型: comment/diary/pet/product)
- **可操作**:
  - 查看点赞统计
  - 检测异常点赞行为
  - 删除无效点赞
- **统计**:
  - 总点赞数
  - 最多点赞的内容
  - 用户平均点赞数

---

## 📊 管理后台功能矩阵

### **CRUD 操作支持情况**

| 模块 | Create | Read | Update | Delete | Search | 状态 |
|------|:------:|:----:|:------:|:------:|:------:|:----:|
| 👥 用户 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 完成 |
| 🐾 宠物 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 完成 |
| 💕 配对 | ❌ | ✅ | ❌ | ✅ | ❌ | ⏳ 部分 |
| 💬 对话 | ❌ | ✅ | ❌ | ✅ | ❌ | ⏳ 部分 |
| 💌 消息 | ❌ | ✅ | ❌ | ✅ | ✅ | ⏳ 部分 |
| 🛍️ 商品 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 完成 |
| 🔔 通知 | ❌ | ✅ | ❌ | ✅ | ✅ | ⏳ 部分 |
| 🌍 领域 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ 缺失 |
| 📝 社交记录 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ 缺失 |
| 📦 订单 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ 缺失 |
| 🐕‍🦺 收养 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ 缺失 |
| 📔 日记 | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ 缺失 |
| 🙏 祈愿 | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ 缺失 |
| 💬 评论 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ 缺失 |
| 👍 点赞 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ 缺失 |

---

## 🎯 前端功能映射关系

| 前端组件 | 涉及的数据模块 | 需要管理的内容 |
|---------|-------------|-------------|
| **Home** | users, pets, realms | 用户数据、宠物数据、领域内容 |
| **AIPrayer** | ai_prayers, users, pets | AI祈愿记录、用户祈愿历史 |
| **Breeding** | pets, matches | 宠物配对、配种记录 |
| **Chat** | conversations, messages, users | 对话内容、消息记录、用户关系 |
| **Creation** | pets, users | 新建宠物、AI克隆 |
| **Diary** | diary_entries, users, pets | 日记内容、作者查证、公开控制 |
| **Market** | products, orders, users | 商品列表、订单、商家资料 |
| **Messages** | messages, conversations | 消息审核、对话管理 |
| **Profile** | users, pets, diary_entries | 用户资料、宠物档案、日记列表 |
| **ProductDetail** | products, comments, likes, orders | 商品详情、评论评分、购买记录 |
| **Settings** | users, notifications | 用户偏好、通知设置 |
| **Tour** | pets, realms | 宠物引导、领域介绍 |
| **WalkingService** | pet_social_records, pets, realms | 散步记录、宠物活动、地点数据 |

---

## 🔐 管理权限分类

### **超级管理员权限** (全部15个模块)
- 查看所有数据
- 编辑所有数据
- 删除所有数据
- 审核内容
- 导出报表

### **内容审核员权限** (8个模块)
- ✅ 日记 (diary_entries)
- ✅ 评论 (comments)
- ✅ AI祈愿 (ai_prayers)
- ✅ 社交记录 (pet_social_records)
- ✅ 消息 (messages)
- ✅ 通知 (notifications)
- ⚠️ 可删除违规内容

### **商业运营员权限** (5个模块)
- ✅ 订单 (orders)
- ✅ 商品 (products)
- ✅ 收养 (adoptions)
- ✅ 评论 (comments)
- ✅ 用户 (users) - 仅查看

### **用户支持员权限** (4个模块)
- ✅ 用户 (users)
- ✅ 订单 (orders)
- ✅ 消息 (messages)
- ✅ 通知 (notifications)

---

## 📈 数据统计报表需求

### **仪表板统计**
- [ ] 总用户数 (活跃/总计)
- [ ] 总宠物数 (真实/AI)
- [ ] 总订单数 (待处理/已完成)
- [ ] 总收益 (商品销售)
- [ ] 总消息数 (已读/未读)
- [ ] 总日记数 (公开/私密)
- [ ] 总评论数
- [ ] 总点赞数

### **用户分析**
- [ ] 新用户数 (日/周/月)
- [ ] 活跃用户数
- [ ] 用户等级分布
- [ ] 用户在线状态分析
- [ ] 用户成就分布

### **宠物分析**
- [ ] 宠物总数统计
- [ ] 宠物品种分布
- [ ] 宠物性别比例
- [ ] AI克隆数量
- [ ] 宠物能量平均值
- [ ] 宠物配对成功率

### **交易分析**
- [ ] 销售额统计
- [ ] 订单状态分布
- [ ] 热卖商品排行
- [ ] 卖家排行
- [ ] 支付方式分析

### **社交分析**
- [ ] 对话活跃度
- [ ] 消息频率
- [ ] 配对热度
- [ ] 互动用户比例

---

## 🔧 API 端点规划

### **已实现** ✅
```
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id

GET    /api/admin/pets
POST   /api/admin/pets
PUT    /api/admin/pets/:id
DELETE /api/admin/pets/:id

GET    /api/admin/matches
DELETE /api/admin/matches/:id

GET    /api/admin/conversations
DELETE /api/admin/conversations/:id

GET    /api/admin/messages
DELETE /api/admin/messages/:id

GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id

GET    /api/admin/notifications
DELETE /api/admin/notifications/:id
```

### **待实现** ❌
```
# 虚拟领域
GET    /api/admin/realms
POST   /api/admin/realms
PUT    /api/admin/realms/:id
DELETE /api/admin/realms/:id

# 社交记录
GET    /api/admin/pet-social-records
DELETE /api/admin/pet-social-records/:id

# 订单
GET    /api/admin/orders
POST   /api/admin/orders
PUT    /api/admin/orders/:id
DELETE /api/admin/orders/:id

# 收养
GET    /api/admin/adoptions
POST   /api/admin/adoptions
PUT    /api/admin/adoptions/:id
DELETE /api/admin/adoptions/:id

# 日记
GET    /api/admin/diary-entries
PUT    /api/admin/diary-entries/:id
DELETE /api/admin/diary-entries/:id

# AI祈愿
GET    /api/admin/ai-prayers
PUT    /api/admin/ai-prayers/:id
DELETE /api/admin/ai-prayers/:id

# 评论
GET    /api/admin/comments
DELETE /api/admin/comments/:id

# 点赞
GET    /api/admin/likes
DELETE /api/admin/likes/:id

# 统计报表
GET    /api/admin/stats/dashboard
GET    /api/admin/stats/users
GET    /api/admin/stats/pets
GET    /api/admin/stats/transactions
```

---

## 📋 实现优先级建议

### **优先级 1 - 必须实现** (下周完成)
1. **🌍 虚拟领域管理** - 平台核心特性
2. **📦 订单管理** - 商业功能
3. **📝 日记管理** - 内容管理

### **优先级 2 - 应该实现** (2周内完成)
4. **🐕‍🦺 收养管理** - 用户互动功能
5. **🙏 AI祈愿管理** - 独特功能
6. **💬 评论管理** - 社交功能

### **优先级 3 - 可以实现** (第三周完成)
7. **👍 点赞管理** - UGC统计
8. **📝 社交记录** - 分析数据

---

## 💾 数据安全和合规

### **需要的功能**
- [ ] 数据导出 (CSV/JSON)
- [ ] 数据备份支持
- [ ] 操作日志记录
- [ ] 敏感操作审计
- [ ] 用户数据删除 (遗忘权)
- [ ] 用户数据导出 (可携权)

---

## 📊 总结

| 指标 | 数值 |
|------|------|
| **总数据表** | 15 |
| **已实现模块** | 7 (47%) |
| **待实现模块** | 8 (53%) |
| **总字段数** | 180+ |
| **总关系数** | 20+ |
| **API端点** | 30+ |

---

**文档更新时间**: 2026年4月1日  
**完成度**: 47% ✅  
**下一阶段目标**: 完成 8 个待实现模块 🎯
