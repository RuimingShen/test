# 🔥 AI 论文搬运工 (AI Paper Porter)

自动抓取 Twitter 上的热门 AI 论文，由 AI 自动重写为小红书爆款风格的图文内容。

## 📖 功能特性

- **自动抓取**: 使用 Twitter API v2 搜索热门 AI 论文（点赞 > 100）
- **AI 改写**: 调用 Claude API 将论文转为小红书爆款风格
- **预览后台**: 可视化预览生成的图文内容
- **模拟发布**: 一键模拟发布到小红书

## 🏗️ 技术架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Twitter API   │────▶│    Supabase     │────▶│   React App     │
│  (论文抓取)      │     │  (Edge Functions │     │  (GitHub Pages) │
│                 │     │   + Database)    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **后端**: Supabase Edge Functions
- **数据库**: Supabase PostgreSQL
- **部署**: GitHub Pages (前端) + Supabase (后端)

## 📁 项目结构

```
ai-paper-porter/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── services/         # API 服务
│   │   ├── types/            # TypeScript 类型
│   │   └── utils/            # 工具函数
│   ├── vite.config.ts
│   └── package.json
│
├── supabase/                 # Supabase 后端
│   ├── functions/            # Edge Functions
│   │   ├── fetch-papers/     # 抓取论文
│   │   ├── rewrite-paper/    # AI 改写
│   │   └── publish-paper/    # 模拟发布
│   ├── migrations/           # 数据库迁移
│   └── config.toml
│
└── README.md
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/ai-paper-porter.git
cd ai-paper-porter
```

### 2. 配置环境变量

#### 前端 (frontend/.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Supabase Secrets
```bash
supabase secrets set TWITTER_BEARER_TOKEN=your_twitter_bearer_token
supabase secrets set TWITTER_CONSUMER_KEY=your_consumer_key
supabase secrets set TWITTER_CONSUMER_SECRET=your_consumer_secret
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. 部署 Supabase

```bash
cd supabase
supabase link --project-ref your-project-ref
supabase db push
supabase functions deploy
```

### 4. 部署前端到 GitHub Pages

```bash
cd frontend
npm install
npm run build
npm run deploy
```

## 🔧 配置说明

### Twitter API 配置

1. 前往 [Twitter Developer Portal](https://developer.twitter.com/)
2. 创建一个 App 并获取以下凭证：
   - Consumer Key (API Key)
   - Consumer Secret (API Secret)
   - Bearer Token

### Supabase 配置

1. 前往 [Supabase](https://supabase.com/) 创建项目
2. 获取 Project URL 和 Anon Key
3. 在 SQL Editor 中运行 migrations 文件

### Claude API 配置

1. 前往 [Anthropic Console](https://console.anthropic.com/)
2. 获取 API Key

## 📝 使用说明

### 抓取论文

点击"抓取论文"按钮，系统会自动：
1. 调用 Twitter API 搜索包含 AI/ML 论文相关关键词的热门推文
2. 筛选点赞数 > 100 的推文
3. 提取论文信息存入数据库

### AI 改写

选择一篇论文，点击"AI 改写"，系统会：
1. 调用 Claude API 将论文内容转为小红书风格
2. 生成吸引眼球的标题和正文
3. 自动添加 emoji 和爆款元素

### 预览发布

在预览界面可以：
1. 查看生成的小红书风格图文
2. 编辑调整内容
3. 一键模拟发布

## 🎨 小红书风格示例

**原始论文标题:**
> "Attention Is All You Need" - A new simple network architecture based solely on attention mechanisms

**改写后:**
> 🔥 震惊！谷歌发布革命性 AI 架构，彻底改变了整个行业！
>
> 姐妹们！今天必须给你们分享一个超级重磅的消息 💥
>
> 谷歌的研究员们发明了一个叫 Transformer 的东西，简单来说就是...
>
> 📍 重点来了：
> ✨ 训练速度快到飞起
> ✨ 效果吊打之前所有模型
> ✨ 现在 ChatGPT 就是用的这个技术！
>
> 码住！以后面试绝对用得上 📚

## 📄 License

MIT License
