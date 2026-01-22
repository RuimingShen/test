// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Twitter API 配置 - 需要在 Supabase Secrets 中设置
const TWITTER_BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN") || "";
const TWITTER_CONSUMER_KEY = Deno.env.get("TWITTER_CONSUMER_KEY") || "";
const TWITTER_CONSUMER_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET") || "";

// Supabase 配置
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// CORS 头
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FetchParams {
  minLikes: number;
  keywords: string[];
  maxResults: number;
}

interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
  };
  entities?: {
    urls?: Array<{
      expanded_url: string;
      display_url: string;
    }>;
  };
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
}

// 构建 Twitter 搜索查询
function buildSearchQuery(keywords: string[], minLikes: number): string {
  // 搜索包含 AI 论文相关关键词的推文
  // 使用高级搜索语法：(关键词1 OR 关键词2) min_faves:100
  const keywordQuery = keywords.map((k) => k).join(" OR ");
  return `(${keywordQuery}) min_faves:${minLikes} -is:retweet lang:en`;
}

// 从推文中提取论文信息
function extractPaperInfo(tweet: TwitterTweet): {
  title?: string;
  url?: string;
  abstract?: string;
} {
  const urls = tweet.entities?.urls || [];
  
  // 查找 arXiv 链接
  const arxivUrl = urls.find(
    (u) => u.expanded_url?.includes("arxiv.org")
  );
  
  // 查找其他论文链接（如 OpenReview, Papers with Code 等）
  const paperUrl = arxivUrl || urls.find(
    (u) =>
      u.expanded_url?.includes("openreview.net") ||
      u.expanded_url?.includes("paperswithcode.com") ||
      u.expanded_url?.includes("huggingface.co/papers")
  );

  // 尝试从推文中提取标题（通常在引号中或冒号后）
  const titleMatch = tweet.text.match(/"([^"]+)"/) || 
                     tweet.text.match(/📄\s*(.+?)(?:\n|$)/) ||
                     tweet.text.match(/Paper:\s*(.+?)(?:\n|$)/i);

  return {
    title: titleMatch?.[1]?.trim(),
    url: paperUrl?.expanded_url,
    abstract: undefined, // 需要单独抓取
  };
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 检查 API 配置
    if (!TWITTER_BEARER_TOKEN) {
      throw new Error("Twitter API credentials not configured");
    }

    // 解析请求参数
    const params: FetchParams = await req.json();
    const { minLikes = 100, keywords = ["arxiv", "paper", "AI"], maxResults = 20 } = params;

    // 构建搜索查询
    const query = buildSearchQuery(keywords, minLikes);
    console.log("Search query:", query);

    // 调用 Twitter API v2
    const searchUrl = new URL("https://api.twitter.com/2/tweets/search/recent");
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("max_results", String(Math.min(maxResults, 100)));
    searchUrl.searchParams.set(
      "tweet.fields",
      "author_id,created_at,public_metrics,entities"
    );
    searchUrl.searchParams.set("expansions", "author_id");
    searchUrl.searchParams.set("user.fields", "name,username");

    const response = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twitter API error:", errorText);
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Twitter API response:", JSON.stringify(data, null, 2));

    // 解析结果
    const tweets: TwitterTweet[] = data.data || [];
    const users: TwitterUser[] = data.includes?.users || [];

    // 创建用户映射
    const userMap = new Map<string, TwitterUser>();
    users.forEach((user) => userMap.set(user.id, user));

    // 初始化 Supabase 客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 处理并存储论文
    const papers = [];
    for (const tweet of tweets) {
      const author = userMap.get(tweet.author_id);
      const paperInfo = extractPaperInfo(tweet);

      const paper = {
        tweet_id: tweet.id,
        tweet_text: tweet.text,
        tweet_url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
        author_name: author?.name || "Unknown",
        author_username: author?.username || "unknown",
        like_count: tweet.public_metrics.like_count,
        retweet_count: tweet.public_metrics.retweet_count,
        reply_count: tweet.public_metrics.reply_count,
        paper_title: paperInfo.title,
        paper_url: paperInfo.url,
        paper_abstract: paperInfo.abstract,
        created_at: tweet.created_at,
        fetched_at: new Date().toISOString(),
      };

      // 插入或更新数据库（使用 upsert 避免重复）
      const { data: insertedPaper, error } = await supabase
        .from("raw_papers")
        .upsert(paper, { onConflict: "tweet_id" })
        .select()
        .single();

      if (error) {
        console.error("Error inserting paper:", error);
      } else {
        papers.push(insertedPaper);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        papers,
        meta: {
          total: papers.length,
          query,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
