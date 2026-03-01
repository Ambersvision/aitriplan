# AITriplan 旅行规划与记录工具设计文档

**日期**: 2026-03-01  
**版本**: v1.0  
**状态**: 已批准

---

## 1. 项目概述

### 1.1 目标
构建一个支持AI智能规划、多端同步、本地部署的旅行规划和记录工具。

### 1.2 核心功能
1. **旅行规划**
   - 多目的地输入（可拖动排序）
   - AI自动生成行程建议
   - 时间线展示（精确到分钟）
   - 地图选址与导航
   - 交通方式和价格记录

2. **旅行记录**
   - 地理位置打卡
   - 多媒体内容上传（文字/图片/视频）
   - 标签系统
   - 社交分享（评论/点赞）

---

## 2. 技术架构

### 2.1 部署架构（NAS本地部署）

```
┌─────────────────────────────────────────────────────────────┐
│                     飞牛OS (NAS)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Docker Compose Stack                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │ Next.js  │ │PostgreSQL│ │  Redis   │            │   │
│  │  │   App    │ │   DB     │ │  Cache   │            │   │
│  │  │  :3000   │ │  :5432   │ │  :6379   │            │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘            │   │
│  │       └─────────────┴─────────────┘                  │   │
│  │                      │                               │   │
│  │              ┌───────┴───────┐                       │   │
│  │              │    Nginx      │                       │   │
│  │              │ 反向代理+SSL   │                       │   │
│  │              │   :80/:443    │                       │   │
│  │              └───────┬───────┘                       │   │
│  └──────────────────────┼───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                    公网IP + DDNS
                          │
              ┌───────────┴───────────┐
              │                       │
        ┌─────┴─────┐         ┌───────┴──────┐
        │   Web端   │         │  React Native│
        │ (Next.js) │         │   Mobile     │
        └───────────┘         └──────────────┘
```

### 2.2 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **Web前端** | Next.js | 16.x | App Router, SSR/SSG |
| | React | 19.x | 最新特性 |
| | Tailwind CSS | 4.x | 原子化样式 |
| | TypeScript | 5.x | 类型安全 |
| **移动端** | React Native | 0.76+ | Expo框架 |
| **后端API** | Next.js API Routes | 16.x | 全栈统一 |
| **数据库** | PostgreSQL | 16 | 主数据库 |
| **ORM** | Prisma | 6.x | 类型安全ORM |
| **缓存** | Redis | 7.x | 会话、AI缓存 |
| **认证** | NextAuth.js | 5.x | OAuth/邮箱认证 |
| **地图** | 高德地图 + Google Maps | - | 双地图切换 |
| **AI** | Kimi (主) + DeepSeek/GLM | - | 多厂商适配 |

### 2.3 AI Provider架构

```typescript
// 核心抽象
interface AIProvider {
  // 行程规划
  generateTripPlan(params: TripPlanParams): Promise<TripPlan>
  
  // 美食推荐
  generateFoodRecommendations(location: Location): Promise<FoodItem[]>
  
  // 游览建议
  generateAttractionTips(attraction: string): Promise<string>
  
  // 流式响应（用于实时显示AI思考过程）
  streamResponse(prompt: string): AsyncIterable<string>
}

// 厂商实现
class KimiProvider implements AIProvider { }
class DeepSeekProvider implements AIProvider { }
class GLMProvider implements AIProvider { }
class OneAPIProvider implements AIProvider { }

// 工厂 + 负载均衡
class AIProviderFactory {
  static getProvider(preferred?: string): AIProvider
  static getProviderWithFallback(): AIProvider[]
}
```

**AI能力矩阵：**

| AI厂商 | 优势场景 | 优先级 | 调用方式 |
|--------|---------|--------|---------|
| **Kimi** | 超长上下文(200k)、中文理解 | P0主用 | 原生API |
| **DeepSeek** | 深度推理、代码生成 | P1备用 | OneAPI/原生 |
| **GLM-4** | 多模态、工具调用 | P2备用 | OneAPI |
| **OneAPI** | 统一接入、负载均衡 | 基础设施 | OpenAI兼容格式 |

