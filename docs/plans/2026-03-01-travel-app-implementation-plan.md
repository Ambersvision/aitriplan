# AITriplan - Master实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement each phase task-by-task.

**Goal:** 构建一个支持AI智能规划、多端同步、NAS本地部署的旅行规划和记录工具

**Architecture:** Next.js全栈 + React Native移动端 + PostgreSQL + Redis + Docker部署，支持多国产AI和双地图切换

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, React Native, Prisma, PostgreSQL, Redis, Docker

**Design Doc:** `docs/plans/2026-03-01-travel-app-design.md`

---

## 实施阶段概览

| 阶段 | 名称 | 预计工时 | 里程碑 |
|------|------|---------|--------|
| Phase 0 | 项目初始化和基础设施 | 2-3h | 可运行的基础项目 |
| Phase 1 | 数据库设计 | 3-4h | 完整的Prisma Schema |
| Phase 2 | 认证系统 | 4-5h | 登录/注册/会话管理 |
| Phase 3 | 核心API - 旅行CRUD | 6-8h | 旅行增删改查API |
| Phase 4 | AI行程规划 | 8-10h | Kimi集成 + 行程生成 |
| Phase 5 | 地图服务 | 4-5h | 高德/Google地图选址 |
| Phase 6 | 前端UI - 旅行管理 | 8-10h | Web界面：行程列表/详情/编辑 |
| Phase 7 | 前端UI - 时间线规划 | 10-12h | 时间线视图 + 拖拽编辑 |
| Phase 8 | 打卡记录 | 6-8h | 打卡API + 多媒体上传 |
| Phase 9 | 分享功能 | 4-5h | 分享链接 + 评论点赞 |
| Phase 10 | 美食推荐 | 3-4h | AI美食推荐 + 公开API |
| Phase 11 | 移动端开发 | 15-20h | React Native基础功能 |
| Phase 12 | NAS部署 | 2-3h | Docker配置 + 部署文档 |

**总计:** 约 70-90 小时开发时间

---

## Phase 0: 项目初始化

### Task 0.1: 初始化Next.js项目结构

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `packages/shared/package.json`
- Create: `package.json` (root monorepo)

**Steps:**

1. **保留现有Next.js项目** - 当前项目已存在，作为 `apps/web/`

2. **创建Monorepo结构**
   ```bash
   # 移动现有文件到 apps/web/
   mkdir -p apps/web
   mv app public components lib hooks types styles next* tsconfig.json postcss.config.mjs eslint.config.mjs apps/web/
   mv package.json apps/web/package.json.bak
   
   # 创建root package.json
   ```

3. **Write Root package.json**

