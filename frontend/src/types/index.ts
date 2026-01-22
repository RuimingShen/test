// 原始论文数据（从 Twitter 抓取）
export interface RawPaper {
  id: string;
  tweet_id: string;
  tweet_text: string;
  tweet_url: string;
  author_name: string;
  author_username: string;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  paper_title?: string;
  paper_url?: string;
  paper_abstract?: string;
  created_at: string;
  fetched_at: string;
}

// 小红书风格的改写内容
export interface XHSContent {
  id: string;
  paper_id: string;
  title: string;           // 小红书标题
  content: string;         // 正文内容
  tags: string[];          // 话题标签
  cover_text: string[];    // 封面文案（3-5个关键词）
  emoji_list: string[];    // 使用的emoji
  created_at: string;
  updated_at: string;
}

// 发布记录
export interface PublishRecord {
  id: string;
  xhs_content_id: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  published_at?: string;
  created_at: string;
}

// 完整的论文卡片数据（用于前端展示）
export interface PaperCard {
  raw: RawPaper;
  xhs?: XHSContent;
  publish?: PublishRecord;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 抓取参数
export interface FetchParams {
  minLikes: number;
  keywords: string[];
  maxResults: number;
}

// 改写参数
export interface RewriteParams {
  paperId: string;
  style: 'casual' | 'professional' | 'humorous';
  targetAudience: string;
}

// 应用状态
export interface AppState {
  papers: PaperCard[];
  selectedPaper: PaperCard | null;
  isLoading: boolean;
  isFetching: boolean;
  isRewriting: boolean;
  error: string | null;
}

// Twitter API 响应类型
export interface TwitterSearchResponse {
  data: TwitterTweet[];
  includes?: {
    users: TwitterUser[];
  };
  meta: {
    newest_id: string;
    oldest_id: string;
    result_count: number;
    next_token?: string;
  };
}

export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  entities?: {
    urls?: Array<{
      start: number;
      end: number;
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
  };
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
}
