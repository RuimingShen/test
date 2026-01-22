-- 创建原始论文表
CREATE TABLE IF NOT EXISTS raw_papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id TEXT UNIQUE NOT NULL,
  tweet_text TEXT NOT NULL,
  tweet_url TEXT,
  author_name TEXT,
  author_username TEXT,
  like_count INTEGER DEFAULT 0,
  retweet_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  paper_title TEXT,
  paper_url TEXT,
  paper_abstract TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建小红书内容表
CREATE TABLE IF NOT EXISTS xhs_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_id UUID REFERENCES raw_papers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  cover_text TEXT[] DEFAULT '{}',
  emoji_list TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建发布记录表
CREATE TABLE IF NOT EXISTS publish_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  xhs_content_id UUID REFERENCES xhs_contents(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'failed')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_raw_papers_like_count ON raw_papers(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_raw_papers_created_at ON raw_papers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xhs_contents_paper_id ON xhs_contents(paper_id);
CREATE INDEX IF NOT EXISTS idx_publish_records_xhs_content_id ON publish_records(xhs_content_id);
CREATE INDEX IF NOT EXISTS idx_publish_records_status ON publish_records(status);

-- 启用 Row Level Security
ALTER TABLE raw_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xhs_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_records ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（简化版，实际生产环境需要更严格的权限控制）
CREATE POLICY "Allow public read access to raw_papers"
  ON raw_papers FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to raw_papers"
  ON raw_papers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to xhs_contents"
  ON xhs_contents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to xhs_contents"
  ON xhs_contents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to xhs_contents"
  ON xhs_contents FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to publish_records"
  ON publish_records FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to publish_records"
  ON publish_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to publish_records"
  ON publish_records FOR UPDATE
  USING (true);