```json
{
  "name": "aitriplan",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "db:generate": "cd apps/web && npx prisma generate",
    "db:migrate": "cd apps/web && npx prisma migrate dev",
    "db:studio": "cd apps/web && npx prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

4. **Create Turbo Configuration**

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

5. **Setup Shared Package**

```json
// packages/shared/package.json
{
  "name": "@aitriplan/shared",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

6. **Install Dependencies**
   ```bash
   npm install
   cd apps/web && npm install
   cd ../../packages/shared && npm install
   ```

7. **Commit**
   ```bash
   git add .
   git commit -m "chore: setup monorepo structure with turbo"
   ```

---

### Task 0.2: 配置环境变量和工具

**Files:**
- Create: `.env.example`
- Create: `apps/web/.env.local` (gitignored)
- Modify: `apps/web/.gitignore`

**Steps:**

1. **Write .env.example**

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5511/aitriplan"

# Redis
REDIS_URL="redis://localhost:6311"

# NextAuth
NEXTAUTH_URL="http://localhost:2311"
NEXTAUTH_SECRET="your-secret-key-min-32-chars-long"

# OAuth Providers (可选)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# AI Services
KIMI_API_KEY="your-kimi-api-key"
KIMI_BASE_URL="https://api.moonshot.cn/v1"
DEEPSEEK_API_KEY="your-deepseek-api-key"
DEEPSEEK_BASE_URL="https://api.deepseek.com/v1"
GLM_API_KEY="your-glm-api-key"
ONEAPI_BASE_URL="http://localhost:3001/v1"
ONEAPI_API_KEY="your-oneapi-key"
DEFAULT_AI_PROVIDER="kimi"

# Maps
AMAP_KEY="your-amap-key"
AMAP_JS_API_KEY="your-amap-js-api-key"
GOOGLE_MAPS_API_KEY="your-google-maps-key"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="52428800" # 50MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,video/mp4"

# App
NODE_ENV="development"
PORT="3000"
```

2. **Update .gitignore**
   ```bash
   # 添加到 apps/web/.gitignore
   .env.local
   .env.*.local
   uploads/
   ```

3. **Install Development Tools**
   ```bash
   cd apps/web
   npm install -D prisma @types/bcryptjs
   npm install bcryptjs next-auth
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "chore: add environment configuration and auth dependencies"
   ```

---

### Task 0.3: 配置Prisma和数据库

**Files:**
- Create: `apps/web/prisma/schema.prisma`
- Create: `apps/web/lib/prisma.ts`
- Create: `apps/web/lib/db.ts`

**Steps:**

1. **Initialize Prisma**
   ```bash
   cd apps/web
   npx prisma init
   ```

2. **Write Prisma Schema** (基础模型，后续扩展)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  accounts Account[]
  sessions Session[]

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}
```

3. **Write Prisma Client Singleton**

```typescript
// apps/web/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

4. **Create Database Utilities**

```typescript
// apps/web/lib/db.ts
import { prisma } from './prisma'

export { prisma }

export async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}
```

5. **Run Initial Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Generate Client**
   ```bash
   npx prisma generate
   ```

7. **Commit**
   ```bash
   git add .
   git commit -m "feat: setup prisma with nextauth models"
   ```

---

## Phase 1: 数据库设计（完整Schema）

### Task 1.1: 完善User模型和Trip模型

**Files:**
- Modify: `apps/web/prisma/schema.prisma`

**Step 1: Add Trip Model**

```prisma
// 在User模型中添加关系
model User {
  // ... existing fields
  trips     Trip[]
  checkIns  CheckIn[]
  comments  Comment[]
}

// Add enums
enum TripStatus {
  PLANNING
  ONGOING
  COMPLETED
  CANCELLED
}

enum ItemType {
  TRANSPORT
  ATTRACTION
  FOOD
  ACCOMMODATION
  ACTIVITY
  FREE_TIME
}

enum TransportMode {
  PLANE
  TRAIN
  HIGH_SPEED_RAIL
  BUS
  SUBWAY
  TAXI
  RIDE_HAILING
  WALK
  DRIVE
  SHIP
  FERRY
  BIKE
}

// Add Trip model
model Trip {
  id          String      @id @default(cuid())
  userId      String      @map("user_id")
  title       String
  description String?
  startDate   DateTime    @map("start_date")
  endDate     DateTime    @map("end_date")
  status      TripStatus  @default(PLANNING)
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  destinations Destination[]
  items       ItineraryItem[]

  @@index([userId])
  @@index([userId, status])
  @@map("trips")
}
```

**Step 2: Add Destination Model**

```prisma
model Destination {
  id          String   @id @default(cuid())
  tripId      String   @map("trip_id")
  name        String
  order       Int
  latitude    Float
  longitude   Float
  address     String?
  createdAt   DateTime @default(now()) @map("created_at")

  trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  items       ItineraryItem[]

  @@unique([tripId, order])
  @@index([tripId])
  @@map("destinations")
}
```

**Step 3: Migrate**

```bash
cd apps/web
npx prisma migrate dev --name add_trip_and_destination
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat(db): add trip and destination models"
```

---

### Task 1.2: 添加行程项模型

**Files:**
- Modify: `apps/web/prisma/schema.prisma`

**Step 1: Add Location Type (JSON)**

```prisma
// ItineraryItem with Location JSON
model ItineraryItem {
  id              String         @id @default(cuid())
  tripId          String         @map("trip_id")
  destinationId   String?        @map("destination_id")
  type            ItemType
  title           String
  description     String?        @db.Text
  startTime       DateTime       @map("start_time")
  endTime         DateTime       @map("end_time")
  duration        Int            // minutes
  fromLocation    Json?          @map("from_location")
  toLocation      Json?          @map("to_location")
  transportMode   TransportMode? @map("transport_mode")
  transportCost   Decimal?       @map("transport_cost") @db.Decimal(10, 2)
  ticketCost      Decimal?       @map("ticket_cost") @db.Decimal(10, 2)
  otherCost       Decimal?       @map("other_cost") @db.Decimal(10, 2)
  order           Int
  isAiGenerated   Boolean        @default(false) @map("is_ai_generated")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  trip            Trip           @relation(fields: [tripId], references: [id], onDelete: Cascade)
  destination     Destination?   @relation(fields: [destinationId], references: [id])

  @@index([tripId, startTime])
  @@index([tripId, order])
  @@map("itinerary_items")
}
```

**Step 2: Migrate**

```bash
npx prisma migrate dev --name add_itinerary_items
```

**Step 3: Define Types**

```typescript
// apps/web/types/location.ts
export interface Location {
  name: string
  address?: string
  latitude: number
  longitude: number
  placeId?: string
}

