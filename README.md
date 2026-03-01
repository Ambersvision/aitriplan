# AITriplan - 旅行规划与记录工具

支持 AI 智能规划、多端同步、NAS 本地部署的旅行规划和记录工具。

## NAS 部署指南

### 1. 准备工作

在飞牛OS (FNOS) 上创建以下目录：

```
/volume1/docker/aitriplan/
├── docker-compose.yml
├── .env
├── uploads/
├── postgres_data/
└── redis_data/
```

### 2. 环境变量配置

复制 `.env.example` 为 `.env` 并填写：

```bash
# 数据库密码
DB_PASSWORD=your_secure_password

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-secret-key-at-least-32-characters

# AI 配置
KIMI_API_KEY=your-kimi-api-key
KIMI_BASE_URL=https://api.moonshot.cn/v1

# 地图配置
AMAP_KEY=your-amap-key
```

### 3. 启动服务

```bash
cd /volume1/docker/aitriplan
docker-compose up -d
```

### 4. 初始化数据库

```bash
docker-compose exec web npx prisma migrate deploy
```

### 5. 访问应用

- Web: http://your-nas-ip:2311
- 数据库: localhost:5511
- Redis: localhost:6311

### 6. 反向代理配置（可选）

使用飞牛OS自带的反向代理或 Nginx Proxy Manager，将域名指向 `http://your-nas-ip:2311`。

### 7. 备份

定期备份以下目录：
- `postgres_data/` - 数据库
- `uploads/` - 上传的文件
- `redis_data/` - 缓存数据

## 开发说明

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式
cd apps/web && npm run dev

# 数据库迁移
cd apps/web && npx prisma migrate dev
```

### 技术栈

- **前端**: Next.js 16 + React 19 + Tailwind CSS 4
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL 16 + Prisma 6
- **缓存**: Redis 7
- **AI**: Kimi API
- **地图**: 高德地图 API

## 功能特性

- [x] 用户认证（登录/注册）
- [x] 旅行计划 CRUD
- [x] AI 智能行程规划（Kimi）
- [x] 地图选址（高德地图）
- [x] 地理位置打卡
- [x] 分享链接（公开访问）
- [ ] 时间线拖拽编辑（Phase 7）
- [ ] 美食推荐（Phase 10）
- [ ] 移动端 App（Phase 11）

## 项目结构

```
aitriplan/
├── apps/
│   └── web/                    # Next.js Web 应用
│       ├── app/                # App Router
│       ├── components/         # React 组件
│       ├── lib/                # 工具函数和服务
│       └── prisma/             # 数据库 Schema
├── docker/                     # Docker 配置
│   ├── Dockerfile.web
│   └── nginx.conf
├── docker-compose.yml          # NAS 部署配置
└── package.json                # Monorepo 配置
```

## 许可证

MIT
