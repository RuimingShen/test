#!/bin/bash

# AI 论文搬运工 - 快速开始脚本

echo "🚀 AI 论文搬运工 - 快速开始"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 进入前端目录
cd frontend

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件"
    echo "📝 复制 .env.example 并填入你的 Supabase 配置"
    cp .env.example .env
    echo ""
    echo "请编辑 frontend/.env 文件，填入以下配置："
    echo "  VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "  VITE_SUPABASE_ANON_KEY=your-anon-key"
    echo ""
    echo "配置完成后，运行: npm run dev"
else
    echo "✅ 找到 .env 文件"
    echo ""
    echo "🎉 启动开发服务器..."
    npm run dev
fi