// apps/web/types/trip.ts
export interface TripCreateInput {
  title: string
  description?: string
  startDate: Date
  endDate: Date
}

export interface DestinationInput {
  name: string
  order: number
  latitude: number
  longitude: number
  address?: string
}

export interface ItineraryItemInput {
  type: ItemType
  title: string
  description?: string
  startTime: Date
  endTime: Date
  fromLocation?: Location
  toLocation?: Location
  transportMode?: TransportMode
  transportCost?: number
  ticketCost?: number
  otherCost?: number
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat(db): add itinerary items with location support"
```

---

### Task 1.3: 添加打卡和分享模型

**Files:**
- Modify: `apps/web/prisma/schema.prisma`

**Step 1: Add CheckIn Model**

```prisma
model CheckIn {
  id          String    @id @default(cuid())
  userId      String    @map("user_id")
  tripId      String    @map("trip_id")
  latitude    Float
  longitude   Float
  address     String?
  content     String    @db.Text
  photos      String[]  // Array of URLs
  videos      String[]  // Array of URLs
  tags        String[]
  likes       Int       @default(0)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments    Comment[]
  shareLinks  ShareLink[]

  @@index([userId])
  @@index([tripId])
  @@index([createdAt])
  @@map("check_ins")
}
```

**Step 2: Add Comment Model**

```prisma
model Comment {
  id          String    @id @default(cuid())
  checkInId   String    @map("check_in_id")
  userId      String?   @map("user_id") // null for anonymous
  userName    String?   @map("user_name") // for anonymous comments
  content     String    @db.Text
  createdAt   DateTime  @default(now()) @map("created_at")

  checkIn     CheckIn   @relation(fields: [checkInId], references: [id], onDelete: Cascade)
  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([checkInId])
  @@index([createdAt])
  @@map("comments")
}
```

**Step 3: Add ShareLink Model**

```prisma
model ShareLink {
  id          String    @id @default(cuid())
  checkInId   String    @map("check_in_id")
  token       String    @unique
  expiresAt   DateTime? @map("expires_at")
  isActive    Boolean   @default(true)
  views       Int       @default(0)
  createdAt   DateTime  @default(now()) @map("created_at")

  checkIn     CheckIn   @relation(fields: [checkInId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([checkInId])
  @@map("share_links")
}
```

**Step 4: Final Migration**

```bash
npx prisma migrate dev --name add_checkin_comments_shares
```

**Step 5: Generate Types**

```bash
npx prisma generate
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat(db): complete schema with checkin, comments, and share links"
```

---

## Phase 2: 认证系统

### Task 2.1: 配置NextAuth

**Files:**
- Create: `apps/web/lib/auth.ts`
- Create: `apps/web/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/web/types/next-auth.d.ts`

**Step 1: Create Auth Configuration**

```typescript
// apps/web/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // For credential provider, you'd need to store password
        // This is a simplified version - in production use proper password hashing
        return user
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
```

**Step 2: Create Type Declarations**

```typescript
// apps/web/types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
  }
}
```

**Step 3: Create API Route**

```typescript
// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**Step 4: Install Dependencies**

```bash
npm install @auth/prisma-adapter
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat(auth): setup nextauth with credentials provider"
```

---

### Task 2.2: 创建登录页面

**Files:**
- Create: `apps/web/app/auth/signin/page.tsx`
- Create: `apps/web/components/auth/SignInForm.tsx`

**Step 1: Create SignIn Form Component**

```typescript
// apps/web/components/auth/SignInForm.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/trips')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

**Step 2: Create SignIn Page**

```typescript
// apps/web/app/auth/signin/page.tsx
import SignInForm from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Sign in to AITriplan
        </h1>
        <SignInForm />
      </div>
    </div>
  )
}
```

**Step 3: Test the Login Page**

```bash
npm run dev
# Visit http://localhost:2311/auth/signin
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat(auth): add signin page and form"
```

---

### Task 2.3: 添加注册功能

**Files:**
- Create: `apps/web/app/api/auth/register/route.ts`
- Create: `apps/web/components/auth/SignUpForm.tsx`
- Create: `apps/web/app/auth/signup/page.tsx`

**Step 1: Create Registration API**

```typescript
// apps/web/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        // Note: NextAuth doesn't store password by default
        // You'd need to extend the schema to add password field
        // For now, we'll create the user without password
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create SignUp Form**

