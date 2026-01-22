# Supabase 后端配置指南

## 1. 创建 Supabase 项目

1. 前往 [Supabase](https://supabase.com/) 注册/登录
2. 创建新项目，记录以下信息：
   - Project URL (例如: `https://xxxxx.supabase.co`)
   - Anon Key (公开密钥)
   - Service Role Key (服务密钥，用于 Edge Functions)

## 2. 数据库初始化

### 方法一：使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 推送迁移
supabase db push
```

### 方法二：手动执行 SQL

1. 进入 Supabase 控制台 → SQL Editor
2. 复制 `migrations/20240101000000_init.sql` 中的内容
3. 执行 SQL

## 3. 配置 Secrets

在 Supabase 控制台 → Settings → Edge Functions → Secrets 中添加：

```
TWITTER_BEARER_TOKEN=你的Twitter Bearer Token
TWITTER_CONSUMER_KEY=你的Twitter Consumer Key
TWITTER_CONSUMER_SECRET=你的Twitter Consumer Secret
ANTHROPIC_API_KEY=你的Anthropic API Key
```

或者使用 CLI：

```bash
supabase secrets set TWITTER_BEARER_TOKEN=xxx
supabase secrets set TWITTER_CONSUMER_KEY=xxx
supabase secrets set TWITTER_CONSUMER_SECRET=xxx
supabase secrets set ANTHROPIC_API_KEY=xxx
```

## 4. 部署 Edge Functions

```bash
# 部署所有函数
supabase functions deploy

# 或者单独部署
supabase functions deploy fetch-papers
supabase functions deploy rewrite-paper
supabase functions deploy publish-paper
```

## 5. 测试 Functions

```bash
# 测试抓取论文
curl -X POST https://your-project.supabase.co/functions/v1/fetch-papers \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"minLikes": 100, "keywords": ["arxiv", "AI", "LLM"], "maxResults": 10}'

# 测试改写论文
curl -X POST https://your-project.supabase.co/functions/v1/rewrite-paper \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"paperId": "your-paper-uuid"}'

# 测试发布
curl -X POST https://your-project.supabase.co/functions/v1/publish-paper \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"xhsContentId": "your-content-uuid"}'
```

## 6. Twitter API 配置说明

### 获取 Twitter API 凭证

1. 前往 [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. 创建一个项目和应用
3. 获取以下凭证：
   - **Consumer Key (API Key)**
   - **Consumer Secret (API Secret)**
   - **Bearer Token**

### 搜索查询语法

Edge Function 使用以下搜索查询：

```
(arxiv OR paper OR AI OR LLM OR GPT OR machine learning) min_faves:100 -is:retweet lang:en
```

- `min_faves:100` - 只获取点赞数超过 100 的推文
- `-is:retweet` - 排除转发
- `lang:en` - 只搜索英文推文

### Twitter API 限制

- 免费版：每月 1500 条推文读取
- Basic 版：每月 10000 条推文读取
- 搜索 API 只能获取最近 7 天的推文

## 7. 数据库结构

### raw_papers 表
存储从 Twitter 抓取的原始论文信息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| tweet_id | TEXT | Twitter 推文 ID |
| tweet_text | TEXT | 推文内容 |
| author_name | TEXT | 作者名称 |
| like_count | INTEGER | 点赞数 |
| paper_title | TEXT | 论文标题 |
| paper_url | TEXT | 论文链接 |

### xhs_contents 表
存储 AI 改写后的小红书内容

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| paper_id | UUID | 关联论文 ID |
| title | TEXT | 小红书标题 |
| content | TEXT | 正文内容 |
| tags | TEXT[] | 话题标签 |

### publish_records 表
存储发布记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| xhs_content_id | UUID | 关联内容 ID |
| status | TEXT | 发布状态 |
| published_at | TIMESTAMPTZ | 发布时间 |
