// 使用 TwitterAPI.io 抓取热门 AI 论文（更严格版）
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
  keywords?: string[];     // 额外关键词（可选），会与默认 AI 关键词合并
  maxResults: number;

  // 可选：更像“热门”的约束（不传就按 minLikes 自动推一个）
  minRetweets?: number;
  minReplies?: number;

  // 可选：只抓近 N 小时（不传则不限）
  sinceHours?: number;
}

interface TwitterAPITweet {
  id: string;
  text: string;
  url?: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  createdAt: string;
  isReply?: boolean;
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

// 允许的论文站点白名单（宁可漏掉，也别把垃圾放进库）
const PAPER_HOSTS = new Set([
  "arxiv.org",
  "openreview.net",
  "paperswithcode.com",
  "huggingface.co",
  "aclanthology.org",
  "doi.org",
  "semanticscholar.org",
]);

function isAllowedPaperUrl(u: string): boolean {
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, "");

    if (!PAPER_HOSTS.has(host)) return false;

    // HuggingFace 只认可 /papers 下的页面，避免把模型页当论文
    if (host === "huggingface.co" && !url.pathname.startsWith("/papers")) return false;

    // Semantic Scholar 只认可 /paper
    if (host === "semanticscholar.org" && !url.pathname.startsWith("/paper")) return false;

    // arXiv 认可 abs/pdf
    if (host === "arxiv.org") {
      const p = url.pathname.toLowerCase();
      if (!(p.startsWith("/abs/") || p.startsWith("/pdf/"))) return false;
    }

    return true;
  } catch {
    return false;
  }
}