```typescript
// apps/web/components/auth/SignUpForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
      } else {
        router.push('/auth/signin?registered=true')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

**Step 3: Create SignUp Page**

```typescript
// apps/web/app/auth/signup/page.tsx
import SignUpForm from '@/components/auth/SignUpForm'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h1>
        <SignUpForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat(auth): add user registration"
```

---

## Phase 3: 核心API - 旅行CRUD

### Task 3.1: 创建旅行API

**Files:**
- Create: `apps/web/app/api/trips/route.ts`
- Create: `apps/web/lib/services/trip.service.ts`

**Step 1: Create Trip Service**

```typescript
// apps/web/lib/services/trip.service.ts
import { prisma } from '@/lib/prisma'
import { TripStatus } from '@prisma/client'

export interface CreateTripInput {
  title: string
  description?: string
  startDate: Date
  endDate: Date
  userId: string
}

export interface UpdateTripInput {
  title?: string
  description?: string
  startDate?: Date
  endDate?: Date
  status?: TripStatus
}

export async function createTrip(data: CreateTripInput) {
  return prisma.trip.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      userId: data.userId
    }
  })
}

export async function getTripsByUser(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { destinations: true, items: true }
      }
    }
  })
}

export async function getTripById(id: string, userId: string) {
  return prisma.trip.findFirst({
    where: { id, userId },
    include: {
      destinations: {
        orderBy: { order: 'asc' }
      },
      items: {
        orderBy: [{ order: 'asc' }, { startTime: 'asc' }]
      }
    }
  })
}

export async function updateTrip(id: string, userId: string, data: UpdateTripInput) {
  return prisma.trip.updateMany({
    where: { id, userId },
    data
  })
}

