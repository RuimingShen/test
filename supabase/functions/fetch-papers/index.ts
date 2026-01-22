
// 使用 TwitterAPI.io 抓取热门 AI 论文
// 文档: https://docs.twitterapi.io/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// TwitterAPI.io 配置 - 需要在 Supabase Secrets 中设置
const TWITTERAPI_IO_KEY = Deno.env.get("TWITTERAPI_IO_KEY") || "";

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

interface TwitterAPITweet {
  id: string;
  text: string;
  url: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    userName: string;
  };
  entities?: {
    urls?: Array<{
      url: string;
      expandedUrl: string;
      displayUrl: string;
    }>;
  };
}

// 从推文中提取论文信息
function extractPaperInfo(tweet: TwitterAPITweet): {
  title?: string;
  url?: string;
} {
  // 从推文文本中查找 URL
  const text = tweet.text;
  
  // 查找 arXiv 链接
  const arxivMatch = text.match(/https?:\/\/arxiv\.org\/abs\/[\d.]+/);
  const arxivUrl = arxivMatch?.[0];
  
  // 查找其他论文链接
  const paperUrlMatch = text.match(/https?:\/\/(openreview\.net|paperswithcode\.com|huggingface\.co\/papers)[^\s]*/);
  const paperUrl = arxivUrl || paperUrlMatch?.[0];

  // 尝试从推文中提取标题（通常在引号中）
  const titleMatch = text.match(/"([^"]+)"/) || 
                     text.match(/📄\s*(.+?)(?:\n|$)/) ||
                     text.match(/Paper:\s*(.+?)(?:\n|$)/i) ||
                     text.match(/🚀\s*(.+?)(?:\n|https|$)/i);

  return {
    title: titleMatch?.[1]?.trim().slice(0, 200),
    url: paperUrl,
  };
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 检查 API 配置
    if (!TWITTERAPI_IO_KEY) {
      throw new Error("TwitterAPI.io API key not configured. Please set TWITTERAPI_IO_KEY in Supabase Secrets.");
    }

    // 解析请求参数
    const params: FetchParams = await req.json();
    const { minLikes = 100, keywords = ["arxiv", "paper", "AI"], maxResults = 20 } = params;

    // 构建搜索查询
    // TwitterAPI.io 支持高级搜索语法，包括 min_faves
    const query = `(${keywords.join(" OR ")}) min_faves:${minLikes} -is:retweet lang:en`;
    console.log("Search query:", query);

    // 调用 TwitterAPI.io
    const searchUrl = new URL("https://api.twitterapi.io/twitter/tweet/advanced_search");
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("queryType", "Latest");

    console.log("Fetching from TwitterAPI.io:", searchUrl.toString());

    const response = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": TWITTERAPI_IO_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TwitterAPI.io error:", errorText);
      throw new Error(`TwitterAPI.io error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("TwitterAPI.io response:", JSON.stringify(data, null, 2));

    // 解析结果
    const tweets: TwitterAPITweet[] = data.tweets || [];

    // 初始化 Supabase 客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 处理并存储论文（只取 maxResults 条）
    const papers = [];
    const tweetsToProcess = tweets.slice(0, maxResults);

    for (const tweet of tweetsToProcess) {
      // 再次过滤确保点赞数符合要求
      if (tweet.likeCount < minLikes) {
        continue;
      }

      const paperInfo = extractPaperInfo(tweet);

      const paper = {
        tweet_id: tweet.id,
        tweet_text: tweet.text,
        tweet_url: tweet.url || `https://twitter.com/${tweet.author?.userName}/status/${tweet.id}`,
        author_name: tweet.author?.name || "Unknown",
        author_username: tweet.author?.userName || "unknown",
        like_count: tweet.likeCount,
        retweet_count: tweet.retweetCount,
        reply_count: tweet.replyCount,
        paper_title: paperInfo.title,
        paper_url: paperInfo.url,
        paper_abstract: null,
        created_at: tweet.createdAt,
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