function cleanKeyword(s: string): string | null {
  const x = (s || "").trim();
  if (!x) return null;

  // 防止把搜索语法搞炸：去掉引号/换行/极端符号
  const safe = x.replace(/["\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return null;

  // 多词用引号包起来更稳定
  if (safe.includes(" ")) return `"${safe}"`;
  return safe;
}

function buildSincePart(sinceHours?: number): string {
  if (!sinceHours || sinceHours <= 0) return "";
  const since = new Date(Date.now() - sinceHours * 3600_000);

  const pad = (n: number) => String(n).padStart(2, "0");
  const s = `${since.getUTCFullYear()}-${pad(since.getUTCMonth() + 1)}-${pad(since.getUTCDate())}_${pad(
    since.getUTCHours(),
  )}:${pad(since.getUTCMinutes())}:${pad(since.getUTCSeconds())}_UTC`;

  return ` since:${s}`;
}

function buildQuery(params: FetchParams): string {
  const { minLikes, minRetweets, minReplies, sinceHours } = params;

  // 默认 AI 主题词：比单独一个 “AI” 体面一点
  const defaultTopics = [
    "LLM",
    "\"large language model\"",
    "transformer",
    "diffusion",
    "multimodal",
    "\"machine learning\"",
    "\"deep learning\"",
    "NLP",
    "vision",
    "RL",
    "agent",
    "reasoning",
    "alignment",
    "benchmark",
  ];

  const extra = (params.keywords ?? []).map(cleanKeyword).filter(Boolean) as string[];

  // 合并主题词（限制长度，避免 query 过长）
  const topics = [...defaultTopics.map(cleanKeyword).filter(Boolean) as string[], ...extra].slice(0, 25);
  const topicQuery = topics.length ? `(${topics.join(" OR ")})` : "";

  // 论文链接域名约束：强制 url 命中这些站点
  const domainQuery = [
    "url:arxiv.org",
    "url:openreview.net",
    "url:paperswithcode.com",
    "url:huggingface.co/papers",
    "url:aclanthology.org",
    "url:doi.org",
    "url:semanticscholar.org/paper",
  ].join(" OR ");

  // 噪音黑名单：招人、卖课、广告、抽奖之类的别进来
  const noiseExclude = [
    "-hiring",
    "-job",
    "-jobs",
    "-apply",
    "-webinar",
    "-workshop",
    "-course",
    "-tutorial",
    "-bootcamp",
    "-giveaway",
    "-newsletter",
    "-sale",
    "-discount",
  ].join(" ");

  // retweet/reply 阈值：不传就按 minLikes 推个默认，避免“单纯点赞高但无人传播”的内容
  const rt = typeof minRetweets === "number" ? minRetweets : Math.max(10, Math.floor(minLikes / 20));
  const rp = typeof minReplies === "number" ? minReplies : 0;

  const sincePart = buildSincePart(sinceHours);

  // 关键：filter:links + 强制论文域名 + 热度门槛 + 排除转推
  const query =
    `(${domainQuery}) filter:links ` +
    `${topicQuery} ` +
    `min_faves:${minLikes} min_retweets:${rt}` +
    (rp > 0 ? ` min_replies:${rp}` : "") +
    ` -filter:retweets -is:retweet lang:en` +
    `${sincePart} ${noiseExclude}`;

  return query.trim().replace(/\s+/g, " ");
}

// 从推文中提取论文信息（只接受白名单域名）
function extractPaperInfo(tweet: TwitterAPITweet): { title?: string; url?: string } {
  const text = tweet.text || "";

  const expandedUrls =
    tweet.entities?.urls
      ?.map((u) => u?.expandedUrl)
      .filter((u): u is string => Boolean(u)) ?? [];

  // 候选 URL：先从 entities 里找，再 fallback 到正文里的链接
  const textUrls = [
    text.match(/https?:\/\/arxiv\.org\/(abs|pdf)\/[^\s)]+/i)?.[0],
    text.match(
      /https?:\/\/(openreview\.net|paperswithcode\.com|huggingface\.co\/papers|aclanthology\.org|doi\.org|semanticscholar\.org\/paper)[^\s)]+/i,
    )?.[0],
  ].filter((u): u is string => Boolean(u));

  const candidates = [...expandedUrls, ...textUrls];

  const paperUrl = candidates.find((u) => isAllowedPaperUrl(u));

  // 标题提取：尽量拿到更像“论文标题”的字段
  const titleMatch =
    text.match(/"([^"]+)"/) ||
    text.match(/📄\s*(.+?)(?:\n|$)/) ||
    text.match(/Paper:\s*(.+?)(?:\n|$)/i) ||
    text.match(/Title:\s*(.+?)(?:\n|$)/i) ||
    text.match(/🚀\s*(.+?)(?:\n|https|$)/i);

  const title = titleMatch?.[1]?.trim()?.slice(0, 200);

  return { title, url: paperUrl };
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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Supabase Secrets.");
    }

    // 解析请求参数
    const params: FetchParams = await req.json();
    const {
      minLikes = 100,
      maxResults = 20,
      keywords = [],
      minRetweets,
      minReplies,
      sinceHours,
    } = params ?? ({} as FetchParams);

    const query = buildQuery({ minLikes, maxResults, keywords, minRetweets, minReplies, sinceHours });
    console.log("Search query:", query);

    // 调用 TwitterAPI.io
    const searchUrl = new URL("https://api.twitterapi.io/twitter/tweet/advanced_search");
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("queryType", "Top"); // 关键：抓热门，不是抓最新一堆噪音

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
    const tweets: TwitterAPITweet[] = Array.isArray(data?.tweets) ? data.tweets : [];

    // 初始化 Supabase 客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 处理并存储论文（只取 maxResults 条“符合条件的论文”，不是只截 tweet 数量）
    const papers: any[] = [];
    const fetchedAt = new Date().toISOString();

    for (const tweet of tweets) {
      if (papers.length >= maxResults) break;

      // 再次过滤确保点赞数符合要求
      if ((tweet.likeCount ?? 0) < minLikes) continue;

      // 可选：如果你不想要回复串（多数不是论文发布），可以打开这句
      // if (tweet.isReply) continue;

      const paperInfo = extractPaperInfo(tweet);

      // 关键 gate：没提取到论文链接，直接跳过
      if (!paperInfo.url) continue;

      // 关键 gate：必须是白名单站点
      if (!isAllowedPaperUrl(paperInfo.url)) continue;

      const paper = {
        tweet_id: tweet.id,
        tweet_text: tweet.text,
        tweet_url: tweet.url || `https://twitter.com/${tweet.author?.userName ?? "unknown"}/status/${tweet.id}`,
        author_name: tweet.author?.name || "Unknown",
        author_username: tweet.author?.userName || "unknown",
        like_count: tweet.likeCount ?? 0,
        retweet_count: tweet.retweetCount ?? 0,
        reply_count: tweet.replyCount ?? 0,
        paper_title: paperInfo.title ?? null,
        paper_url: paperInfo.url,
        paper_abstract: null,
        created_at: tweet.createdAt,
        fetched_at: fetchedAt,
      };

      // 插入或更新数据库（使用 upsert 避免重复）
      const { data: insertedPaper, error } = await supabase
        .from("raw_papers")
        .upsert(paper, { onConflict: "tweet_id" })
        .select()
        .single();

      if (error) {
        console.error("Error inserting paper:", error);
        continue;
      }

      papers.push(insertedPaper);
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
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error)?.message ?? String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