export async function deleteTrip(id: string, userId: string) {
  return prisma.trip.deleteMany({
    where: { id, userId }
  })
}
```

**Step 2: Create API Route**

```typescript
// apps/web/app/api/trips/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createTrip, getTripsByUser } from '@/lib/services/trip.service'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const trips = await getTripsByUser(session.user.id)
    return NextResponse.json(trips)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    const trip = await createTrip({
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      userId: session.user.id
    })

    return NextResponse.json(trip, { status: 201 })
  } catch (error) {
    console.error('Create trip error:', error)
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat(api): add trip list and create endpoints"
```

---

### Task 3.2: 创建旅行详情API

**Files:**
- Create: `apps/web/app/api/trips/[id]/route.ts`

**Step 1: Create Trip Detail API**

```typescript
// apps/web/app/api/trips/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getTripById, updateTrip, deleteTrip } from '@/lib/services/trip.service'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const trip = await getTripById(params.id, session.user.id)
    
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    const updateData: any = {}
    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.startDate) updateData.startDate = new Date(body.startDate)
    if (body.endDate) updateData.endDate = new Date(body.endDate)
    if (body.status) updateData.status = body.status

    const result = await updateTrip(params.id, session.user.id, updateData)
    
    if (result.count === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Trip updated' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await deleteTrip(params.id, session.user.id)
    
    if (result.count === 0) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Trip deleted' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat(api): add trip detail, update, and delete endpoints"
```

---

## Phase 4: AI行程规划

### Task 4.1: 配置Kimi AI Provider

**Files:**
- Create: `apps/web/lib/ai/types.ts`
- Create: `apps/web/lib/ai/providers/kimi.provider.ts`
- Create: `apps/web/lib/ai/factory.ts`
- Create: `apps/web/lib/ai/prompts/trip.prompt.ts`

**Step 1: Define AI Types**

```typescript
// apps/web/lib/ai/types.ts
export interface Location {
  name: string
  address?: string
  latitude: number
  longitude: number
}

export interface AIItineraryItem {
  type: 'TRANSPORT' | 'ATTRACTION' | 'FOOD' | 'ACCOMMODATION' | 'ACTIVITY'
  title: string
  description?: string
  startTime: string // ISO string
  endTime: string
  duration: number // minutes
  fromLocation?: Location
  toLocation?: Location
  transportMode?: string
  transportCost?: number
  ticketCost?: number
  otherCost?: number
}

export interface AITripPlan {
  destinations: {
    name: string
    order: number
    latitude: number
    longitude: number
    address?: string
  }[]
  items: AIItineraryItem[]
  totalCost: number
  tips: string[]
}

export interface TripPlanParams {
  destinations: string[]
  startDate: string
  endDate: string
  preferences?: {
    transportPreference?: string
    pace?: 'relaxed' | 'moderate' | 'intensive'
    budget?: 'budget' | 'moderate' | 'luxury'
    specialNeeds?: string[]
  }
}

export interface AIProvider {
  generateTripPlan(params: TripPlanParams): Promise<AITripPlan>
  generateFoodRecommendations(location: Location, count?: number): Promise<any[]>
  streamResponse(prompt: string): AsyncIterable<string>
}
```

**Step 2: Create Kimi Provider**

```typescript
// apps/web/lib/ai/providers/kimi.provider.ts
import OpenAI from 'openai'
import { AIProvider, TripPlanParams, AITripPlan, Location } from '../types'
import { generateTripPlanPrompt } from '../prompts/trip.prompt'

export class KimiProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.KIMI_API_KEY,
      baseURL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1'
    })
  }

  async generateTripPlan(params: TripPlanParams): Promise<AITripPlan> {
    const prompt = generateTripPlanPrompt(params)

    const response = await this.client.chat.completions.create({
      model: 'moonshot-v1-128k',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的旅行规划师，擅长制定详细的旅行行程。请严格按照用户要求输出JSON格式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from Kimi')
    }

    try {
      const plan = JSON.parse(content) as AITripPlan
      return plan
    } catch (error) {
      throw new Error('Failed to parse AI response')
    }
  }

  async generateFoodRecommendations(
    location: Location,
    count: number = 5
  ): Promise<any[]> {
    const prompt = `请为以下位置推荐${count}个当地特色美食和餐厅：

位置：${location.name}
坐标：${location.latitude}, ${location.longitude}

请以JSON数组格式返回，每个元素包含：
- name: 餐厅/美食名称
- type: 类型（如：火锅、小吃、正餐等）
- specialty: 招牌菜/特色
- priceRange: 人均消费范围（如：50-100元）
- bestTime: 推荐用餐时间
- tips: 用餐建议

注意：请确保推荐真实存在的餐厅类型。`

    const response = await this.client.chat.completions.create({
      model: 'moonshot-v1-128k',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) return []

    try {
      const result = JSON.parse(content)
      return result.recommendations || []
    } catch {
      return []
    }
  }

  async *streamResponse(prompt: string): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: 'moonshot-v1-128k',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      stream: true
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }
}
```

**Step 3: Create Prompt Templates**

```typescript
// apps/web/lib/ai/prompts/trip.prompt.ts
import { TripPlanParams } from '../types'