### 2.4 地图服务架构

```typescript
// 地图Provider
interface MapProvider {
  geocode(address: string): Promise<GeoLocation>
  reverseGeocode(location: GeoLocation): Promise<Address>
  searchPOI(keyword: string): Promise<POI[]>
  getRoute(from: Location, to: Location, mode: TransportMode): Promise<Route>
  renderMap(element: HTMLElement, options: MapOptions): MapInstance
}

class AMapProvider implements MapProvider {
  // 高德地图实现
  // 国内使用，POI丰富，地址解析准确
}

class GoogleMapProvider implements MapProvider {
  // Google Maps实现
  // 海外使用，全球覆盖
}

// 自动切换策略
class MapService {
  static getProvider(location: Location): MapProvider {
    return location.country === 'CN' ? amapProvider : googleProvider
  }
}
```

---

## 3. 数据模型

### 3.1 实体关系图

```
User (用户)
├── id: UUID (PK)
├── email: String (Unique)
├── name: String
├── avatar: String (URL)
├── createdAt: DateTime
└── trips: Trip[]

Trip (旅行计划)
├── id: UUID (PK)
├── userId: UUID (FK)
├── title: String (旅行名称)
├── description: String
├── startDate: DateTime
├── endDate: DateTime
├── status: Enum (PLANNING/ONGOING/COMPLETED)
├── destinations: Destination[] (排序)
├── items: ItineraryItem[]
├── createdAt: DateTime
└── updatedAt: DateTime

Destination (目的地)
├── id: UUID (PK)
├── tripId: UUID (FK)
├── name: String
├── order: Int (排序)
├── latitude: Float
├── longitude: Float
├── address: String
└── items: ItineraryItem[]

ItineraryItem (行程项)
├── id: UUID (PK)
├── tripId: UUID (FK)
├── destinationId: UUID (FK, nullable)
├── type: Enum (TRANSPORT/ATTRACTION/FOOD/ACCOMMODATION/ACTIVITY)
├── title: String
├── description: String (游览建议)
├── startTime: DateTime (精确到分钟)
├── endTime: DateTime
├── duration: Int (分钟)
├── fromLocation: Location
├── toLocation: Location
├── transportMode: Enum (PLANE/TRAIN/BUS/TAXI/WALK/DRIVE/SHIP)
├── transportCost: Decimal
├── ticketCost: Decimal
├── otherCost: Decimal
├── order: Int
├── isAiGenerated: Boolean
└── createdAt: DateTime

Location (地理位置 - Embedded)
├── name: String
├── address: String
├── latitude: Float
├── longitude: Float
├── placeId: String (地图服务商ID)

CheckIn (打卡记录)
├── id: UUID (PK)
├── userId: UUID (FK)
├── tripId: UUID (FK)
├── location: Location
├── content: String (文字)
├── photos: String[] (URL数组)
├── videos: String[] (URL数组)
├── tags: String[]
├── createdAt: DateTime
├── likes: Int
└── comments: Comment[]

Comment (评论)
├── id: UUID (PK)
├── checkInId: UUID (FK)
├── userId: UUID (FK)
├── content: String
├── createdAt: DateTime

ShareLink (分享链接)
├── id: UUID (PK)
├── checkInId: UUID (FK)
├── token: String (Unique)
├── expiresAt: DateTime (nullable)
├── isActive: Boolean
└── views: Int
```

### 3.2 Prisma Schema核心定义

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  trips     Trip[]
  checkIns  CheckIn[]
  comments  Comment[]
}

