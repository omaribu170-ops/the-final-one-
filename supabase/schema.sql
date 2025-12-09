-- =====================================================
-- The Hub - قاعدة بيانات Supabase
-- نظام إدارة Co-Working Space و Entertainment Hub
-- =====================================================

-- تفعيل UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. جدول المستخدمين (users)
-- يحتوي على جميع المستخدمين: أعضاء، موظفين، أدمن
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- البيانات الأساسية
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password_hash TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  
  -- نوع المستخدم والصلاحيات
  role TEXT CHECK (role IN ('super_admin', 'admin', 'staff', 'user')) DEFAULT 'user',
  
  -- رصيد المحفظة
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  
  -- كود التسويق (Affiliate)
  affiliate_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  
  -- اسم مستعار للـ Entertainment Hub
  nickname TEXT,
  
  -- حالة الحساب
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. جدول OTP للتحقق
-- =====================================================
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT CHECK (type IN ('email', 'sms')) DEFAULT 'email',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. جدول الترابيزات (tables)
-- =====================================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  table_number INT UNIQUE NOT NULL,
  image_url TEXT,
  price_per_hour_per_person DECIMAL(10, 2) NOT NULL,
  capacity_min INT DEFAULT 1,
  capacity_max INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. جدول المنتجات (products)
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('food', 'drink', 'supply', 'equipment')) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  min_stock_alert INT DEFAULT 5,
  is_for_sale BOOLEAN DEFAULT TRUE,
  is_for_internal_use BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. جدول الجلسات (sessions)
-- =====================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('active', 'pending_payment', 'closed')) DEFAULT 'active',
  table_price DECIMAL(10, 2) DEFAULT 0,
  products_price DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'visa', 'wallet')),
  payment_details TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. جدول أعضاء الجلسة (session_members)
-- =====================================================
CREATE TABLE session_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  guest_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- =====================================================
-- 7. جدول طلبات الجلسة (session_orders)
-- =====================================================
CREATE TABLE session_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT DEFAULT 1,
  price_at_time DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  ordered_by UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'delivered', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. جدول ليالي الألعاب (game_nights)
-- =====================================================
CREATE TABLE game_nights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  total_prizes_value DECIMAL(10, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
  image_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. جدول البطولات (tournaments)
-- =====================================================
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_night_id UUID REFERENCES game_nights(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  prize_first DECIMAL(10, 2) DEFAULT 0,
  prize_second DECIMAL(10, 2) DEFAULT 0,
  prize_third DECIMAL(10, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. جدول المشاركين في البطولات
-- =====================================================
CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  rank INT CHECK (rank IN (1, 2, 3)),
  prize_won DECIMAL(10, 2) DEFAULT 0,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- =====================================================
-- 11. جدول سجل النظافة (cleaning_logs)
-- =====================================================
CREATE TABLE cleaning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_date DATE DEFAULT CURRENT_DATE,
  time_slot TIME NOT NULL,
  area TEXT CHECK (area IN ('bathroom', 'hall', 'kitchen', 'entrance')) NOT NULL,
  status TEXT CHECK (status IN ('checked', 'missed')) DEFAULT 'missed',
  checked_by UUID REFERENCES users(id),
  checked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(log_date, time_slot, area)
);

-- =====================================================
-- 12. جدول طلبات المكان (requests)
-- =====================================================
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('supply', 'maintenance', 'food', 'drink', 'other')) NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INT DEFAULT 1,
  estimated_cost DECIMAL(10, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'received', 'completed')) DEFAULT 'pending',
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. جدول مصروفات المكان (expenses)
-- =====================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT CHECK (category IN ('rent', 'utilities', 'salary', 'supplies', 'maintenance', 'other')) DEFAULT 'other',
  expense_date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. جدول بيانات الموظفين (employees)
-- =====================================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  national_id TEXT,
  national_id_image_url TEXT,
  address TEXT,
  emergency_contact TEXT,
  salary DECIMAL(10, 2) DEFAULT 0,
  shift TEXT CHECK (shift IN ('morning', 'evening', 'night', 'full')) DEFAULT 'full',
  hire_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. جدول المهام (tasks)
-- =====================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')) DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 16. جدول المكلفين بالمهام (task_assignees)
-- =====================================================
CREATE TABLE task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(task_id, user_id)
);

-- =====================================================
-- 17. جدول الحجوزات المسبقة (bookings)
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  people_count INT DEFAULT 1,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  table_id UUID REFERENCES tables(id),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 18. جدول طلبات الحجز (booking_orders)
-- =====================================================
CREATE TABLE booking_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT DEFAULT 1,
  price_at_time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 19. جدول أرباح المسوقين (affiliate_earnings)