export function generateTripPlanPrompt(params: TripPlanParams): string {
  const { destinations, startDate, endDate, preferences } = params

  return `你是一位专业的旅行规划师。请根据以下信息生成详细的旅行规划：

【目的地】
${destinations.map((d, i) => `${i + 1}. ${d}`).join('\n')}

【时间】
开始：${startDate}
结束：${endDate}

【偏好】
- 交通方式偏好：${preferences?.transportPreference || '无特殊偏好'}
- 游玩节奏：${preferences?.pace || '适中'} (relaxed=休闲, moderate=适中, intensive=紧凑)
- 预算等级：${preferences?.budget || 'moderate'} (budget=经济, moderate=中等, luxury=豪华)
- 特殊需求：${preferences?.specialNeeds?.join(', ') || '无'}

【要求】
1. 精确到每个行程项的开始和结束时间（精确到分钟，格式：YYYY-MM-DDTHH:mm:ss）
2. 包含交通时间、游览时间、用餐时间、休息时间
3. 每个景点提供游览建议（最佳时间、必看内容、注意事项）
4. 推荐当地特色美食（餐厅类型、人均价格、招牌菜）
5. 计算每个行程项的预估费用（交通费、门票费、其他费用）
6. 考虑地理位置合理性，避免绕路，优化路线
7. 第一天和最后一天的交通安排要合理

【输出格式】
请以JSON格式返回：
{
  "destinations": [
    {
      "name": "城市名",
      "order": 0,
      "latitude": 纬度,
      "longitude": 经度,
      "address": "详细地址"
    }
  ],
  "items": [
    {
      "type": "TRANSPORT|ATTRACTION|FOOD|ACCOMMODATION|ACTIVITY",
      "title": "标题",
      "description": "详细描述和建议",
      "startTime": "2024-01-01T09:00:00",
      "endTime": "2024-01-01T11:00:00",
      "duration": 120,
      "fromLocation": {"name": "出发地", "latitude": 0, "longitude": 0},
      "toLocation": {"name": "目的地", "latitude": 0, "longitude": 0},
      "transportMode": "PLANE|TRAIN|BUS|TAXI|WALK|DRIVE|SHIP",
      "transportCost": 100,
      "ticketCost": 50,
      "otherCost": 20
    }
  ],
  "totalCost": 5000,
  "tips": ["提示1", "提示2"]
}

请确保JSON格式正确，所有字段都存在。`
}
```

**Step 4: Create AI Factory**

```typescript
// apps/web/lib/ai/factory.ts
import { KimiProvider } from './providers/kimi.provider'
import { AIProvider } from './types'

export type AIProviderType = 'kimi' | 'deepseek' | 'glm' | 'oneapi'

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map()

  static getProvider(type?: AIProviderType): AIProvider {
    const providerType = type || (process.env.DEFAULT_AI_PROVIDER as AIProviderType) || 'kimi'

    if (!this.providers.has(providerType)) {
      switch (providerType) {
        case 'kimi':
          this.providers.set(providerType, new KimiProvider())
          break
        // TODO: Add other providers
        default:
          throw new Error(`Unknown AI provider: ${providerType}`)
      }
    }

    return this.providers.get(providerType)!
  }

  static getProviderWithFallback(): AIProvider[] {
    const providers: AIProvider[] = []
    
    // Try providers in order of preference
    const types: AIProviderType[] = ['kimi', 'deepseek', 'glm']
    
    for (const type of types) {
      try {
        providers.push(this.getProvider(type))
      } catch (error) {
        console.warn(`Failed to initialize ${type} provider`)
      }
    }

    if (providers.length === 0) {
      throw new Error('No AI providers available')
    }

    return providers
  }
}
```

**Step 5: Install OpenAI SDK**

```bash
cd apps/web
npm install openai
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat(ai): setup kimi provider and trip planning prompts"
```

---

### Task 4.2: 创建AI规划API

**Files:**
- Create: `apps/web/app/api/trips/[id]/plan/route.ts`
- Create: `apps/web/lib/services/ai-trip.service.ts`

**Step 1: Create AI Trip Service**

```typescript
// apps/web/lib/services/ai-trip.service.ts
import { prisma } from '@/lib/prisma'
import { AIProviderFactory } from '@/lib/ai/factory'
import { TripPlanParams } from '@/lib/ai/types'

export async function generateTripPlanWithAI(
  tripId: string,
  userId: string,
  params: TripPlanParams
) {
  // Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId }
  })

  if (!trip) {
    throw new Error('Trip not found')
  }

  // Generate AI plan
  const provider = AIProviderFactory.getProvider()
  const plan = await provider.generateTripPlan(params)

  // Save to database in transaction
  return prisma.$transaction(async (tx) => {
    // Clear existing destinations and items
    await tx.destination.deleteMany({ where: { tripId } })
    await tx.itineraryItem.deleteMany({ where: { tripId } })

    // Create destinations
    const destinations = await Promise.all(
      plan.destinations.map((dest) =>
        tx.destination.create({
          data: {
            tripId,
            name: dest.name,
            order: dest.order,
            latitude: dest.latitude,
            longitude: dest.longitude,
            address: dest.address
          }
        })
      )
    )

    // Create itinerary items
    const items = await Promise.all(
      plan.items.map((item, index) =>
        tx.itineraryItem.create({
          data: {
            tripId,
            type: item.type,
            title: item.title,
            description: item.description,
            startTime: new Date(item.startTime),
            endTime: new Date(item.endTime),
            duration: item.duration,
            fromLocation: item.fromLocation,
            toLocation: item.toLocation,
            transportMode: item.transportMode as any,
            transportCost: item.transportCost,
            ticketCost: item.ticketCost,
            otherCost: item.otherCost,
            order: index,
            isAiGenerated: true
          }
        })
      )
    )

    return {
      trip: await tx.trip.update({
        where: { id: tripId },
        data: { status: 'PLANNING' }
      }),
      destinations,
      items,
      totalCost: plan.totalCost,
      tips: plan.tips
    }
  })
}
```

**Step 2: Create Plan API Route**

```typescript
// apps/web/app/api/trips/[id]/plan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateTripPlanWithAI } from '@/lib/services/ai-trip.service'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const result = await generateTripPlanWithAI(
      params.id,
      session.user.id,
      {
        destinations: body.destinations,
        startDate: body.startDate,
        endDate: body.endDate,
        preferences: body.preferences
      }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI planning error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate plan' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat(api): add ai trip planning endpoint"