model Trip {
  id          String      @id @default(uuid())
  userId      String
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime
  status      TripStatus  @default(PLANNING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  user        User        @relation(fields: [userId], references: [id])
  destinations Destination[]
  items       ItineraryItem[]
}

model Destination {
  id          String   @id @default(uuid())
  tripId      String
  name        String
  order       Int
  latitude    Float
  longitude   Float
  address     String?
  createdAt   DateTime @default(now())
  
  trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  items       ItineraryItem[]
  
  @@index([tripId, order])
}

model ItineraryItem {
  id              String        @id @default(uuid())
  tripId          String
  destinationId   String?
  type            ItemType
  title           String
  description     String?
  startTime       DateTime
  endTime         DateTime
  duration        Int           // 分钟
  fromLocation    Json?         // Location对象
  toLocation      Json?         // Location对象
  transportMode   TransportMode?
  transportCost   Decimal?      @db.Decimal(10, 2)
  ticketCost      Decimal?      @db.Decimal(10, 2)
  otherCost       Decimal?      @db.Decimal(10, 2)
  order           Int
  isAiGenerated   Boolean       @default(false)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  trip            Trip          @relation(fields: [tripId], references: [id], onDelete: Cascade)
  destination     Destination?  @relation(fields: [destinationId], references: [id])
  
  @@index([tripId, startTime])
  @@index([tripId, order])
}

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
```

---

## 4. 功能详细设计

### 4.1 旅行规划流程

```
用户输入 → AI分析 → 生成建议 → 人工调整 → 确认行程
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ 目的地   │ │ 距离计算 │ │ 路线规划 │ │ 拖动排序 │ │ 保存DB  │
│ 时间    │ │ 景点推荐 │ │ 时间分配 │ │ 修改时间 │ │ 分享   │
│ 偏好    │ │ 美食推荐 │ │ 交通建议 │ │ 调整内容 │ │        │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**AI Prompt模板（Kimi）：**

```
你是一位专业的旅行规划师。请根据以下信息生成详细的旅行规划：

【目的地】
{{destinations}}

【时间】
开始：{{startDate}}
结束：{{endDate}}

【偏好】
- 交通方式偏好：{{transportPreference}}
- 游玩节奏：{{pace}} (紧凑/适中/休闲)
- 预算等级：{{budget}}
- 特殊需求：{{specialNeeds}}

【要求】
1. 精确到每个行程项的开始和结束时间（精确到分钟）
2. 包含交通时间、游览时间、用餐时间
3. 每个景点提供游览建议（最佳时间、必看内容、注意事项）
4. 推荐当地特色美食（餐厅类型、人均价格、招牌菜）
5. 计算每个行程项的预估费用
6. 考虑地理位置合理性，避免绕路

请以JSON格式返回，包含：
- destinations: 排序后的目的地列表
- items: 行程项数组（包含时间、地点、交通、费用、建议）
- totalCost: 总费用估算
```

### 4.2 时间线展示

- **视图模式**: 日视图 / 列表视图
- **交互**: 拖拽排序、时间调整、展开详情
- **精确度**: 支持分钟级调整（08:30-09:15）
- **时间冲突检测**: 自动检测并提示重叠项

### 4.3 地图选址功能

1. **地址输入**: 自动补全（高德/Google Place API）
2. **地图选点**: 点击地图选择位置
3. **当前位置**: 获取GPS定位
4. **地址详情**: 显示地址、经纬度、POI信息

### 4.4 旅行记录功能

```
打卡流程：
定位 → 拍照/视频 → 添加文字 → 选择标签 → 发布
  │        │            │           │         │
  ▼        ▼            ▼           ▼         ▼
GPS坐标  压缩上传     富文本编辑   预设+自定义  生成分享链接
地址解析  生成缩略图   @提及        分类标签    可选过期时间
```

**分享功能：**
- 生成短链接（/share/{token}）
- 支持设置有效期（1天/7天/30天/永久）
- 访问者无需登录即可查看
- 支持评论和点赞（匿名或昵称）

### 4.5 美食推荐方案（方案B）

**数据源：**
1. **AI生成**（Kimi）- 主推荐
   - 根据地理位置生成当地特色美食
   - 结合季节、时间推荐
   - 提供餐厅类型和价格区间

2. **公开API** - 辅助验证
   - Foursquare API（海外）
   - Yelp Fusion API（海外）
   - 高德POI搜索（国内）

**推荐算法：**
```
输入：目的地坐标 + 当前时间 + 用户偏好
↓
Kimi生成推荐列表（含名称、类型、特色、价格）
↓
地图API搜索附近餐厅验证存在性
↓
按距离/评分排序
↓
展示给用户（带导航链接）
```

---

## 5. 项目结构

```
aitriplan/
├── apps/
│   ├── web/                          # Next.js Web应用
│   │   ├── app/                      # App Router
│   │   │   ├── (auth)/               # 认证相关（登录/注册）
│   │   │   ├── (main)/               # 主应用
│   │   │   │   ├── trips/            # 旅行列表/详情
│   │   │   │   ├── plan/             # 行程规划
│   │   │   │   ├── timeline/         # 时间线视图
│   │   │   │   └── checkin/          # 打卡记录
│   │   │   ├── api/                  # API路由
│   │   │   │   ├── auth/             # 认证API
│   │   │   │   ├── trips/            # 旅行API
│   │   │   │   ├── ai/               # AI服务API
│   │   │   │   ├── upload/           # 文件上传
│   │   │   │   └── share/            # 分享API
│   │   │   └── share/                # 公开分享页面
│   │   ├── components/               # React组件
│   │   │   ├── ui/                   # 基础UI组件
│   │   │   ├── trip/                 # 旅行相关组件
│   │   │   ├── map/                  # 地图组件
│   │   │   ├── timeline/             # 时间线组件
│   │   │   └── ai/                   # AI交互组件
│   │   ├── lib/
│   │   │   ├── prisma.ts             # Prisma客户端
│   │   │   ├── auth.ts               # 认证配置
│   │   │   ├── ai/                   # AI服务
│   │   │   │   ├── providers/        # 各厂商实现
│   │   │   │   ├── factory.ts        # Provider工厂
│   │   │   │   └── prompts/          # Prompt模板
│   │   │   ├── map/                  # 地图服务
│   │   │   └── utils/                # 工具函数
│   │   ├── hooks/                    # 自定义Hooks
│   │   ├── types/                    # TypeScript类型
│   │   └── prisma/
│   │       └── schema.prisma         # 数据库Schema
│   │
│   └── mobile/                       # React Native移动端
│       ├── src/
│       │   ├── components/           # 组件
│       │   ├── screens/              # 页面
│       │   │   ├── Auth/             # 认证
│       │   │   ├── Trips/            # 旅行列表
│       │   │   ├── Plan/             # 行程规划
│       │   │   ├── Timeline/         # 时间线
│       │   │   ├── CheckIn/          # 打卡
│       │   │   └── Profile/          # 个人中心
│       │   ├── services/             # API服务
│       │   ├── store/                # 状态管理
│       │   └── utils/                # 工具函数
│       └── App.tsx
│
├── packages/
│   ├── shared/                       # 共享代码
│   │   ├── src/
│   │   │   ├── types/                # 共享类型
│   │   │   ├── constants/            # 常量
│   │   │   └── utils/                # 共享工具
│   │   └── package.json
│   │
│   └── ui/                           # 共享UI组件（可选）
│
├── docker/                           # Docker配置
│   ├── Dockerfile.web
│   ├── Dockerfile.mobile
│   └── nginx.conf
│
├── docs/                             # 文档
│   └── plans/                        # 设计文档
│
├── docker-compose.yml                # NAS部署配置
├── .env.example                      # 环境变量示例
└── README.md
```

---

## 6. 环境变量配置

```bash
# 数据库 (端口 5511)
DATABASE_URL="postgresql://postgres:password@localhost:5511/aitriplan"

# Redis (端口 6311)
REDIS_URL="redis://localhost:6311"

# 认证
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# AI配置
KIMI_API_KEY="your-kimi-api-key"
KIMI_BASE_URL="https://api.moonshot.cn/v1"
DEEPSEEK_API_KEY="your-deepseek-key"  # 备用
ONEAPI_BASE_URL="http://localhost:3001"  # 可选

# 地图
AMAP_KEY="your-amap-key"
GOOGLE_MAPS_KEY="your-google-key"  # 海外用

# 存储（NAS本地路径）
UPLOAD_DIR="/app/uploads"
MAX_FILE_SIZE="50MB"

# 其他
NODE_ENV="production"
PORT="3000"
```

---

## 7. NAS部署配置

### 7.1 Docker Compose

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    container_name: aitriplan-web
    restart: unless-stopped
    ports:
      - "2311:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/aitriplan
      - REDIS_URL=redis://redis:6311
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    networks:
      - aitriplan

  db:
    image: postgres:16-alpine
    container_name: aitriplan-db
    restart: unless-stopped
    ports:
      - "5511:5432"
    environment:
      - POSTGRES_DB=aitriplan
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    networks:
      - aitriplan

  redis:
    image: redis:7-alpine
    container_name: aitriplan-redis
    restart: unless-stopped
    ports:
      - "6311:6379"
    volumes:
      - ./redis_data:/data
    networks:
      - aitriplan

networks:
  aitriplan:
    driver: bridge
```

### 7.2 部署步骤

1. **飞牛OS创建文件夹**
   ```
   /volume1/docker/aitriplan/
   ├── docker-compose.yml
   ├── .env
   ├── uploads/
   ├── postgres_data/
   └── redis_data/
   ```

2. **配置反向代理**（你已有）
   - Nginx Proxy Manager或飞牛自带
   - 域名指向NAS公网IP
   - SSL证书配置

3. **启动服务**
   ```bash
   cd /volume1/docker/aitriplan
   docker-compose up -d
   ```

4. **初始化数据库**
   ```bash
   docker-compose exec web npx prisma migrate deploy
   docker-compose exec web npx prisma db seed  # 如有种子数据
   ```

---

## 8. 安全考虑

1. **数据安全**
   - 数据库密码强加密
   - 用户密码bcrypt加密
   - 文件上传类型限制（图片/视频）
   - 文件大小限制（单文件50MB）

2. **API安全**
   - Rate Limiting（AI接口限速）
   - JWT Token认证
   - CORS配置
   - SQL注入防护（Prisma天然防护）

3. **部署安全**
   - 防火墙只开放80/443
   - Docker容器隔离
   - 定期备份数据库
   - 敏感信息环境变量管理

---

## 9. 后续扩展

1. **功能扩展**
   - 团队协作（多人编辑同一行程）
   - 预算统计与报表
   - 旅行足迹地图
   - 离线模式
   - AI语音导览

2. **移动端增强**
   - 原生地图导航集成
   - 推送通知（行程提醒）
   - 相机滤镜/AR功能
   - 离线地图包

3. **商业化**
   - 高级AI功能订阅
   - 去广告
   - 云端备份
   - 多设备同步加速

---

## 10. 附录

### API端点概览

| 端点 | 方法 | 描述 |
|------|------|------|
| /api/auth/* | - | NextAuth认证 |
| /api/trips | GET/POST | 旅行列表/创建 |
| /api/trips/[id] | GET/PUT/DELETE | 旅行详情/更新/删除 |
| /api/trips/[id]/plan | POST | AI生成行程 |
| /api/trips/[id]/items | POST/PUT | 添加/更新行程项 |
| /api/ai/generate | POST | AI通用生成 |
| /api/upload | POST | 文件上传 |
| /api/checkin | GET/POST | 打卡列表/创建 |
| /api/share/[token] | GET | 公开分享访问 |

### 性能指标目标

- 首屏加载 < 2s
- AI生成行程 < 10s
- 地图加载 < 1s
- API响应 < 200ms (P95)
- 支持并发用户 100+

---

**设计文档完成，准备进入实施阶段。**
