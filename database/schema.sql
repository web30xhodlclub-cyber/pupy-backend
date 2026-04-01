-- ============================================================================
-- PUPY爪住 完整数据库架构 v1.0
-- 宠物社交平台 & AI克隆 & 虚拟领域系统
-- 使用Supabase (PostgreSQL)
-- ============================================================================

-- 1. 用户表 (Users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  mbti_type VARCHAR(10),
  age INT,
  
  -- 等级系统
  user_level INT DEFAULT 1,
  points INT DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  
  -- 统计数据
  total_social_count INT DEFAULT 0,
  successful_matches INT DEFAULT 0,
  social_success_rate FLOAT DEFAULT 0.0,
  social_need_index INT DEFAULT 0, -- 1-5
  
  -- 在线状态
  online_status VARCHAR(20) DEFAULT 'offline', -- offline, online
  last_seen TIMESTAMP DEFAULT NOW(),
  
  -- 地理位置
  latitude FLOAT,
  longitude FLOAT,
  location_name VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 2. 宠物表 (Pets)
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  age INT,
  gender VARCHAR(20), -- 妹妹, 弟弟
  
  mbti_type VARCHAR(10), -- E系宠物, I系宠物等
  tags TEXT[] DEFAULT '{}', -- 活泼, 治愈系等
  
  image_url TEXT,
  image_3d_url TEXT, -- 3D克隆图像
  
  -- 宠物属性
  is_real BOOLEAN DEFAULT true, -- true=真实宠物, false=AI克隆
  clone_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- 宠物状态监测
  energy_level INT DEFAULT 100, -- 0-100
  mood VARCHAR(50) DEFAULT '开心', -- 开心, 疲劳, 兴奋等
  happiness_score INT DEFAULT 50,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 3. 匹配记录表 (Matches)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 主动方
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  
  -- 目标方
  target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  
  -- 方向
  direction VARCHAR(20) NOT NULL, -- like, dislike
  
  -- 双向匹配标志
  is_mutual BOOLEAN DEFAULT false,
  mutual_at TIMESTAMP,
  
  -- 相容性分数
  compatibility_score INT DEFAULT 0, -- 0-100
  mbti_compatibility FLOAT,
  distance_km FLOAT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 4. 对话表 (Conversations)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 参与方（支持多种类型）
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  pet1_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  pet2_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  
  conversation_type VARCHAR(30) DEFAULT 'user-to-user', -- user-to-user, pet-to-pet, user-to-pet
  
  last_message TEXT,
  last_message_at TIMESTAMP,
  user1_unread INT DEFAULT 0,
  user2_unread INT DEFAULT 0,
  
  realm_id UUID REFERENCES public.realms(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 5. 消息表 (Messages)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  sender_id UUID, -- 可能是user或pet
  sender_type VARCHAR(20) NOT NULL, -- user, pet
  recipient_id UUID,
  recipient_type VARCHAR(20),
  
  message_text TEXT NOT NULL,
  message_type VARCHAR(30) DEFAULT 'text', -- text, image, audio, media
  media_url TEXT, -- 如果是media
  
  -- AI翻译（用于宠物消息）
  translated_text TEXT,
  translation_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  
  read_at TIMESTAMP,
  edited_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 6. 虚拟领域表 (Realms)
CREATE TABLE public.realms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  story TEXT,
  function_description TEXT,
  
  image_url TEXT,
  icon_name VARCHAR(100),
  
  online_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. 宠物社交记录表 (Pet_Social_Records)
CREATE TABLE public.pet_social_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  pet1_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  pet2_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  realm_id UUID REFERENCES public.realms(id),
  
  interaction_type VARCHAR(50) DEFAULT 'chat', -- chat, play, share
  
  original_text TEXT,
  translated_text TEXT, -- AI翻译的宠物话语
  
  location VARCHAR(255),
  location_name VARCHAR(255),
  
  sentiment VARCHAR(20), -- positive, neutral, negative
  
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 8. 通知表 (Notifications)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  notification_type VARCHAR(50) NOT NULL, -- match, message, follow, achievement
  title VARCHAR(255),
  content TEXT,
  
  related_user_id UUID REFERENCES public.users(id),
  related_pet_id UUID REFERENCES public.pets(id),
  action_url VARCHAR(255),
  
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 9. 商品/服务表 (Products)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  category VARCHAR(50) NOT NULL, -- supermarket, walking, love, care
  product_type VARCHAR(50), -- adoption, merchandise, service
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  
  image_url TEXT,
  images TEXT[],
  
  seller_id UUID REFERENCES public.users(id),
  tags TEXT[] DEFAULT '{}',
  
  rating FLOAT DEFAULT 0,
  review_count INT DEFAULT 0,
  
  stock INT DEFAULT -1, -- -1表示无限
  is_published BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 10. 收养表 (Adoptions)
CREATE TABLE public.adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  pet_id UUID NOT NULL REFERENCES public.pets(id),
  product_id UUID REFERENCES public.products(id),
  
  applicant_id UUID NOT NULL REFERENCES public.users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, completed
  
  application_text TEXT,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES public.users(id),
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. 日志表 (Diary_Entries)
CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  image_url TEXT,
  
  location VARCHAR(255),
  location_name VARCHAR(255),
  
  mood VARCHAR(50) DEFAULT '开心',
  tags TEXT[] DEFAULT '{}',
  
  visibility VARCHAR(20) DEFAULT 'private', -- private, friends, public
  
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 12. 订单表 (Orders)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES public.users(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  
  quantity INT DEFAULT 1,
  total_amount DECIMAL(10, 2),
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  payment_method VARCHAR(50),
  
  shipping_address TEXT,
  shipping_status VARCHAR(50) DEFAULT 'pending',
  tracking_number VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. AI祈愿表 (AI_Prayers)
CREATE TABLE public.ai_prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  core_traits TEXT[] DEFAULT '{}',
  
  generated_pet_id UUID REFERENCES public.pets(id),
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed
  generation_result JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 14. 评论表 (Comments)
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  diary_entry_id UUID NOT NULL REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 15. 点赞表 (Likes)
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  diary_entry_id UUID REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  UNIQUE(diary_entry_id, user_id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 16. 对象关注表 (Follows)
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  UNIQUE(follower_id, followee_id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 索引优化
-- ============================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_created_at ON public.users(created_at);

CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_pets_is_real ON public.pets(is_real);
CREATE INDEX idx_pets_created_at ON public.pets(created_at);

CREATE INDEX idx_matches_user_id ON public.matches(user_id);
CREATE INDEX idx_matches_target_user_id ON public.matches(target_user_id);
CREATE INDEX idx_matches_is_mutual ON public.matches(is_mutual);
CREATE INDEX idx_matches_created_at ON public.matches(created_at);

CREATE INDEX idx_conversations_user1_id ON public.conversations(user1_id);
CREATE INDEX idx_conversations_user2_id ON public.conversations(user2_id);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);

CREATE INDEX idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX idx_diary_entries_pet_id ON public.diary_entries(pet_id);
CREATE INDEX idx_diary_entries_created_at ON public.diary_entries(created_at);

CREATE INDEX idx_pet_social_records_pet1_id ON public.pet_social_records(pet1_id);
CREATE INDEX idx_pet_social_records_realm_id ON public.pet_social_records(realm_id);

-- ============================================================================
-- 初始虚拟领域数据
-- ============================================================================

INSERT INTO public.realms (id, name, description, story, function_description, icon_name) 
VALUES 
  (
    '00000000-0000-0000-0000-000000000001'::UUID,
    '躲雨深林',
    '这里永远有细雨和萤火虫。',
    '这里永远有细雨和萤火虫。适合那些性格社恐、安静的宠物。',
    '这里的宠物社交频率更慢，但一旦对话，深度更高。',
    'umbrella'
  ),
  (
    '00000000-0000-0000-0000-000000000002'::UUID,
    '气泡失重海',
    '宠物在这里变成透明的形态，对话会变成气泡。',
    '宠物在这里变成透明的形态，对话会变成气泡。',
    '适合寻找异地、跨圈层的朋友，打破地理限制。',
    'bubble_chart'
  ),
  (
    '00000000-0000-0000-0000-000000000003'::UUID,
    '霓虹天台公园',
    '最潮流的宠物聚集地，背景是永不落幕的晚霞。',
    '最潮流的宠物聚集地，背景是永不落幕的晚霞。',
    '强 LBS 属性（同城），适合想要立刻线下约遛狗的主人。',
    'nightlife'
  );

-- ============================================================================
-- 触发器：自动更新updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) 策略
-- ============================================================================

-- 用户表 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::uuid = id);

CREATE POLICY "Public can see non-sensitive user data"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated'::text);

-- 宠物表 RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own pets"
  ON public.pets FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Authenticated users can see other pets"
  ON public.pets FOR SELECT
  USING (auth.role() = 'authenticated'::text AND deleted_at IS NULL);

-- 消息表 RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid()::uuid = sender_id OR 
    auth.uid()::uuid = recipient_id
  );
