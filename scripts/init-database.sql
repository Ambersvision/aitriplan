-- 初始化 AITriplan 数据库
-- 创建所有必要的表

-- 1. User 表
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "email_verified" TIMESTAMP,
  "image" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Account 表 (NextAuth)
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  UNIQUE("provider", "provider_account_id"),
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- 3. Session 表 (NextAuth)
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT PRIMARY KEY,
  "session_token" TEXT UNIQUE NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- 4. VerificationToken 表 (NextAuth)
CREATE TABLE IF NOT EXISTS "verificationtokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  UNIQUE("identifier", "token")
);

-- 5. Trip 表
CREATE TABLE IF NOT EXISTS "trips" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "status" TEXT DEFAULT 'PLANNING',
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- 6. Destination 表
CREATE TABLE IF NOT EXISTS "destinations" (
  "id" TEXT PRIMARY KEY,
  "trip_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "address" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE,
  UNIQUE("trip_id", "order")
);

-- 7. ItineraryItem 表
CREATE TABLE IF NOT EXISTS "itinerary_items" (
  "id" TEXT PRIMARY KEY,
  "trip_id" TEXT NOT NULL,
  "destination_id" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP NOT NULL,
  "duration" INTEGER NOT NULL,
  "from_location" JSONB,
  "to_location" JSONB,
  "transport_mode" TEXT,
  "transport_cost" DECIMAL(10,2),
  "ticket_cost" DECIMAL(10,2),
  "other_cost" DECIMAL(10,2),
  "order" INTEGER NOT NULL,
  "is_ai_generated" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE,
  FOREIGN KEY ("destination_id") REFERENCES "destinations"("id")
);

-- 8. CheckIn 表
CREATE TABLE IF NOT EXISTS "check_ins" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "trip_id" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "address" TEXT,
  "content" TEXT NOT NULL,
  "photos" TEXT[] DEFAULT '{}',
  "videos" TEXT[] DEFAULT '{}',
  "tags" TEXT[] DEFAULT '{}',
  "likes" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE
);

-- 9. Comment 表
CREATE TABLE IF NOT EXISTS "comments" (
  "id" TEXT PRIMARY KEY,
  "check_in_id" TEXT NOT NULL,
  "user_id" TEXT,
  "user_name" TEXT,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("check_in_id") REFERENCES "check_ins"("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- 10. ShareLink 表
CREATE TABLE IF NOT EXISTS "share_links" (
  "id" TEXT PRIMARY KEY,
  "check_in_id" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires_at" TIMESTAMP,
  "is_active" BOOLEAN DEFAULT TRUE,
  "views" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("check_in_id") REFERENCES "check_ins"("id") ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "trips_user_id_idx" ON "trips"("user_id");
CREATE INDEX IF NOT EXISTS "trips_user_id_status_idx" ON "trips"("user_id", "status");
CREATE INDEX IF NOT EXISTS "destinations_trip_id_idx" ON "destinations"("trip_id");
CREATE INDEX IF NOT EXISTS "itinerary_items_trip_id_start_time_idx" ON "itinerary_items"("trip_id", "start_time");
CREATE INDEX IF NOT EXISTS "itinerary_items_trip_id_order_idx" ON "itinerary_items"("trip_id", "order");
CREATE INDEX IF NOT EXISTS "check_ins_user_id_idx" ON "check_ins"("user_id");
CREATE INDEX IF NOT EXISTS "check_ins_trip_id_idx" ON "check_ins"("trip_id");
CREATE INDEX IF NOT EXISTS "check_ins_created_at_idx" ON "check_ins"("created_at");
CREATE INDEX IF NOT EXISTS "comments_check_in_id_idx" ON "comments"("check_in_id");
CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "comments"("created_at");
CREATE INDEX IF NOT EXISTS "share_links_token_idx" ON "share_links"("token");
CREATE INDEX IF NOT EXISTS "share_links_check_in_id_idx" ON "share_links"("check_in_id");

-- 创建 _prisma_migrations 表（Prisma 需要）
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) PRIMARY KEY,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMP,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP,
  "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- 插入初始迁移记录
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
VALUES (
  'init-' || substr(md5(random()::text), 1, 8),
  'init',
  CURRENT_TIMESTAMP,
  '20240301000000_init',
  1
) ON CONFLICT DO NOTHING;

SELECT 'Database initialized successfully!' as status;