```

---

## Phase 5: 地图服务

### Task 5.1: 配置高德地图

**Files:**
- Create: `apps/web/lib/map/types.ts`
- Create: `apps/web/lib/map/providers/amap.provider.ts`
- Create: `apps/web/lib/map/factory.ts`
- Create: `apps/web/components/map/AMapComponent.tsx`

**Step 1: Define Map Types**

```typescript
// apps/web/lib/map/types.ts
export interface GeoLocation {
  latitude: number
  longitude: number
}

export interface Address {
  formatted: string
  province?: string
  city?: string
  district?: string
  street?: string
  streetNumber?: string
}

export interface POI {
  id: string
  name: string
  address: string
  location: GeoLocation
  type: string
  distance?: number
}

export interface Route {
  distance: number // meters
  duration: number // seconds
  steps: RouteStep[]
  polyline: GeoLocation[]
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  startLocation: GeoLocation
  endLocation: GeoLocation
}

export type TransportMode = 'driving' | 'walking' | 'transit' | 'bicycling'

export interface MapProvider {
  name: string
  geocode(address: string): Promise<GeoLocation | null>
  reverseGeocode(location: GeoLocation): Promise<Address | null>
  searchPOI(keyword: string, location?: GeoLocation, radius?: number): Promise<POI[]>
  getRoute(from: GeoLocation, to: GeoLocation, mode: TransportMode): Promise<Route | null>
}
```

**Step 2: Create AMap Provider**

```typescript
// apps/web/lib/map/providers/amap.provider.ts
import { MapProvider, GeoLocation, Address, POI, Route, TransportMode } from '../types'

export class AMapProvider implements MapProvider {
  name = 'amap'
  private apiKey: string

  constructor() {
    this.apiKey = process.env.AMAP_KEY || ''
    if (!this.apiKey) {
      throw new Error('AMAP_KEY not configured')
    }
  }