-- =====================================================
CREATE TABLE affiliate_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES users(id),
  referred_user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES sessions(id),
  amount DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2) DEFAULT 30,
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 20. جدول معاملات المحفظة (wallet_transactions)
-- =====================================================
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('deposit', 'withdrawal', 'session_payment', 'affiliate_earning', 'refund')) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  reference_id UUID,
  payment_method TEXT,
  payment_reference TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 21. جدول الإشعارات (notifications)
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('general', 'booking', 'session', 'task', 'promo', 'reminder')) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 22. جدول محادثات صميده AI (ai_conversations)
-- =====================================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT DEFAULT 'محادثة جديدة',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 23. جدول رسائل صميده AI (ai_messages)
-- =====================================================
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 24. جدول الملاحظات (notes)
-- =====================================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT DEFAULT 'ملاحظة جديدة',
  content TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#ffffff',
  folder_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 25. جدول مجلدات الملاحظات (note_folders)
-- =====================================================
CREATE TABLE note_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#007AFF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة foreign key للملاحظات
ALTER TABLE notes ADD CONSTRAINT fk_notes_folder 
  FOREIGN KEY (folder_id) REFERENCES note_folders(id) ON DELETE SET NULL;

-- =====================================================
-- 26. جدول العروض والبانرات (banners)
-- =====================================================
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 27. جدول الإعدادات (settings)
-- =====================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 28. جدول اشتراكات Push (push_subscriptions)
-- =====================================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- إنشاء Indexes للأداء
-- =====================================================
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_table ON sessions(table_id);
CREATE INDEX idx_sessions_created ON sessions(created_at);
CREATE INDEX idx_session_members_session ON session_members(session_id);
CREATE INDEX idx_session_members_user ON session_members(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_affiliate ON users(affiliate_code);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_cleaning_logs_date ON cleaning_logs(log_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_notes_user ON notes(user_id);

-- =====================================================
-- Functions
-- =====================================================

-- توليد كود Affiliate فريد
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM users WHERE affiliate_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- حساب سعر الجلسة
CREATE OR REPLACE FUNCTION calculate_session_price(session_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  table_total DECIMAL;
  products_total DECIMAL;
  hours_count DECIMAL;
  price_per_person DECIMAL;
  member_count INT;
BEGIN
  SELECT 
    EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time)) / 3600,
    t.price_per_hour_per_person
  INTO hours_count, price_per_person
  FROM sessions s
  JOIN tables t ON s.table_id = t.id
  WHERE s.id = session_uuid;
  
  SELECT COUNT(*) INTO member_count
  FROM session_members
  WHERE session_id = session_uuid;
  
  table_total := CEIL(hours_count) * price_per_person * member_count;
  
  SELECT COALESCE(SUM(total_price), 0) INTO products_total
  FROM session_orders
  WHERE session_id = session_uuid AND status != 'cancelled';
  
  RETURN table_total + products_total;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers
-- =====================================================

-- تحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- توليد كود Affiliate تلقائياً
CREATE OR REPLACE FUNCTION auto_generate_affiliate_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.affiliate_code IS NULL THEN
    NEW.affiliate_code := generate_affiliate_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_user_affiliate_code
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION auto_generate_affiliate_code();

-- =====================================================
-- بيانات تجريبية
-- =====================================================

-- إضافة Super Admin
INSERT INTO users (name, email, phone, password_hash, role, is_verified, nickname)
VALUES ('المدير العام', 'admin@thehub.com', '01000000000', 'admin123', 'super_admin', true, 'الأدمن');

-- إضافة ترابيزات
INSERT INTO tables (name, table_number, price_per_hour_per_person, capacity_min, capacity_max) VALUES 
  ('ترابيزة VIP 1', 1, 50.00, 2, 6),
  ('ترابيزة VIP 2', 2, 50.00, 2, 6),
  ('ترابيزة عادية 1', 3, 30.00, 1, 4),
  ('ترابيزة عادية 2', 4, 30.00, 1, 4),
  ('ترابيزة كبيرة', 5, 40.00, 4, 10);

-- إضافة منتجات
INSERT INTO products (name, name_ar, type, price, stock_quantity, is_for_sale) VALUES 
  ('Coffee', 'قهوة', 'drink', 25.00, 100, true),
  ('Tea', 'شاي', 'drink', 15.00, 100, true),
  ('Water', 'مياه', 'drink', 10.00, 200, true),
  ('Sandwich', 'ساندوتش', 'food', 35.00, 50, true),
  ('Cake', 'كيكة', 'food', 30.00, 30, true);

-- إعدادات افتراضية
INSERT INTO settings (key, value) VALUES
  ('logo_url', '/images/logo.png'),
  ('pwa_logo_url', '/icons/icon-512x512.png'),
  ('theme_primary_color', '#E63E32'),
  ('theme_secondary_color', '#F18A21'),
  ('opening_hours', '10:00-22:00'),
  ('working_days', 'daily');
