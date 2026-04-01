-- ============================================================================
-- PUPY爪住 完整数据库架构 (Supabase PostgreSQL)
-- 作者: GitHub Copilot
-- 创建日期: 2026年3月30日
-- 版本: v1.0.0 生产级
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  mbti_type VARCHAR(4),
  user_level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  online_status VARCHAR(20) DEFAULT 'offline',
  last_seen TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_created_at ON public.users(created_at);
CREATE INDEX idx_users_online_status ON public.users(online_status);

-- 宠物表
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  age INTEGER,
  gender VARCHAR(20),
  mbti_type VARCHAR(4),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  image_3d_url TEXT,
  is_real BOOLEAN DEFAULT TRUE,
  clone_status VARCHAR(50) DEFAULT 'original',
  energy_level INTEGER DEFAULT 100,
  mood VARCHAR(50) DEFAULT '开心',
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_pets_breed ON public.pets(breed);
CREATE INDEX idx_pets_is_real ON public.pets(is_real);
CREATE INDEX idx_pets_created_at ON public.pets(created_at);
CREATE INDEX idx_pets_is_deleted ON public.pets(is_deleted);

-- 匹配表
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  direction VARCHAR(20) NOT NULL,
  is_mutual BOOLEAN DEFAULT FALSE,
  compatibility_score INTEGER DEFAULT 60,
  mutual_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matches_user_id ON public.matches(user_id);
CREATE INDEX idx_matches_pet_id ON public.matches(pet_id);
CREATE INDEX idx_matches_target_user_id ON public.matches(target_user_id);
CREATE INDEX idx_matches_direction ON public.matches(direction);
CREATE INDEX idx_matches_is_mutual ON public.matches(is_mutual);

-- 对话表
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pet1_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  pet2_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  conversation_type VARCHAR(50) DEFAULT 'pet-to-pet',
  last_message TEXT,
  last_message_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user1_id ON public.conversations(user1_id);
CREATE INDEX idx_conversations_user2_id ON public.conversations(user2_id);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at);

-- 消息表
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) DEFAULT 'user',
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  translated_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text',
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- 虚拟领域表
CREATE TABLE IF NOT EXISTS public.realms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  story TEXT,
  function_description TEXT,
  image_url TEXT,
  icon_name VARCHAR(50),
  realm_type VARCHAR(50),
  online_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_realms_is_active ON public.realms(is_active);
CREATE INDEX idx_realms_created_at ON public.realms(created_at);

INSERT INTO public.realms (name, description, story, function_description, realm_type) VALUES
  ('幻想森林', '一个充满魔法的森林，宠物可以在这里相遇', '古老的森林中住着许多神秘的生物', '宠物在这里可以进行社交互动', 'fantasy'),
  ('星际空间', '浩瀚的宇宙中迷失的小行星', '在遥远的星系中发现了新的世界', '宠物可以进行太空探险', 'space'),
  ('梦幻城堡', '一座浮在云端的神秘城堡', '传说中的王国，充满了奇迹', '宠物可以在城堡中展示才能', 'castle');

-- 宠物社交记录表
CREATE TABLE IF NOT EXISTS public.pet_social_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  realm_id UUID REFERENCES public.realms(id) ON DELETE SET NULL,
  action_type VARCHAR(50),
  action_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pet_social_records_pet_id ON public.pet_social_records(pet_id);
CREATE INDEX idx_pet_social_records_user_id ON public.pet_social_records(user_id);
CREATE INDEX idx_pet_social_records_created_at ON public.pet_social_records(created_at);

-- 通知表
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message TEXT NOT NULL,
  notification_type VARCHAR(50),
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- 商品表
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price NUMERIC(10, 2),
  image_url TEXT,
  inventory INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  product_type VARCHAR(50),
  ratings NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_available ON public.products(is_available);
CREATE INDEX idx_products_created_at ON public.products(created_at);

-- 订单表
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  order_status VARCHAR(50) DEFAULT 'pending',
  total_price NUMERIC(10, 2),
  payment_method VARCHAR(50),
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_product_id ON public.orders(product_id);
CREATE INDEX idx_orders_order_status ON public.orders(order_status);

-- 收养表
CREATE TABLE IF NOT EXISTS public.adoptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  previous_owner_id UUID NOT NULL REFERENCES public.users(id),
  new_owner_id UUID NOT NULL REFERENCES public.users(id),
  adoption_status VARCHAR(50) DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_adoptions_pet_id ON public.adoptions(pet_id);
CREATE INDEX idx_adoptions_adoption_status ON public.adoptions(adoption_status);

-- 日记表
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  mood VARCHAR(50),
  image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX idx_diary_entries_pet_id ON public.diary_entries(pet_id);
CREATE INDEX idx_diary_entries_is_public ON public.diary_entries(is_public);
CREATE INDEX idx_diary_entries_created_at ON public.diary_entries(created_at);

-- AI祈愿表
CREATE TABLE IF NOT EXISTS public.ai_prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
  prayer_text TEXT NOT NULL,
  generated_response TEXT,
  prayer_type VARCHAR(50),
  is_fulfilled BOOLEAN DEFAULT FALSE,
  fulfilled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_prayers_user_id ON public.ai_prayers(user_id);
CREATE INDEX idx_ai_prayers_pet_id ON public.ai_prayers(pet_id);
CREATE INDEX idx_ai_prayers_created_at ON public.ai_prayers(created_at);

-- 评论表
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(50),
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_target_id ON public.comments(target_id);

-- 点赞表
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_target_id ON public.likes(target_id);
CREATE UNIQUE INDEX idx_likes_unique ON public.likes(user_id, target_id, target_type);

-- 关注表
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE UNIQUE INDEX idx_follows_unique ON public.follows(follower_id, following_id);

-- 自动更新updated_at触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_realms_updated_at BEFORE UPDATE ON public.realms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