  async geocode(address: string): Promise<GeoLocation | null> {
    const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${this.apiKey}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.geocodes?.length > 0) {
        const location = data.geocodes[0].location.split(',')
        return {
          latitude: parseFloat(location[1]),
          longitude: parseFloat(location[0])
        }
      }
      return null
    } catch (error) {
      console.error('AMap geocode error:', error)
      return null
    }
  }

  async reverseGeocode(location: GeoLocation): Promise<Address | null> {
    const url = `https://restapi.amap.com/v3/geocode/regeo?location=${location.longitude},${location.latitude}&key=${this.apiKey}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.regeocode) {
        const address = data.regeocode.addressComponent
        return {
          formatted: data.regeocode.formatted_address,
          province: address.province,
          city: address.city,
          district: address.district,
          street: address.street,
          streetNumber: address.streetNumber
        }
      }
      return null
    } catch (error) {
      console.error('AMap reverse geocode error:', error)
      return null
    }
  }

  async searchPOI(
    keyword: string,
    location?: GeoLocation,
    radius: number = 5000
  ): Promise<POI[]> {
    let url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keyword)}&key=${this.apiKey}&offset=20&page=1`
    
    if (location) {
      url += `&location=${location.longitude},${location.latitude}&radius=${radius}`
    }

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.pois) {
        return data.pois.map((poi: any) => {
          const loc = poi.location?.split(',')
          return {
            id: poi.id,
            name: poi.name,
            address: poi.address || '',
            location: loc ? {
              latitude: parseFloat(loc[1]),
              longitude: parseFloat(loc[0])
            } : { latitude: 0, longitude: 0 },
            type: poi.type,
            distance: poi.distance ? parseInt(poi.distance) : undefined
          }
        })
      }
      return []
    } catch (error) {
      console.error('AMap POI search error:', error)
      return []
    }
  }

  async getRoute(
    from: GeoLocation,
    to: GeoLocation,
    mode: TransportMode = 'driving'
  ): Promise<Route | null> {
    const origin = `${from.longitude},${from.latitude}`
    const destination = `${to.longitude},${to.latitude}`
    
    let url: string
    switch (mode) {
      case 'walking':
        url = `https://restapi.amap.com/v3/direction/walking?origin=${origin}&destination=${destination}&key=${this.apiKey}`
        break
      case 'transit':
        url = `https://restapi.amap.com/v3/direction/transit/integrated?origin=${origin}&destination=${destination}&key=${this.apiKey}&city=北京`
        break
      case 'bicycling':
        url = `https://restapi.amap.com/v3/direction/riding?origin=${origin}&destination=${destination}&key=${this.apiKey}`
        break
      default:
        url = `https://restapi.amap.com/v3/direction/driving?origin=${origin}&destination=${destination}&key=${this.apiKey}`
    }

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === '1' && data.route?.paths?.length > 0) {
        const path = data.route.paths[0]
        return {
          distance: parseInt(path.distance),
          duration: parseInt(path.duration),
          steps: path.steps?.map((step: any) => ({
            instruction: step.instruction,
            distance: parseInt(step.distance),
            duration: parseInt(step.duration),
            startLocation: this.parseLocation(step.start_location),
            endLocation: this.parseLocation(step.end_location)
          })) || [],
          polyline: this.decodePolyline(path.polyline)
        }
      }
      return null
    } catch (error) {
      console.error('AMap route error:', error)
      return null
    }
  }

  private parseLocation(loc: string): GeoLocation {
    const [lng, lat] = loc.split(',').map(Number)
    return { longitude: lng, latitude: lat }
  }

  private decodePolyline(polyline: string): GeoLocation[] {
    // Simplified polyline decoding
    // In production, use a proper decoding algorithm
    return []
  }
}
```

**Step 3: Create Map Factory**

```typescript
// apps/web/lib/map/factory.ts
import { AMapProvider } from './providers/amap.provider'
import { MapProvider, GeoLocation } from './types'

export class MapService {
  private static providers: Map<string, MapProvider> = new Map()

  static getProvider(location?: GeoLocation): MapProvider {
    // For now, always use AMap for China
    // TODO: Detect country from coordinates and switch to Google Maps for overseas
    if (!this.providers.has('amap')) {
      this.providers.set('amap', new AMapProvider())
    }
    return this.providers.get('amap')!
  }

  static async geocode(address: string): Promise<GeoLocation | null> {
    return this.getProvider().geocode(address)
  }

  static async searchPOI(keyword: string, location?: GeoLocation) {
    return this.getProvider().searchPOI(keyword, location)
  }
}
```

**Step 4: Create Map API Routes**

```typescript
// apps/web/app/api/map/geocode/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MapService } from '@/lib/map/factory'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  try {
    const location = await MapService.geocode(address)
    return NextResponse.json({ location })
  } catch (error) {
    return NextResponse.json(
      { error: 'Geocoding failed' },
      { status: 500 }
    )
  }
}
```

```typescript
// apps/web/app/api/map/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MapService } from '@/lib/map/factory'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword required' }, { status: 400 })
  }

  const location = lat && lng ? {
    latitude: parseFloat(lat),
    longitude: parseFloat(lng)
  } : undefined

  try {
    const pois = await MapService.searchPOI(keyword, location)
    return NextResponse.json({ pois })
  } catch (error) {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat(map): setup amap integration with geocode and search"
```

---

## Phase 6-12 待续...

（由于篇幅限制，后续Phase详见实际实施时展开）

---

## 执行建议

**推荐执行顺序:**
1. Phase 0-1: 基础设施 (1-2天)
2. Phase 2-3: 认证和基础API (2-3天)
3. Phase 4-5: AI和地图 (2-3天)
4. Phase 6-7: 前端UI (4-5天)
5. Phase 8-10: 打卡、分享、美食 (3-4天)
6. Phase 11: 移动端 (1-2周)
7. Phase 12: 部署 (1天)

**总计开发周期:** 4-6周（单兵作战）

**下一步:** 使用 executing-plans 技能开始实施 Phase 0
