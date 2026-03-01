#!/bin/bash
# Docker 本地部署和测试脚本

set -e

echo "🚀 AITriplan 本地 Docker 部署脚本"
echo "=================================="

# 检查 Docker
echo "📋 检查 Docker..."
if ! docker --version > /dev/null 2>&1; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! docker-compose --version > /dev/null 2>&1; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 检查通过"

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p uploads logs

# 启动服务
echo "🐳 启动 Docker 服务..."
docker-compose -f docker/docker-compose.local.yml up -d

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 5

# 初始化数据库
echo "🗄️ 初始化数据库..."
docker-compose -f docker/docker-compose.local.yml exec -T web npx prisma migrate dev --name init || true

echo ""
echo "=================================="
echo "✅ 部署成功！"
echo ""
echo "访问地址:"
echo "  🌐 Web 应用: http://localhost:2311"
echo "  🗄️  数据库:  localhost:5511"
echo "  💾 Redis:    localhost:6311"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose -f docker/docker-compose.local.yml logs -f"
echo "  停止服务: docker-compose -f docker/docker-compose.local.yml down"
echo "  进入容器: docker-compose -f docker/docker-compose.local.yml exec web sh"
echo "  运行测试: docker-compose -f docker/docker-compose.local.yml exec web npm test"
echo "=================================="
